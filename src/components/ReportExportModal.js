import React from 'react';
import {
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

const formatPkr = (val) => `PKR ${Number(val || 0).toLocaleString('en-US')}`;

export const ReportExportModal = ({ visible, onClose, year = '2024' }) => {
  const { t, isRTL, themeColors } = useLanguage();
  const { totalDue, totalPaid, remaining, records, snapshots } = useZakat();

  const snapshot = (snapshots && snapshots[year]) || {
    totalEligibleAssets: 2500000,
    deductibleDebts: 100000,
    netZakatableWealth: 2400000,
    calculatedZakat: 60000,
  };

  const filteredRecords = (records || []).filter((r) => r.date?.includes(year));

  const handleDownloadPdf = () => {
    Alert.alert(t('appTitle'), `${t('pdfReportTitle')} (${year})\n\n${t('reportGeneratedSuccess')}`);
    onClose?.();
  };

  const handleExportCsv = () => {
    Alert.alert(t('appTitle'), `CSV Sheet for ${year}\n\n${t('reportGeneratedSuccess')}`);
    onClose?.();
  };

  if (!visible) return null;

  return (
    <Modal visible animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: themeColors.cardBg }]}>
          {/* Header */}
          <View style={[styles.header, isRTL && styles.rtlRow]}>
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>
              {t('pdfReportTitle')}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={themeColors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
            {/* Summary Box */}
            <View style={[styles.summaryBox, { backgroundColor: themeColors.cardBgAlt, borderColor: themeColors.border }]}>
              <Text style={[styles.boxTitle, { color: themeColors.primary }]}>AH 1445 - {year} Summary</Text>
              
              <View style={[styles.row, isRTL && styles.rtlRow]}>
                <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('totalAssetsLabel')}</Text>
                <Text style={[styles.val, { color: themeColors.textPrimary }]}>{formatPkr(snapshot.totalEligibleAssets)}</Text>
              </View>

              <View style={[styles.row, isRTL && styles.rtlRow]}>
                <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('netWealthLabel')}</Text>
                <Text style={[styles.val, { color: themeColors.textPrimary }]}>{formatPkr(snapshot.netZakatableWealth)}</Text>
              </View>

              <View style={[styles.row, isRTL && styles.rtlRow]}>
                <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('totalDueLabel')}</Text>
                <Text style={[styles.val, { color: themeColors.textPrimary }]}>{formatPkr(totalDue)}</Text>
              </View>

              <View style={[styles.row, isRTL && styles.rtlRow]}>
                <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('totalPaidLabel')}</Text>
                <Text style={[styles.val, { color: themeColors.primary }]}>{formatPkr(totalPaid)}</Text>
              </View>

              <View style={[styles.row, isRTL && styles.rtlRow]}>
                <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('remainingZakatLabel')}</Text>
                <Text style={[styles.val, { color: themeColors.danger }]}>{formatPkr(remaining)}</Text>
              </View>
            </View>

            {/* Transactions count */}
            <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }]}>
              Payment Transactions ({filteredRecords.length})
            </Text>

            {filteredRecords.map((item) => (
              <View key={item.id} style={[styles.transRow, { borderBottomColor: themeColors.border }, isRTL && styles.rtlRow]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.recText, { color: themeColors.textPrimary }]}>{item.recipient}</Text>
                  <Text style={[styles.dateText, { color: themeColors.textSecondary }]}>{item.date}</Text>
                </View>
                <Text style={[styles.amtText, { color: themeColors.primary }]}>{formatPkr(item.amount)}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsGroup}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: themeColors.primary }]}
              onPress={handleDownloadPdf}
              activeOpacity={0.85}
            >
              <Ionicons name="document-text-outline" size={18} color="#FFFFFF" />
              <Text style={styles.btnText}>{t('downloadPdfBtn')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: themeColors.cardBgAlt, borderWidth: 1, borderColor: themeColors.border }]}
              onPress={handleExportCsv}
              activeOpacity={0.85}
            >
              <Ionicons name="grid-outline" size={18} color={themeColors.textPrimary} />
              <Text style={[styles.btnText, { color: themeColors.textPrimary }]}>{t('exportCsvBtn')}</Text>
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
  btnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
