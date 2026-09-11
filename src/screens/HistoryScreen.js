import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, StatusBar } from 'react-native';
import { Header } from '../components/Header';
import HistoryYearCard from '../components/HistoryYearCard';
import { useLanguage } from '../context/LanguageContext';
import { useZakat } from '../context/ZakatContext';

const getYear = (dateStr) => {
  if (!dateStr) return 'Other';
  const match = dateStr.match(/\d{4}/);
  return match ? match[0] : 'Other';
};

export default function HistoryScreen({ onOpenSettings, onOpenYearDetail, onOpenAllRecords }) {
  const { t, isRTL, themeColors } = useLanguage();
  const { records } = useZakat();

  const yearlySummaries = Object.entries(
    (records || []).reduce((groups, record) => {
      const year = getYear(record.date);
      groups[year] = groups[year] || { year, transactionCount: 0, totalAmount: 0 };
      groups[year].transactionCount += 1;
      groups[year].totalAmount += (Number(record.amount) || 0);
      return groups;
    }, {})
  )
    .map(([, summary]) => summary)
    .sort((first, second) => Number(second.year) - Number(first.year));

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />
      <View style={styles.screen}>
        <Header onOpenSettings={onOpenSettings} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          <Text style={[styles.title, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {t('pastYearsHistory')}
          </Text>

          {yearlySummaries.length > 0 ? (
            yearlySummaries.map((summary) => (
              <HistoryYearCard
                key={summary.year}
                {...summary}
                onPress={() => onOpenYearDetail?.(summary.year)}
              />
            ))
          ) : (
            <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>
              {t('noPaymentsYet')}
            </Text>
          )}

          <Pressable style={styles.recordsLink} onPress={() => onOpenAllRecords?.()}>
            <Text style={[styles.recordsLinkText, { color: themeColors.primary }]}>
              {t('viewAllPayments')}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  listContent: { paddingBottom: 30 },
  title: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '800',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
  },
  rtlText: {
    textAlign: 'right',
  },
  recordsLink: { alignItems: 'center', paddingVertical: 18 },
  recordsLinkText: { fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginVertical: 20,
  },
});
