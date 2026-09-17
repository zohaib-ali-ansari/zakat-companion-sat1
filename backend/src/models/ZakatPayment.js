const mongoose = require('mongoose');

const zakatPaymentSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [1, 'Amount must be greater than 0'],
    },
    recipient: {
      type: String,
      required: [true, 'Recipient name/organization is required'],
      trim: true,
    },
    date: {
      type: String,
      required: true,
      default: () => new Date().toISOString().split('T')[0],
      trim: true,
    },
    year: {
      type: String,
      default: () => new Date().getFullYear().toString(),
      trim: true,
      index: true,
    },
    category: {
      type: String,
      default: 'Zakat',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending'],
      default: 'Paid',
    },
    receiptUrl: {
      type: String,
      default: '',
    },
    currency: {
      type: String,
      default: 'PKR',
      uppercase: true,
    },
  },
  {
    timestamps: true,
  }
);

zakatPaymentSchema.index({ userId: 1, date: -1 });
zakatPaymentSchema.index({ userId: 1, year: 1 });

module.exports = mongoose.model('ZakatPayment', zakatPaymentSchema);
