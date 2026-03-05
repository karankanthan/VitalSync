const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  bedNumber: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true },
  ward: { type: String, enum: ['ICU', 'General', 'Maternity'], required: true },
  status: {
    type: String,
    enum: ['critical', 'stable', 'observation', 'discharge-ready'],
    default: 'stable'
  },
  diagnosis: { type: String, trim: true },
  medications: [{ type: String }],
  notes: { type: String },
  lastUpdated: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isOccupied: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
