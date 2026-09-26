import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  fetchZakatSummary,
  createPaymentRecord,
  updatePaymentRecord,
  deletePaymentRecord,
  deleteYearHistoryRecords,
  updateZakatCycle,
  archiveZakatCycleApi,
  fetchMetalRates,
  saveZakatCalculation,
} from '../services/zakatApi';

const ZakatContext = createContext();

const INITIAL_RECORDS = [
  {
    id: 'payment-2024-1',
    _id: 'payment-2024-1',
    amount: 100000,
    date: '2024-03-15',
    recipient: 'Alkhidmat Foundation',
    notes: 'Ramadan Zakat payment',
    category: 'Zakat',
    status: 'Paid',
  },
  {
    id: 'payment-2023-1',
    _id: 'payment-2023-1',
    amount: 125000,
    date: '2023-10-24',
    recipient: 'Edhi Foundation',
    notes: 'Annual Zakat distribution',
    category: 'Zakat',
    status: 'Paid',
  },
  {
    id: 'payment-2023-2',
    _id: 'payment-2023-2',
    amount: 85000,
    date: '2023-04-15',
    recipient: 'Local Community Fund',
    notes: 'Needy families support',
    category: 'Zakat',
    status: 'Paid',
  },
];

const INITIAL_CAMPAIGNS = [
  {
    id: 'camp-1',
    title: 'Emergency Flood Relief 2026',
    orgName: 'Alkhidmat Foundation',
    category: 'Disaster Relief',
    goalAmount: 5000000,
    raisedAmount: 3450000,
    isUrgent: true,
    description: 'Providing clean drinking water, shelter tents, food packs, and medical aid to flood-affected families in Pakistan.',
    icon: 'water-outline',
    location: 'Sindh & Balochistan, Pakistan',
    phone: '+92-21-111-254-343',
    email: 'relief@alkhidmat.org',
    datePosted: '2026-08-15',
    isVerified: true,
  },
  {
    id: 'camp-2',
    title: 'Gaza Medical & Food Aid',
    orgName: 'Edhi Foundation',
    category: 'Emergency Aid',
    goalAmount: 10000000,
    raisedAmount: 7800000,
    isUrgent: true,
    description: 'Delivering urgent life-saving medical supplies, ambulances, and hot meals to displaced families.',
    icon: 'medkit-outline',
    location: 'Gaza, Palestine',
    phone: '+92-21-111-111-911',
    email: 'international@edhi.org',
    datePosted: '2026-07-20',
    isVerified: true,
  },
  {
    id: 'camp-3',
    title: 'Winter Warmth Food Drive',
    orgName: 'Saylani Welfare',
    category: 'Food Assistance',
    goalAmount: 3000000,
    raisedAmount: 1850000,
    isUrgent: false,
    description: 'Distributing warm clothes, blankets, and monthly ration boxes to vulnerable households.',
    icon: 'shirt-outline',
    location: 'Karachi, Lahore, Islamabad',
    phone: '+92-21-111-729-526',
    email: 'info@saylaniwelfare.com',
    datePosted: '2026-09-01',
    isVerified: true,
  },
];

const INITIAL_COMPLETED_CYCLES = [
  {
    id: 'cycle-2023',
    zakatPeriod: '1444-1445 AH (2023)',
    year: '2023',
    originalCalculatedAmount: 187500,
    trackingTotal: 187500,
    totalPaid: 210000,
    completedAt: '2023-10-24',
    nisabThreshold: 240000,
    isNisabMet: true,
    assetBreakdown: {
      goldSilver: 4000000,
      cashInBank: 2500000,
      investments: 2000000,
    },
    totalEligibleAssets: 8500000,
    deductibleDebts: 1000000,
    netZakatableWealth: 7500000,
    payments: [
      { id: 'p-2023-1', amount: 125000, date: '2023-10-24', recipient: 'Edhi Foundation', notes: 'Annual Zakat distribution' },
      { id: 'p-2023-2', amount: 85000, date: '2023-04-15', recipient: 'Local Community Fund', notes: 'Needy families support' },
    ],
  },
  {
    id: 'cycle-2024',
    zakatPeriod: '1445-1446 AH (2024)',
    year: '2024',
    originalCalculatedAmount: 60000,
    trackingTotal: 60000,
    totalPaid: 100000,
    completedAt: '2024-03-15',
    nisabThreshold: 270000,
    isNisabMet: true,
    assetBreakdown: {
      goldSilver: 1250000,
      cashInBank: 800000,
      investments: 450000,
    },
    totalEligibleAssets: 2500000,
    deductibleDebts: 100000,
    netZakatableWealth: 2400000,
    payments: [
      { id: 'p-2024-1', amount: 100000, date: '2024-03-15', recipient: 'Alkhidmat Foundation', notes: 'Ramadan Zakat payment' },
    ],
  },
];

const INITIAL_ASSETS = {
  goldVal: 1250000,
  silverVal: 0,
  cashHand: 300000,
  bankSavings: 500000,
  stockVal: 450000,
  propertyVal: 0,
  businessVal: 0,
  liabilitiesVal: 100000,
  totalAssets: 2500000,
  netZakatableWealth: 2400000,
  silverNisabThreshold: 174523,
  isNisabMet: true,
  zakatPayable: 60000,
};

export const ZakatProvider = ({ children, token, user }) => {
  const [authToken, setAuthToken] = useState(token || null);
  const [currentUser, setCurrentUser] = useState(user || null);

  // Active tracking state
  const [totalDue, setTotalDue] = useState(340000);
  const [originalCalculatedAmount, setOriginalCalculatedAmount] = useState(340000);
  const [calculatedResult, setCalculatedResultState] = useState(null);

  // Active payment records (current cycle)
  const [records, setRecords] = useState(INITIAL_RECORDS);

  // Completed historical cycles
  const [completedCycles, setCompletedCycles] = useState(INITIAL_COMPLETED_CYCLES);

  // Snapshots dictionary
  const [snapshots, setSnapshots] = useState({});

  // Campaigns / Zakat Needs
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);

  // Live Market Rates & Backend sync state
  const [metalRates, setMetalRates] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [assetsBreakdown, setAssetsBreakdown] = useState(INITIAL_ASSETS);
  const [hijriYear, setHijriYear] = useState('1447 AH');
  const [nisabDate, setNisabDate] = useState('12 Ramadan 1447');

  const [liveRates, setLiveRates] = useState({
    gold24kTola: 245000,
    silver24kTola: 2950,
    usdToPkr: 278.5,
    goldNisabPkr: 1837500,
    silverNisabPkr: 154875,
    lastUpdated: new Date().toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' }),
    source: 'Sarafa Market / State Bank of Pakistan',
  });

  // Sync token prop changes & clear state on logout
  useEffect(() => {
    if (token !== undefined) setAuthToken(token);
    if (user !== undefined) setCurrentUser(user);
    if (!token && !authToken) {
      // Clear data when no token is present
      setRecords([]);
      setTotalDue(0);
      setCompletedCycles([]);
    }
  }, [token, user]);

  // Load live data from backend
  const refreshData = useCallback(async (activeToken = authToken) => {
    // 1. Fetch live metal rates & Nisab
    try {
      const ratesData = await fetchMetalRates();
      if (ratesData) {
        setMetalRates(ratesData);
        if (ratesData?.nisab?.silverThreshold) {
          setAssetsBreakdown((prev) => ({
            ...prev,
            silverNisabThreshold: ratesData.nisab.silverThreshold,
            isNisabMet: (prev.netZakatableWealth || 0) >= ratesData.nisab.silverThreshold,
          }));
          setLiveRates((prev) => ({
            ...prev,
            silverNisabPkr: ratesData.nisab.silverThreshold,
            goldNisabPkr: ratesData.nisab.goldThreshold || prev.goldNisabPkr,
          }));
        }
      }
    } catch (e) {
      console.log('Metal rates fallback used:', e.message);
    }

    // 2. Fetch user's zakat summary & payments if logged in
    if (activeToken) {
      try {
        setIsSyncing(true);
        const summary = await fetchZakatSummary(activeToken);
        if (summary) {
          if (summary.totalDue !== undefined) setTotalDue(summary.totalDue);
          if (summary.hijriYear) setHijriYear(summary.hijriYear);
          if (summary.nisabDate) setNisabDate(summary.nisabDate);
          if (Array.isArray(summary.records)) {
            setRecords(
              summary.records.map((r) => ({
                ...r,
                id: r._id || r.id,
              }))
            );
          }
          if (Array.isArray(summary.yearlyHistory)) {
            setCompletedCycles(summary.yearlyHistory);
          }
        }
      } catch (err) {
        console.log('Backend sync notice (using local state):', err.message);
      } finally {
        setIsSyncing(false);
      }
    }
  }, [authToken]);

  useEffect(() => {
    refreshData();
  }, [refreshData, authToken]);

  // ─── Derived totals ────────────────────────────────────────────────────────
  const totalPaid = useMemo(
    () => records.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [records]
  );

  const remaining = useMemo(() => Math.max(0, totalDue - totalPaid), [totalDue, totalPaid]);

  const percentPaid = useMemo(() => {
    if (totalDue <= 0) return 100;
    return Math.min(100, Math.round((totalPaid / totalDue) * 100));
  }, [totalDue, totalPaid]);

  const isCompleted = useMemo(() => totalDue > 0 && remaining === 0, [totalDue, remaining]);

  // ─── Calculator ────────────────────────────────────────────────────────────
  const setCalculatedResult = (resultData) => {
    setCalculatedResultState(resultData);
  };

  const startTrackingCalculatedAmount = (amount) => {
    const val = parseFloat(amount) || 0;
    if (val > 0) {
      setOriginalCalculatedAmount(val);
      setTotalDue(val);
      setRecords([]); // reset active payment list for new cycle
    }
  };

  const updateTrackingTotal = async (newAmount) => {
    const val = parseFloat(newAmount) || 0;
    if (val >= 0) {
      setTotalDue(val);
      if (authToken) {
        try {
          await updateZakatCycle({ totalDue: val }, authToken);
        } catch (err) {
          console.warn('Backend update cycle error:', err.message);
        }
      }
    }
  };

  const updateTotalDue = async (newAmount) => {
    const val = parseFloat(newAmount) || 0;
    if (val >= 0) {
      setOriginalCalculatedAmount(val);
      setTotalDue(val);
      if (authToken) {
        try {
          await updateZakatCycle({ totalDue: val }, authToken);
        } catch (err) {
          console.warn('Backend update cycle error:', err.message);
        }
      }
    }
  };

  const updateAssetsBreakdown = (values) => {
    const gold = parseFloat(values.goldVal) || 0;
    const silver = parseFloat(values.silverVal) || 0;
    const cashHand = parseFloat(values.cashHand) || 0;
    const bankSavings = parseFloat(values.bankSavings) || 0;
    const cash = cashHand + bankSavings;
    const stocks = parseFloat(values.stockVal) || 0;
    const property = parseFloat(values.propertyVal) || 0;
    const business = parseFloat(values.businessVal) || 0;
    const liabilities = parseFloat(values.liabilitiesVal) || 0;

    const totalAssets = gold + silver + cash + stocks + property + business;
    const netZakatableWealth = Math.max(0, totalAssets - liabilities);
    const silverNisabThreshold = metalRates?.nisab?.silverThreshold || liveRates.silverNisabPkr;
    const isNisabMet = netZakatableWealth >= silverNisabThreshold;
    const zakatPayable = isNisabMet ? netZakatableWealth * 0.025 : 0;

    const updated = {
      goldVal: gold,
      silverVal: silver,
      cashHand,
      bankSavings,
      cash,
      stockVal: stocks,
      propertyVal: property,
      businessVal: business,
      liabilitiesVal: liabilities,
      totalAssets,
      netZakatableWealth,
      silverNisabThreshold,
      isNisabMet,
      zakatPayable,
    };

    setAssetsBreakdown(updated);
    setTotalDue(zakatPayable);
    return updated;
  };

  // ─── Cycle Completion ──────────────────────────────────────────────────────
  const completeAndArchiveCycle = async () => {
    const now = new Date();
    const yearStr = String(now.getFullYear());
    const formattedCompletedDate = now.toISOString().split('T')[0];
    const cyclePeriodStr = `${hijriYear || '1447 AH'} (${yearStr})`;

    const cycleSnapshot = {
      id: `cycle-${Date.now()}`,
      _id: `cycle-${Date.now()}`,
      zakatPeriod: cyclePeriodStr,
      year: yearStr,
      originalCalculatedAmount: originalCalculatedAmount || totalDue || 0,
      trackingTotal: totalDue || 0,
      totalPaid: totalPaid || 0,
      completedAt: formattedCompletedDate,
      nisabThreshold: metalRates?.nisab?.silverThreshold || liveRates.silverNisabPkr || 174523,
      isNisabMet: true,
      assetBreakdown: assetsBreakdown
        ? {
            goldSilver: (Number(assetsBreakdown.goldVal) || 0) + (Number(assetsBreakdown.silverVal) || 0),
            cashInBank: (Number(assetsBreakdown.cashHand) || 0) + (Number(assetsBreakdown.bankSavings) || 0),
            investments: Number(assetsBreakdown.stockVal) || 0,
          }
        : calculatedResult?.assetBreakdown || {},
      totalEligibleAssets: assetsBreakdown?.totalAssets || calculatedResult?.totalAssets || 0,
      deductibleDebts: assetsBreakdown?.liabilitiesVal || calculatedResult?.liabilities || 0,
      netZakatableWealth: assetsBreakdown?.netZakatableWealth || calculatedResult?.netZakatableWealth || 0,
      payments: records.map((r) => ({
        id: r._id || r.id,
        _id: r._id || r.id,
        amount: Number(r.amount) || 0,
        recipient: r.recipient || 'Beneficiary',
        date: r.date || formattedCompletedDate,
        notes: r.notes || '',
        category: r.category || 'Zakat',
        status: r.status || 'Paid',
      })),
    };

    setCompletedCycles((prev) => [cycleSnapshot, ...prev]);

    if (authToken) {
      try {
        await archiveZakatCycleApi(
          {
            ...cycleSnapshot,
            initialDue: 0,
            nextHijriYear: hijriYear,
            nextNisabDate: nisabDate,
          },
          authToken
        );
        await refreshData(authToken);
      } catch (err) {
        console.warn('Backend archive cycle error:', err.message);
      }
    }

    // Reset active tracking for new cycle
    setRecords([]);
    setTotalDue(0);
    setOriginalCalculatedAmount(0);
    setCalculatedResultState(null);

    return cycleSnapshot;
  };

  // ─── Payments ──────────────────────────────────────────────────────────────
  const addPayment = async ({ date, amount, recipient, notes, category = 'Zakat' }) => {
    const numericAmount = parseFloat(amount) || 0;
    if (numericAmount <= 0 || !recipient?.trim()) {
      return false;
    }

    const tempId = 'payment-' + Date.now();
    const newRecord = {
      id: tempId,
      _id: tempId,
      date: date?.trim() || new Date().toISOString().split('T')[0],
      amount: numericAmount,
      recipient: recipient.trim(),
      notes: notes?.trim() || '',
      category,
      status: 'Paid',
    };
    setRecords((prev) => [newRecord, ...prev]);

    if (authToken) {
      try {
        const saved = await createPaymentRecord(
          {
            amount: numericAmount,
            recipient: recipient.trim(),
            date: newRecord.date,
            notes: newRecord.notes,
            category,
          },
          authToken
        );
        if (saved?._id) {
          setRecords((prev) =>
            prev.map((rec) => (rec.id === tempId ? { ...saved, id: saved._id } : rec))
          );
        }
        await refreshData(authToken);
      } catch (err) {
        console.warn('Backend add payment sync error:', err.message);
      }
    }

    return true;
  };

  const editPayment = async (id, { date, amount, recipient, notes, category }) => {
    const numericAmount = parseFloat(amount) || 0;
    if (!id || numericAmount <= 0 || !recipient?.trim()) return false;
    setRecords((prev) =>
      prev.map((rec) =>
        rec.id === id || rec._id === id
          ? {
              ...rec,
              date: date?.trim() || rec.date,
              amount: numericAmount,
              recipient: recipient.trim(),
              notes: notes !== undefined ? (typeof notes === 'string' ? notes.trim() : notes) : rec.notes,
              category: category || rec.category,
            }
          : rec
      )
    );

    if (authToken && !String(id).startsWith('payment-')) {
      try {
        await updatePaymentRecord(
          id,
          {
            amount: numericAmount,
            recipient: recipient.trim(),
            date,
            notes,
            category,
          },
          authToken
        );
        await refreshData(authToken);
      } catch (err) {
        console.warn('Backend edit payment sync error:', err.message);
      }
    }

    return true;
  };

  const deletePayment = async (id) => {
    if (!id) return false;
    setRecords((prev) => prev.filter((rec) => rec.id !== id && rec._id !== id));

    if (authToken && !String(id).startsWith('payment-')) {
      try {
        await deletePaymentRecord(id, authToken);
        await refreshData(authToken);
      } catch (err) {
        console.warn('Backend delete payment sync error:', err.message);
      }
    }

    return true;
  };

  const deleteCompletedCycle = (cycleId) => {
    if (!cycleId) return false;
    setCompletedCycles((prev) => prev.filter((c) => c.id !== cycleId));
    return true;
  };

  const deleteYearHistory = async (yearStr) => {
    if (!yearStr) return false;
    const targetYear = String(yearStr);
    setRecords((prev) =>
      prev.filter((rec) => {
        const recYear = rec.date ? (rec.date.match(/\d{4}/) || [])[0] : 'Other';
        return recYear !== targetYear;
      })
    );
    setCompletedCycles((prev) => prev.filter((c) => c.year !== targetYear));

    if (authToken) {
      try {
        await deleteYearHistoryRecords(targetYear, authToken);
        await refreshData(authToken);
      } catch (err) {
        console.warn('Backend delete year sync error:', err.message);
      }
    }

    return true;
  };

  const archiveZakatCycle = async (yearStr = '2024') => {
    return true;
  };

  const saveCalculationSnapshot = async (calculationData) => {
    if (calculationData?.values) {
      updateAssetsBreakdown(calculationData.values);
    }
    if (authToken) {
      try {
        const res = await saveZakatCalculation(calculationData, authToken);
        if (res?.cycle?.totalDue !== undefined) {
          setTotalDue(res.cycle.totalDue);
        }
        return res;
      } catch (err) {
        console.warn('Save calculation backend error:', err.message);
      }
    }
    if (calculationData?.breakdown?.zakatDue !== undefined) {
      setTotalDue(calculationData.breakdown.zakatDue);
    }
    return null;
  };

  // ─── Campaigns ─────────────────────────────────────────────────────────────
  const addCampaign = ({ title, orgName, category, goalAmount, description, location, phone, email }) => {
    const newCamp = {
      id: `camp-${Date.now()}`,
      title: title.trim(),
      orgName: orgName.trim() || 'Verified Partner NGO',
      category: category?.trim() || 'Disaster Relief',
      goalAmount: parseFloat(goalAmount) || 1000000,
      raisedAmount: 0,
      isUrgent: true,
      description: description?.trim() || 'Emergency Zakat contribution campaign.',
      icon: 'sparkles-outline',
      location: location?.trim() || 'Pakistan',
      phone: phone?.trim() || '',
      email: email?.trim() || '',
      datePosted: new Date().toISOString().split('T')[0],
      isVerified: false,
    };
    setCampaigns((prev) => [newCamp, ...prev]);
    return true;
  };

  // ─── Live Rates ────────────────────────────────────────────────────────────
  const applyLiveRates = (rates) => {
    setLiveRates((prev) => ({
      ...prev,
      ...rates,
      lastUpdated: new Date().toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' }),
    }));
  };

  return (
    <ZakatContext.Provider
      value={{
        // Tracking state
        totalDue,
        originalCalculatedAmount,
        totalPaid,
        remaining,
        percentPaid,
        isCompleted,
        // Calculation
        calculatedResult,
        setCalculatedResult,
        startTrackingCalculatedAmount,
        updateTrackingTotal,
        updateTotalDue,
        completeAndArchiveCycle,
        // Records & Auth
        records,
        hijriYear,
        nisabDate,
        metalRates,
        isSyncing,
        authToken,
        currentUser,
        assetsBreakdown,
        updateAssetsBreakdown,
        setAuthToken,
        setCurrentUser,
        refreshData,
        addPayment,
        editPayment,
        deletePayment,
        // Completed history cycles
        completedCycles,
        deleteCompletedCycle,
        deleteYearHistory,
        archiveZakatCycle,
        saveCalculationSnapshot,
        // Campaigns
        campaigns,
        addCampaign,
        // Rates
        liveRates,
        applyLiveRates,
        // Snapshots
        snapshots,
      }}
    >
      {children}
    </ZakatContext.Provider>
  );
};

export const useZakat = () => {
  const context = useContext(ZakatContext);
  if (!context) throw new Error('useZakat must be used within a ZakatProvider');
  return context;
};
