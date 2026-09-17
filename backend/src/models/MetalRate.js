const mongoose = require('mongoose');

const metalRateSchema = new mongoose.Schema(
  {
    currency: {
      type: String,
      default: 'PKR',
      uppercase: true,
      trim: true,
    },
    // Gold rates
    gold24kPerGram: {
      type: Number,
      required: true,
      default: 23500, // PKR default estimation
    },
    gold22kPerGram: {
      type: Number,
      default: 21540,
    },
    goldPerTola: {
      type: Number,
      default: 274100, // ~11.66 grams
    },
    // Silver rates
    silverPerGram: {
      type: Number,
      required: true,
      default: 285, // PKR default estimation
    },
    silverPerTola: {
      type: Number,
      default: 3320,
    },
    // Shariah Nisab constants
    // Gold Nisab: 87.48 grams (7.5 Tola)
    // Silver Nisab: 612.36 grams (52.5 Tola)
    nisabGoldThreshold: {
      type: Number,
    },
    nisabSilverThreshold: {
      type: Number,
    },
    source: {
      type: String,
      default: 'Market Standard Rates',
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to compute exact Nisab amounts
metalRateSchema.pre('save', function (next) {
  this.nisabGoldThreshold = Math.round(this.gold24kPerGram * 87.48);
  this.nisabSilverThreshold = Math.round(this.silverPerGram * 612.36);
  next();
});

module.exports = mongoose.model('MetalRate', metalRateSchema);
