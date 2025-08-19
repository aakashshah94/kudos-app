
import express from 'express';
import { z } from 'zod';
import * as db from '../lib/db.js';
import auth from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const POINTS_PER_MONTH = parseInt(process.env.POINTS_PER_MONTH || '1000', 10);

export const router = express.Router();

const monthSchema = z.object({
  month: z.string().regex(/^[0-9]{4}-[0-9]{2}$/), // YYYY-MM
});

router.post('/monthly', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  const month = new Date().toISOString().slice(0, 7);

  const tx = await db.getPool().then(pool => pool.transaction());
  try {
    await tx.begin('SERIALIZABLE');
    // Idempotency: check if already allocated
    const check = await tx.request()
      .input('tenantId', req.user.tenantId)
      .input('month', month)
      .query('SELECT COUNT(*) AS cnt FROM Allocation WHERE tenantId = @tenantId AND month = @month');
    if (check.recordset[0].cnt > 0) {
      await tx.rollback();
      return res.status(200).json({ data: 'Already allocated for this month.' });
    }
    // Get active users
    const users = await tx.request()
      .input('tenantId', req.user.tenantId)
      .query('SELECT userId FROM [User] WHERE tenantId = @tenantId AND isActive = 1');
    for (const { userId } of users.recordset) {
      await tx.request()
        .input('allocationId', uuidv4())
        .input('userId', userId)
        .input('tenantId', req.user.tenantId)
        .input('month', month)
        .input('points', POINTS_PER_MONTH)
        .query(`
          INSERT INTO Allocation (allocationId, userId, tenantId, month, points, createdAt)
          VALUES (@allocationId, @userId, @tenantId, @month, @points, GETDATE())
        `);
      await tx.request()
        .input('userId', userId)
        .input('points', POINTS_PER_MONTH)
        .query('UPDATE Wallet SET balance = balance + @points, lastUpdated = GETDATE() WHERE userId = @userId');
    }
    await tx.commit();
    res.status(201).json({ data: 'Allocations complete.' });
  } catch (err) {
    await tx.rollback();
    res.status(500).json({ error: 'Allocation failed', meta: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  const { month } = req.query;
  const parsed = monthSchema.safeParse({ month });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  try {
    const pool = await db.getPool();
    const result = await pool.request()
      .input('tenantId', req.user.tenantId)
      .input('month', month)
      .query(`
        SELECT * FROM Allocation
        WHERE tenantId = @tenantId AND month = @month
        ORDER BY createdAt DESC
      `);
    res.json({ data: result.recordset });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch allocations', meta: err.message });
  }
});
