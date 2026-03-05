const express = require('express');
const Handover = require('../models/Handover');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/handovers — All handovers
router.get('/', protect, async (req, res) => {
  try {
    const { bed, reviewed } = req.query;
    const filter = {};
    if (bed) filter.bedNumber = bed.toUpperCase();
    if (reviewed !== undefined) filter.isReviewed = reviewed === 'true';

    const handovers = await Handover.find(filter)
      .populate('createdBy', 'name role')
      .populate('reviewedBy', 'name role')
      .populate('patient', 'name age ward')
      .sort({ createdAt: -1 });

    res.json({ handovers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/handovers/unreviewed — For RED section
router.get('/unreviewed', protect, async (req, res) => {
  try {
    const handovers = await Handover.find({ isReviewed: false })
      .populate('createdBy', 'name role')
      .populate('patient', 'name age status ward')
      .sort({ createdAt: -1 });
    res.json({ handovers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/handovers/:id/review — Mark as reviewed
router.post('/:id/review', protect, async (req, res) => {
  try {
    const handover = await Handover.findById(req.params.id);
    if (!handover) return res.status(404).json({ message: 'Handover not found' });
    if (handover.isReviewed) return res.status(400).json({ message: 'Already reviewed' });

    handover.isReviewed = true;
    handover.reviewedBy = req.user._id;
    handover.reviewedAt = new Date();
    await handover.save();

    const updated = await Handover.findById(handover._id)
      .populate('createdBy', 'name role')
      .populate('reviewedBy', 'name role')
      .populate('patient', 'name age status ward');

    res.json({ handover: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
