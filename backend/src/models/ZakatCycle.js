const mongoose = require('mongoose');

const zakatCycleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    hijriYear: {
      type: String,
      default: '1445 AH',
      trim: true,
    },
    gregorianYear: {
      type: String,
      default: () => new Date().getFullYear().toString(),
      trim: true,
    },
    totalDue: {
      type: Number,
      default: 0,
      min: 0,
    },
    nisabDate: {
      type: String,
      default: '12 Ramadan 1445',
      trim: true,
    },
    currency: {
      type: String,
      default: 'PKR',
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly find active cycle for a user
zakatCycleSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('ZakatCycle', zakatCycleSchema);
