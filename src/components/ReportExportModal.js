import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useZakat } from '../context/ZakatContext';
import {
  generateAndSharePdfReport,
  generateAndExportCsvReport,
} from '../services/reportExportService';

const formatPkr = (val) => `PKR ${Number(val || 0).toLocaleString('en-US')}`;

export const ReportExportModal = ({ visible, onClose, year = '2024', cycle = null }) => {
  const { t, isRTL, themeColors } = useLanguage();
  const { totalDue, totalPaid, remaining, records, snapshots, currentUser, completedCycles, assetsBreakdown } = useZakat();

  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingCsv, setLoadingCsv] = useState(false);

  // If a historical completed cycle was passed or exists in completedCycles
  const archivedCycle = cycle || (completedCycles || []).find((c) => String(c.year) === String(year));

  const snapshot = archivedCycle || (snapshots && snapshots[year]) || {
    totalEligibleAssets: assetsBreakdown?.totalAssets || 2500000,
    deductibleDebts: assetsBreakdown?.liabilitiesVal || 100000,
    netZakatableWealth: assetsBreakdown?.netZakatableWealth || 2400000,
    calculatedZakat: assetsBreakdown?.zakatPayable || 60000,
  };

  const effectiveRecords = archivedCycle?.payments || (records || []).filter((r) => r.date?.includes(year));
  const effectiveTotalDue = archivedCycle ? (archivedCycle.originalCalculatedAmount || archivedCycle.trackingTotal || totalDue) : totalDue;
  const effectiveTotalPaid = archivedCycle ? (archivedCycle.totalPaid || effectiveRecords.reduce((s, r) => s + (Number(r.amount) || 0), 0)) : totalPaid;
  const effectiveRemaining = archivedCycle ? 0 : remaining;

  const handleDownloadPdf = async () => {
    try {
      setLoadingPdf(true);
      await generateAndSharePdfReport({
        year,
        currentUser,
        snapshot,
        totalDue: effectiveTotalDue,
        totalPaid: effectiveTotalPaid,
        remaining: effectiveRemaining,
        records: effectiveRecords,
      });
      onClose?.();
    } catch (error) {
      console.error('PDF generation error:', error);
      Alert.alert(t('appTitle'), `Failed to generate PDF: ${error.message}`);
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setLoadingCsv(true);
      await generateAndExportCsvReport({
        year,
        currentUser,
        snapshot,
        totalDue: effectiveTotalDue,
        totalPaid: effectiveTotalPaid,
        remaining: effectiveRemaining,
        records: effectiveRecords,
      });
      onClose?.();
    } catch (error) {
      console.error('CSV export error:', error);
      Alert.alert(t('appTitle'), `Failed to export CSV: ${error.message}`);
    } finally {
      setLoadingCsv(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: themeColors.cardBg }]}>
          {/* Header */}
          <View style={[styles.header, isRTL && styles.rtlRow]}>
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>
              {t('pdfReportTitle')}
            </Text>
            <TouchableOpacity onPress={onClose} disabled={loadingPdf || loadingCsv}>
              <Ionicons name="close" size={24} color={themeColors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
            {/* Summary Box */}
            <View style={[styles.summaryBox, { backgroundColor: themeColors.cardBgAlt, borderColor: themeColors.border }]}>
              <Text style={[styles.boxTitle, { color: themeColors.primary }]}>Zakat Summary • {year}</Text>
              
              <View style={[styles.row, isRTL && styles.rtlRow]}>
                <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('totalAssetsLabel')}</Text>
                <Text style={[styles.val, { color: themeColors.textPrimary }]}>{formatPkr(snapshot.totalEligibleAssets || snapshot.totalAssets)}</Text>
              </View>

              <View style={[styles.row, isRTL && styles.rtlRow]}>
                <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('netWealthLabel')}</Text>
                <Text style={[styles.val, { color: themeColors.textPrimary }]}>{formatPkr(snapshot.netZakatableWealth)}</Text>
              </View>

              <View style={[styles.row, isRTL && styles.rtlRow]}>
                <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('totalDueLabel')}</Text>
                <Text style={[styles.val, { color: themeColors.textPrimary }]}>{formatPkr(effectiveTotalDue)}</Text>
              </View>

              <View style={[styles.row, isRTL && styles.rtlRow]}>
                <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('totalPaidLabel')}</Text>
                <Text style={[styles.val, { color: themeColors.primary }]}>{formatPkr(effectiveTotalPaid)}</Text>
              </View>

              <View style={[styles.row, isRTL && styles.rtlRow]}>
                <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('remainingZakatLabel')}</Text>
                <Text style={[styles.val, { color: effectiveRemaining > 0 ? themeColors.danger : themeColors.primary }]}>
                  {formatPkr(effectiveRemaining)}
                </Text>
              </View>
            </View>

            {/* Transactions count */}
            <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }]}>
              Payment Transactions ({effectiveRecords.length})
            </Text>

            {effectiveRecords.length > 0 ? (
              effectiveRecords.map((item, index) => (
                <View key={item.id || item._id || index} style={[styles.transRow, { borderBottomColor: themeColors.border }, isRTL && styles.rtlRow]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.recText, { color: themeColors.textPrimary }]}>{item.recipient || 'Beneficiary'}</Text>
                    <Text style={[styles.dateText, { color: themeColors.textSecondary }]}>{item.date || 'N/A'}</Text>
                  </View>
                  <Text style={[styles.amtText, { color: themeColors.primary }]}>{formatPkr(item.amount)}</Text>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>
                No transaction records found for {year}.
              </Text>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsGroup}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: themeColors.primary }, (loadingPdf || loadingCsv) && styles.btnDisabled]}
              onPress={handleDownloadPdf}
              disabled={loadingPdf || loadingCsv}
              activeOpacity={0.85}
            >
              {loadingPdf ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="document-text-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.btnText}>{t('downloadPdfBtn')}</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.btn,
                { backgroundColor: themeColors.cardBgAlt, borderWidth: 1, borderColor: themeColors.border },
                (loadingPdf || loadingCsv) && styles.btnDisabled,
              ]}
              onPress={handleExportCsv}
              disabled={loadingPdf || loadingCsv}
              activeOpacity={0.85}
            >
              {loadingCsv ? (
                <ActivityIndicator size="small" color={themeColors.primary} />
              ) : (
                <>
                  <Ionicons name="grid-outline" size={18} color={themeColors.textPrimary} />
                  <Text style={[styles.btnText, { color: themeColors.textPrimary }]}>{t('exportCsvBtn')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    borderRadius: 24,
    padding: 20,
    elevation: 5,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  summaryBox: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  boxTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  val: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  transRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  recText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 12,
    marginTop: 2,
  },
  amtText: {
    fontSize: 14,
    fontWeight: '800',
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: 12,
    textAlign: 'center',
  },
  actionsGroup: {
    marginTop: 16,
    gap: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    gap: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
