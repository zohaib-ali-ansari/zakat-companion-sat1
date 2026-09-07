import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

export const PrivacyPolicyScreen = ({ onBack }) => {
  const { t, themeColors } = useLanguage();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />

      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={themeColors.primary} />
          <Text style={[styles.backText, { color: themeColors.primary }]}>{t('backBtn')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>{t('privacyPolicyTitle')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }]}>1. Privacy & Security Commitment</Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }]}>
            Zakat Companion takes your financial privacy with utmost seriousness. All asset values, cash calculations, and wealth data stored within the app are strictly encrypted and stored locally on your device.
          </Text>

          <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }]}>2. Information Collection</Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }]}>
            We do not transmit your bank accounts, gold holdings, or financial calculations to external third-party servers without your permission.
          </Text>

          <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }]}>3. Data Protection</Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }]}>
            Industry-standard encryption is used for local state persistence. You can reset or wipe all saved calculation history from settings at any time.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { fontSize: 15, fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: 20 },
  card: { padding: 20, borderRadius: 18, borderWidth: 1 },
  sectionHeading: { fontSize: 16, fontWeight: '800', marginTop: 14, marginBottom: 6 },
  bodyText: { fontSize: 14, lineHeight: 22 },
});
