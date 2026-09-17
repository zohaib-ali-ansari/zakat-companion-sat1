const ZakatPayment = require('../models/ZakatPayment');
const ZakatCycle = require('../models/ZakatCycle');

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

    // Fetch all user payments
    const payments = await ZakatPayment.find({ userId }).sort({ date: -1, createdAt: -1 });

    const totalPaid = payments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalDue = Number(cycle.totalDue) || 0;
    const remaining = Math.max(0, totalDue - totalPaid);
    const percentPaid = totalDue <= 0 ? 100 : Math.min(100, Math.round((totalPaid / totalDue) * 100));

    // Grouping by Year
    const yearMap = {};
    // Grouping by Recipient
    const recipientMap = {};

    payments.forEach((payment) => {
      const year = payment.year || (payment.date ? payment.date.substring(0, 4) : 'Other');
      if (!yearMap[year]) {
        yearMap[year] = { year, totalAmount: 0, count: 0, records: [] };
      }
      yearMap[year].totalAmount += payment.amount;
      yearMap[year].count += 1;
      yearMap[year].records.push(payment);

      const rec = payment.recipient || 'Other';
      if (!recipientMap[rec]) {
        recipientMap[rec] = 0;
      }
      recipientMap[rec] += payment.amount;
    });

    const yearlyHistory = Object.values(yearMap).sort((a, b) => b.year.localeCompare(a.year));
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
        totalRecordsCount: payments.length,
        recentPayments: payments.slice(0, 5),
        records: payments,
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

    const result = await ZakatPayment.deleteMany({
      userId,
      $or: [{ year: String(year) }, { date: new RegExp(`^${year}`) }],
    });

    return res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} payment records for year ${year}`,
      deletedCount: result.deletedCount,
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
    const { nextHijriYear, nextNisabDate, initialDue = 0 } = req.body;

    const activeCycle = await ZakatCycle.findOne({ userId, status: 'active' });
    if (activeCycle) {
      activeCycle.status = 'archived';
      await activeCycle.save();
    }

    const newCycle = await ZakatCycle.create({
      userId,
      hijriYear: nextHijriYear || '1446 AH',
      gregorianYear: (new Date().getFullYear() + 1).toString(),
      totalDue: parseFloat(initialDue) || 0,
      nisabDate: nextNisabDate || '1 Ramadan 1446',
      status: 'active',
    });

    return res.status(201).json({
      success: true,
      message: 'Previous Zakat cycle archived and new cycle initiated',
      data: newCycle,
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
