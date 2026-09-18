import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, StatusBar } from 'react-native';
import { Header } from '../components/Header';
import HistoryYearCard from '../components/HistoryYearCard';
import { useLanguage } from '../context/LanguageContext';
import { useZakat } from '../context/ZakatContext';

export default function HistoryScreen({ onOpenSettings, onOpenYearDetail, onOpenAllRecords }) {
  const { t, isRTL, themeColors } = useLanguage();
  const { completedCycles } = useZakat();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />
      <View style={styles.screen}>
        <Header onOpenSettings={onOpenSettings} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          <Text style={[styles.title, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            Zakat History
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            Completed Zakat Cycles & Records
          </Text>

          {completedCycles && completedCycles.length > 0 ? (
            completedCycles.map((cycle) => (
              <HistoryYearCard
                key={cycle.id}
                year={cycle.zakatPeriod || `Zakat Period ${cycle.year}`}
                transactionCount={cycle.payments ? cycle.payments.length : 0}
                totalAmount={cycle.totalPaid || cycle.trackingTotal}
                onPress={() => onOpenYearDetail?.(cycle.year, cycle)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>
                No completed Zakat periods archived yet.
              </Text>
            </View>
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
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 14,
    paddingHorizontal: 24,
    marginTop: 4,
    marginBottom: 20,
  },
  rtlText: { textAlign: 'right' },
  recordsLink: { alignItems: 'center', paddingVertical: 18 },
  recordsLinkText: { fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  emptyContainer: { paddingHorizontal: 24, marginVertical: 30, alignItems: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center' },
});
