import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomNavigation } from '../components/BottomNavigation';
import { mockRecords } from '../data/mockRecords';
import { colors } from '../theme/colors';

const getYear = (date) => date.match(/\d{4}/)?.[0] || 'Other';
const formatAmount = (amount) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function HistoryYearDetailScreen({ navigation, route }) {
  const year = String(route?.params?.year || '');
  const records = mockRecords.records.filter((record) => getYear(record.date) === year);
  const total = records.reduce((sum, record) => sum + record.amount, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation?.navigate('History')} accessibilityLabel="Back to history">
            <Ionicons name="arrow-back" size={32} color={colors.primaryDark} />
          </Pressable>
          <View style={styles.topTitle}>
            <View style={styles.logo}><Ionicons name="sparkles-outline" size={14} color={colors.primary} /></View>
            <Text style={styles.topTitleText}>History: {year}</Text>
          </View>
          <Ionicons name="ellipsis-vertical" size={25} color={colors.primaryDark} />
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeading}>
              <Text style={styles.summaryTitle}>Annual Zakat Summary</Text>
              <Text style={styles.summaryYear}>{year}</Text>
            </View>
            <View style={styles.rule} />
            <View style={styles.tableHeader}>
              <Text style={styles.headerDate}>Date</Text>
              <Text style={styles.headerRecipient}>Recipient</Text>
              <Text style={styles.headerAmount}>Amount</Text>
            </View>
            <View style={styles.rule} />
            {records.map((record) => (
              <View style={styles.paymentRow} key={record.id}>
                <Text style={styles.date}>{record.date}</Text>
                <Text style={styles.recipient} numberOfLines={1}>{record.recipient}</Text>
                <Text style={styles.paymentAmount}>{formatAmount(record.amount)}</Text>
              </View>
            ))}
            <View style={styles.rule} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalAmount}>{formatAmount(total)}</Text>
            </View>
          </View>
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
  topBar: { height: 74, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topTitle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 38, height: 38, backgroundColor: colors.cardBg, alignItems: 'center', justifyContent: 'center' },
  topTitleText: { color: colors.primaryDark, fontSize: 24, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 28 },
  summaryCard: { padding: 28, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.cardBg },
  summaryHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryTitle: { color: colors.textPrimary, fontSize: 24 },
  summaryYear: { color: colors.textSecondary, fontSize: 24 },
  rule: { height: 1, backgroundColor: colors.border, marginVertical: 18 },
  tableHeader: { flexDirection: 'row', alignItems: 'center' },
  headerDate: { width: '40%', color: colors.textSecondary, fontSize: 18 },
  headerRecipient: { width: '34%', color: colors.textSecondary, fontSize: 18 },
  headerAmount: { flex: 1, color: colors.textSecondary, fontSize: 18, textAlign: 'right' },
  paymentRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center' },
  date: { width: '40%', color: colors.textPrimary, fontSize: 18 },
  recipient: { width: '34%', color: colors.textPrimary, fontSize: 18 },
  paymentAmount: { flex: 1, color: colors.primaryDark, fontSize: 20, fontWeight: '800', textAlign: 'right' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: colors.textPrimary, fontSize: 21, fontWeight: '800' },
  totalAmount: { color: colors.primaryDark, fontSize: 24, fontWeight: '800' },
  recordsLink: { alignItems: 'center', paddingVertical: 18 },
  recordsLinkText: { color: colors.primary, fontSize: 14, fontWeight: '800', letterSpacing: 1 },
});
