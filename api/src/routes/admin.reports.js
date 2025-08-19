
import express from 'express';
import { z } from 'zod';
import * as db from '../lib/db.js';
import auth from '../middleware/auth.js';

export const router = express.Router();

const monthSchema = z.object({
  month: z.string().regex(/^[0-9]{4}-[0-9]{2}$/), // YYYY-MM
});

// GET /api/admin/reports/monthly?month=YYYY-MM
router.get('/monthly', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  const { month } = req.query;
  const parsed = monthSchema.safeParse({ month });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  try {
    // Allocations
    const pool = await db.getPool();
    const allocations = await pool.request()
      .input('tenantId', req.user.tenantId)
      .input('month', month)
      .query(`SELECT userId, points FROM Allocation WHERE tenantId = @tenantId AND month = @month`);
    // Transfers
    const transfers = await pool.request()
      .input('tenantId', req.user.tenantId)
      .input('month', month)
      .query(`SELECT senderUserId, recipientUserId, points FROM Transfer WHERE senderUserId IN (SELECT userId FROM [User] WHERE tenantId = @tenantId) AND FORMAT(createdAt, 'yyyy-MM') = @month`);
    // Redemptions
    const redemptions = await pool.request()
      .input('tenantId', req.user.tenantId)
      .input('month', month)
      .query(`SELECT userId, usdValue FROM Redemption WHERE userId IN (SELECT userId FROM [User] WHERE tenantId = @tenantId) AND FORMAT(createdAt, 'yyyy-MM') = @month AND status = 'FULFILLED'`);
    // Aggregate per user
    const summary = {};
    for (const alloc of allocations.recordset) {
      summary[alloc.userId] = { userId: alloc.userId, month, points: alloc.points, transferCount: 0, redemptionCount: 0, totalRedeemedUSD: 0 };
    }
    for (const t of transfers.recordset) {
      if (summary[t.senderUserId]) summary[t.senderUserId].transferCount++;
    }
    for (const r of redemptions.recordset) {
      if (summary[r.userId]) {
        summary[r.userId].redemptionCount++;
        summary[r.userId].totalRedeemedUSD += r.usdValue;
      }
    }
    // CSV output
    const header = 'userId,month,points,transferCount,redemptionCount,totalRedeemedUSD';
    const rows = Object.values(summary).map(u => `${u.userId},${u.month},${u.points},${u.transferCount},${u.redemptionCount},${u.totalRedeemedUSD}`);
    const csv = [header, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate report', meta: err.message });
  }
});


