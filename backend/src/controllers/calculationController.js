const ZakatCalculation = require('../models/ZakatCalculation');
const ZakatCycle = require('../models/ZakatCycle');
const MetalRate = require('../models/MetalRate');

// Default Silver Nisab threshold in PKR
const DEFAULT_SILVER_NISAB_PKR = 174523;

/**
 * Helper to compute zakat breakdown
 */
const computeZakatValues = ({
  selectedCategories = {},
  values = {},
  silverNisabThreshold = DEFAULT_SILVER_NISAB_PKR,
}) => {
  const isSelected = (key) => selectedCategories[key] !== false;

  const gold = isSelected('goldSilver') ? Math.max(0, parseFloat(values.goldVal) || 0) : 0;
  const silver = isSelected('goldSilver') ? Math.max(0, parseFloat(values.silverVal) || 0) : 0;
  const cashHand = isSelected('cash') ? Math.max(0, parseFloat(values.cashHand) || 0) : 0;
  const bankSavings = isSelected('cash') ? Math.max(0, parseFloat(values.bankSavings) || 0) : 0;
  const stocks = isSelected('stocks') ? Math.max(0, parseFloat(values.stockVal) || 0) : 0;
  const property = isSelected('property') ? Math.max(0, parseFloat(values.propertyVal) || 0) : 0;
  const business = isSelected('business') ? Math.max(0, parseFloat(values.businessVal) || 0) : 0;
  const liabilities = isSelected('liabilities') ? Math.max(0, parseFloat(values.liabilitiesVal) || 0) : 0;

  const totalAssets = gold + silver + cashHand + bankSavings + stocks + property + business;
  const netZakatableWealth = Math.max(0, totalAssets - liabilities);
  const isAboveNisab = netZakatableWealth >= silverNisabThreshold;
  const zakatRatePercent = 2.5;
  const zakatDue = isAboveNisab ? Math.round(netZakatableWealth * 0.025) : 0;

  const breakdown = {
    goldSilverTotal: gold + silver,
    cashBankTotal: cashHand + bankSavings,
    stocksTotal: stocks,
    propertyTotal: property,
    businessTotal: business,
    totalAssets,
    totalLiabilities: liabilities,
    netZakatableWealth,
    nisabThreshold: silverNisabThreshold,
    isAboveNisab,
    zakatRatePercent,
    zakatDue,
  };

  return breakdown;
};

/**
 * @route   POST /api/calculations/compute
 * @desc    Test/compute calculation on the fly without saving
 * @access  Public / Authenticated
 */
const computeZakat = async (req, res) => {
  try {
    const { selectedCategories, values, currency = 'PKR' } = req.body;

    const rateRecord = await MetalRate.findOne({ currency: currency.toUpperCase() });
    const silverNisabThreshold = rateRecord?.nisabSilverThreshold || DEFAULT_SILVER_NISAB_PKR;

    const result = computeZakatValues({
      selectedCategories,
      values,
      silverNisabThreshold,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error computing Zakat:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to compute Zakat',
    });
  }
};

/**
 * @route   POST /api/calculations
 * @desc    Save a complete calculation snapshot for the user
 * @access  Private
 */
const saveCalculation = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      selectedCategories,
      values,
      year = new Date().getFullYear().toString(),
      hijriYear = '1445 AH',
      currency = 'PKR',
      notes = '',
      updateCycleObligation = true, // Whether to sync this zakat due to active cycle
    } = req.body;

    const rateRecord = await MetalRate.findOne({ currency: currency.toUpperCase() });
    const silverNisabThreshold = rateRecord?.nisabSilverThreshold || DEFAULT_SILVER_NISAB_PKR;

    const breakdown = computeZakatValues({
      selectedCategories,
      values,
      silverNisabThreshold,
    });

    // Find or create active ZakatCycle
    let cycle = await ZakatCycle.findOne({ userId, status: 'active' });
    if (!cycle) {
      cycle = await ZakatCycle.create({
        userId,
        hijriYear,
        gregorianYear: year,
        totalDue: breakdown.zakatDue,
        currency,
        status: 'active',
      });
    } else if (updateCycleObligation) {
      cycle.totalDue = breakdown.zakatDue;
      await cycle.save();
    }

    const newCalculation = await ZakatCalculation.create({
      userId,
      cycleId: cycle._id,
      year,
      hijriYear,
      currency,
      selectedCategories,
      values,
      totalAssets: breakdown.totalAssets,
      totalLiabilities: breakdown.totalLiabilities,
      netZakatableWealth: breakdown.netZakatableWealth,
      nisabThreshold: breakdown.nisabThreshold,
      isAboveNisab: breakdown.isAboveNisab,
      zakatRatePercent: breakdown.zakatRatePercent,
      zakatDue: breakdown.zakatDue,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: 'Zakat calculation saved successfully',
      data: newCalculation,
      cycle,
    });
  } catch (error) {
    console.error('Error saving calculation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save Zakat calculation',
    });
  }
};

/**
 * @route   GET /api/calculations
 * @desc    Get user's calculation history
 * @access  Private
 */
const getUserCalculations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { year } = req.query;

    const query = { userId };
    if (year) {
      query.year = String(year);
    }

    const calculations = await ZakatCalculation.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: calculations.length,
      data: calculations,
    });
  } catch (error) {
    console.error('Error fetching calculations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch calculations',
    });
  }
};

/**
 * @route   GET /api/calculations/latest
 * @desc    Get the latest calculation for the logged-in user
 * @access  Private
 */
const getLatestCalculation = async (req, res) => {
  try {
    const userId = req.user._id;
    const latest = await ZakatCalculation.findOne({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: latest || null,
    });
  } catch (error) {
    console.error('Error fetching latest calculation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch latest calculation',
    });
  }
};

/**
 * @route   DELETE /api/calculations/:id
 * @desc    Delete a specific calculation
 * @access  Private
 */
const deleteCalculation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const calculation = await ZakatCalculation.findOneAndDelete({ _id: id, userId });

    if (!calculation) {
      return res.status(404).json({
        success: false,
        message: 'Calculation not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Calculation deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting calculation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete calculation',
    });
  }
};

module.exports = {
  computeZakat,
  saveCalculation,
  getUserCalculations,
  getLatestCalculation,
  deleteCalculation,
};
