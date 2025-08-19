
import express from 'express';
import { z } from 'zod';
import * as db from '../lib/db.js';
import auth from '../middleware/auth.js';
import * as vendorMock from '../lib/vendorMock.js';
import { v4 as uuidv4 } from 'uuid';

export const router = express.Router();

const redemptionSchema = z.object({
  catalogItemId: z.string().uuid(),
});

router.post('/', auth, async (req, res) => {
  const { success, data, error } = redemptionSchema.safeParse(req.body);
  if (!success) return res.status(400).json({ error: error.errors });

  const { catalogItemId } = data;
  const userId = req.user.userId;

  const pool = await db.getPool();
  const tx = pool.transaction();
  await tx.begin('SERIALIZABLE');
  try {
    // Get catalog item
    const itemRes = await tx.request()
      .input('catalogItemId', catalogItemId)
      .query('SELECT * FROM CatalogItem WHERE catalogItemId = @catalogItemId AND isActive = 1');
    const item = itemRes.recordset[0];
    if (!item) {
      await tx.rollback();
      return res.status(404).json({ error: 'Catalog item not found.' });
    }
    // Check user balance
    const walletRes = await tx.request()
      .input('userId', userId)
      .query('SELECT balance FROM Wallet WHERE userId = @userId');
    const balance = walletRes.recordset[0]?.balance ?? 0;
    if (balance < item.denominationUSD) {
      await tx.rollback();
      return res.status(400).json({ error: 'Insufficient balance.' });
    }
    // Deduct points
    await tx.request()
      .input('userId', userId)
      .input('points', item.denominationUSD)
      .query('UPDATE Wallet SET balance = balance - @points, lastUpdated = GETDATE() WHERE userId = @userId');
    // Call vendor mock
    const vendorResult = await vendorMock.redeem(item.vendorCode, item.denominationUSD, userId);
    // Insert redemption
    const redemptionId = uuidv4();
    await tx.request()
      .input('redemptionId', redemptionId)
      .input('userId', userId)
      .input('catalogItemId', catalogItemId)
      .input('status', vendorResult.success ? 'FULFILLED' : 'FAILED')
      .input('usdValue', item.denominationUSD)
      .input('vendorCode', item.vendorCode)
      .input('meta', JSON.stringify(vendorResult))
      .query(`
        INSERT INTO Redemption (redemptionId, userId, catalogItemId, status, usdValue, vendorCode, meta, createdAt)
        VALUES (@redemptionId, @userId, @catalogItemId, @status, @usdValue, @vendorCode, @meta, GETDATE())
      `);
    await tx.commit();
    res.status(201).json({ data: { redemptionId, status: vendorResult.success ? 'FULFILLED' : 'FAILED', vendorResult } });
  } catch (err) {
    await tx.rollback();
    res.status(500).json({ error: 'Redemption failed', meta: err.message });
  }
});
