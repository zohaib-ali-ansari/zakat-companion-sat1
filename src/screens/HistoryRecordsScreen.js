import React from 'react';
import { SafeAreaView, SectionList, StyleSheet, Text, View } from 'react-native';
import { BottomNavigation } from '../components/BottomNavigation';
import { Header } from '../components/Header';
import { mockRecords } from '../data/mockRecords';
import { colors } from '../theme/colors';

const getYear = (date) => date.match(/\d{4}/)?.[0] || 'Other';
const formatAmount = (amount) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const sections = Object.entries(mockRecords.records.reduce((groups, record) => {
  const year = getYear(record.date);
  groups[year] = groups[year] || [];
  groups[year].push(record);
  return groups;
}, {}))
  .map(([title, data]) => ({ title, data }))
  .sort((first, second) => Number(second.title) - Number(first.title));

export default function HistoryRecordsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <Header />
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          ListHeaderComponent={<Text style={styles.title}>Past Years{`\n`}History</Text>}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <View style={styles.line} />
              <Text style={styles.year}>{section.title}</Text>
              <View style={styles.line} />
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.details}>
                <Text style={styles.recipient}>{item.recipient}</Text>
                <Text style={styles.date}>{item.date.toUpperCase()}</Text>
              </View>
              <Text style={styles.amount}>{formatAmount(item.amount)}</Text>
            </View>
          )}
        />
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
  content: { paddingBottom: 18 },
  title: { color: colors.textPrimary, fontSize: 52, lineHeight: 62, fontWeight: '800', paddingHorizontal: 24, paddingTop: 42, paddingBottom: 58 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 24, paddingHorizontal: 24, marginBottom: 38 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  year: { color: colors.textMuted, fontSize: 18, fontWeight: '700', letterSpacing: 1 },
  row: { minHeight: 120, paddingHorizontal: 24, paddingVertical: 22, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  details: { flex: 1 },
  recipient: { color: colors.textPrimary, fontSize: 23, lineHeight: 29, fontWeight: '700' },
  date: { color: colors.textSecondary, fontSize: 15, lineHeight: 22, marginTop: 5, fontWeight: '700', letterSpacing: 1 },
  amount: { color: colors.textPrimary, fontSize: 32, fontWeight: '800' },
});
