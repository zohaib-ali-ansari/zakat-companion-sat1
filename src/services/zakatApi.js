import { Platform } from 'react-native';

const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }

  const host = Platform.OS === 'web' ? 'localhost' : '192.168.0.104';
  return `http://${host}:5000/api`;
};

const api = getApiBaseUrl();

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// ==========================================
// 1. METAL RATES & NISAB
// ==========================================
export const fetchMetalRates = async (currency = 'PKR') => {
  const response = await fetch(`${api}/rates?currency=${currency}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch metal rates');
  return data.data;
};

// ==========================================
// 2. ZAKAT CALCULATIONS
// ==========================================
export const computeZakatPreview = async ({ selectedCategories, values, currency = 'PKR' }) => {
  const response = await fetch(`${api}/calculations/compute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selectedCategories, values, currency }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Calculation failed');
  return data.data;
};

export const saveZakatCalculation = async (calculationData, token) => {
  const response = await fetch(`${api}/calculations`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(calculationData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to save calculation');
  return data;
};

export const fetchCalculationsHistory = async (token, year) => {
  const url = year ? `${api}/calculations?year=${year}` : `${api}/calculations`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch calculation history');
  return data.data;
};

// ==========================================
// 3. PAYMENTS & SUMMARY
// ==========================================
export const fetchZakatSummary = async (token) => {
  const response = await fetch(`${api}/payments/summary`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch summary');
  return data.data;
};

export const fetchPaymentsList = async (token, { year, recipient, category } = {}) => {
  const params = new URLSearchParams();
  if (year) params.append('year', year);
  if (recipient) params.append('recipient', recipient);
  if (category) params.append('category', category);

  const response = await fetch(`${api}/payments?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch payments');
  return data.data;
};

export const createPaymentRecord = async (paymentData, token) => {
  const response = await fetch(`${api}/payments`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(paymentData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to record payment');
  return data.data;
};

export const updatePaymentRecord = async (id, paymentData, token) => {
  const response = await fetch(`${api}/payments/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(paymentData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update payment');
  return data.data;
};

export const deletePaymentRecord = async (id, token) => {
  const response = await fetch(`${api}/payments/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete payment');
  return data;
};

export const deleteYearHistoryRecords = async (year, token) => {
  const response = await fetch(`${api}/payments/year/${year}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete yearly history');
  return data;
};

export const updateZakatCycle = async (cycleData, token) => {
  const response = await fetch(`${api}/payments/cycle`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(cycleData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update cycle');
  return data.data;
};
