const express = require('express');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Handover = require('../models/Handover');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/analytics
router.get('/analytics', protect, adminOnly, async (req, res) => {
  try {
    const [patients, handovers, users] = await Promise.all([
      Patient.find(),
      Handover.find().sort({ createdAt: -1 }).limit(50),
      User.find({ isActive: true }).select('-password')
    ]);

    const statusCounts = patients.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});

    const wardCounts = patients.reduce((acc, p) => {
      acc[p.ward] = (acc[p.ward] || 0) + 1;
      return acc;
    }, {});

    const shiftCounts = handovers.reduce((acc, h) => {
      acc[h.shiftStart] = (acc[h.shiftStart] || 0) + 1;
      return acc;
    }, {});

    const unreviewed = handovers.filter(h => !h.isReviewed).length;

    res.json({
      totalBeds: patients.length,
      criticalCount: statusCounts.critical || 0,
      stableCount: statusCounts.stable || 0,
      unreviewedHandovers: unreviewed,
      statusCounts,
      wardCounts,
      shiftCounts,
      totalStaff: users.length,
      recentHandovers: handovers.slice(0, 10)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/staff
router.get('/staff', protect, adminOnly, async (req, res) => {
  try {
    const staff = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ staff });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/staff — Add new staff
router.post('/staff', protect, adminOnly, async (req, res) => {
  try {
    const { name, email, password, role, ward } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role, ward });
    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/staff/:id — Update staff
router.put('/staff/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, role, ward, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, ward, isActive },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
