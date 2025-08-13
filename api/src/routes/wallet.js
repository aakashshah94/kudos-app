import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { query } from '../lib/db.js';

export const router = Router();

router.get('/', authRequired, async (req, res) => {
  const { userId } = req.user;
  const r = await query(`SELECT balancePoints FROM Wallet WHERE userId=@userId`, { userId });
  res.json({ balancePoints: r.recordset[0]?.balancePoints ?? 0 });
});
