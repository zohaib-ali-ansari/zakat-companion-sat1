import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomNavigation } from '../components/BottomNavigation';
import { Header } from '../components/Header';
import HistoryYearCard from '../components/HistoryYearCard';
import { mockRecords } from '../data/mockRecords';
import { colors } from '../theme/colors';

const getYear = (date) => date.match(/\d{4}/)?.[0] || 'Other';

const yearlySummaries = Object.entries(
  mockRecords.records.reduce((groups, record) => {
    const year = getYear(record.date);
    groups[year] = groups[year] || { year, transactionCount: 0, totalAmount: 0 };
    groups[year].transactionCount += 1;
    groups[year].totalAmount += record.amount;
    return groups;
  }, {}),
)
  .map(([, summary]) => summary)
  .sort((first, second) => Number(second.year) - Number(first.year));

export default function HistoryScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <Header />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          <Text style={styles.title}>Past Years{`\n`}History</Text>
          {yearlySummaries.map((summary) => (
            <HistoryYearCard
              key={summary.year}
              {...summary}
              onPress={() => navigation?.navigate('HistoryYearDetail', { year: summary.year })}
            />
          ))}
          <Pressable style={styles.recordsLink} onPress={() => navigation?.navigate('HistoryRecords')}>
            <Text style={styles.recordsLinkText}>VIEW ALL PAYMENTS</Text>
          </Pressable>
        </ScrollView>
        <BottomNavigation
          activeTab="history"
          onSelectTab={(tab) => navigation?.navigate(tab === 'history' ? 'History' : 'Track')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingBottom: 18 },
  title: {
    color: colors.textPrimary,
    fontSize: 52,
    lineHeight: 62,
    fontWeight: '800',
    paddingHorizontal: 24,
    paddingTop: 42,
    paddingBottom: 58,
  },
  recordsLink: { alignItems: 'center', paddingVertical: 16 },
  recordsLinkText: { color: colors.primary, fontSize: 14, fontWeight: '800', letterSpacing: 1 },
});
