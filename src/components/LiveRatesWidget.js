import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useZakat } from '../context/ZakatContext';

const formatPkr = (val) => `PKR ${Number(val || 0).toLocaleString('en-US')}`;

export const LiveRatesWidget = ({ onPress }) => {
  const { t, isRTL, themeColors } = useLanguage();
  const { liveRates } = useZakat();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: themeColors.cardBg, borderColor: themeColors.primaryBorder },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.headerRow, isRTL && styles.rtlRow]}>
        <View style={styles.titleGroup}>
          <Ionicons name="trending-up" size={18} color={themeColors.primary} />
          <Text style={[styles.title, { color: themeColors.textPrimary }]}>{t('liveRatesTitle')}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: themeColors.primaryLight }]}>
          <Text style={[styles.badgeText, { color: themeColors.primary }]}>{liveRates.lastUpdated}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={[styles.rateBox, { backgroundColor: themeColors.cardBgAlt }]}>
          <Text style={[styles.rateLabel, { color: themeColors.textSecondary }]}>{t('goldRateLabel')}</Text>
          <Text style={[styles.rateVal, { color: themeColors.textPrimary }]}>{formatPkr(liveRates.gold24kTola)}</Text>
        </View>

        <View style={[styles.rateBox, { backgroundColor: themeColors.cardBgAlt }]}>
          <Text style={[styles.rateLabel, { color: themeColors.textSecondary }]}>{t('silverRateLabel')}</Text>
          <Text style={[styles.rateVal, { color: themeColors.textPrimary }]}>{formatPkr(liveRates.silver24kTola)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  rateBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
  },
  rateLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  rateVal: {
    fontSize: 14,
    fontWeight: '800',
  },
});
