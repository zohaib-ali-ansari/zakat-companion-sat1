import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

export const CalculatedZakatExplanationScreen = ({ onBack }) => {
  const { t, themeColors, isRTL } = useLanguage();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />

      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={themeColors.primary} />
          <Text style={[styles.backText, { color: themeColors.primary }]}>{t('backBtn')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>{t('zakatExplanationTitle')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Step 1: Sum Assets */}
        <View style={[styles.stepCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <View style={[styles.stepBadge, { backgroundColor: themeColors.primaryLight }]}>
            <Text style={[styles.stepBadgeText, { color: themeColors.primary }]}>STEP 1</Text>
          </View>
          <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
            {isRTL ? 'تمام قابل زکوٰۃ اثاثوں کا مجموعہ' : 'Summing All Eligible Assets'}
          </Text>
          <Text style={[styles.cardBody, { color: themeColors.textSecondary }]}>
            {isRTL
              ? 'اپنے تمام نقد رقم، سونے، چاندی، اور تجارتی سرمایے کی کل مالیت جمع کی جاتی ہے۔'
              : 'Add the current monetary value of all your cash, bank balances, gold, silver, investments, and trade goods.'}
          </Text>
        </View>

        {/* Step 2: Deduct Short-Term Liabilities */}
        <View style={[styles.stepCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <View style={[styles.stepBadge, { backgroundColor: themeColors.primaryLight }]}>
            <Text style={[styles.stepBadgeText, { color: themeColors.primary }]}>STEP 2</Text>
          </View>
          <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
            {isRTL ? 'فوراً واجب الادا قرضے منہا کریں' : 'Deducting Short-Term Liabilities'}
          </Text>
          <Text style={[styles.cardBody, { color: themeColors.textSecondary }]}>
            {isRTL
              ? 'اپنے فوری ادا کرنے والے قرضے اور واجبات کل رقم سے منہا کریں تا کہ خالص مالیت معلوم ہو سکے۔'
              : 'Deduct short-term debts, due utility bills, or immediate liabilities from your gross wealth.'}
          </Text>
        </View>

        {/* Step 3: Nisab Check & 2.5% Rate */}
        <View style={[styles.stepCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <View style={[styles.stepBadge, { backgroundColor: themeColors.primaryLight }]}>
            <Text style={[styles.stepBadgeText, { color: themeColors.primary }]}>STEP 3</Text>
          </View>
          <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
            {isRTL ? 'نصاب کی جانچ اور 2.5% کا حساب' : 'Nisab Check & 2.5% Calculation'}
          </Text>
          <Text style={[styles.cardBody, { color: themeColors.textSecondary }]}>
            {isRTL
              ? 'اگر خالص مالیت نصاب سے زیادہ ہے تو کل خالص رقم کا 2.5% (1/40 واں حصہ) بطور زکوٰۃ ادا کیا جاتا ہے۔'
              : 'If net wealth exceeds the silver/gold Nisab threshold, exactly 2.5% (1/40th) is calculated as your payable Zakat.'}
          </Text>
        </View>

        {/* Math Formula Card */}
        <View style={[styles.formulaBox, { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder }]}>
          <Ionicons name="calculator-outline" size={24} color={themeColors.primary} />
          <Text style={[styles.formulaText, { color: themeColors.primary }]}>
            Zakat Due = (Gross Assets - Liabilities) × 0.025
          </Text>
        </View>

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
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { fontSize: 15, fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: 20, gap: 16 },
  stepCard: { padding: 18, borderRadius: 18, borderWidth: 1 },
  stepBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  stepBadgeText: { fontSize: 12, fontWeight: '800' },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  cardBody: { fontSize: 14, lineHeight: 22 },
  formulaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 10,
    marginTop: 10,
  },
  formulaText: { fontSize: 15, fontWeight: '800' },
});
