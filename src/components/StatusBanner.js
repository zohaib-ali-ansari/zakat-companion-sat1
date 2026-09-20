import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useZakat } from '../context/ZakatContext';

export const StatusBanner = () => {
  const { t, themeColors, isRTL } = useLanguage();
  const { assetsBreakdown, metalRates, totalDue } = useZakat();

  const threshold = metalRates?.nisab?.silverThreshold || assetsBreakdown?.silverNisabThreshold || 174523;
  const isMet = assetsBreakdown ? assetsBreakdown.isNisabMet : totalDue > 0;

  const statusTitle = t('statusLabel') || 'Status';
  const statusBadgeText = isMet
    ? (t('nisabMetStatus') || t('nisabComplete') || 'Nisab Reached (Zakat Mandatory)')
    : (t('nisabNotMetStatus') || 'Below Nisab Threshold (No Zakat Due)');

  const statusColor = isMet ? themeColors.primary : '#D97706';
  const iconName = isMet ? 'checkmark-circle' : 'information-circle';
  const borderColor = isMet ? themeColors.primaryBorder : '#FDE68A';

  return (
    <View style={[styles.bannerContainer, { backgroundColor: themeColors.cardBg, borderColor }]}>
      <View style={styles.contentWrapper}>
        <View style={[styles.headerRow, isRTL && styles.rtlRow]}>
          <Ionicons name={iconName} size={18} color={statusColor} />
          <Text style={[styles.statusTitle, { color: themeColors.textSecondary }]}>
            {statusTitle}
          </Text>
        </View>
        <Text style={[styles.statusBadgeText, { color: statusColor }, isRTL && styles.rtlText]}>
          {statusBadgeText}
        </Text>
        <Text style={[styles.thresholdSub, { color: themeColors.textMuted }, isRTL && styles.rtlText]}>
          {(t('nisabThresholdLabel') || 'Silver Nisab Standard') + ': PKR ' + Number(threshold).toLocaleString('en-US')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statusBadgeText: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  thresholdSub: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
  rtlText: {
    textAlign: 'center',
  },
});
