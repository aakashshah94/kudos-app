
import express from 'express';
import auth from '../middleware/auth.js';
import * as db from '../lib/db.js';

export const router = express.Router();

router.get('/', auth, async (req, res) => {
  const { userId } = req.user;
  try {
    const pool = await db.getPool();
    const r = await pool.request()
      .input('userId', userId)
      .query('SELECT balance FROM Wallet WHERE userId=@userId');
    res.json({ balance: r.recordset[0]?.balance ?? 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wallet balance', meta: err.message });
  }
});
