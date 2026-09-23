import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useZakat } from '../context/ZakatContext';
import { Header } from '../components/Header';

export const CalculatorScreen = ({ onOpenSettings, onNavigateExplanation }) => {
  const { t, themeColors, isRTL } = useLanguage();
  const {
    liveRates,
    metalRates,
    setCalculatedResult,
    updateTotalDue,
    startTrackingCalculatedAmount,
    updateAssetsBreakdown,
    saveCalculationSnapshot,
  } = useZakat();

  // Active Category Toggles
  const [selectedCategories, setSelectedCategories] = useState({
    goldSilver: true,
    cash: true,
    stocks: true,
    mutualFunds: false,
    crypto: false,
    business: false,
    pension: false,
    property: false,
    liabilities: true,
  });

  // Asset Values
  const [goldVal, setGoldVal] = useState('');
  const [silverVal, setSilverVal] = useState('');
  const [cashHand, setCashHand] = useState('');
  const [bankSavings, setBankSavings] = useState('');
  const [stockVal, setStockVal] = useState('');
  const [mutualFundVal, setMutualFundVal] = useState('');
  const [cryptoVal, setCryptoVal] = useState('');
  const [businessVal, setBusinessVal] = useState('');
  const [pensionVal, setPensionVal] = useState('');
  const [propertyVal, setPropertyVal] = useState('');
  const [liabilitiesVal, setLiabilitiesVal] = useState('');

  const [calculated, setCalculated] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const toggleCategory = (catKey) => {
    setSelectedCategories((prev) => ({ ...prev, [catKey]: !prev[catKey] }));
    setCalculated(null);
    setIsSaved(false);
  };

  const handleCompute = () => {
    const gold = selectedCategories.goldSilver ? parseFloat(goldVal) || 0 : 0;
    const silver = selectedCategories.goldSilver ? parseFloat(silverVal) || 0 : 0;
    const cash = selectedCategories.cash
      ? (parseFloat(cashHand) || 0) + (parseFloat(bankSavings) || 0)
      : 0;
    const stocks = selectedCategories.stocks ? parseFloat(stockVal) || 0 : 0;
    const mutualFunds = selectedCategories.mutualFunds ? parseFloat(mutualFundVal) || 0 : 0;
    const crypto = selectedCategories.crypto ? parseFloat(cryptoVal) || 0 : 0;
    const business = selectedCategories.business ? parseFloat(businessVal) || 0 : 0;
    const pension = selectedCategories.pension ? parseFloat(pensionVal) || 0 : 0;
    const property = selectedCategories.property ? parseFloat(propertyVal) || 0 : 0;
    const liabilities = selectedCategories.liabilities ? parseFloat(liabilitiesVal) || 0 : 0;

    const totalAssets = gold + silver + cash + stocks + mutualFunds + crypto + business + pension + property;
    const netZakatableWealth = Math.max(0, totalAssets - liabilities);

    // Use live silver nisab from backend or context
    const nisabThreshold = metalRates?.nisab?.silverThreshold || liveRates?.silverNisabPkr || 154875;
    const isNisabMet = netZakatableWealth >= nisabThreshold;
    const zakatPayable = isNisabMet ? netZakatableWealth * 0.025 : 0;

    const result = {
      totalAssets,
      liabilities,
      netZakatableWealth,
      nisabThreshold,
      isNisabMet,
      zakatPayable,
      assetBreakdown: {
        goldSilver: gold + silver,
        cashInBank: cash,
        stocks,
        mutualFunds,
        crypto,
        business,
        pension,
        property,
      },
    };

    setCalculated(result);
    setIsSaved(false);
    if (setCalculatedResult) setCalculatedResult(result);

    if (updateAssetsBreakdown) {
      updateAssetsBreakdown({
        goldVal,
        silverVal,
        cashHand,
        bankSavings,
        stockVal,
        propertyVal,
        businessVal,
        liabilitiesVal,
      });
    }
  };

  const handleSaveAndTrack = async () => {
    if (!calculated || calculated.zakatPayable <= 0) return;
    if (startTrackingCalculatedAmount) {
      startTrackingCalculatedAmount(calculated.zakatPayable);
    } else if (updateTotalDue) {
      updateTotalDue(calculated.zakatPayable);
    }

    if (saveCalculationSnapshot) {
      await saveCalculationSnapshot({
        selectedCategories,
        values: {
          goldVal: parseFloat(goldVal) || 0,
          silverVal: parseFloat(silverVal) || 0,
          cashHand: parseFloat(cashHand) || 0,
          bankSavings: parseFloat(bankSavings) || 0,
          stockVal: parseFloat(stockVal) || 0,
          propertyVal: parseFloat(propertyVal) || 0,
          businessVal: parseFloat(businessVal) || 0,
          liabilitiesVal: parseFloat(liabilitiesVal) || 0,
        },
        currency: 'PKR',
      });
    }
    setIsSaved(true);
  };

  const categories = [
    { key: 'goldSilver',  labelKey: 'catGoldSilver',  icon: 'sparkles-outline' },
    { key: 'cash',        labelKey: 'catCash',         icon: 'wallet-outline' },
    { key: 'stocks',      labelKey: 'catStocks',       icon: 'trending-up-outline' },
    { key: 'mutualFunds', label: 'Mutual Funds',       icon: 'pie-chart-outline' },
    { key: 'crypto',      label: 'Cryptocurrency',     icon: 'logo-bitcoin' },
    { key: 'business',   labelKey: 'catBusiness',      icon: 'briefcase-outline' },
    { key: 'pension',    label: 'Pension / Retirement', icon: 'shield-checkmark-outline' },
    { key: 'property',   labelKey: 'catProperty',      icon: 'home-outline' },
    { key: 'liabilities',labelKey: 'catLiabilities',   icon: 'card-outline' },
  ];

  const getLabel = (cat) => cat.label || (cat.labelKey ? t(cat.labelKey) : cat.key);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />
      <Header onOpenSettings={onOpenSettings} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.headerSection}>
          <Text style={[styles.pageTitle, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {t('calculatorTitle')}
          </Text>
          <Text style={[styles.pageSub, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            {t('calculatorSub')}
          </Text>
        </View>

        {/* Nisab info bar */}
        <View style={[styles.nisabBar, { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder }]}>
          <Ionicons name="information-circle-outline" size={16} color={themeColors.primary} />
          <Text style={[styles.nisabBarText, { color: themeColors.primary }]}>
            Nisab (Silver): PKR {(metalRates?.nisab?.silverThreshold || liveRates?.silverNisabPkr || 154875).toLocaleString()} · Gold: PKR {(liveRates?.gold24kTola || 245000).toLocaleString()} /Tola
          </Text>
        </View>

        {/* Step 1: Category Selection */}
        <View style={styles.stepBox}>
          <Text style={[styles.stepTitle, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {t('selectAssetsStep')}
          </Text>
          <View style={[styles.chipsGrid, isRTL && styles.rtlRow]}>
            {categories.map((cat) => {
              const isSelected = selectedCategories[cat.key];
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.chipItem,
                    {
                      backgroundColor: isSelected ? themeColors.primaryLight : themeColors.cardBg,
                      borderColor: isSelected ? themeColors.primary : themeColors.border,
                    },
                  ]}
                  onPress={() => toggleCategory(cat.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={cat.icon} size={16} color={isSelected ? themeColors.primary : themeColors.textMuted} />
                  <Text style={[styles.chipText, { color: isSelected ? themeColors.primary : themeColors.textPrimary }]}>
                    {getLabel(cat)}
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={14} color={themeColors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Step 2: Asset Inputs */}
        <View style={styles.stepBox}>
          <Text style={[styles.stepTitle, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {t('enterValuesStep')}
          </Text>

          {selectedCategories.goldSilver && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.groupHeader, { color: themeColors.primary }]}>Gold & Silver</Text>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>{t('fieldGoldVal')} (PKR)</Text>
              <TextInput style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.textPrimary, borderColor: themeColors.border }]} keyboardType="numeric" value={goldVal} onChangeText={(v) => { setGoldVal(v); setCalculated(null); }} placeholder="0" placeholderTextColor={themeColors.textMuted} />
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>{t('fieldSilverVal')} (PKR)</Text>
              <TextInput style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.textPrimary, borderColor: themeColors.border }]} keyboardType="numeric" value={silverVal} onChangeText={(v) => { setSilverVal(v); setCalculated(null); }} placeholder="0" placeholderTextColor={themeColors.textMuted} />
            </View>
          )}

          {selectedCategories.cash && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.groupHeader, { color: themeColors.primary }]}>Cash & Bank</Text>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>{t('fieldCashHand')} (PKR)</Text>
              <TextInput style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.textPrimary, borderColor: themeColors.border }]} keyboardType="numeric" value={cashHand} onChangeText={(v) => { setCashHand(v); setCalculated(null); }} placeholder="0" placeholderTextColor={themeColors.textMuted} />
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>{t('fieldBankSavings')} (PKR)</Text>
              <TextInput style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.textPrimary, borderColor: themeColors.border }]} keyboardType="numeric" value={bankSavings} onChangeText={(v) => { setBankSavings(v); setCalculated(null); }} placeholder="0" placeholderTextColor={themeColors.textMuted} />
            </View>
          )}

          {selectedCategories.stocks && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.groupHeader, { color: themeColors.primary }]}>Stocks & Investments</Text>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>Market Value of Shares/Stocks (PKR)</Text>
              <TextInput style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.textPrimary, borderColor: themeColors.border }]} keyboardType="numeric" value={stockVal} onChangeText={(v) => { setStockVal(v); setCalculated(null); }} placeholder="0" placeholderTextColor={themeColors.textMuted} />
            </View>
          )}

          {selectedCategories.mutualFunds && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.groupHeader, { color: themeColors.primary }]}>Mutual Funds</Text>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>Current NAV / Unit Value (PKR)</Text>
              <TextInput style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.textPrimary, borderColor: themeColors.border }]} keyboardType="numeric" value={mutualFundVal} onChangeText={(v) => { setMutualFundVal(v); setCalculated(null); }} placeholder="0" placeholderTextColor={themeColors.textMuted} />
            </View>
          )}

          {selectedCategories.crypto && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.groupHeader, { color: themeColors.primary }]}>Cryptocurrency</Text>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>Total Crypto Value in PKR</Text>
              <TextInput style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.textPrimary, borderColor: themeColors.border }]} keyboardType="numeric" value={cryptoVal} onChangeText={(v) => { setCryptoVal(v); setCalculated(null); }} placeholder="0" placeholderTextColor={themeColors.textMuted} />
            </View>
          )}

          {selectedCategories.business && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.groupHeader, { color: themeColors.primary }]}>Business / Trade Assets</Text>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>Inventory + Cash + Receivables (PKR)</Text>
              <TextInput style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.textPrimary, borderColor: themeColors.border }]} keyboardType="numeric" value={businessVal} onChangeText={(v) => { setBusinessVal(v); setCalculated(null); }} placeholder="0" placeholderTextColor={themeColors.textMuted} />
            </View>
          )}

          {selectedCategories.pension && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.groupHeader, { color: themeColors.primary }]}>Pension / Retirement</Text>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>Accessible Pension Fund Value (PKR)</Text>
              <TextInput style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.textPrimary, borderColor: themeColors.border }]} keyboardType="numeric" value={pensionVal} onChangeText={(v) => { setPensionVal(v); setCalculated(null); }} placeholder="0" placeholderTextColor={themeColors.textMuted} />
            </View>
          )}

          {selectedCategories.property && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.groupHeader, { color: themeColors.primary }]}>Property (Trade/Rental)</Text>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>Market Value of Trade Property (PKR)</Text>
              <TextInput style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.textPrimary, borderColor: themeColors.border }]} keyboardType="numeric" value={propertyVal} onChangeText={(v) => { setPropertyVal(v); setCalculated(null); }} placeholder="0" placeholderTextColor={themeColors.textMuted} />
            </View>
          )}

          {selectedCategories.liabilities && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.groupHeader, { color: '#EF4444' }]}>Deductible Liabilities</Text>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>{t('fieldLiabilitiesVal')} (PKR)</Text>
              <TextInput style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.textPrimary, borderColor: themeColors.border }]} keyboardType="numeric" value={liabilitiesVal} onChangeText={(v) => { setLiabilitiesVal(v); setCalculated(null); }} placeholder="0" placeholderTextColor={themeColors.textMuted} />
            </View>
          )}
        </View>

        {/* Calculate Button */}
        <TouchableOpacity
          style={[styles.computeBtn, { backgroundColor: themeColors.primary }]}
          onPress={handleCompute}
          activeOpacity={0.85}
        >
          <Ionicons name="calculator-outline" size={22} color="#FFFFFF" />
          <Text style={styles.computeBtnText}>{t('computeResultBtn')}</Text>
        </TouchableOpacity>

        {/* Result Card */}
        {calculated && (
          <View style={[styles.resultCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.primaryBorder }]}>
            <Text style={[styles.resultTitle, { color: themeColors.textPrimary }]}>Calculation Summary</Text>

            {/* Asset Breakdown */}
            {Object.entries(calculated.assetBreakdown || {}).map(([key, val]) =>
              val > 0 ? (
                <View key={key} style={[styles.resultRow, isRTL && styles.rtlRow]}>
                  <Text style={[styles.resultRowLabel, { color: themeColors.textSecondary }]}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                  </Text>
                  <Text style={[styles.resultRowVal, { color: themeColors.textPrimary }]}>
                    PKR {val.toLocaleString()}
                  </Text>
                </View>
              ) : null
            )}

            <View style={styles.divider} />

            <View style={[styles.resultRow, isRTL && styles.rtlRow]}>
              <Text style={[styles.resultRowLabel, { color: themeColors.textSecondary }]}>{t('totalWealthLabel')}</Text>
              <Text style={[styles.resultRowVal, { color: themeColors.textPrimary }]}>PKR {calculated.totalAssets.toLocaleString()}</Text>
            </View>

            {calculated.liabilities > 0 && (
              <View style={[styles.resultRow, isRTL && styles.rtlRow]}>
                <Text style={[styles.resultRowLabel, { color: themeColors.textSecondary }]}>{t('netDeductionsLabel')}</Text>
                <Text style={[styles.resultRowVal, { color: '#EF4444' }]}>- PKR {calculated.liabilities.toLocaleString()}</Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={[styles.resultRow, isRTL && styles.rtlRow]}>
              <Text style={[styles.resultRowLabel, { color: themeColors.textPrimary, fontWeight: '700' }]}>{t('netWealthLabel')}</Text>
              <Text style={[styles.resultRowVal, { color: themeColors.textPrimary, fontWeight: '800' }]}>PKR {calculated.netZakatableWealth.toLocaleString()}</Text>
            </View>

            {/* Nisab Badge */}
            <View style={[styles.badgeBox, { backgroundColor: calculated.isNisabMet ? themeColors.successBg : themeColors.cardBgAlt }]}>
              <Ionicons
                name={calculated.isNisabMet ? 'checkmark-circle' : 'information-circle'}
                size={18}
                color={calculated.isNisabMet ? themeColors.success : themeColors.textMuted}
              />
              <Text style={[styles.badgeText, { color: calculated.isNisabMet ? themeColors.success : themeColors.textMuted }]}>
                {calculated.isNisabMet
                  ? `Nisab Met (PKR ${calculated.nisabThreshold.toLocaleString()})`
                  : `Below Nisab — No Zakat due (Threshold: PKR ${calculated.nisabThreshold.toLocaleString()})`}
              </Text>
            </View>

            {/* Zakat Amount */}
            <Text style={[styles.zakatPayableTitle, { color: themeColors.textSecondary }]}>{t('zakatPayableLabel')}</Text>
            <Text style={[styles.zakatPayableAmount, { color: themeColors.primary }]}>
              PKR {calculated.zakatPayable.toLocaleString()}
            </Text>
            <Text style={[styles.rateNote, { color: themeColors.textMuted }]}>2.5% × Net Zakatable Wealth</Text>

            {/* CTAs */}
            {calculated.zakatPayable > 0 && (
              <View style={styles.ctaGroup}>
                {onNavigateExplanation && (
                  <TouchableOpacity
                    style={[styles.explainBtn, { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder }]}
                    onPress={() => onNavigateExplanation(calculated)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="information-circle-outline" size={18} color={themeColors.primary} />
                    <Text style={[styles.explainBtnText, { color: themeColors.primary }]}>View Calculation Breakdown</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: isSaved ? themeColors.successBg : themeColors.primary }]}
                  onPress={handleSaveAndTrack}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isSaved ? 'checkmark-circle' : 'stats-chart-outline'}
                    size={18}
                    color={isSaved ? themeColors.success : '#FFFFFF'}
                  />
                  <Text style={[styles.saveBtnText, { color: isSaved ? themeColors.success : '#FFFFFF' }]}>
                    {isSaved ? 'Saved to Tracker ✓' : 'Start Tracking This Amount'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  headerSection: { marginTop: 10, marginBottom: 16 },
  pageTitle: { fontSize: 26, fontWeight: '800', marginBottom: 6 },
  pageSub: { fontSize: 14, lineHeight: 20 },
  rtlText: { textAlign: 'right' },
  rtlRow: { flexDirection: 'row-reverse' },
  nisabBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 12, borderWidth: 1, marginBottom: 20,
  },
  nisabBarText: { fontSize: 12, fontWeight: '600', flex: 1 },
  stepBox: { marginBottom: 24 },
  stepTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 20, borderWidth: 1.5, gap: 6,
  },
  chipText: { fontSize: 12, fontWeight: '700' },
  fieldGroup: { marginBottom: 16 },
  groupHeader: { fontSize: 13, fontWeight: '800', marginBottom: 8, letterSpacing: 0.5 },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 6 },
  input: { height: 48, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 14, fontSize: 15, fontWeight: '600' },
  computeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 52, borderRadius: 26, gap: 10, marginBottom: 24,
    shadowColor: '#1A4FD6', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  computeBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  resultCard: {
    borderRadius: 20, padding: 20, borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, marginBottom: 20,
  },
  resultTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginVertical: 5 },
  resultRowLabel: { fontSize: 13 },
  resultRowVal: { fontSize: 14, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#E2E8F0', width: '100%', marginVertical: 10 },
  badgeBox: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 20, gap: 6, marginVertical: 12,
  },
  badgeText: { fontSize: 12, fontWeight: '700', flex: 1 },
  zakatPayableTitle: { fontSize: 13, fontWeight: '600', marginTop: 6, textAlign: 'center' },
  zakatPayableAmount: { fontSize: 34, fontWeight: '900', marginVertical: 4, textAlign: 'center' },
  rateNote: { fontSize: 11, textAlign: 'center', marginBottom: 16 },
  ctaGroup: { gap: 10, marginTop: 4 },
  explainBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: 20, borderWidth: 1.5, gap: 8,
  },
  explainBtnText: { fontSize: 14, fontWeight: '700' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, paddingHorizontal: 20, borderRadius: 26, gap: 8,
    shadowColor: '#1A4FD6', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  saveBtnText: { fontSize: 15, fontWeight: '700' },
});
