
import express from 'express';
import * as db from '../lib/db.js';
import auth from '../middleware/auth.js';

export const router = express.Router();

router.get('/', auth, async (req, res) => {
  const tenantId = req.user.tenantId;
  try {
    const pool = await db.getPool();
    const result = await pool.request()
      .input('tenantId', tenantId)
      .query(`
        SELECT * FROM CatalogItem
        WHERE isActive = 1 AND (tenantId IS NULL OR tenantId = @tenantId)
        ORDER BY denominationUSD ASC
      `);
    res.json({ data: result.recordset });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch catalog', meta: err.message });
  }
});
