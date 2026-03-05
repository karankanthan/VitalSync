const mongoose = require('mongoose');

const handoverSchema = new mongoose.Schema({
  bedNumber: { type: String, required: true, uppercase: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  changes: {
    status: {
      from: String,
      to: String
    },
    medications: {
      added: [String],
      removed: [String]
    },
    notes: String
  },
  instructions: { type: String },
  shiftStart: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Night'],
    required: true
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isReviewed: { type: Boolean, default: false },
  reviewedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Handover', handoverSchema);
