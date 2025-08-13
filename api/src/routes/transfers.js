const express = require('express');
const { z } = require('zod');
const db = require('../lib/db');
const auth = require('../middleware/auth');

const MIN_TRANSFER_POINTS = 50;

const router = express.Router();

const transferSchema = z.object({
  recipientUserId: z.string().uuid(),
  message: z.string().max(256),
  isPublic: z.boolean(),
  points: z.number().int().min(MIN_TRANSFER_POINTS),
});

router.post('/', auth, async (req, res) => {
  const { success, data, error } = transferSchema.safeParse(req.body);
  if (!success) return res.status(400).json({ error: error.errors });

  const { recipientUserId, message, isPublic, points } = data;
  const senderUserId = req.user.userId;
  if (recipientUserId === senderUserId) {
    return res.status(400).json({ error: 'Cannot send kudos to yourself.' });
  }

  const tx = await db.pool.request().transaction();
  try {
    await tx.begin('SERIALIZABLE');
    // Check sender balance
    const senderRes = await tx.request()
      .input('userId', senderUserId)
      .query('SELECT balance FROM Wallet WHERE userId = @userId');
    if (!senderRes.recordset[0] || senderRes.recordset[0].balance < points) {
      await tx.rollback();
      return res.status(400).json({ error: 'Insufficient balance.' });
    }
    // Deduct from sender, add to recipient
    await tx.request()
      .input('userId', senderUserId)
      .input('points', points)
      .query('UPDATE Wallet SET balance = balance - @points, lastUpdated = GETDATE() WHERE userId = @userId');
    await tx.request()
      .input('userId', recipientUserId)
      .input('points', points)
      .query('UPDATE Wallet SET balance = balance + @points, lastUpdated = GETDATE() WHERE userId = @userId');
    // Insert transfer
    const transferId = require('uuid').v4();
    await tx.request()
      .input('transferId', transferId)
      .input('senderUserId', senderUserId)
      .input('recipientUserId', recipientUserId)
      .input('message', message)
      .input('isPublic', isPublic)
      .input('points', points)
      .query(`
        INSERT INTO Transfer (transferId, senderUserId, recipientUserId, message, isPublic, points, createdAt)
        VALUES (@transferId, @senderUserId, @recipientUserId, @message, @isPublic, @points, GETDATE())
      `);
    await tx.commit();
    res.status(201).json({ data: { transferId } });
  } catch (err) {
    await tx.rollback();
    res.status(500).json({ error: 'Transfer failed', meta: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  const { direction = 'sent', limit = 50, offset = 0 } = req.query;
  const userId = req.user.userId;
  let where = '';
  if (direction === 'sent') where = 'senderUserId = @userId';
  else where = 'recipientUserId = @userId';

  try {
    const result = await db.pool.request()
      .input('userId', userId)
      .input('limit', limit)
      .input('offset', offset)
      .query(`
        SELECT * FROM Transfer
        WHERE ${where}
        ORDER BY createdAt DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);
    res.json({ data: result.recordset });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transfers', meta: err.message });
  }
});

module.exports = router;
