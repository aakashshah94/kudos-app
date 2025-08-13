const express = require('express');
const db = require('../lib/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const tenantId = req.user.tenantId;
  try {
    const result = await db.pool.request()
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

module.exports = router;
