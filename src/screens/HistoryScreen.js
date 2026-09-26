import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, StatusBar } from 'react-native';
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
            {t('historyTitle')}
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            {t('historySubtitle')}
          </Text>

          {completedCycles && completedCycles.length > 0 ? (
            completedCycles.map((cycle) => (
              <HistoryYearCard
                key={cycle.id || cycle._id || `cycle-${cycle.year}`}
                year={cycle.zakatPeriod || `${t('zakatPeriodLabel')} ${cycle.year}`}
                transactionCount={cycle.payments ? cycle.payments.length : 0}
                totalAmount={cycle.totalPaid || cycle.trackingTotal}
                onPress={() => onOpenYearDetail?.(cycle.year, cycle)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: themeColors.textMuted }, isRTL && styles.rtlText]}>
                {t('noCompletedCycles')}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  listContent: { paddingBottom: 60, paddingHorizontal: 4 },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 14,
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 20,
  },
  rtlText: { textAlign: 'right' },
  emptyContainer: { paddingHorizontal: 24, marginVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center' },
});

