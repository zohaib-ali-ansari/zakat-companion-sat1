import React, { createContext, useContext, useState, useMemo } from 'react';

const ZakatContext = createContext();

const INITIAL_RECORDS = [];

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

export const ZakatProvider = ({ children }) => {
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

  // Live Market Rates (PKR) — will be overwritten by "Apply Rates"
  const [liveRates, setLiveRates] = useState({
    gold24kTola: 245000,
    silver24kTola: 2950,
    usdToPkr: 278.5,
    goldNisabPkr: 1837500,   // 7.5 Tolas × 245,000
    silverNisabPkr: 154875,  // 52.5 Tolas × 2,950
    lastUpdated: new Date().toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' }),
    source: 'Sarafa Market / State Bank of Pakistan',
  });

  const [hijriYear] = useState('1447 AH');
  const [nisabDate] = useState('12 Ramadan 1447');

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

  // Called when user presses "Start Tracking" — sets both original and tracking total
  const startTrackingCalculatedAmount = (amount) => {
    const val = parseFloat(amount) || 0;
    if (val > 0) {
      setOriginalCalculatedAmount(val);
      setTotalDue(val);
      setRecords([]); // reset active payment list for new cycle
    }
  };

  // Called from TrackingScreen edit modal — only updates tracking total, not original
  const updateTrackingTotal = (newAmount) => {
    const val = parseFloat(newAmount) || 0;
    if (val > 0) {
      setTotalDue(val);
    }
  };

  // Legacy alias kept for CalculatorScreen "Save to Tracker" button compatibility
  const updateTotalDue = (newAmount) => {
    const val = parseFloat(newAmount) || 0;
    if (val > 0) {
      setOriginalCalculatedAmount(val);
      setTotalDue(val);
    }
  };

  // ─── Cycle Completion ──────────────────────────────────────────────────────
  const completeAndArchiveCycle = () => {
    const now = new Date();
    const yearStr = String(now.getFullYear());
    const newCycle = {
      id: `cycle-${Date.now()}`,
      zakatPeriod: `${hijriYear} (${yearStr})`,
      year: yearStr,
      originalCalculatedAmount,
      trackingTotal: totalDue,
      totalPaid,
      completedAt: now.toISOString().split('T')[0],
      nisabThreshold: liveRates.silverNisabPkr,
      isNisabMet: true,
      assetBreakdown: calculatedResult?.assetBreakdown || {},
      totalEligibleAssets: calculatedResult?.totalAssets || 0,
      deductibleDebts: calculatedResult?.liabilities || 0,
      netZakatableWealth: calculatedResult?.netZakatableWealth || 0,
      payments: [...records],
    };
    setCompletedCycles((prev) => [newCycle, ...prev]);
    // Reset active tracking
    setRecords([]);
    setTotalDue(0);
    setOriginalCalculatedAmount(0);
    setCalculatedResultState(null);
    return newCycle;
  };

  // ─── Payments ──────────────────────────────────────────────────────────────
  const addPayment = ({ date, amount, recipient, notes }) => {
    const numericAmount = parseFloat(amount) || 0;
    if (numericAmount <= 0 || !recipient?.trim()) return false;
    const newRecord = {
      id: `payment-${Date.now()}`,
      date: date?.trim() || new Date().toISOString().split('T')[0],
      amount: numericAmount,
      recipient: recipient.trim(),
      notes: notes?.trim() || '',
      category: 'Zakat',
      status: 'Paid',
    };
    setRecords((prev) => [newRecord, ...prev]);
    return true;
  };

  const editPayment = (id, { date, amount, recipient, notes }) => {
    const numericAmount = parseFloat(amount) || 0;
    if (!id || numericAmount <= 0 || !recipient?.trim()) return false;
    setRecords((prev) =>
      prev.map((rec) =>
        rec.id === id
          ? { ...rec, date: date?.trim() || rec.date, amount: numericAmount, recipient: recipient.trim(), notes: notes?.trim() || '' }
          : rec
      )
    );
    return true;
  };

  const deletePayment = (id) => {
    if (!id) return false;
    setRecords((prev) => prev.filter((rec) => rec.id !== id));
    return true;
  };

  const deleteCompletedCycle = (cycleId) => {
    if (!cycleId) return false;
    setCompletedCycles((prev) => prev.filter((c) => c.id !== cycleId));
    return true;
  };

  // Legacy — kept for HistoryYearDetailScreen compatibility
  const deleteYearHistory = (yearStr) => {
    if (!yearStr) return false;
    const target = String(yearStr);
    setCompletedCycles((prev) => prev.filter((c) => c.year !== target));
    return true;
  };

  // ─── Snapshot (legacy, now merged into completedCycles) ────────────────────
  const saveCalculationSnapshot = (year, snapshotData) => {
    // kept for backward compat — no-op since we use completedCycles now
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
        // Records
        records,
        addPayment,
        editPayment,
        deletePayment,
        // Completed history cycles
        completedCycles,
        deleteCompletedCycle,
        deleteYearHistory,
        // Campaigns
        campaigns,
        addCampaign,
        // Rates
        liveRates,
        applyLiveRates,
        // Snapshots & History
        snapshots,
        saveCalculationSnapshot,
        // Misc
        hijriYear,
        nisabDate,
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
