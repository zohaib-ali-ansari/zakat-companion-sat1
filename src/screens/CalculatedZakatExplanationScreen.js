import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useZakat } from '../context/ZakatContext';

const formatPkr = (val) => `PKR ${Number(val || 0).toLocaleString('en-US')}`;

export const CalculatedZakatExplanationScreen = ({ onBack, onStartTracking, calculatedData }) => {
  const { t, themeColors, isRTL } = useLanguage();
  const { calculatedResult, startTrackingCalculatedAmount, liveRates } = useZakat();

  // Use passed calculatedData or fallback to context calculatedResult
  const data = calculatedData || calculatedResult || {
    totalAssets: 2500000,
    liabilities: 100000,
    netZakatableWealth: 2400000,
    nisabThreshold: liveRates?.silverNisabPkr || 154875,
    isNisabMet: true,
    zakatPayable: 60000,
    assetBreakdown: {
      goldSilver: 1250000,
      cashInBank: 800000,
      investments: 450000,
    },
  };

  const handleStartTracking = () => {
    if (data.zakatPayable > 0) {
      startTrackingCalculatedAmount(data.zakatPayable);
    }
    if (onStartTracking) {
      onStartTracking(data.zakatPayable);
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />

      <View style={[styles.headerRow, isRTL && styles.rtlRow]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={22} color={themeColors.primary} />
          <Text style={[styles.backText, { color: themeColors.primary }]}>{t('backBtn')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Calculation Explanation</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dynamic Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder }]}>
          <Text style={[styles.summarySubtitle, { color: themeColors.textSecondary }]}>YOUR CALCULATED ZAKAT</Text>
          <Text style={[styles.summaryAmount, { color: themeColors.primary }]}>{formatPkr(data.zakatPayable)}</Text>
          <Text style={[styles.summaryMeta, { color: themeColors.textMuted }]}>
            Based on Net Wealth of {formatPkr(data.netZakatableWealth)} (Rate: 2.5%)
          </Text>
        </View>

        {/* Step 1: Gross Assets */}
        <View style={[styles.stepCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <View style={[styles.stepBadge, { backgroundColor: themeColors.primaryLight }]}>
            <Text style={[styles.stepBadgeText, { color: themeColors.primary }]}>STEP 1 · ASSETS</Text>
          </View>
          <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>Summing All Zakatable Assets</Text>
          <Text style={[styles.cardBody, { color: themeColors.textSecondary }]}>
            Total value of your cash, savings, precious metals, stocks, investments, and business trade assets.
          </Text>
          <View style={styles.mathRow}>
            <Text style={[styles.mathLabel, { color: themeColors.textSecondary }]}>Total Gross Assets:</Text>
            <Text style={[styles.mathVal, { color: themeColors.textPrimary }]}>{formatPkr(data.totalAssets)}</Text>
          </View>
        </View>

        {/* Step 2: Liabilities */}
        <View style={[styles.stepCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <View style={[styles.stepBadge, { backgroundColor: '#FEE2E2' }]}>
            <Text style={[styles.stepBadgeText, { color: '#EF4444' }]}>STEP 2 · DEDUCTIONS</Text>
          </View>
          <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>Deducting Short-Term Liabilities</Text>
          <Text style={[styles.cardBody, { color: themeColors.textSecondary }]}>
            Immediate short-term debts, due utility bills, or liabilities payable within 12 months are deducted.
          </Text>
          <View style={styles.mathRow}>
            <Text style={[styles.mathLabel, { color: themeColors.textSecondary }]}>Deductible Liabilities:</Text>
            <Text style={[styles.mathVal, { color: '#EF4444' }]}>- {formatPkr(data.liabilities)}</Text>
          </View>
          <View style={[styles.mathRow, { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: themeColors.border }]}>
            <Text style={[styles.mathLabel, { color: themeColors.textPrimary, fontWeight: '700' }]}>Net Zakatable Wealth:</Text>
            <Text style={[styles.mathVal, { color: themeColors.primary, fontWeight: '800' }]}>{formatPkr(data.netZakatableWealth)}</Text>
          </View>
        </View>

        {/* Step 3: Nisab Check & 2.5% Rate */}
        <View style={[styles.stepCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <View style={[styles.stepBadge, { backgroundColor: data.isNisabMet ? '#DCFCE7' : '#FEF3C7' }]}>
            <Text style={[styles.stepBadgeText, { color: data.isNisabMet ? '#166534' : '#92400E' }]}>
              STEP 3 · NISAB & RATE
            </Text>
          </View>
          <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>Nisab Verification & 2.5% Rate</Text>
          <Text style={[styles.cardBody, { color: themeColors.textSecondary }]}>
            The Nisab threshold is {formatPkr(data.nisabThreshold)} (based on 52.5 Tolas Silver).
            {data.isNisabMet
              ? ' Your Net Wealth meets/exceeds Nisab. Zakat is obligatory at exactly 2.5% (1/40th).'
              : ' Your Net Wealth is below Nisab. No Zakat is obligatory.'}
          </Text>
        </View>

        {/* Math Formula Card */}
        <View style={[styles.formulaBox, { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder }]}>
          <Ionicons name="calculator-outline" size={24} color={themeColors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.formulaText, { color: themeColors.primary }]}>
              ({formatPkr(data.totalAssets)} - {formatPkr(data.liabilities)}) × 2.5%
            </Text>
            <Text style={[styles.formulaSub, { color: themeColors.primary }]}>
              = {formatPkr(data.zakatPayable)} Payable Zakat
            </Text>
          </View>
        </View>

        {/* Primary CTA Button to start tracking */}
        <TouchableOpacity
          style={[styles.trackCtaBtn, { backgroundColor: themeColors.primary }]}
          onPress={handleStartTracking}
          activeOpacity={0.85}
        >
          <Ionicons name="stats-chart" size={20} color="#FFFFFF" />
          <Text style={styles.trackCtaBtnText}>Start Zakat Tracking</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  rtlRow: { flexDirection: 'row-reverse' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { fontSize: 15, fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: 20, gap: 16, paddingBottom: 40 },
  summaryCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  summarySubtitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  summaryAmount: { fontSize: 32, fontWeight: '900', marginBottom: 4 },
  summaryMeta: { fontSize: 12, textAlign: 'center' },
  stepCard: { padding: 18, borderRadius: 18, borderWidth: 1 },
  stepBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  stepBadgeText: { fontSize: 11, fontWeight: '800' },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  cardBody: { fontSize: 13, lineHeight: 20, marginBottom: 10 },
  mathRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3 },
  mathLabel: { fontSize: 13, fontWeight: '600' },
  mathVal: { fontSize: 14, fontWeight: '800' },
  formulaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  formulaText: { fontSize: 14, fontWeight: '800' },
  formulaSub: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  trackCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 27,
    gap: 10,
    marginTop: 6,
    shadowColor: '#1A4FD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  trackCtaBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
