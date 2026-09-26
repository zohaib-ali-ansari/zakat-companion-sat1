import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';

export default function OrganizationPortalScreen({ onBack }) {
  const { t, isRTL, themeColors } = useLanguage();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />

      {/* Top Header */}
      <View style={[styles.topHeader, isRTL && styles.rtlRow]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
          onPress={() => onBack?.()}
          activeOpacity={0.7}
          accessibilityLabel="Back"
        >
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={20} color={themeColors.primary} />
        </TouchableOpacity>
        <Text style={[styles.topHeaderTitle, { color: themeColors.textPrimary }]}>
          {t('orgPortalTitle')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Coming Soon Body */}
      <View style={styles.centerContainer}>
        <View style={[styles.iconContainer, { backgroundColor: themeColors.primaryLight }]}>
          <Ionicons name="business-outline" size={48} color={themeColors.primary} />
        </View>

        <View style={[styles.badge, { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder }]}>
          <Text style={[styles.badgeText, { color: themeColors.primary }]}>
            {t('comingSoonBadge')}
          </Text>
        </View>

        <Text style={[styles.title, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
          {t('orgPortalTitle')}
        </Text>

        <Text style={[styles.description, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
          {t('comingSoonOrgDesc')}
        </Text>

        <TouchableOpacity
          style={[styles.backCta, { backgroundColor: themeColors.primary }]}
          onPress={() => onBack?.()}
          activeOpacity={0.85}
        >
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={18} color="#FFFFFF" />
          <Text style={styles.backCtaText}>{t('backBtn') || 'Back'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  rtlRow: { flexDirection: 'row-reverse' },
  rtlText: { textAlign: 'center' },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 320,
  },
  backCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
  },
  backCtaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
