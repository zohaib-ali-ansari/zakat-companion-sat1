import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

const formatAmount = (amount) => `PKR ${Number(amount || 0).toLocaleString('en-US')}`;

export default function HistoryYearCard({ year, transactionCount, totalAmount, onPress }) {
  const { t, isRTL, themeColors } = useLanguage();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: themeColors.cardBg,
          borderColor: themeColors.border,
        },
        isRTL && styles.rtlRow,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${year} history`}
    >
      <View style={isRTL ? styles.rtlAlign : null}>
        <Text style={[styles.year, { color: themeColors.textPrimary }]}>{year}</Text>
        <Text style={[styles.count, { color: themeColors.textSecondary }]}>
          {transactionCount}{' '}
          {transactionCount === 1 ? t('transactionSingle') : t('transactionPlural')}
        </Text>
      </View>
      <View style={[styles.amountArea, isRTL && styles.rtlRow]}>
        <Text style={[styles.amount, { color: themeColors.primary }]}>{formatAmount(totalAmount)}</Text>
        <Ionicons
          name={isRTL ? 'chevron-back' : 'chevron-forward'}
          size={22}
          color={themeColors.primary}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 100,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardPressed: { opacity: 0.75 },
  rtlRow: { flexDirection: 'row-reverse' },
  rtlAlign: { alignItems: 'flex-end' },
  year: { fontSize: 20, fontWeight: '700' },
  count: { fontSize: 14, marginTop: 4 },
  amountArea: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  amount: { fontSize: 20, fontWeight: '800' },
});

