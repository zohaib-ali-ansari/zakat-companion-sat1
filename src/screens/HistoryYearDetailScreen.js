import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { useZakat } from '../context/ZakatContext';
import { ReportExportModal } from '../components/ReportExportModal';
import { CustomAlertModal } from '../components/CustomAlertModal';

const formatCurrency = (amount) => `PKR ${Number(amount || 0).toLocaleString('en-US')}`;

export default function HistoryYearDetailScreen({ year: yearProp, cycle: cycleProp, onBack, onNavigateEditPayment }) {
  const { t, isRTL, themeColors } = useLanguage();
  const { completedCycles, deleteCompletedCycle, deleteYearHistory } = useZakat();
  const insets = useSafeAreaInsets();

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'OK',
    cancelText: null,
    onConfirm: null,
    onCancel: null,
  });

  const showAlert = ({
    title,
    message,
    type = 'warning',
    confirmText = 'OK',
    cancelText = null,
    onConfirm = null,
    onCancel = null,
  }) => {
    setCustomAlert({
      visible: true,
      title,
      message,
      type,
      confirmText,
      cancelText,
      onConfirm: () => {
        setCustomAlert((prev) => ({ ...prev, visible: false }));
        onConfirm?.();
      },
      onCancel: () => {
        setCustomAlert((prev) => ({ ...prev, visible: false }));
        onCancel?.();
      },
    });
  };

  const year = String(yearProp || '2024');

  // Find archived cycle from context or fallback
  const cycle = cycleProp || (completedCycles || []).find((c) => c.year === year) || {
    id: 'cycle-default',
    zakatPeriod: `Zakat Period ${year}`,
    year,
    originalCalculatedAmount: 60000,
    trackingTotal: 60000,
    totalPaid: 60000,
    completedAt: '2024-03-15',
    nisabThreshold: 270000,
    isNisabMet: true,
    totalEligibleAssets: 2500000,
    deductibleDebts: 100000,
    netZakatableWealth: 2400000,
    assetBreakdown: {
      goldSilver: 1250000,
      cashInBank: 800000,
      investments: 450000,
    },
    payments: [
      { id: 'p-1', amount: 60000, date: '2024-03-15', recipient: 'Alkhidmat Foundation', notes: 'Ramadan Zakat' },
    ],
  };

  const payments = cycle.payments || [];
  const total = payments.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const handleDeleteYear = () => {
    showAlert({
      title: t('appTitle') || 'Zakat Companion',
      message: t('confirmDeleteArchiveMsg') || 'Delete this Zakat Period archive from your history?',
      type: 'warning',
      confirmText: t('deleteArchiveBtn') || 'Delete Archive',
      cancelText: t('cancelBtn') || 'Cancel',
      onConfirm: async () => {
        const targetId = cycle.id || cycle._id || year;
        if (deleteCompletedCycle) deleteCompletedCycle(targetId);
        if (deleteYearHistory) await deleteYearHistory(targetId);
        onBack?.();
      },
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />
      <View style={styles.screen}>
        {/* Top Bar */}
        <View style={[styles.topBar, { borderBottomColor: themeColors.border, paddingTop: 10, paddingBottom: 10 }, isRTL && styles.rtlRow]}>
          <Pressable onPress={() => onBack?.()} accessibilityLabel="Back to history">
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={themeColors.primary} />
          </Pressable>
          <View style={[styles.topTitle, isRTL && styles.rtlRow]}>
            <View style={[styles.logo, { backgroundColor: themeColors.primaryLight }]}>
              <Ionicons name="sparkles-outline" size={14} color={themeColors.primary} />
            </View>
            <Text style={[styles.topTitleText, { color: themeColors.textPrimary }]}>
              {cycle.zakatPeriod || `${t('zakatPeriodLabel')} ${year}`}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setReportModalVisible(true)} activeOpacity={0.7}>
            <Ionicons name="document-text-outline" size={22} color={themeColors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Summary Overview Card */}
          <View style={[styles.summaryCard, { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder }]}>
            <Text style={[styles.summarySub, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
              {t('completedZakatObligation')}
            </Text>
            <Text style={[styles.summaryTotal, { color: themeColors.primary }]}>
              {formatCurrency(cycle.totalPaid || total)}
            </Text>
            <Text style={[styles.summaryDate, { color: themeColors.textMuted }, isRTL && styles.rtlText]}>
              {t('completedOnLabel')} {cycle.completedAt || t('archivedStatus')}
            </Text>
          </View>

          {/* Historical Snapshot Breakdown */}
          <View style={[styles.snapshotCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <View style={[styles.snapshotHeader, isRTL && styles.rtlRow]}>
              <Ionicons name="pie-chart-outline" size={18} color={themeColors.primary} />
              <Text style={[styles.snapshotTitle, { color: themeColors.textPrimary }]}>
                {t('calculationSnapshotTitle')}
              </Text>
            </View>

            <View style={[styles.rule, { backgroundColor: themeColors.border }]} />

            {cycle.originalCalculatedAmount ? (
              <View style={[styles.row, isRTL && styles.rtlRow]}>
                <Text style={[styles.rowLabel, { color: themeColors.textSecondary }]}>{t('originalCalculatedZakat')}</Text>
                <Text style={[styles.rowVal, { color: themeColors.textPrimary }]}>{formatCurrency(cycle.originalCalculatedAmount)}</Text>
              </View>
            ) : null}

            {cycle.totalEligibleAssets ? (
              <View style={[styles.row, isRTL && styles.rtlRow]}>
                <Text style={[styles.rowLabel, { color: themeColors.textSecondary }]}>{t('totalGrossAssets')}</Text>
                <Text style={[styles.rowVal, { color: themeColors.textPrimary }]}>{formatCurrency(cycle.totalEligibleAssets)}</Text>
              </View>
            ) : null}

            {cycle.netZakatableWealth ? (
              <View style={[styles.row, isRTL && styles.rtlRow]}>
                <Text style={[styles.rowLabel, { color: themeColors.textSecondary }]}>{t('netZakatableWealthLabel')}</Text>
                <Text style={[styles.rowVal, { color: themeColors.textPrimary }]}>{formatCurrency(cycle.netZakatableWealth)}</Text>
              </View>
            ) : null}

            <View style={[styles.row, isRTL && styles.rtlRow]}>
              <Text style={[styles.rowLabel, { color: themeColors.primary, fontWeight: '700' }]}>{t('totalZakatPaid')}</Text>
              <Text style={[styles.rowVal, { color: themeColors.primary, fontWeight: '800' }]}>{formatCurrency(total)}</Text>
            </View>
          </View>

          {/* Payment Transactions Table Card */}
          <View style={[styles.tableCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <View style={[styles.tableHeading, isRTL && styles.rtlRow]}>
              <Text style={[styles.tableTitle, { color: themeColors.textPrimary }]}>{t('paymentRecordsTitle')}</Text>
              <Text style={[styles.tableBadge, { color: themeColors.primary }]}>
                {payments.length} {payments.length === 1 ? t('transactionSingle') : t('transactionPlural')}
              </Text>
            </View>

            <View style={[styles.rule, { backgroundColor: themeColors.border }]} />

            {payments.length > 0 ? (
              payments.map((record) => (
                <View style={[styles.paymentCardItem, { backgroundColor: themeColors.cardBgAlt, borderColor: themeColors.border }]} key={record.id || record._id}>
                  <View style={[styles.itemHeader, isRTL && styles.rtlRow]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.recipientText, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
                        {record.recipient}
                      </Text>
                      <Text style={[styles.dateText, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
                        {record.date} {record.notes ? `• ${record.notes}` : ''}
                      </Text>
                    </View>

                    <Text style={[styles.itemAmount, { color: themeColors.primary }]}>
                      {formatCurrency(record.amount)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: themeColors.textMuted }, isRTL && styles.rtlText]}>
                {t('noIndividualRecords')}
              </Text>
            )}
          </View>

          {/* Action CTAs */}
          <View style={styles.ctaGroup}>
            <TouchableOpacity
              style={[styles.exportBtn, { backgroundColor: themeColors.primary }]}
              onPress={() => setReportModalVisible(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="document-text-outline" size={18} color="#FFFFFF" />
              <Text style={styles.exportBtnText}>{t('exportReportBtn')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deleteYearBtn, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}
              onPress={handleDeleteYear}
              activeOpacity={0.85}
            >
              <Ionicons name="trash-outline" size={18} color={themeColors.danger} />
              <Text style={[styles.deleteYearText, { color: themeColors.danger }]}>{t('deleteArchiveBtn')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <ReportExportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        year={year}
        cycle={cycle}
      />

      <CustomAlertModal {...customAlert} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topTitle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  topTitleText: { fontSize: 16, fontWeight: '800' },
  content: { padding: 20, paddingBottom: 40 },
  summaryCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: 16,
  },
  summarySub: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  summaryTotal: { fontSize: 32, fontWeight: '900', marginBottom: 4 },
  summaryDate: { fontSize: 12 },
  snapshotCard: { padding: 18, borderWidth: 1, borderRadius: 18, marginBottom: 16 },
  snapshotHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  snapshotTitle: { fontSize: 16, fontWeight: '800' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  rowLabel: { fontSize: 13, fontWeight: '600' },
  rowVal: { fontSize: 14, fontWeight: '700' },
  tableCard: { padding: 18, borderWidth: 1, borderRadius: 18, marginBottom: 20 },
  tableHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tableTitle: { fontSize: 17, fontWeight: '800' },
  tableBadge: { fontSize: 13, fontWeight: '700' },
  rule: { height: 1, marginVertical: 12 },
  paymentCardItem: { borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 8 },
  itemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  recipientText: { fontSize: 14, fontWeight: '700' },
  dateText: { fontSize: 12, marginTop: 2 },
  itemAmount: { fontSize: 15, fontWeight: '800' },
  rtlText: { textAlign: 'right' },
  rtlRow: { flexDirection: 'row-reverse' },
  emptyText: { textAlign: 'center', marginVertical: 16, fontSize: 14 },
  ctaGroup: { gap: 12 },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 25,
    gap: 8,
  },
  exportBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  deleteYearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    gap: 8,
  },
  deleteYearText: { fontSize: 14, fontWeight: '800' },
});
