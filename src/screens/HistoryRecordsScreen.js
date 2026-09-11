import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, SectionList, StyleSheet, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useZakat } from '../context/ZakatContext';

const getYear = (dateStr) => {
  if (!dateStr) return 'Other';
  const match = dateStr.match(/\d{4}/);
  return match ? match[0] : 'Other';
};

const formatCurrency = (amount) => `PKR ${Number(amount || 0).toLocaleString('en-US')}`;

export default function HistoryRecordsScreen({ onBack, onOpenSettings }) {
  const { t, isRTL, isDarkMode, toggleDarkMode, themeColors } = useLanguage();
  const { records } = useZakat();

  const sections = Object.entries(
    (records || []).reduce((groups, record) => {
      const year = getYear(record.date);
      groups[year] = groups[year] || [];
      groups[year].push(record);
      return groups;
    }, {})
  )
    .map(([title, data]) => ({ title, data }))
    .sort((first, second) => Number(second.title) - Number(first.title));

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />
      <View style={styles.screen}>
        {/* Top Bar */}
        <View style={[styles.topBar, { borderBottomColor: themeColors.border }, isRTL && styles.rtlRow]}>
          <TouchableOpacity onPress={() => onBack?.()} style={styles.iconButton}>
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={themeColors.primary} />
          </TouchableOpacity>
          <Text style={[styles.topTitle, { color: themeColors.textPrimary }]}>{t('allPaymentsTitle')}</Text>
          <TouchableOpacity onPress={toggleDarkMode} style={styles.iconButton}>
            <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={22} color={isDarkMode ? '#F59E0B' : themeColors.primary} />
          </TouchableOpacity>
        </View>

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <Text style={[styles.title, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
              {t('pastYearsHistory')}
            </Text>
          }
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeader, isRTL && styles.rtlRow]}>
              <View style={[styles.line, { backgroundColor: themeColors.border }]} />
              <Text style={[styles.year, { color: themeColors.textMuted }]}>{section.title}</Text>
              <View style={[styles.line, { backgroundColor: themeColors.border }]} />
            </View>
          )}
          renderItem={({ item }) => (
            <View style={[styles.row, { borderBottomColor: themeColors.border }, isRTL && styles.rtlRow]}>
              <View style={styles.details}>
                <Text style={[styles.recipient, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
                  {item.recipient}
                </Text>
                <Text style={[styles.date, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
                  {item.date} {item.notes ? `• ${item.notes}` : ''}
                </Text>
              </View>
              <Text style={[styles.amount, { color: themeColors.primary }]}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  content: { paddingBottom: 30 },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  rtlText: { textAlign: 'right' },
  rtlRow: { flexDirection: 'row-reverse' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    marginVertical: 16,
  },
  line: { flex: 1, height: 1 },
  year: { fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  row: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  details: { flex: 1 },
  recipient: { fontSize: 16, fontWeight: '700' },
  date: { fontSize: 13, marginTop: 4 },
  amount: { fontSize: 18, fontWeight: '800' },
});
