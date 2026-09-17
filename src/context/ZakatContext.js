import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  fetchZakatSummary,
  createPaymentRecord,
  updatePaymentRecord,
  deletePaymentRecord,
  deleteYearHistoryRecords,
  updateZakatCycle,
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

export const ZakatProvider = ({ children, token, user }) => {
  const [authToken, setAuthToken] = useState(token || null);
  const [currentUser, setCurrentUser] = useState(user || null);

  const [totalDue, setTotalDue] = useState(340000);
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [hijriYear, setHijriYear] = useState('1445 AH');
  const [nisabDate, setNisabDate] = useState('12 Ramadan 1445');
  const [metalRates, setMetalRates] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync token prop changes
  useEffect(() => {
    if (token) setAuthToken(token);
    if (user) setCurrentUser(user);
  }, [token, user]);

  // Load live data from backend
  const refreshData = useCallback(async (activeToken = authToken) => {
    // 1. Fetch live metal rates & Nisab
    try {
      const ratesData = await fetchMetalRates();
      if (ratesData) {
        setMetalRates(ratesData);
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
          if (Array.isArray(summary.records) && summary.records.length > 0) {
            setRecords(
              summary.records.map((r) => ({
                ...r,
                id: r._id || r.id,
              }))
            );
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

  const totalPaid = useMemo(() => {
    return records.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [records]);

  const remaining = useMemo(() => {
    return Math.max(0, totalDue - totalPaid);
  }, [totalDue, totalPaid]);

  const percentPaid = useMemo(() => {
    if (totalDue <= 0) return 100;
    return Math.min(100, Math.round((totalPaid / totalDue) * 100));
  }, [totalDue, totalPaid]);

  const addPayment = async ({ date, amount, recipient, notes, category = 'Zakat' }) => {
    const numericAmount = parseFloat(amount) || 0;
    if (numericAmount <= 0 || !recipient?.trim()) {
      return false;
    }

    const tempId = `payment-${Date.now()}`;
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

    // Optimistic local update
    setRecords((prev) => [newRecord, ...prev]);

    // Backend sync if token present
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
      } catch (err) {
        console.warn('Backend add payment sync error:', err.message);
      }
    }

    return true;
  };

  const editPayment = async (id, { date, amount, recipient, notes, category }) => {
    const numericAmount = parseFloat(amount) || 0;
    if (!id || numericAmount <= 0 || !recipient?.trim()) {
      return false;
    }

    setRecords((prev) =>
      prev.map((rec) =>
        rec.id === id || rec._id === id
          ? {
              ...rec,
              date: date?.trim() || rec.date,
              amount: numericAmount,
              recipient: recipient.trim(),
              notes: notes !== undefined ? notes.trim() : rec.notes,
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
      } catch (err) {
        console.warn('Backend delete payment sync error:', err.message);
      }
    }

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

    if (authToken) {
      try {
        await deleteYearHistoryRecords(targetYear, authToken);
      } catch (err) {
        console.warn('Backend delete year sync error:', err.message);
      }
    }

    return true;
  };

  const archiveZakatCycle = async (yearStr = '2024') => {
    return true;
  };

  const updateTotalDue = async (newAmount) => {
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

  const saveCalculationSnapshot = async (calculationData) => {
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

  return (
    <ZakatContext.Provider
      value={{
        totalDue,
        totalPaid,
        remaining,
        percentPaid,
        records,
        hijriYear,
        nisabDate,
        metalRates,
        isSyncing,
        authToken,
        currentUser,
        setAuthToken,
        setCurrentUser,
        refreshData,
        addPayment,
        editPayment,
        deletePayment,
        deleteYearHistory,
        archiveZakatCycle,
        updateTotalDue,
        saveCalculationSnapshot,
      }}
    >
      {children}
    </ZakatContext.Provider>
  );
};

export const useZakat = () => {
  const context = useContext(ZakatContext);
  if (!context) {
    throw new Error('useZakat must be used within a ZakatProvider');
  }
  return context;
};
