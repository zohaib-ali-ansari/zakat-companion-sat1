const mongoose = require('mongoose');
const ZakatPayment = require('../models/ZakatPayment');
const ZakatCycle = require('../models/ZakatCycle');
const ZakatCalculation = require('../models/ZakatCalculation');

/**
 * Helper to get or create active cycle for user
 */
const getOrCreateActiveCycle = async (userId) => {
  let cycle = await ZakatCycle.findOne({ userId, status: 'active' });
  if (!cycle) {
    cycle = await ZakatCycle.create({
      userId,
      hijriYear: '1445 AH',
      gregorianYear: new Date().getFullYear().toString(),
      totalDue: 340000, // Default baseline for demo / initial profile
      nisabDate: '12 Ramadan 1445',
      currency: 'PKR',
      status: 'active',
    });
  }
  return cycle;
};

/**
 * @route   GET /api/payments/summary
 * @desc    Get complete summary for Dashboard and Tracking screen
 * @access  Private
 */
const getZakatSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const cycle = await getOrCreateActiveCycle(userId);

    // 1. Fetch completed/archived cycles from MongoDB
    const archivedCycles = await ZakatCycle.find({
      userId,
      status: { $in: ['completed', 'archived'] },
    }).sort({ createdAt: -1 });

    // 2. Fetch active payments (for the currently active cycle only)
    const activePayments = await ZakatPayment.find({
      userId,
      cycleId: cycle._id,
      status: { $ne: 'archived' },
    }).sort({ date: -1, createdAt: -1 });

    const totalPaid = activePayments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalDue = Number(cycle.totalDue) || 0;
    const remaining = Math.max(0, totalDue - totalPaid);
    const percentPaid = totalDue <= 0 ? 100 : Math.min(100, Math.round((totalPaid / totalDue) * 100));

    // 3. Format completed cycles into yearlyHistory
    const yearlyHistory = archivedCycles.map((c) => ({
      id: c._id.toString(),
      _id: c._id.toString(),
      year: c.gregorianYear || String(new Date(c.createdAt).getFullYear()),
      zakatPeriod: c.zakatPeriod || `${c.hijriYear || '1447 AH'} (${c.gregorianYear || '2026'})`,
      hijriYear: c.hijriYear || '1447 AH',
      originalCalculatedAmount: c.originalCalculatedAmount || c.totalDue || 0,
      trackingTotal: c.trackingTotal || c.totalDue || 0,
      totalPaid: c.totalPaid || (Array.isArray(c.payments) ? c.payments.reduce((s, p) => s + (Number(p.amount) || 0), 0) : 0),
      completedAt: c.completedAt || (c.createdAt ? c.createdAt.toISOString().split('T')[0] : 'Completed'),
      nisabThreshold: c.nisabThreshold || 174523,
      isNisabMet: c.isNisabMet !== undefined ? c.isNisabMet : true,
      totalEligibleAssets: c.totalEligibleAssets || 0,
      deductibleDebts: c.deductibleDebts || 0,
      netZakatableWealth: c.netZakatableWealth || 0,
      assetBreakdown: c.assetBreakdown || {},
      payments: Array.isArray(c.payments)
        ? c.payments.map((p, idx) => ({
            id: p.id || p._id || `p-${c._id}-${idx}`,
            _id: p._id || p.id || `p-${c._id}-${idx}`,
            amount: Number(p.amount) || 0,
            recipient: p.recipient || 'Beneficiary',
            date: p.date || c.completedAt || 'Past Record',
            notes: p.notes || '',
            category: p.category || 'Zakat',
            status: p.status || 'Paid',
          }))
        : [],
    }));

    // Recipient breakdown for active cycle
    const recipientMap = {};
    activePayments.forEach((p) => {
      const rec = p.recipient || 'Other';
      recipientMap[rec] = (recipientMap[rec] || 0) + (Number(p.amount) || 0);
    });
    const recipientBreakdown = Object.entries(recipientMap).map(([recipient, amount]) => ({
      recipient,
      amount,
      percentage: totalPaid > 0 ? Math.round((amount / totalPaid) * 100) : 0,
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalDue,
        totalPaid,
        remaining,
        percentPaid,
        hijriYear: cycle.hijriYear,
        nisabDate: cycle.nisabDate,
        currency: cycle.currency || 'PKR',
        activeCycleId: cycle._id,
        totalRecordsCount: activePayments.length,
        recentPayments: activePayments.slice(0, 5),
        records: activePayments,
        yearlyHistory,
        recipientBreakdown,
      },
    });
  } catch (error) {
    console.error('Error fetching zakat summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch zakat summary',
    });
  }
};

/**
 * @route   GET /api/payments
 * @desc    Get all payments with optional filtering (year, recipient, category)
 * @access  Private
 */
const getPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { year, recipient, category } = req.query;

    const query = { userId };

    if (year) {
      query.$or = [
        { year: String(year) },
        { date: new RegExp(`^${year}`) },
      ];
    }
    if (recipient) {
      query.recipient = new RegExp(recipient, 'i');
    }
    if (category) {
      query.category = category;
    }

    const payments = await ZakatPayment.find(query).sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
    });
  }
};

/**
 * @route   POST /api/payments
 * @desc    Add a new Zakat payment record
 * @access  Private
 */
const addPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount, recipient, date, notes = '', category = 'Zakat', receiptUrl = '', status = 'Paid' } = req.body;

    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment amount greater than 0 is required',
      });
    }

    if (!recipient || !recipient.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Recipient name/organization is required',
      });
    }

    const paymentDate = date?.trim() || new Date().toISOString().split('T')[0];
    const year = paymentDate.substring(0, 4);

    const cycle = await getOrCreateActiveCycle(userId);

    const payment = await ZakatPayment.create({
      userId,
      cycleId: cycle._id,
      amount: numericAmount,
      recipient: recipient.trim(),
      date: paymentDate,
      year,
      notes: notes?.trim() || '',
      category: category?.trim() || 'Zakat',
      receiptUrl: receiptUrl?.trim() || '',
      status,
      currency: cycle.currency || 'PKR',
    });

    return res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment,
    });
  } catch (error) {
    console.error('Error adding payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add payment',
    });
  }
};

/**
 * @route   PUT /api/payments/:id
 * @desc    Edit/update an existing payment
 * @access  Private
 */
const updatePayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { amount, recipient, date, notes, category, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    const payment = await ZakatPayment.findOne({ _id: id, userId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    if (amount !== undefined) {
      const numericAmount = parseFloat(amount);
      if (numericAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount must be greater than 0',
        });
      }
      payment.amount = numericAmount;
    }

    if (recipient !== undefined) {
      if (!recipient.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Recipient cannot be empty',
        });
      }
      payment.recipient = recipient.trim();
    }

    if (date !== undefined) {
      payment.date = date.trim();
      payment.year = date.substring(0, 4);
    }

    if (notes !== undefined) payment.notes = notes.trim();
    if (category !== undefined) payment.category = category.trim();
    if (status !== undefined) payment.status = status;

    await payment.save();

    return res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      data: payment,
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update payment',
    });
  }
};

/**
 * @route   DELETE /api/payments/:id
 * @desc    Delete a payment record
 * @access  Private
 */
const deletePayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    const payment = await ZakatPayment.findOneAndDelete({ _id: id, userId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment deleted successfully',
      data: { id },
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete payment',
    });
  }
};

/**
 * @route   DELETE /api/payments/year/:year
 * @desc    Delete all payments for a specific year
 * @access  Private
 */
const deleteYearPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { year } = req.params;

    const isObjectId = mongoose.Types.ObjectId.isValid(year);

    const [cycleResult, paymentResult, calcResult] = await Promise.all([
      ZakatCycle.deleteMany({
        userId,
        $or: [
          ...(isObjectId ? [{ _id: year }] : []),
          { gregorianYear: String(year) },
          { zakatPeriod: new RegExp(year, 'i') },
        ],
      }),
      ZakatPayment.deleteMany({
        userId,
        $or: [
          ...(isObjectId ? [{ cycleId: year }] : []),
          { year: String(year) },
          { date: new RegExp(`^${year}`) },
        ],
      }),
      ZakatCalculation.deleteMany({
        userId,
        year: String(year),
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: `Deleted archived cycle and payment records for year ${year}`,
      deletedCount: (cycleResult.deletedCount || 0) + (paymentResult.deletedCount || 0),
    });
  } catch (error) {
    console.error('Error deleting year payments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete year payments',
    });
  }
};

/**
 * @route   PUT /api/payments/cycle
 * @desc    Update active cycle details (totalDue, nisabDate, hijriYear)
 * @access  Private
 */
const updateCycle = async (req, res) => {
  try {
    const userId = req.user._id;
    const { totalDue, nisabDate, hijriYear, notes } = req.body;

    const cycle = await getOrCreateActiveCycle(userId);

    if (totalDue !== undefined) {
      const val = parseFloat(totalDue);
      if (val >= 0) cycle.totalDue = val;
    }
    if (nisabDate !== undefined) cycle.nisabDate = nisabDate.trim();
    if (hijriYear !== undefined) cycle.hijriYear = hijriYear.trim();
    if (notes !== undefined) cycle.notes = notes.trim();

    await cycle.save();

    return res.status(200).json({
      success: true,
      message: 'Zakat cycle updated successfully',
      data: cycle,
    });
  } catch (error) {
    console.error('Error updating cycle:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update Zakat cycle',
    });
  }
};

/**
 * @route   POST /api/payments/cycle/archive
 * @desc    Archive active cycle and start a new one
 * @access  Private
 */
const archiveCycle = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      originalCalculatedAmount,
      trackingTotal,
      totalPaid,
      completedAt = new Date().toISOString().split('T')[0],
      nisabThreshold,
      isNisabMet = true,
      assetBreakdown,
      totalEligibleAssets,
      deductibleDebts,
      netZakatableWealth,
      payments = [],
      zakatPeriod,
      year = new Date().getFullYear().toString(),
      nextHijriYear = '1447 AH',
      nextNisabDate = '12 Ramadan 1447',
      initialDue = 0,
    } = req.body;

    let activeCycle = await ZakatCycle.findOne({ userId, status: 'active' });
    if (!activeCycle) {
      activeCycle = new ZakatCycle({
        userId,
        status: 'completed',
      });
    }

    // Capture all payments for this cycle
    let cyclePayments = Array.isArray(payments) && payments.length > 0 ? payments : [];
    if (cyclePayments.length === 0) {
      const dbPayments = await ZakatPayment.find({
        userId,
        $or: [{ cycleId: activeCycle._id }, { cycleId: null }, { cycleId: { $exists: false } }],
      });
      cyclePayments = dbPayments.map((p) => ({
        id: p._id.toString(),
        _id: p._id.toString(),
        amount: p.amount,
        recipient: p.recipient,
        date: p.date,
        notes: p.notes || '',
        category: p.category || 'Zakat',
        status: p.status || 'Paid',
      }));
    }

    const calculatedTotalPaid = Number(totalPaid) || cyclePayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);

    activeCycle.status = 'completed';
    activeCycle.gregorianYear = String(year);
    activeCycle.hijriYear = nextHijriYear;
    activeCycle.zakatPeriod = zakatPeriod || `${activeCycle.hijriYear || '1447 AH'} (${year})`;
    activeCycle.originalCalculatedAmount = Number(originalCalculatedAmount) || Number(activeCycle.totalDue) || 0;
    activeCycle.trackingTotal = Number(trackingTotal) || Number(activeCycle.totalDue) || 0;
    activeCycle.totalPaid = calculatedTotalPaid;
    activeCycle.completedAt = completedAt;
    activeCycle.nisabThreshold = Number(nisabThreshold) || 174523;
    activeCycle.isNisabMet = isNisabMet !== undefined ? isNisabMet : true;
    activeCycle.assetBreakdown = assetBreakdown || {};
    activeCycle.totalEligibleAssets = Number(totalEligibleAssets) || 0;
    activeCycle.deductibleDebts = Number(deductibleDebts) || 0;
    activeCycle.netZakatableWealth = Number(netZakatableWealth) || 0;
    activeCycle.payments = cyclePayments;

    await activeCycle.save();

    // Mark current user payments in DB as attached to this completed cycle and archived
    await ZakatPayment.updateMany(
      {
        userId,
        $or: [{ cycleId: activeCycle._id }, { cycleId: null }, { cycleId: { $exists: false } }],
      },
      { $set: { cycleId: activeCycle._id, status: 'archived' } }
    );

    // Create a new fresh active cycle for current tracking
    const newCycle = await ZakatCycle.create({
      userId,
      hijriYear: nextHijriYear,
      gregorianYear: new Date().getFullYear().toString(),
      totalDue: parseFloat(initialDue) || 0,
      nisabDate: nextNisabDate,
      status: 'active',
    });

    return res.status(201).json({
      success: true,
      message: 'Zakat cycle archived and permanently saved in database history',
      data: {
        archivedCycle: activeCycle,
        newCycle,
      },
    });
  } catch (error) {
    console.error('Error archiving cycle:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to archive cycle',
    });
  }
};

module.exports = {
  getZakatSummary,
  getPayments,
  addPayment,
  updatePayment,
  deletePayment,
  deleteYearPayments,
  updateCycle,
  archiveCycle,
};
