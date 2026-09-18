import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { useLanguage } from '../context/LanguageContext';
import { useZakat } from '../context/ZakatContext';

const formatCurrency = (amount) => `PKR ${Number(amount || 0).toLocaleString('en-US')}`;

export default function TrackingScreen({ onOpenSettings, onAddPayment, onNavigateHistory }) {
  const { t, isRTL, themeColors } = useLanguage();
  const {
    hijriYear,
    totalDue,
    originalCalculatedAmount,
    totalPaid,
    remaining,
    nisabDate,
    percentPaid,
    records,
    deletePayment,
    updateTrackingTotal,
    completeAndArchiveCycle,
    isCompleted,
  } = useZakat();

  // Edit Total Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newTotalInput, setNewTotalInput] = useState('');

  const handleOpenEditModal = () => {
    setNewTotalInput(String(totalDue || ''));
    setEditModalVisible(true);
  };

  const handleSaveNewTotal = () => {
    const val = parseFloat(newTotalInput);
    if (!val || val <= 0) {
      Alert.alert(t('appTitle'), 'Please enter a valid positive amount.');
      return;
    }
    updateTrackingTotal(val);
    setEditModalVisible(false);
  };

  const handleCompleteAndArchive = () => {
    Alert.alert(
      'Zakat Completed! 🎉',
      'Would you like to save this complete cycle into your Zakat History?',
      [
        { text: t('cancelBtn'), style: 'cancel' },
        {
          text: 'Archive to History',
          onPress: () => {
            completeAndArchiveCycle();
            if (onNavigateHistory) {
              onNavigateHistory();
            }
          },
        },
      ]
    );
  };

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
              Zakat Period {hijriYear}
            </Text>
          </View>

          {/* Completion Banner when remaining === 0 */}
          {isCompleted && (
            <View style={[styles.completionBanner, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}>
              <View style={styles.completionHeader}>
                <Ionicons name="checkmark-circle" size={28} color="#166534" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.completionTitle}>Alhamdulillah! Zakat Fully Paid</Text>
                  <Text style={styles.completionSub}>You have fulfilled your total Zakat obligation for this period.</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.archiveBtn, { backgroundColor: '#166534' }]}
                onPress={handleCompleteAndArchive}
                activeOpacity={0.85}
              >
                <Ionicons name="archive-outline" size={18} color="#FFFFFF" />
                <Text style={styles.archiveBtnText}>Complete & Save to History</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Remaining Visual Circle */}
          <View style={styles.remainingVisual}>
            <View style={[styles.orbit, styles.orbitLarge, { borderColor: themeColors.primaryBorder }]} />
            <View style={[styles.orbit, styles.orbitSmall, { borderColor: themeColors.primary }]} />
            <View style={[styles.remainingBadge, { backgroundColor: themeColors.cardBg, shadowColor: themeColors.primary }]}>
              <Text style={[styles.remainingLabel, { color: themeColors.textSecondary }]}>
                {t('remainingZakatLabel').toUpperCase()}
              </Text>
              <Text style={[styles.remainingAmount, { color: isCompleted ? themeColors.success : themeColors.primary }]}>
                {formatCurrency(remaining)}
              </Text>
            </View>
          </View>

          {/* Totals Section with Edit Target Option */}
          <View style={[styles.totalsCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            {/* Original vs Current tracking row */}
            {originalCalculatedAmount > 0 && originalCalculatedAmount !== totalDue && (
              <View style={[styles.totalRow, isRTL && styles.rtlRow, { marginBottom: 6 }]}>
                <Text style={[styles.smallLabel, { color: themeColors.textMuted }]}>Original Calculated Amount:</Text>
                <Text style={[styles.smallVal, { color: themeColors.textMuted }]}>{formatCurrency(originalCalculatedAmount)}</Text>
              </View>
            )}

            <View style={[styles.totalRow, isRTL && styles.rtlRow]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.totalLabel, { color: themeColors.textPrimary }]}>Current Tracking Target:</Text>
                <TouchableOpacity onPress={handleOpenEditModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="pencil" size={16} color={themeColors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.totalDueValue, { color: themeColors.textPrimary }]}>{formatCurrency(totalDue)}</Text>
            </View>

            <View style={[styles.totalRow, isRTL && styles.rtlRow, { marginTop: 8 }]}>
              <Text style={[styles.totalLabel, { color: themeColors.textPrimary }]}>{t('totalPaidLabel')}:</Text>
              <Text style={[styles.totalPaidValue, { color: themeColors.success }]}>{formatCurrency(totalPaid)}</Text>
            </View>
          </View>

          {/* Progress Bar */}
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
                  style={[styles.paymentCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
                >
                  <View style={[styles.paymentIconBox, { backgroundColor: themeColors.primaryLight }]}>
                    <Ionicons name="cash-outline" size={22} color={themeColors.primary} />
                  </View>

                  <View style={styles.paymentDetails}>
                    <Text style={[styles.recipientText, { color: themeColors.textPrimary }, isRTL && styles.rtlText]} numberOfLines={2}>
                      {item.recipient}
                    </Text>
                    <Text style={[styles.dateText, { color: themeColors.textSecondary }, isRTL && styles.rtlText]} numberOfLines={1}>
                      {item.date}{item.notes ? ` · ${item.notes}` : ''}
                    </Text>
                  </View>

                  <View style={styles.cardRight}>
                    <Text style={[styles.amountText, { color: themeColors.primary }]} numberOfLines={1}>
                      {formatCurrency(item.amount)}
                    </Text>
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: themeColors.primaryLight }]}
                        onPress={() => onAddPayment?.(item)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="pencil" size={14} color={themeColors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}
                        onPress={() => handleDelete(item.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={14} color={themeColors.danger} />
                      </TouchableOpacity>
                    </View>
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

      {/* Edit Target Obligation Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: themeColors.cardBg }]}>
            <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>Edit Tracking Total</Text>
            <Text style={[styles.modalSub, { color: themeColors.textSecondary }]}>
              Enter your desired Zakat tracking target (Original calculated: {formatCurrency(originalCalculatedAmount)}).
            </Text>

            <TextInput
              style={[styles.modalInput, { color: themeColors.textPrimary, borderColor: themeColors.border, backgroundColor: themeColors.background }]}
              keyboardType="numeric"
              value={newTotalInput}
              onChangeText={setNewTotalInput}
              placeholder="e.g. 500000"
              placeholderTextColor={themeColors.textMuted}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: themeColors.cardBgAlt }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: themeColors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: themeColors.primary }]}
                onPress={handleSaveNewTotal}
              >
                <Text style={[styles.modalBtnText, { color: '#FFFFFF' }]}>Save Target</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  content: { paddingBottom: 40 },
  titleBlock: { paddingHorizontal: 24, paddingTop: 16 },
  title: { fontSize: 32, lineHeight: 40, fontWeight: '800' },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: 4 },
  rtlAlign: { alignItems: 'flex-end' },
  rtlText: { textAlign: 'right' },
  rtlRow: { flexDirection: 'row-reverse' },
  completionBanner: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  completionHeader: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  completionTitle: { fontSize: 16, fontWeight: '800', color: '#166534' },
  completionSub: { fontSize: 12, color: '#15803D', marginTop: 2 },
  archiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  archiveBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  remainingVisual: {
    height: 220,
    marginHorizontal: 30,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orbit: { position: 'absolute', borderWidth: 1 },
  orbitLarge: { width: 180, height: 180, borderRadius: 90, transform: [{ rotate: '45deg' }] },
  orbitSmall: { width: 130, height: 130, borderRadius: 65, transform: [{ rotate: '45deg' }, { scale: 1.15 }] },
  remainingBadge: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    minWidth: 190,
  },
  remainingLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 4 },
  remainingAmount: { fontSize: 26, fontWeight: '900' },
  totalsCard: {
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  smallLabel: { fontSize: 12 },
  smallVal: { fontSize: 12, fontWeight: '600' },
  totalLabel: { fontSize: 15, fontWeight: '600' },
  totalDueValue: { fontSize: 18, fontWeight: '800' },
  totalPaidValue: { fontSize: 18, fontWeight: '800' },
  progressRow: {
    marginHorizontal: 24,
    marginTop: 16,
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
    marginTop: 20,
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
  paymentButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  historySection: { marginHorizontal: 24, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  paymentIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  paymentDetails: { flex: 1 },
  recipientText: { fontSize: 14, fontWeight: '700' },
  dateText: { fontSize: 12, marginTop: 2 },
  amountText: { fontSize: 15, fontWeight: '800' },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 10 },
  cardRight: { alignItems: 'flex-end', justifyContent: 'center', gap: 6, minWidth: 90 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalBox: { borderRadius: 20, padding: 20, gap: 14 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  modalSub: { fontSize: 13, lineHeight: 18 },
  modalInput: { height: 48, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 14, fontSize: 16, fontWeight: '700' },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 6 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12 },
  modalBtnText: { fontSize: 14, fontWeight: '700' },
});
