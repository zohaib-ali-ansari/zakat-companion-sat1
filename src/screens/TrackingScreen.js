import React from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { useLanguage } from '../context/LanguageContext';
import { useZakat } from '../context/ZakatContext';

const formatCurrency = (amount) => `PKR ${Number(amount || 0).toLocaleString('en-US')}`;

export default function TrackingScreen({ onOpenSettings, onAddPayment }) {
  const { t, isRTL, themeColors } = useLanguage();
  const { hijriYear, totalDue, totalPaid, remaining, nisabDate, percentPaid, records, deletePayment } = useZakat();

  const handleDelete = (id) => {
    Alert.alert(
      t('appTitle'),
      t('confirmDeletePayment'),
      [
        { text: t('cancelBtn'), style: 'cancel' },
        {
          text: t('deletePayment'),
          style: 'destructive',
          onPress: () => deletePayment(id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />
      <View style={styles.screen}>
        <Header onOpenSettings={onOpenSettings} />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title Block */}
          <View style={[styles.titleBlock, isRTL && styles.rtlAlign]}>
            <Text style={[styles.title, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
              {t('trackTitle')}
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
              {t('trackSub')} ({hijriYear})
            </Text>
          </View>

          {/* Remaining Visual Circle */}
          <View style={styles.remainingVisual}>
            <View style={[styles.orbit, styles.orbitLarge, { borderColor: themeColors.primaryBorder }]} />
            <View style={[styles.orbit, styles.orbitSmall, { borderColor: themeColors.primary }]} />
            <View style={[styles.remainingBadge, { backgroundColor: themeColors.cardBg, shadowColor: themeColors.primary }]}>
              <Text style={[styles.remainingLabel, { color: themeColors.textSecondary }]}>
                {t('remainingZakatLabel').toUpperCase()}
              </Text>
              <Text style={[styles.remainingAmount, { color: themeColors.primary }]}>
                {formatCurrency(remaining)}
              </Text>
            </View>
          </View>

          {/* Totals Section */}
          <View style={styles.totals}>
            <View style={[styles.totalRow, isRTL && styles.rtlRow]}>
              <Text style={[styles.totalLabel, { color: themeColors.textPrimary }]}>{t('totalDueLabel')}</Text>
              <Text style={[styles.totalDueValue, { color: themeColors.textPrimary }]}>{formatCurrency(totalDue)}</Text>
            </View>
            <View style={[styles.totalRow, isRTL && styles.rtlRow]}>
              <Text style={[styles.totalLabel, { color: themeColors.textPrimary }]}>{t('totalPaidLabel')}</Text>
              <Text style={[styles.totalPaidValue, { color: themeColors.textSecondary }]}>{formatCurrency(totalPaid)}</Text>
            </View>
          </View>

          {/* Progress Row */}
          <View style={[styles.progressRow, isRTL && styles.rtlRow]}>
            <View style={[styles.progressBadge, { borderColor: themeColors.primary, backgroundColor: themeColors.primaryLight }]}>
              <Text style={[styles.progressPercent, { color: themeColors.primary }]}>{percentPaid}%</Text>
              <Text style={[styles.progressLabel, { color: themeColors.primary }]}>{t('paidBadge')}</Text>
            </View>
            <Text style={[styles.nisabText, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
              {t('nisabReachedOn')} {nisabDate}
            </Text>
          </View>

          {/* ADD PAYMENT CTA Button */}
          <Pressable
            style={({ pressed }) => [
              styles.paymentButton,
              { backgroundColor: themeColors.primary },
              pressed && styles.paymentButtonPressed,
            ]}
            onPress={() => onAddPayment?.()}
            accessibilityRole="button"
            accessibilityLabel={t('addPaymentBtn')}
          >
            <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.paymentButtonText}>{t('addPaymentBtn')}</Text>
          </Pressable>

          {/* Recent Payments Section */}
          <View style={styles.historySection}>
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
              {t('recentPaymentsTitle')}
            </Text>

            {records && records.length > 0 ? (
              records.map((item) => (
                <View
                  key={item.id}
                  style={[styles.paymentCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }, isRTL && styles.rtlRow]}
                >
                  <View style={[styles.paymentIconBox, { backgroundColor: themeColors.primaryLight }]}>
                    <Ionicons name="cash-outline" size={22} color={themeColors.primary} />
                  </View>
                  <View style={styles.paymentDetails}>
                    <Text style={[styles.recipientText, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
                      {item.recipient}
                    </Text>
                    <Text style={[styles.dateText, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
                      {item.date} {item.notes ? `• ${item.notes}` : ''}
                    </Text>
                  </View>

                  <Text style={[styles.amountText, { color: themeColors.primary }]}>
                    {formatCurrency(item.amount)}
                  </Text>

                  {/* Edit and Delete Actions */}
                  <View style={[styles.cardActions, isRTL && styles.rtlRow]}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: themeColors.primaryLight }]}
                      onPress={() => onAddPayment?.(item)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="pencil" size={16} color={themeColors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: themeColors.cardBgAlt }]}
                      onPress={() => handleDelete(item.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={16} color={themeColors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>
                {t('noPaymentsYet')}
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  content: { paddingBottom: 40 },
  titleBlock: { paddingHorizontal: 24, paddingTop: 16 },
  title: { fontSize: 36, lineHeight: 44, fontWeight: '800' },
  subtitle: { fontSize: 16, lineHeight: 22, marginTop: 6 },
  rtlAlign: { alignItems: 'flex-end' },
  rtlText: { textAlign: 'right' },
  rtlRow: { flexDirection: 'row-reverse' },
  remainingVisual: {
    height: 240,
    marginHorizontal: 30,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orbit: { position: 'absolute', borderWidth: 1 },
  orbitLarge: { width: 190, height: 190, borderRadius: 95, transform: [{ rotate: '45deg' }] },
  orbitSmall: {
    width: 140,
    height: 140,
    borderRadius: 70,
    transform: [{ rotate: '45deg' }, { scale: 1.15 }],
  },
  remainingBadge: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    minWidth: 200,
  },
  remainingLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2, marginBottom: 4 },
  remainingAmount: { fontSize: 28, fontWeight: '900' },
  totals: { paddingHorizontal: 24, gap: 14, marginTop: 10 },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { fontSize: 16, fontWeight: '600' },
  totalDueValue: { fontSize: 20, fontWeight: '800' },
  totalPaidValue: { fontSize: 18, fontWeight: '700' },
  progressRow: {
    marginHorizontal: 24,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  progressBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercent: { fontSize: 16, fontWeight: '800' },
  progressLabel: { fontSize: 10, fontWeight: '700' },
  nisabText: { flex: 1, fontSize: 13, fontWeight: '500' },
  paymentButton: {
    marginHorizontal: 24,
    marginTop: 24,
    minHeight: 54,
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A4FD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  paymentButtonPressed: { opacity: 0.85 },
  paymentButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  historySection: {
    marginHorizontal: 24,
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  paymentIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentDetails: {
    flex: 1,
  },
  recipientText: {
    fontSize: 15,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 12,
    marginTop: 2,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 4,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
