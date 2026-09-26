import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useZakat } from '../context/ZakatContext';
import { SettingRow } from '../components/SettingRow';

export const ProfileSettingsScreen = ({
  onClose,
  onSignOut,
  onOpenPrivacy,
  onOpenTerms,
  onOpenGuidance,
  onOpenExplanation,
  onOpenDisasterRelief,
  onOpenOrgPortal,
  onOpenLiveRates,
  onExportReport,
}) => {
  const { t, language, setLanguage, isDarkMode, toggleDarkMode, themeColors, isRTL } = useLanguage();
  const { currentUser } = useZakat();

  const [avatarIndex, setAvatarIndex] = React.useState(currentUser?.avatar ?? 0);

  const avatars = ['wallet', 'person', 'star', 'sparkles'];

  const cycleAvatar = () => {
    setAvatarIndex((prev) => (prev + 1) % avatars.length);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />

      {/* Header bar */}
      <View style={[styles.headerBar, isRTL && styles.rtlRow]}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: themeColors.cardBg }]}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={22} color={themeColors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.langPill, { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder }]}
          onPress={() => setLanguage(language === 'en' ? 'ur' : 'en')}
          activeOpacity={0.8}
        >
          <Text style={[styles.langPillText, { color: themeColors.primary }]}>
            {language === 'en' ? 'UR' : 'EN'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card / Header with editable avatar */}
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={cycleAvatar} activeOpacity={0.85}>
            <View style={[styles.avatarSquare, { backgroundColor: themeColors.primary }]}>
              <Ionicons name={avatars[avatarIndex]} size={36} color="#FFFFFF" />
            </View>
            <View style={[styles.cameraBadge, { backgroundColor: themeColors.primary, borderColor: themeColors.background }]}>
              <Ionicons name="camera-outline" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text
            style={[styles.profileTitle, { color: themeColors.textPrimary }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {currentUser?.name || t('userName')}
          </Text>
          <Text style={[styles.userEmail, { color: themeColors.textSecondary }]}>
            {currentUser?.email || t('userEmail')}
          </Text>
          <Text style={[styles.avatarHint, { color: themeColors.primary }]}>
            {t('changeAvatar')}
          </Text>
        </View>

        {/* PREFERENCES */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            {t('sectionPreferences')}
          </Text>

          <SettingRow
            icon="globe-outline"
            title={t('settingLanguage')}
            type="segmented"
            value={language.toUpperCase()}
            onValueChange={(val) => setLanguage(val.toLowerCase())}
            options={[
              { label: 'EN', value: 'EN' },
              { label: 'UR', value: 'UR' },
            ]}
          />

          <SettingRow
            icon="moon-outline"
            title={t('settingDarkTheme')}
            type="switch"
            value={isDarkMode}
            onValueChange={toggleDarkMode}
          />
        </View>

        {/* SUPPORT & LEGAL */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            {t('sectionSupportLegal')}
          </Text>

          <SettingRow
            icon="heart-outline"
            title={t('disasterReliefTitle')}
            type="link"
            onPress={onOpenDisasterRelief}
          />

          <SettingRow
            icon="business-outline"
            title={t('orgPortalTitle')}
            type="link"
            onPress={onOpenOrgPortal}
          />

          <SettingRow
            icon="trending-up-outline"
            title={t('liveRatesTitle')}
            type="link"
            onPress={onOpenLiveRates}
          />

          <SettingRow
            icon="document-text-outline"
            title={t('exportReportBtn')}
            type="link"
            onPress={onExportReport}
          />

          <SettingRow
            icon="help-circle-outline"
            title={t('settingZakatGuidance')}
            type="link"
            onPress={onOpenGuidance}
          />

          <SettingRow
            icon="shield-checkmark-outline"
            title={t('settingPrivacyPolicy')}
            type="link"
            onPress={onOpenPrivacy}
          />

          <SettingRow
            icon="document-text-outline"
            title={t('settingTermsOfService')}
            type="link"
            onPress={onOpenTerms}
          />

          <SettingRow
            icon="information-circle-outline"
            title={t('settingCalculatedZakatExplanation')}
            type="link"
            onPress={onOpenExplanation}
          />
        </View>

        {/* SIGN OUT */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={onSignOut}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={themeColors.danger} />
          <Text style={[styles.signOutText, { color: themeColors.danger }]}>
            {t('signOut')}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  iconButton: {
    padding: 8,
    borderRadius: 10,
  },
  langPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  langPillText: {
    fontSize: 13,
    fontWeight: '800',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarSquare: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A4FD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0,
    maxWidth: '90%',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  avatarHint: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  rtlText: {
    textAlign: 'right',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 36,
    paddingVertical: 14,
    gap: 8,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
