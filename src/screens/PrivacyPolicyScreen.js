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

      {/* Header Bar */}
      <View style={[styles.headerRow, isRTL && styles.rtlRow]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={22} color={themeColors.primary} />
          <Text style={[styles.backText, { color: themeColors.primary }]}>{t('backBtn') || 'Back'}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>{t('privacyPolicyTitle') || 'Privacy Policy'}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Intro Card */}
        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark" size={24} color={themeColors.primary} />
            <Text style={[styles.mainCardTitle, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
              {isRTL ? 'ہماری پرائیویسی پالیسی' : 'Zakat Companion Privacy Policy'}
            </Text>
          </View>
          <Text style={[styles.lastUpdated, { color: themeColors.textMuted }, isRTL && styles.rtlText]}>
            {isRTL ? 'آخری بار ترمیم شدہ: فروری ۲۰۲۵' : 'Last Updated: February 2025'}
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            {isRTL
              ? 'زکوٰۃ کمپینین آپ کے مالیاتی حسابات اور ذاتی ڈیٹا کی رازداری اور تحفظ کے لیے پرعزم ہے۔ یہ دستاویز واضح کرتی ہے کہ کلاؤڈ ڈیٹا بیس (MongoDB Atlas) اور ہماری محفوظ بیک اینڈ سروسز پر آپ کا ڈیٹا کس طرح منظم اور محفوظ کیا جاتا ہے۔'
              : 'Zakat Companion is committed to safeguarding your personal information and financial calculations. This policy explains how your data is processed and protected across our secure backend infrastructure and MongoDB Atlas cloud database.'}
          </Text>
        </View>

        {/* Section 1: Cloud Storage & MongoDB Atlas */}
        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {isRTL ? '۱. کلاؤڈ ڈیٹا بیس اور محفوظ اسٹوریج (MongoDB Atlas)' : '1. Cloud Database & Storage (MongoDB Atlas)'}
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            {isRTL
              ? 'آپ کے اکاؤنٹ کی معلومات، زکوٰۃ کے سالانہ سائیکلز، اثاثہ جات کا ریکارڈ (سونا، چاندی، کیش، پراپرٹی، بزنس، حصص) اور ادائیگیوں کی تفصیلات انڈسٹری گریڈ MongoDB Atlas کلاؤڈ کلسٹرز پر محفوظ طریقے سے ہم آہنگ (Sync) اور اسٹور کی جاتی ہیں۔ تمام ڈیٹا ٹرانسمیشن TLS 1.3 / SSL انکرپشن کے ساتھ کی جاتی ہے۔'
              : 'Your account credentials, multi-year Zakat cycles, asset breakdowns (gold, silver, cash, property, business, stocks), and payment tracking records are securely synced and persisted on enterprise-grade MongoDB Atlas cloud clusters with TLS 1.3/SSL encryption in transit and AES-256 at rest.'}
          </Text>
        </View>

        {/* Section 2: Account Security & Authentication */}
        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {isRTL ? '۲. اکاؤنٹ سیکیورٹی اور پاس ورڈ کا تحفظ' : '2. Authentication & Account Security'}
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            {isRTL
              ? 'پاس ورڈز کو کبھی بھی سادہ متن (Plain Text) میں محفوظ نہیں کیا جاتا۔ ہم صنعت کے معیاری Bcrypt ون وے سالٹڈ ہیشنگ الگورتھم کا استعمال کرتے ہیں۔ سیشنز کو تصدیق شدہ JSON Web Tokens (JWT) کے ذریعے محفوظ رکھا جاتا ہے تاکہ غیر مجاز رسائی کو مکمل طور پر روکا جا سکے۔'
              : 'Passwords are never stored in plain text. We employ salted Bcrypt one-way cryptographic hashing. User authentication sessions are validated through signed JSON Web Tokens (JWT) to ensure strict session authorization.'}
          </Text>
        </View>

        {/* Section 3: Financial Data Privacy */}
        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {isRTL ? '۳. مالیاتی ڈیٹا کی رازداری اور عدم اشتراک' : '3. Financial Confidentiality & Non-Disclosure'}
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            {isRTL
              ? 'آپ کے مالی اثاثے اور زکوٰۃ کے اعداد و شمار صرف آپ کے ذاتی حساب اور ریکارڈ کے لیے استعمال ہوتے ہیں۔ ہم آپ کی ذاتی یا مالی تفصیلات کو کسی تیسرے فریق (Third-Party Advertisers) کو فروخت، کرایہ پر یا اشتراک نہیں کرتے۔'
              : 'Your wealth and Zakat balance metrics are strictly private to your registered profile. We do NOT monetize, sell, lease, or broker your financial records to advertisers, marketing vendors, or third-party agencies.'}
          </Text>
        </View>

        {/* Section 4: Live Rates & Third-Party APIs */}
        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {isRTL ? '۴. لائیو میٹل ریٹس اور نصاب کا حساب' : '4. Live Metal Rates & Nisab Calculations'}
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            {isRTL
              ? 'سونے اور چاندی کی مروجہ مارکیٹ قیمتیں اور نصاب کی حد قابل اعتماد مارکیٹ API فیڈز سے حاصل کی جاتی ہیں۔ ریٹ معلوم کرتے وقت آپ کی کوئی بھی ذاتی یا شناختی معلومات بیرونی سرورز پر نہیں بھیجی جاتی۔'
              : 'Real-time gold and silver market prices are fetched from authenticated financial rate providers solely to calculate live Nisab thresholds. No identifiable user information is sent during rate queries.'}
          </Text>
        </View>

        {/* Section 5: User Rights & Data Deletion */}
        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {isRTL ? '۵. ڈیٹا تک رسائی، برآمد اور اکاؤنٹ کا خاتمہ' : '5. User Rights, PDF Export & Data Erasure'}
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            {isRTL
              ? 'آپ کو اپنے ڈیٹا پر مکمل کنٹرول حاصل ہے۔ آپ کسی بھی وقت اپنے زکوٰۃ حسابات کا پی ڈی ایف سرٹیفکیٹ ڈاؤن لوڈ کر سکتے ہیں، پروفائل اپ ڈیٹ کر سکتے ہیں، یا اپنا اکاؤنٹ اور ڈیٹا بیس سے تمام متعلقہ ریکارڈ حذف (Delete) کروا سکتے ہیں۔'
              : 'You retain full control over your data. You can export verified Zakat PDF calculation summaries, modify asset entries, or request permanent deletion of your profile and history from our database at any time.'}
          </Text>
        </View>

        {/* Section 6: Contact & Support */}
        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border, marginBottom: 30 }]}>
          <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {isRTL ? '۶. رابطہ برائے سوالات و تعاون' : '6. Contact & Inquiries'}
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            {isRTL
              ? 'اگر آپ کے پاس پرائیویسی پالیسی یا کلاؤڈ سیکیورٹی کے حوالے سے کوئی سوالات ہیں، تو آپ ہماری سپورٹ ٹیم سے رابطہ کر سکتے ہیں۔'
              : 'If you have questions regarding our data protection measures or cloud infrastructure, contact our technical team via the app support portal.'}
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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { padding: 18, borderRadius: 18, borderWidth: 1, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  mainCardTitle: { fontSize: 18, fontWeight: '800', flex: 1 },
  lastUpdated: { fontSize: 12, fontWeight: '600', marginBottom: 10 },
  sectionHeading: { fontSize: 15, fontWeight: '800', marginBottom: 6 },
  bodyText: { fontSize: 13.5, lineHeight: 22 },
  rtlText: { textAlign: 'right' },
});
