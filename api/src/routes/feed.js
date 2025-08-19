
import express from 'express';
import * as db from '../lib/db.js';
import auth from '../middleware/auth.js';

export const router = express.Router();

router.get('/', auth, async (req, res) => {
  const { limit = 20, offset = 0 } = req.query;
  const tenantId = req.user.tenantId;

  try {
    const pool = await db.getPool();
    const result = await pool.request()
      .input('tenantId', tenantId)
      .input('limit', limit)
      .input('offset', offset)
      .query(`
        SELECT t.*, u.name AS senderName, r.name AS recipientName
        FROM Transfer t
        JOIN [User] u ON t.senderUserId = u.userId
        JOIN [User] r ON t.recipientUserId = r.userId
        WHERE t.isPublic = 1 AND u.tenantId = @tenantId
        ORDER BY t.createdAt DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);
    res.json({ data: result.recordset });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feed', meta: err.message });
  }
});
