const mongoose = require('mongoose');

const zakatCalculationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    cycleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ZakatCycle',
    },
    year: {
      type: String,
      default: () => new Date().getFullYear().toString(),
      trim: true,
    },
    hijriYear: {
      type: String,
      default: '1445 AH',
    },
    currency: {
      type: String,
      default: 'PKR',
      uppercase: true,
    },
    // Selected category flags
    selectedCategories: {
      goldSilver: { type: Boolean, default: true },
      cash: { type: Boolean, default: true },
      stocks: { type: Boolean, default: true },
      property: { type: Boolean, default: false },
      business: { type: Boolean, default: false },
      liabilities: { type: Boolean, default: true },
    },
    // Itemized values entered by user
    values: {
      goldVal: { type: Number, default: 0 },
      silverVal: { type: Number, default: 0 },
      cashHand: { type: Number, default: 0 },
      bankSavings: { type: Number, default: 0 },
      stockVal: { type: Number, default: 0 },
      propertyVal: { type: Number, default: 0 },
      businessVal: { type: Number, default: 0 },
      liabilitiesVal: { type: Number, default: 0 },
    },
    // Computed totals
    totalAssets: {
      type: Number,
      required: true,
      default: 0,
    },
    totalLiabilities: {
      type: Number,
      default: 0,
    },
    netZakatableWealth: {
      type: Number,
      required: true,
      default: 0,
    },
    nisabThreshold: {
      type: Number,
      default: 0,
    },
    isAboveNisab: {
      type: Boolean,
      default: true,
    },
    zakatRatePercent: {
      type: Number,
      default: 2.5,
    },
    zakatDue: {
      type: Number,
      required: true,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

zakatCalculationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ZakatCalculation', zakatCalculationSchema);
