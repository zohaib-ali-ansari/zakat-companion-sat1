import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

export const TermsOfServiceScreen = ({ onBack }) => {
  const { t, themeColors, isRTL } = useLanguage();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />

      <View style={[styles.headerRow, isRTL && styles.rtlRow]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={22} color={themeColors.primary} />
          <Text style={[styles.backText, { color: themeColors.primary }]}>{t('backBtn')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>{t('termsOfServiceTitle')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {isRTL ? '۱. استعمال کی شرائط' : '1. Terms of Usage'}
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            {isRTL
              ? 'زکوٰۃ کمپینین کو ڈاؤن لوڈ اور استعمال کر کے، آپ زکوٰۃ کے شرعی واجبات کی رہنمائی اور حساب کتاب کے لیے اس ایپلیکیشن کے استعمال سے اتفاق کرتے ہیں۔'
              : 'By downloading and using Zakat Companion, you agree to use the app for personal calculation and guidance of Islamic Zakat duties.'}
          </Text>

          <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {isRTL ? '۲. مالیاتی اور شرعی وضاحتی نوٹ' : '2. Financial Disclaimer'}
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            {isRTL
              ? 'زکوٰۃ کمپینین معیارِ نصاب اور مروجہ فقہی اصولوں کے مطابق حساب کتاب سہولت فراہم کرتا ہے۔ کسی بھی پیچیدہ فقہی مسئلے کے لیے جید علماء کرام سے رجوع کریں۔'
              : 'Zakat Companion provides calculation utilities based on standard Islamic jurisprudence and silver/gold Nisab rates. For complex scholarly disputes or corporate wealth, consult a qualified Islamic scholar.'}
          </Text>

          <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {isRTL ? '۳. اپ ڈیٹس اور ترمیمات' : '3. Updates & Modifications'}
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            {isRTL
              ? 'ہم نصاب کی لائیو قیمتوں اور خصوصیات میں بہتری اور درستگی کے لیے باقاعدگی سے اپ ڈیٹس فراہم کرنے کا حق رکھتے ہیں۔'
              : 'We reserve the right to update live Nisab threshold rates and currency conversion tools to ensure accuracy for users worldwide.'}
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
