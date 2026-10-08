require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { sendOtp, verifyOtp } = require('./minimoth');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// Middleware
app.use(cors());
app.use(express.json());

// Auth helper middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// -------------------------------------------------------------
// ENDPOINT 1: Send OTP via Minimoth
// POST /api/auth/send-otp
// -------------------------------------------------------------
app.post('/api/auth/send-otp', async (req, res) => {
  const { phone } = req.body;

  if (!phone || typeof phone !== 'string' || phone.trim().length < 10) {
    return res.status(400).json({ error: 'Valid phone number is required (min 10 digits)' });
  }

  try {
    const result = await sendOtp(phone.trim());
    const isSandbox = Boolean(process.env.MINIMOTH_API_KEY && process.env.MINIMOTH_API_KEY.startsWith('mm_test_'));
    return res.json({
      success: true,
      message: isSandbox ? 'Test OTP sent. In sandbox mode, use verification code: 000000' : (result.message || 'OTP sent successfully'),
      isSandbox,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to send OTP' });
  }
});

// -------------------------------------------------------------
// ENDPOINT 2: Verify OTP via Minimoth & Login/Register
// POST /api/auth/verify-otp
// -------------------------------------------------------------
app.post('/api/auth/verify-otp', async (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ error: 'Both phone and OTP code are required' });
  }

  try {
    await verifyOtp(phone.trim(), code.trim());

    // Find or create user
    const selectStmt = db.prepare('SELECT id, phone, created_at FROM users WHERE phone = ?');
    let user = selectStmt.get(phone.trim());

    if (!user) {
      const insertStmt = db.prepare('INSERT INTO users (phone) VALUES (?)');
      const info = insertStmt.run(phone.trim());
      user = { id: Number(info.lastInsertRowid), phone: phone.trim() };
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, phone: user.phone }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.json({
      token,
      user: { id: user.id, phone: user.phone },
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'OTP verification failed' });
  }
});

// -------------------------------------------------------------
// ENDPOINT 3: List all packages for current user
// GET /api/packages
// -------------------------------------------------------------
app.get('/api/packages', authenticateToken, (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT id, tracking_number, title, carrier, status, estimated_delivery, created_at 
      FROM packages 
      WHERE user_id = ? 
      ORDER BY id DESC
    `);
    const packages = stmt.all(req.user.id);
    return res.json(packages);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// -------------------------------------------------------------
// ENDPOINT 4: Create a new package
// POST /api/packages
// -------------------------------------------------------------
app.post('/api/packages', authenticateToken, (req, res) => {
  const { tracking_number, title, carrier, estimated_delivery, origin } = req.body;

  if (!tracking_number || !title || !carrier) {
    return res.status(400).json({ error: 'tracking_number, title, and carrier are required' });
  }

  try {
    const insertPackage = db.prepare(`
      INSERT INTO packages (user_id, tracking_number, title, carrier, status, estimated_delivery)
      VALUES (?, ?, ?, ?, 'In Transit', ?)
    `);

    const result = insertPackage.run(
      req.user.id,
      tracking_number.trim(),
      title.trim(),
      carrier.trim(),
      estimated_delivery || 'In 3 business days'
    );

    const packageId = Number(result.lastInsertRowid);

    // Seed initial checkpoint
    const insertCheckpoint = db.prepare(`
      INSERT INTO checkpoints (package_id, status, location)
      VALUES (?, ?, ?)
    `);
    insertCheckpoint.run(packageId, 'Package Registered & Dispatched', origin?.trim() || 'Central Sort Facility');

    return res.status(201).json({
      id: packageId,
      tracking_number: tracking_number.trim(),
      title: title.trim(),
      carrier: carrier.trim(),
      status: 'In Transit',
      estimated_delivery: estimated_delivery || 'In 3 business days',
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create package' });
  }
});

// -------------------------------------------------------------
// ENDPOINT 5: Get single package details & checkpoints
// GET /api/packages/:id
// -------------------------------------------------------------
app.get('/api/packages/:id', authenticateToken, (req, res) => {
  const packageId = Number(req.params.id);

  if (!packageId) {
    return res.status(400).json({ error: 'Valid package ID required' });
  }

  try {
    const pkgStmt = db.prepare(`
      SELECT id, tracking_number, title, carrier, status, estimated_delivery, created_at 
      FROM packages 
      WHERE id = ? AND user_id = ?
    `);
    const pkg = pkgStmt.get(packageId, req.user.id);

    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const checkStmt = db.prepare(`
      SELECT id, status, location, timestamp 
      FROM checkpoints 
      WHERE package_id = ? 
      ORDER BY id ASC
    `);
    const checkpoints = checkStmt.all(packageId);

    return res.json({
      ...pkg,
      checkpoints,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch package details' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
