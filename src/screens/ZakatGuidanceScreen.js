import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

export const ZakatGuidanceScreen = ({ onBack }) => {
  const { t, themeColors, isRTL } = useLanguage();

  const guidanceItems = [
    {
      q: isRTL ? 'زکوٰۃ کس پر فرض ہے؟' : 'Who is obligated to pay Zakat?',
      a: isRTL
        ? 'ہر اس عاقل اور بالغ مسلمان پر زکوٰۃ فرض ہے جس کے پاس نصاب کی مقدار کے برابر یا اس سے زائد اثاثے ایک سال سے موجود ہوں۔'
        : 'Zakat is mandatory on any sane, adult Muslim who owns wealth meeting or exceeding the Nisab threshold for one full lunar year (Hawl).',
    },
    {
      q: isRTL ? 'نصاب کا کیا مطلب ہے؟' : 'What is Nisab?',
      a: isRTL
        ? 'نصاب وہ کم از کم شرعی حد ہے جس پر زکوٰۃ لاگو ہوتی ہے۔ سونا: 7.5 تولے (87.48 گرام) اور چاندی: 52.5 تولے (612.36 گرام)۔'
        : 'Nisab is the minimum threshold of wealth that makes Zakat obligatory. It equals 52.5 Tolas (612.36g) of Silver or 7.5 Tolas (87.48g) of Gold.',
    },
    {
      q: isRTL ? 'کن اثاثوں پر زکوٰۃ ادا کرنی ہوگی؟' : 'Which assets are subject to Zakat?',
      a: isRTL
        ? 'سونا، چاندی، نقد رقم، بینک ڈیپازٹس، شیئرز، میوچل فنڈز، اور تجارتی مال پر زکوٰۃ عائد ہوتی ہے۔'
        : 'Subject assets include Gold, Silver, Cash in Hand & Bank, Investments, Stocks, Rental Revenue, and Commercial Trade Merchandise.',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />

      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={themeColors.primary} />
          <Text style={[styles.backText, { color: themeColors.primary }]}>{t('backBtn')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>{t('zakatGuidanceTitle')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {guidanceItems.map((item, idx) => (
          <View
            key={idx}
            style={[styles.faqCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
          >
            <View style={styles.qRow}>
              <Ionicons name="help-circle" size={22} color={themeColors.primary} />
              <Text style={[styles.qText, { color: themeColors.textPrimary }]}>{item.q}</Text>
            </View>
            <Text style={[styles.aText, { color: themeColors.textSecondary }]}>{item.a}</Text>
          </View>
        ))}
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
  scrollContent: { padding: 20, gap: 16 },
  faqCard: { padding: 18, borderRadius: 18, borderWidth: 1 },
  qRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  qText: { fontSize: 16, fontWeight: '800', flex: 1 },
  aText: { fontSize: 14, lineHeight: 22 },
});
