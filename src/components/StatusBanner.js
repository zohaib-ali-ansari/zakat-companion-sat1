import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

export const StatusBanner = () => {
  const { t, themeColors } = useLanguage();

  return (
    <View style={[styles.bannerContainer, { backgroundColor: themeColors.cardBg, borderColor: themeColors.primaryBorder }]}>
      <View style={styles.contentWrapper}>
        <View style={styles.headerRow}>
          <Ionicons name="checkmark-circle-outline" size={18} color={themeColors.primary} />
          <Text style={[styles.statusTitle, { color: themeColors.textSecondary }]}>{t('statusLabel')}</Text>
        </View>
        <Text style={[styles.statusBadgeText, { color: themeColors.primary }]}>{t('nisabComplete')}</Text>
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
    borderWidth: 1,
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statusBadgeText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
