import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

export const PrivacyPolicyScreen = ({ onBack }) => {
  const { t, themeColors, isRTL } = useLanguage();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />

      <View style={[styles.headerRow, isRTL && styles.rtlRow]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={22} color={themeColors.primary} />
          <Text style={[styles.backText, { color: themeColors.primary }]}>{t('backBtn')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>{t('privacyPolicyTitle')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {isRTL ? '۱. پرائیویسی اور سیکیورٹی کی یقین دہانی' : '1. Privacy & Security Commitment'}
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            {isRTL
              ? 'زکوٰۃ کمپینین آپ کی مالیاتی معلومات کی پرائیویسی کو انتہائی اہمیت دیتا ہے۔ تمام اثاثہ جات، نقد رقم اور حساب کتاب کا ڈیٹا آپ کے موبائل ڈیوائس پر مقامی طور پر محفوظ اور انکرپٹڈ رہتا ہے۔'
              : 'Zakat Companion takes your financial privacy with utmost seriousness. All asset values, cash calculations, and wealth data stored within the app are strictly encrypted and stored locally on your device.'}
          </Text>

          <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {isRTL ? '۲. معلومات کا جمع کرنا' : '2. Information Collection'}
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            {isRTL
              ? 'ہم آپ کے بینک اکاؤنٹس، سونے کے اثاثوں، یا زکوٰۃ کے حسابات کو بغیر اجازت کسی بیرونی سرور پر منتقل نہیں کرتے۔'
              : 'We do not transmit your bank accounts, gold holdings, or financial calculations to external third-party servers without your permission.'}
          </Text>

          <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {isRTL ? '۳. ڈیٹا کا تحفظ' : '3. Data Protection'}
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            {isRTL
              ? 'مقامی تحفظ کے لیے انڈسٹری لیول انکرپشن استعمال کی جاتی ہے۔ آپ کسی بھی وقت سیٹنگز سے اپنا تمام ریکارڈ ری سیٹ کر سکتے ہیں۔'
              : 'Industry-standard encryption is used for local state persistence. You can reset or wipe all saved calculation history from settings at any time.'}
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
  rtlRow: { flexDirection: 'row-reverse' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { fontSize: 15, fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: 20 },
  card: { padding: 20, borderRadius: 18, borderWidth: 1 },
  sectionHeading: { fontSize: 16, fontWeight: '800', marginTop: 14, marginBottom: 6 },
  bodyText: { fontSize: 14, lineHeight: 22 },
  rtlText: { textAlign: 'right' },
});
