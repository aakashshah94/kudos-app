const express = require('express');
const db = require('../lib/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const { limit = 20, offset = 0 } = req.query;
  const tenantId = req.user.tenantId;

  try {
    const result = await db.pool.request()
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

module.exports = router;
