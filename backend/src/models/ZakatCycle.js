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
      default: '1447 AH',
      trim: true,
    },
    gregorianYear: {
      type: String,
      default: () => new Date().getFullYear().toString(),
      trim: true,
    },
    zakatPeriod: {
      type: String,
      trim: true,
    },
    totalDue: {
      type: Number,
      default: 0,
      min: 0,
    },
    originalCalculatedAmount: {
      type: Number,
      default: 0,
    },
    trackingTotal: {
      type: Number,
      default: 0,
    },
    totalPaid: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: String,
      trim: true,
    },
    nisabThreshold: {
      type: Number,
      default: 174523,
    },
    isNisabMet: {
      type: Boolean,
      default: true,
    },
    assetBreakdown: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    totalEligibleAssets: {
      type: Number,
      default: 0,
    },
    deductibleDebts: {
      type: Number,
      default: 0,
    },
    netZakatableWealth: {
      type: Number,
      default: 0,
    },
    payments: {
      type: Array,
      default: [],
    },
    nisabDate: {
      type: String,
      default: '12 Ramadan 1447',
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
      index: true,
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
zakatCycleSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ZakatCycle', zakatCycleSchema);
