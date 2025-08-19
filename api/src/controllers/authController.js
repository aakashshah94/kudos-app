import bcrypt from 'bcryptjs';
import { signToken } from '../middleware/auth.js';
import { query } from '../lib/db.js';
import { v4 as uuid } from 'uuid';

// POST /auth/register
export async function register(req, res) {
  const { tenantId, name, email, password } = req.body;
  if (!tenantId || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  const userId = uuid();
  const hash = await bcrypt.hash(password, 10);
  try {
    await query(`
      INSERT INTO [User] (userId, tenantId, name, email, role, status)
      VALUES (@userId, @tenantId, @name, @email, 'EMPLOYEE', 'ACTIVE');
      INSERT INTO Wallet (walletId, userId, balancePoints) VALUES (@walletId, @userId, 0);
    `, { userId, tenantId, name, email, walletId: uuid() });
    // Store hash securely later (separate table); omitted here for brevity
    const token = signToken({ userId, tenantId, email, role: 'EMPLOYEE' });
    res.json({ token });
  } catch (e) {
    console.error('Registration error:', e);
    res.status(500).json({ error: 'Registration failed', details: e.message });
  }
}

// POST /auth/login
export async function login(req, res) {
  const { email } = req.body;
  // For pilot: trust email exists and issue token (DON'T do this in prod)
  try {
    const result = await query(`SELECT TOP 1 userId, tenantId, email, role FROM [User] WHERE email=@email`, { email });
    if (!result.recordset.length) return res.status(401).json({ error: 'User not found' });
    const u = result.recordset[0];
    const token = signToken({ userId: u.userId, tenantId: u.tenantId, email: u.email, role: u.role });
    res.json({ token });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Login failed', details: e.message });
  }
}
