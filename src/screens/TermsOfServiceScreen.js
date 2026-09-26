import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {isRTL ? '۱. استعمال کی شرائط اور سروس اکاؤنٹ' : '1. Terms of Usage & Account Responsibilities'}
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            {isRTL
              ? 'زکوٰۃ کمپینین کو استعمال کر کے آپ اپنے اکاؤنٹ کی سیکیورٹی، درست اثاثہ جات کی معلومات کے اندراج اور زکوٰۃ کے شرعی واجبات کی انجام دہی کے لیے اس پلیٹ فارم کے استعمال سے اتفاق کرتے ہیں۔'
              : 'By using Zakat Companion, you agree to maintain the security of your account credentials, provide accurate asset details for calculation, and utilize the application for lawful Islamic Zakat compliance.'}
          </Text>

          <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {isRTL ? '۲. مالیاتی اور شرعی وضاحتی نوٹ' : '2. Financial & Shariah Guidance Disclaimer'}
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            {isRTL
              ? 'زکوٰۃ کمپینین مروجہ فقہی اصولوں اور لائیو مارکیٹ نصاب کی بنیاد پر خودکار حساب کتاب فراہم کرتا ہے۔ کسی بھی مخصوص یا پیچیدہ شرعی مسئلے کے لیے مستند مفتیانِ کرام اور علماء سے رہنمائی لیں۔'
              : 'Zakat Companion delivers automated calculation utilities adhering to recognized Shariah principles and real-time metal Nisab benchmarks. For unique commercial portfolios or scholarly rulings, consult certified Islamic scholars.'}
          </Text>

          <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {isRTL ? '۳. کلاؤڈ سروسز اور ڈیٹا ہم آہنگی (Syncing)' : '3. Cloud Services & Real-Time Sync'}
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            {isRTL
              ? 'ہم سروس کے بلاتعطل تسلسل، بیک اپ سسٹمز، لائیو میٹل ریٹس کی فراہمی اور کلاؤڈ ڈیٹا بیس سنکرونائزیشن کی مسلسل بہتری کے لیے سروسز کو اپ ڈیٹ کرنے کا حق رکھتے ہیں۔'
              : 'We reserve the right to deploy updates, enhance multi-device cloud synchronization, and update live market Nisab feeds to ensure seamless calculation accuracy.'}
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
