import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Header } from '../components/Header';
import { mockRecords } from '../data/mockRecords';
import { colors } from '../theme/colors';

const formatAmount = (amount) => `$${amount.toLocaleString('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})}`;

export default function TrackingScreen({ onOpenSettings, onAddPayment }) {
  const { hijriYear, totalDue, totalPaid, remaining, nisabDate, percentPaid } = mockRecords;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <Header onOpenSettings={onOpenSettings} />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Track</Text>
            <Text style={styles.subtitle}>Overview of your Zakat obligations for {hijriYear}.</Text>
          </View>

          <View style={styles.remainingVisual}>
            <View style={[styles.orbit, styles.orbitLarge]} />
            <View style={[styles.orbit, styles.orbitSmall]} />
            <View style={styles.remainingBadge}>
              <Text style={styles.remainingLabel}>REMAINING</Text>
              <Text style={styles.remainingAmount}>{formatAmount(remaining)}</Text>
            </View>
          </View>

          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Due</Text>
              <Text style={styles.totalDueValue}>{formatAmount(totalDue)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalPaidValue}>{formatAmount(totalPaid)}</Text>
            </View>
          </View>

          <View style={styles.progressRow}>
            <View style={styles.progressBadge}>
              <Text style={styles.progressPercent}>{percentPaid}%</Text>
              <Text style={styles.progressLabel}>PAID</Text>
            </View>
            <Text style={styles.nisabText}>Nisab Reached on {nisabDate}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.paymentButton, pressed && styles.paymentButtonPressed]}
            onPress={() => onAddPayment?.()}
            accessibilityRole="button"
            accessibilityLabel="Add payment"
          >
            <Text style={styles.paymentButtonText}>ADD PAYMENT</Text>
          </Pressable>
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 24 },
  titleBlock: { paddingHorizontal: 24, paddingTop: 38 },
  title: { color: colors.textPrimary, fontSize: 54, lineHeight: 62, fontWeight: '800' },
  subtitle: { color: colors.textSecondary, fontSize: 24, lineHeight: 34, marginTop: 10 },
  remainingVisual: {
    height: 286,
    marginHorizontal: 46,
    marginTop: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orbit: { position: 'absolute', borderWidth: 1, borderColor: colors.primaryBorder },
  orbitLarge: { width: 190, height: 190, transform: [{ rotate: '45deg' }] },
  orbitSmall: {
    width: 140,
    height: 140,
    borderColor: colors.primary,
    transform: [{ rotate: '45deg' }, { scale: 1.15 }],
  },
  remainingBadge: {
    width: 190,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 5,
  },
  remainingLabel: { color: colors.textSecondary, fontSize: 16, fontWeight: '800', letterSpacing: 1.5 },
  remainingAmount: { color: colors.primaryDark, fontSize: 39, lineHeight: 47, fontWeight: '800' },
  totals: { paddingHorizontal: 24, gap: 30, marginTop: 12 },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { color: colors.textPrimary, fontSize: 23 },
  totalDueValue: { color: colors.textPrimary, fontSize: 34, fontWeight: '800' },
  totalPaidValue: { color: colors.textSecondary, fontSize: 25 },
  progressRow: {
    minHeight: 58,
    marginHorizontal: 24,
    marginTop: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  progressBadge: {
    width: 98,
    minHeight: 42,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercent: { color: colors.primary, fontSize: 16 },
  progressLabel: { color: colors.primary, fontSize: 12, lineHeight: 14 },
  nisabText: { flex: 1, color: colors.textSecondary, fontSize: 18, lineHeight: 25 },
  paymentButton: {
    marginHorizontal: 24,
    marginTop: 20,
    minHeight: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark,
  },
  paymentButtonPressed: { backgroundColor: colors.primary },
  paymentButtonText: { color: colors.textWhite, fontSize: 16, fontWeight: '800', letterSpacing: 1.2 },
});
