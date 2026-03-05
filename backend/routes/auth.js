const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'vitalsync_secret_key', { expiresIn: '12h' });

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email, isActive: true });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ward: user.ward
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/seed  (Dev only - seed initial admin + demo users)
router.post('/seed', async (req, res) => {
  try {
    const exists = await User.findOne({ email: 'admin@vitalsync.com' });
    if (exists) return res.json({ message: 'Already seeded' });

    await User.create([
      { name: 'Admin User', email: 'admin@vitalsync.com', password: 'admin123', role: 'admin', ward: 'All' },
      { name: 'Dr. Rajesh Kumar', email: 'rajesh@vitalsync.com', password: 'doctor123', role: 'doctor', ward: 'ICU' },
      { name: 'Nurse Priya', email: 'priya@vitalsync.com', password: 'nurse123', role: 'nurse', ward: 'General' }
    ]);
    res.json({ message: 'Seeded successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
