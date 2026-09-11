import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, StatusBar } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useZakat } from '../context/ZakatContext';

const getYear = (dateStr) => {
  if (!dateStr) return 'Other';
  const match = dateStr.match(/\d{4}/);
  return match ? match[0] : 'Other';
};

const formatCurrency = (amount) => `PKR ${Number(amount || 0).toLocaleString('en-US')}`;

export default function HistoryYearDetailScreen({ year: yearProp, onBack }) {
  const { t, isRTL, themeColors } = useLanguage();
  const { records } = useZakat();

  const year = String(yearProp || '');
  const filteredRecords = (records || []).filter((record) => getYear(record.date) === year);
  const total = filteredRecords.reduce((sum, record) => sum + (Number(record.amount) || 0), 0);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />
      <View style={styles.screen}>
        {/* Top Bar */}
        <View style={[styles.topBar, { borderBottomColor: themeColors.border }, isRTL && styles.rtlRow]}>
          <Pressable onPress={() => onBack?.()} accessibilityLabel="Back to history">
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={themeColors.primary} />
          </Pressable>
          <View style={[styles.topTitle, isRTL && styles.rtlRow]}>
            <View style={[styles.logo, { backgroundColor: themeColors.primaryLight }]}>
              <Ionicons name="sparkles-outline" size={14} color={themeColors.primary} />
            </View>
            <Text style={[styles.topTitleText, { color: themeColors.textPrimary }]}>
              {t('historyAction')}: {year}
            </Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.summaryCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <View style={[styles.summaryHeading, isRTL && styles.rtlRow]}>
              <Text style={[styles.summaryTitle, { color: themeColors.textPrimary }]}>
                {t('annualSummaryTitle')}
              </Text>
              <Text style={[styles.summaryYear, { color: themeColors.textSecondary }]}>{year}</Text>
            </View>

            <View style={[styles.rule, { backgroundColor: themeColors.border }]} />

            {/* Table Header */}
            <View style={[styles.tableHeader, isRTL && styles.rtlRow]}>
              <Text style={[styles.headerDate, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
                {t('dateHeader')}
              </Text>
              <Text style={[styles.headerRecipient, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
                {t('recipientHeader')}
              </Text>
              <Text style={[styles.headerAmount, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
                {t('amountHeader')}
              </Text>
            </View>

            <View style={[styles.rule, { backgroundColor: themeColors.border }]} />

            {/* Payment Rows */}
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <View style={[styles.paymentRow, isRTL && styles.rtlRow]} key={record.id}>
                  <Text style={[styles.date, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
                    {record.date}
                  </Text>
                  <Text style={[styles.recipient, { color: themeColors.textPrimary }, isRTL && styles.rtlText]} numberOfLines={1}>
                    {record.recipient}
                  </Text>
                  <Text style={[styles.paymentAmount, { color: themeColors.primary }, isRTL && styles.rtlText]}>
                    {formatCurrency(record.amount)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>
                {t('noPaymentsYet')}
              </Text>
            )}

            <View style={[styles.rule, { backgroundColor: themeColors.border }]} />

            {/* Total Row */}
            <View style={[styles.totalRow, isRTL && styles.rtlRow]}>
              <Text style={[styles.totalLabel, { color: themeColors.textPrimary }]}>
                {t('totalPaidLabel')}
              </Text>
              <Text style={[styles.totalAmount, { color: themeColors.primary }]}>
                {formatCurrency(total)}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  topBar: {
    height: 60,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topTitle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  topTitleText: { fontSize: 18, fontWeight: '800' },
  content: { padding: 20, paddingBottom: 30 },
  summaryCard: { padding: 20, borderWidth: 1, borderRadius: 16 },
  summaryHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryTitle: { fontSize: 18, fontWeight: '800' },
  summaryYear: { fontSize: 18, fontWeight: '700' },
  rule: { height: 1, marginVertical: 14 },
  tableHeader: { flexDirection: 'row', alignItems: 'center' },
  headerDate: { width: '35%', fontSize: 14, fontWeight: '700' },
  headerRecipient: { width: '35%', fontSize: 14, fontWeight: '700' },
  headerAmount: { flex: 1, fontSize: 14, fontWeight: '700', textAlign: 'right' },
  paymentRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  date: { width: '35%', fontSize: 14 },
  recipient: { width: '35%', fontSize: 14, fontWeight: '600' },
  paymentAmount: { flex: 1, fontSize: 14, fontWeight: '800', textAlign: 'right' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: '800' },
  totalAmount: { fontSize: 18, fontWeight: '900' },
  rtlText: { textAlign: 'right' },
  rtlRow: { flexDirection: 'row-reverse' },
  emptyText: { textAlign: 'center', marginVertical: 16, fontSize: 14 },
});
