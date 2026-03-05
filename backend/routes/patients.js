const express = require('express');
const Patient = require('../models/Patient');
const Handover = require('../models/Handover');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/patients — List all or search by bed
router.get('/', protect, async (req, res) => {
  try {
    const { bed, ward, status } = req.query;
    const filter = {};
    if (bed) filter.bedNumber = bed.toUpperCase();
    if (ward) filter.ward = ward;
    if (status) filter.status = status;

    const patients = await Patient.find(filter)
      .populate('updatedBy', 'name role')
      .sort({ lastUpdated: -1 });
    res.json({ patients });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/patients/changes — Beds updated this shift (RED section)
router.get('/changes', protect, async (req, res) => {
  try {
    const shiftStart = getShiftStart();
    const patients = await Patient.find({ lastUpdated: { $gte: shiftStart } })
      .populate('updatedBy', 'name role')
      .sort({ lastUpdated: -1 });

    const unreviewedHandovers = await Handover.find({ isReviewed: false })
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ patients, unreviewedHandovers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/patients/:bed — Single patient
router.get('/:bed', protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ bedNumber: req.params.bed.toUpperCase() })
      .populate('updatedBy', 'name role');
    if (!patient) return res.status(404).json({ message: 'Bed not found' });

    const handovers = await Handover.find({ bedNumber: req.params.bed.toUpperCase() })
      .populate('createdBy', 'name role')
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ patient, handovers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/patients — Create patient
router.post('/', protect, async (req, res) => {
  try {
    const { bedNumber, name, age, ward, status, diagnosis, medications, notes } = req.body;

    const exists = await Patient.findOne({ bedNumber: bedNumber.toUpperCase() });
    if (exists) return res.status(400).json({ message: 'Bed already occupied' });

    const patient = await Patient.create({
      bedNumber: bedNumber.toUpperCase(), name, age, ward,
      status, diagnosis, medications, notes,
      updatedBy: req.user._id,
      lastUpdated: new Date()
    });

    res.status(201).json({ patient });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/patients/:bed/update — Update patient & auto-create handover
router.put('/:bed/update', protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ bedNumber: req.params.bed.toUpperCase() });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const { status, medications, addMeds, removeMeds, notes, instructions } = req.body;

    // Track changes for handover
    const changes = {};

    if (status && status !== patient.status) {
      changes.status = { from: patient.status, to: status };
      patient.status = status;
    }

    let medsAdded = [];
    let medsRemoved = [];

    if (addMeds && addMeds.length > 0) {
      medsAdded = addMeds.filter(m => !patient.medications.includes(m));
      patient.medications.push(...medsAdded);
    }

    if (removeMeds && removeMeds.length > 0) {
      medsRemoved = removeMeds.filter(m => patient.medications.includes(m));
      patient.medications = patient.medications.filter(m => !removeMeds.includes(m));
    }

    if (medsAdded.length || medsRemoved.length) {
      changes.medications = { added: medsAdded, removed: medsRemoved };
    }

    if (notes) {
      changes.notes = notes;
      patient.notes = notes;
    }

    patient.updatedBy = req.user._id;
    patient.lastUpdated = new Date();
    await patient.save();

    // Auto-create handover if there were changes
    if (Object.keys(changes).length > 0) {
      await Handover.create({
        bedNumber: patient.bedNumber,
        patient: patient._id,
        changes,
        instructions: instructions || '',
        shiftStart: getCurrentShift(),
        createdBy: req.user._id
      });
    }

    const updatedPatient = await Patient.findById(patient._id).populate('updatedBy', 'name role');
    res.json({ patient: updatedPatient, changes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/patients/:bed — Discharge / remove patient
router.delete('/:bed', protect, async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({ bedNumber: req.params.bed.toUpperCase() });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json({ message: `Patient discharged from bed ${req.params.bed}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Utility
function getShiftStart() {
  const now = new Date();
  const hour = now.getHours();
  const start = new Date(now);
  if (hour >= 6 && hour < 14) start.setHours(6, 0, 0, 0);
  else if (hour >= 14 && hour < 22) start.setHours(14, 0, 0, 0);
  else { start.setHours(22, 0, 0, 0); if (hour < 6) start.setDate(start.getDate() - 1); }
  return start;
}

function getCurrentShift() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 14) return 'Morning';
  if (hour >= 14 && hour < 22) return 'Afternoon';
  return 'Night';
}

module.exports = router;
