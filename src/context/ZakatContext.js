import React, { createContext, useContext, useState, useMemo } from 'react';

const ZakatContext = createContext();

const INITIAL_RECORDS = [
  {
    id: 'payment-2024-1',
    amount: 100000,
    date: '2024-03-15',
    recipient: 'Alkhidmat Foundation',
    notes: 'Ramadan Zakat payment',
    category: 'Zakat',
    status: 'Paid',
  },
  {
    id: 'payment-2023-1',
    amount: 125000,
    date: '2023-10-24',
    recipient: 'Edhi Foundation',
    notes: 'Annual Zakat distribution',
    category: 'Zakat',
    status: 'Paid',
  },
  {
    id: 'payment-2023-2',
    amount: 85000,
    date: '2023-04-15',
    recipient: 'Local Community Fund',
    notes: 'Needy families support',
    category: 'Zakat',
    status: 'Paid',
  },
];

export const ZakatProvider = ({ children }) => {
  const [totalDue, setTotalDue] = useState(340000); // 340,000 PKR initial obligation
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [hijriYear] = useState('1445 AH');
  const [nisabDate] = useState('12 Ramadan 1445');

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

  const addPayment = ({ date, amount, recipient, notes }) => {
    const numericAmount = parseFloat(amount) || 0;
    if (numericAmount <= 0 || !recipient?.trim()) {
      return false;
    }

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

  const updateTotalDue = (newAmount) => {
    const val = parseFloat(newAmount) || 0;
    if (val > 0) {
      setTotalDue(val);
    }
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
        addPayment,
        updateTotalDue,
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
