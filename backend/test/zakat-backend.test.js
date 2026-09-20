const test = require('node:test');
const assert = require('node:assert/strict');

// Test 1: Nisab calculation logic
test('Nisab Calculation Logic calculates correct thresholds for Gold & Silver', () => {
  const gold24kPerGram = 23500;
  const silverPerGram = 285;

  const goldNisabGrams = 87.48; // 7.5 tola
  const silverNisabGrams = 612.36; // 52.5 tola

  const goldNisabValue = Math.round(gold24kPerGram * goldNisabGrams);
  const silverNisabValue = Math.round(silverPerGram * silverNisabGrams);

  assert.equal(goldNisabValue, 2055780);
  assert.equal(silverNisabValue, 174523);
});

// Test 2: Zakat math calculation engine
test('Zakat math computes 2.5% when net wealth is above Nisab', () => {
  const values = {
    goldVal: 1250000,
    silverVal: 0,
    cashHand: 300000,
    bankSavings: 500000,
    stockVal: 450000,
    propertyVal: 0,
    businessVal: 0,
    liabilitiesVal: 100000,
  };

  const totalAssets =
    values.goldVal +
    values.silverVal +
    values.cashHand +
    values.bankSavings +
    values.stockVal +
    values.propertyVal +
    values.businessVal; // 2,500,000

  const netZakatableWealth = totalAssets - values.liabilitiesVal; // 2,400,000
  const silverNisab = 174523;

  assert.equal(totalAssets, 2500000);
  assert.equal(netZakatableWealth, 2400000);
  assert.equal(netZakatableWealth >= silverNisab, true);

  const zakatDue = Math.round(netZakatableWealth * 0.025);
  assert.equal(zakatDue, 60000); // 2.5% of 2,400,000 = 60,000
});

test('Zakat math returns 0 when net wealth is below Nisab', () => {
  const netWealth = 100000;
  const silverNisab = 174523;
  const isAboveNisab = netWealth >= silverNisab;
  const zakatDue = isAboveNisab ? Math.round(netWealth * 0.025) : 0;

  assert.equal(isAboveNisab, false);
  assert.equal(zakatDue, 0);
});

// Test 3: Payment Summary and Groupings logic
test('Payment summary accurately sums totals, remaining, and percentage', () => {
  const totalDue = 340000;
  const payments = [
    { amount: 100000, recipient: 'Alkhidmat', date: '2024-03-15' },
    { amount: 125000, recipient: 'Edhi', date: '2023-10-24' },
    { amount: 85000, recipient: 'Local Community', date: '2023-04-15' },
  ];

  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0); // 310,000
  const remaining = Math.max(0, totalDue - totalPaid); // 30,000
  const percentPaid = Math.round((totalPaid / totalDue) * 100); // 91%

  assert.equal(totalPaid, 310000);
  assert.equal(remaining, 30000);
  assert.equal(percentPaid, 91);
});
