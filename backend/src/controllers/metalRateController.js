const MetalRate = require('../models/MetalRate');

// Default fallback rates if DB record does not exist yet
const DEFAULT_RATES = {
  currency: 'PKR',
  gold24kPerGram: 23500,
  gold22kPerGram: 21540,
  goldPerTola: 274100, // 1 tola = 11.664g
  silverPerGram: 285,
  silverPerTola: 3320,
  nisabGoldThreshold: Math.round(23500 * 87.48), // ~2,055,780 PKR (7.5 tola / 87.48g)
  nisabSilverThreshold: Math.round(285 * 612.36), // ~174,523 PKR (52.5 tola / 612.36g)
  source: 'Standard Bullion Rates (Pakistan)',
  lastUpdated: new Date(),
};

/**
 * @route   GET /api/rates
 * @desc    Get live/cached Gold & Silver rates and Nisab thresholds
 * @access  Public
 */
const getMetalRates = async (req, res) => {
  try {
    const currency = (req.query.currency || 'PKR').toUpperCase();

    let rateRecord = await MetalRate.findOne({ currency }).sort({ updatedAt: -1 });

    if (!rateRecord) {
      // Seed default record if none exists
      rateRecord = await MetalRate.create({
        ...DEFAULT_RATES,
        currency,
      });
    }

    const goldNisabGrams = 87.48; // 7.5 Tola
    const silverNisabGrams = 612.36; // 52.5 Tola

    const goldNisabValue = Math.round(rateRecord.gold24kPerGram * goldNisabGrams);
    const silverNisabValue = Math.round(rateRecord.silverPerGram * silverNisabGrams);

    return res.status(200).json({
      success: true,
      data: {
        currency: rateRecord.currency,
        rates: {
          gold24kPerGram: rateRecord.gold24kPerGram,
          gold22kPerGram: rateRecord.gold22kPerGram,
          goldPerTola: rateRecord.goldPerTola,
          silverPerGram: rateRecord.silverPerGram,
          silverPerTola: rateRecord.silverPerTola,
        },
        nisab: {
          goldGrams: goldNisabGrams,
          goldTola: 7.5,
          goldThreshold: goldNisabValue,
          silverGrams: silverNisabGrams,
          silverTola: 52.5,
          silverThreshold: silverNisabValue,
          recommendedStandard: 'silver', // In contemporary Islamic jurisprudence, silver nisab is most beneficial for the poor
          recommendedThreshold: silverNisabValue,
        },
        lastUpdated: rateRecord.updatedAt || rateRecord.lastUpdated,
      },
    });
  } catch (error) {
    console.error('Error fetching metal rates:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch metal rates',
      fallback: DEFAULT_RATES,
    });
  }
};

/**
 * @route   POST /api/rates
 * @desc    Update or seed metal rates
 * @access  Private / Admin
 */
const updateMetalRates = async (req, res) => {
  try {
    const {
      currency = 'PKR',
      gold24kPerGram,
      gold22kPerGram,
      goldPerTola,
      silverPerGram,
      silverPerTola,
    } = req.body;

    const rateRecord = await MetalRate.findOneAndUpdate(
      { currency: currency.toUpperCase() },
      {
        currency: currency.toUpperCase(),
        ...(gold24kPerGram && { gold24kPerGram: Number(gold24kPerGram) }),
        ...(gold22kPerGram && { gold22kPerGram: Number(gold22kPerGram) }),
        ...(goldPerTola && { goldPerTola: Number(goldPerTola) }),
        ...(silverPerGram && { silverPerGram: Number(silverPerGram) }),
        ...(silverPerTola && { silverPerTola: Number(silverPerTola) }),
        lastUpdated: new Date(),
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Metal rates updated successfully',
      data: rateRecord,
    });
  } catch (error) {
    console.error('Error updating metal rates:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update metal rates',
    });
  }
};

module.exports = {
  getMetalRates,
  updateMetalRates,
};
