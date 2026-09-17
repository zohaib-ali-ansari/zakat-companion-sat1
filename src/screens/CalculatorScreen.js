import { SafeAreaView } from 'react-native-safe-area-context';
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
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useZakat } from '../context/ZakatContext';
import { Header } from '../components/Header';

export const CalculatorScreen = ({ onOpenSettings }) => {
  const { t, themeColors, isRTL } = useLanguage();
  const { updateTotalDue, saveCalculationSnapshot, updateAssetsBreakdown, metalRates, assetsBreakdown } = useZakat();

  // Active Category Toggles
  const [selectedCategories, setSelectedCategories] = useState({
    goldSilver: true,
    cash: true,
    stocks: true,
    property: false,
    business: false,
    liabilities: true,
  });

  // Dynamic Asset Values (in PKR)
  const [goldVal, setGoldVal] = useState('1250000');
  const [silverVal, setSilverVal] = useState('0');
  const [cashHand, setCashHand] = useState('300000');
  const [bankSavings, setBankSavings] = useState('500000');
  const [stockVal, setStockVal] = useState('450000');
  const [propertyVal, setPropertyVal] = useState('0');
  const [businessVal, setBusinessVal] = useState('0');
  const [liabilitiesVal, setLiabilitiesVal] = useState('100000');

  // Calculation Result State
  const [calculated, setCalculated] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const toggleCategory = (catKey) => {
    setSelectedCategories((prev) => ({ ...prev, [catKey]: !prev[catKey] }));
  };

  const handleCompute = () => {
    const gold = selectedCategories.goldSilver ? parseFloat(goldVal) || 0 : 0;
    const silver = selectedCategories.goldSilver ? parseFloat(silverVal) || 0 : 0;
    const cash = selectedCategories.cash ? (parseFloat(cashHand) || 0) + (parseFloat(bankSavings) || 0) : 0;
    const stocks = selectedCategories.stocks ? parseFloat(stockVal) || 0 : 0;
    const property = selectedCategories.property ? parseFloat(propertyVal) || 0 : 0;
    const business = selectedCategories.business ? parseFloat(businessVal) || 0 : 0;
    const liabilities = selectedCategories.liabilities ? parseFloat(liabilitiesVal) || 0 : 0;

    const totalAssets = gold + silver + cash + stocks + property + business;
    const netZakatableWealth = Math.max(0, totalAssets - liabilities);
    const nisabThreshold = metalRates?.nisab?.silverThreshold || 174523;
    const isNisabMet = netZakatableWealth >= nisabThreshold;
    const zakatPayable = isNisabMet ? netZakatableWealth * 0.025 : 0;

    setCalculated({
      totalAssets,
      liabilities,
      netZakatableWealth,
      nisabThreshold,
      isNisabMet,
      zakatPayable,
    });
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
    setIsSaved(false);
  };

  const handleSaveToHistory = async () => {
    if (calculated && calculated.zakatPayable >= 0) {
      updateTotalDue(calculated.zakatPayable);
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
      setIsSaved(true);
      Alert.alert(
        t('appTitle'),
        isRTL
          ? 'آپ کی زکوٰۃ کی کل مقدار ٹریکر میں اپ ڈیٹ ہو گئی ہے!'
          : 'Your total Zakat calculation has been saved and updated in the tracker!'
      );
    }
  };

  const categories = [
    { key: 'goldSilver', labelKey: 'catGoldSilver', icon: 'sparkles-outline' },
    { key: 'cash', labelKey: 'catCash', icon: 'wallet-outline' },
    { key: 'stocks', labelKey: 'catStocks', icon: 'trending-up-outline' },
    { key: 'property', labelKey: 'catProperty', icon: 'home-outline' },
    { key: 'business', labelKey: 'catBusiness', icon: 'briefcase-outline' },
    { key: 'liabilities', labelKey: 'catLiabilities', icon: 'card-outline' },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />
      <Header onOpenSettings={onOpenSettings} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Title Header */}
        <View style={styles.headerSection}>
          <Text style={[styles.pageTitle, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {t('calculatorTitle')}
          </Text>
          <Text style={[styles.pageSub, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            {t('calculatorSub')}
          </Text>
        </View>

        {/* Step 1: Category Selection Chips */}
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
                    isRTL && styles.rtlRow,
                  ]}
                  onPress={() => toggleCategory(cat.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={cat.icon}
                    size={18}
                    color={isSelected ? themeColors.primary : themeColors.textMuted}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? themeColors.primary : themeColors.textPrimary },
                    ]}
                  >
                    {t(cat.labelKey)}
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={16} color={themeColors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Step 2: Asset Input Fields */}
        <View style={styles.stepBox}>
          <Text style={[styles.stepTitle, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {t('enterValuesStep')}
          </Text>

          {/* Gold & Silver Inputs */}
          {selectedCategories.goldSilver && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>{t('fieldGoldVal')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.textPrimary, borderColor: themeColors.border }, isRTL && styles.rtlInput]}
                keyboardType="numeric"
                value={goldVal}
                onChangeText={setGoldVal}
                placeholder="0"
                placeholderTextColor={themeColors.textMuted}
              />
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>{t('fieldSilverVal')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.textPrimary, borderColor: themeColors.border }, isRTL && styles.rtlInput]}
                keyboardType="numeric"
                value={silverVal}
                onChangeText={setSilverVal}
                placeholder="0"
                placeholderTextColor={themeColors.textMuted}
              />
            </View>
          )}

          {/* Cash Inputs */}
          {selectedCategories.cash && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>{t('fieldCashHand')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.textPrimary, borderColor: themeColors.border }, isRTL && styles.rtlInput]}
                keyboardType="numeric"
                value={cashHand}
                onChangeText={setCashHand}
                placeholder="0"
                placeholderTextColor={themeColors.textMuted}
              />
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>{t('fieldBankSavings')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.textPrimary, borderColor: themeColors.border }, isRTL && styles.rtlInput]}
                keyboardType="numeric"
                value={bankSavings}
                onChangeText={setBankSavings}
                placeholder="0"
                placeholderTextColor={themeColors.textMuted}
              />
            </View>
          )}

          {/* Stocks Inputs */}
          {selectedCategories.stocks && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>{t('fieldStockVal')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.textPrimary, borderColor: themeColors.border }, isRTL && styles.rtlInput]}
                keyboardType="numeric"
                value={stockVal}
                onChangeText={setStockVal}
                placeholder="0"
                placeholderTextColor={themeColors.textMuted}
              />
            </View>
          )}

          {/* Property Inputs */}
          {selectedCategories.property && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>{t('fieldPropertyVal')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.textPrimary, borderColor: themeColors.border }, isRTL && styles.rtlInput]}
                keyboardType="numeric"
                value={propertyVal}
                onChangeText={setPropertyVal}
                placeholder="0"
                placeholderTextColor={themeColors.textMuted}
              />
            </View>
          )}

          {/* Business Inputs */}
          {selectedCategories.business && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>{t('fieldBusinessVal')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.textPrimary, borderColor: themeColors.border }, isRTL && styles.rtlInput]}
                keyboardType="numeric"
                value={businessVal}
                onChangeText={setBusinessVal}
                placeholder="0"
                placeholderTextColor={themeColors.textMuted}
              />
            </View>
          )}

          {/* Liabilities Inputs */}
          {selectedCategories.liabilities && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>{t('fieldLiabilitiesVal')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.textPrimary, borderColor: themeColors.border }, isRTL && styles.rtlInput]}
                keyboardType="numeric"
                value={liabilitiesVal}
                onChangeText={setLiabilitiesVal}
                placeholder="0"
                placeholderTextColor={themeColors.textMuted}
              />
            </View>
          )}
        </View>

        {/* Compute CTA Button */}
        <TouchableOpacity
          style={[styles.computeBtn, { backgroundColor: themeColors.primary }]}
          onPress={handleCompute}
          activeOpacity={0.85}
        >
          <Ionicons name="calculator-outline" size={22} color="#FFFFFF" />
          <Text style={styles.computeBtnText}>{t('computeResultBtn')}</Text>
        </TouchableOpacity>

        {/* Calculation Result Summary Card */}
        {calculated && (
          <View style={[styles.resultCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.primaryBorder }]}>
            <Text style={[styles.resultTitle, { color: themeColors.textPrimary }]}>
              {t('remainingZakatLabel')}
            </Text>

            <View style={[styles.resultRow, isRTL && styles.rtlRow]}>
              <Text style={[styles.resultRowLabel, { color: themeColors.textSecondary }]}>{t('totalWealthLabel')}</Text>
              <Text style={[styles.resultRowVal, { color: themeColors.textPrimary }]}>PKR {calculated.totalAssets.toLocaleString()}</Text>
            </View>

            <View style={[styles.resultRow, isRTL && styles.rtlRow]}>
              <Text style={[styles.resultRowLabel, { color: themeColors.textSecondary }]}>{t('netDeductionsLabel')}</Text>
              <Text style={[styles.resultRowVal, { color: themeColors.danger }]}>- PKR {calculated.liabilities.toLocaleString()}</Text>
            </View>

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
                {calculated.isNisabMet ? t('nisabMetBadge') : t('nisabNotMetBadge')}
              </Text>
            </View>

            {/* Zakat Payable */}
            <Text style={[styles.zakatPayableTitle, { color: themeColors.textSecondary }]}>{t('zakatPayableLabel')}</Text>
            <Text style={[styles.zakatPayableAmount, { color: themeColors.primary }]}>
              PKR {calculated.zakatPayable.toLocaleString()}
            </Text>

            {/* Save Action */}
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: isSaved ? themeColors.successBg : themeColors.primaryLight }]}
              onPress={handleSaveToHistory}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isSaved ? 'checkmark-circle' : 'bookmark-outline'}
                size={18}
                color={isSaved ? themeColors.success : themeColors.primary}
              />
              <Text style={[styles.saveBtnText, { color: isSaved ? themeColors.success : themeColors.primary }]}>
                {isSaved ? (isRTL ? 'محفوظ ہو گیا' : 'Saved to Tracker') : t('saveCalculationBtn')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  pageSub: {
    fontSize: 14,
    lineHeight: 20,
  },
  stepBox: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  rtlText: {
    textAlign: 'right',
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  rtlInput: {
    textAlign: 'right',
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '600',
  },
  computeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 26,
    gap: 10,
    marginBottom: 24,
    shadowColor: '#1A4FD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  computeBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  resultCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 6,
  },
  resultRowLabel: {
    fontSize: 14,
  },
  resultRowVal: {
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    width: '100%',
    marginVertical: 10,
  },
  badgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    marginVertical: 14,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  zakatPayableTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  zakatPayableAmount: {
    fontSize: 34,
    fontWeight: '900',
    marginVertical: 6,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    gap: 8,
    marginTop: 10,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
