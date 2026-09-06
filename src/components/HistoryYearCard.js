import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const formatAmount = (amount) => `$${amount.toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

export default function HistoryYearCard({ year, transactionCount, totalAmount, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${year} history`}
    >
      <View>
        <Text style={styles.year}>Year {year}</Text>
        <Text style={styles.count}>
          {transactionCount} {transactionCount === 1 ? 'Transaction' : 'Transactions'}
        </Text>
      </View>
      <View style={styles.amountArea}>
        <Text style={styles.amount}>{formatAmount(totalAmount)}</Text>
        <Ionicons name="chevron-forward" size={25} color={colors.primary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 142,
    marginHorizontal: 24,
    marginBottom: 22,
    paddingHorizontal: 24,
    paddingVertical: 22,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardPressed: { opacity: 0.75 },
  year: { color: colors.textPrimary, fontSize: 25, lineHeight: 32, fontWeight: '700' },
  count: { color: colors.textSecondary, fontSize: 20, lineHeight: 28, marginTop: 6 },
  amountArea: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  amount: { color: colors.textPrimary, fontSize: 30, fontWeight: '800' },
});
