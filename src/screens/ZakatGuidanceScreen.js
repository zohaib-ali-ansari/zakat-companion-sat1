import React, { useMemo, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

const GUIDANCE_TOPICS_EN = [
  {
    id: 'what-is-zakat',
    title: 'What is Zakat?',
    section: 'fundamentals',
    summary: 'The basic meaning and purpose of Zakat as one of the pillars of Islam.',
    body: [
      'Zakat is one of the five pillars of Islam. It is an obligatory act of worship that requires eligible Muslims to give a portion of their wealth to those in need.',
      'The word Zakat means "purification" and "growth" - giving Zakat purifies the remaining wealth and brings blessing (barakah) to it.',
      'The standard rate for most zakatable assets is 2.5% of the wealth held above the Nisab threshold for one full lunar year.',
    ],
  },
  {
    id: 'understanding-nisab',
    title: 'Understanding Nisab',
    section: 'fundamentals',
    summary: 'The minimum amount of wealth a Muslim must have before Zakat becomes due.',
    body: [
      'Nisab is the minimum threshold of wealth a Muslim must own before Zakat becomes obligatory.',
      'It is commonly calculated using the value of 87.48 grams (7.5 Tolas) of gold or 612.36 grams (52.5 Tolas) of silver.',
      'If your total zakatable wealth stays above the Nisab threshold for a full lunar year (Hawl), Zakat becomes due on it.',
    ],
  },
  {
    id: 'gold-silver',
    title: 'Gold & Silver',
    section: 'assets',
    summary: 'How Zakat applies to gold and silver holdings.',
    body: [
      'Gold and silver are zakatable assets regardless of whether they are held as jewelry, coins, or bullion.',
      'The value is typically calculated using the current market rate at the time of your Zakat calculation.',
      'The standard Zakat rate of 2.5% applies to the total value owned.',
    ],
  },
  {
    id: 'cash-bank',
    title: 'Cash & Bank Accounts',
    section: 'assets',
    summary: 'How Zakat applies to cash on hand and bank balances.',
    body: [
      'All cash on hand, and balances in savings or current bank accounts, are zakatable at 2.5% of the total amount.',
      'This includes money held in different currencies converted to your local currency at calculation time.',
    ],
  },
];

const GUIDANCE_TOPICS_UR = [
  {
    id: 'what-is-zakat',
    title: 'زکوٰۃ کیا ہے؟',
    section: 'fundamentals',
    summary: 'اسلام کے اہم ارکان میں سے ایک کے طور پر زکوٰۃ کا بنیادی مقصد اور اہمیت۔',
    body: [
      'زکوٰۃ اسلام کے پانچ بنیادی ارکان میں سے ایک ہے۔ یہ ایک فرض عبادی عمل ہے جس کے تحت صاحبانِ نصاب مسلمانوں کو اپنی دولت کا ایک مقررہ حصہ مستحقین کو دینا ہوتا ہے۔',
      'لفظ "زکوٰۃ" کا مطلب پاکیزگی اور بالیدگی ہے۔ زکوٰۃ ادا کرنے سے باقی ماندہ مال پاک ہوتا ہے اور اس میں برکت آتی ہے۔',
      'عام اثاثوں پر زکوٰۃ کی شرح نصاب سے زائد رقم پر سال میں ایک بار 2.5 فیصد (1/40 واں حصہ) ہوتی ہے۔',
    ],
  },
  {
    id: 'understanding-nisab',
    title: 'نصاب کو سمجھنا',
    section: 'fundamentals',
    summary: 'وہ کم از کم مالیت جس کا مالک ہونے پر انسان پر زکوٰۃ فرض ہوتی ہے۔',
    body: [
      'نصاب وہ شرعی معیار ہے جو یہ طے کرتا ہے کہ آیا کسی شخص پر زکوٰۃ واجب ہے یا نہیں۔',
      'اس کا حساب 87.48 گرام (7.5 تولے) سونا یا 612.36 گرام (52.5 تولے) چاندی کی موجودہ مارکیٹ ویلیو کے مطابق لگایا جاتا ہے۔',
      'اگر آپ کی کل قابلِ زکوٰۃ دولت ایک پورا قمری سال (حول) نصاب کی مقدار سے زیادہ رہے تو اس پر 2.5% زکوٰۃ ادا کرنا فرض ہو جاتا ہے۔',
    ],
  },
  {
    id: 'gold-silver',
    title: 'سونا اور چاندی',
    section: 'assets',
    summary: 'سونے اور چاندی کی ملکیت پر زکوٰۃ کا اطلاق کیسے ہوتا ہے۔',
    body: [
      'سونا اور چاندی چاہے زیورات کی شکل میں ہوں، سکے ہوں یا بسکوٹ، اکثریت علماء کے نزدیک قابلِ زکوٰۃ اثاثے ہیں۔',
      'زکوٰۃ کی ادائیگی کے وقت سونے اور چاندی کی موجودہ مارکیٹ ریٹ کے حساب سے کل مالیت کا 2.5% زکوٰۃ دی جاتی ہے۔',
    ],
  },
  {
    id: 'cash-bank',
    title: 'نقد رقم اور بینک بیلنس',
    section: 'assets',
    summary: 'ہاتھ میں موجود نقد رقم اور بینک اکاؤنٹس پر زکوٰۃ کا حساب۔',
    body: [
      'ہاتھ میں موجود تمام نقد رقم اور سیونگز یا کرنٹ بینک اکاؤنٹس کے بیلنس پر 2.5 فیصد کی شرح سے زکوٰۃ فرض ہے۔',
      'غیر ملکی کرنسیوں کو بھی حساب کے وقت مقامی کرنسی میں تبدیل کر کے کل مالیت میں شامل کیا جاتا ہے۔',
    ],
  },
];

export const ZakatGuidanceScreen = ({ onBack }) => {
  const { t, language, themeColors, isRTL } = useLanguage();
  const isUr = language === 'ur';

  const [query, setQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);

  const guidanceTopics = isUr ? GUIDANCE_TOPICS_UR : GUIDANCE_TOPICS_EN;

  const filteredTopics = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return guidanceTopics.filter(
      (item) => item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q)
    );
  }, [query, guidanceTopics]);

  const isSearching = query.trim().length > 0;

  const guidanceItems = [
    {
      q: isUr ? 'زکوٰۃ کس پر فرض ہے؟' : 'Who is obligated to pay Zakat?',
      a: isUr
        ? 'ہر اس عاقل اور بالغ مسلمان پر زکوٰۃ فرض ہے جس کے پاس نصاب کی مقدار کے برابر یا اس سے زائد اثاثے ایک سال سے موجود ہوں۔'
        : 'Zakat is mandatory on any sane, adult Muslim who owns wealth meeting or exceeding the Nisab threshold for one full lunar year (Hawl).',
    },
    {
      q: isUr ? 'نصاب کا کیا مطلب ہے؟' : 'What is Nisab?',
      a: isUr
        ? 'نصاب وہ کم از کم شرعی حد ہے جس پر زکوٰۃ لاگو ہوتی ہے۔ سونا: 7.5 تولے (87.48 گرام) اور چاندی: 52.5 تولے (612.36 گرام)۔'
        : 'Nisab is the minimum threshold of wealth that makes Zakat obligatory. It equals 52.5 Tolas (612.36g) of Silver or 7.5 Tolas (87.48g) of Gold.',
    },
    {
      q: isUr ? 'کن اثاثوں پر زکوٰۃ ادا کرنی ہوگی؟' : 'Which assets are subject to Zakat?',
      a: isUr
        ? 'سونا، چاندی، نقد رقم، بینک ڈیپازٹس، شیئرز، میوچل فنڈز، اور تجارتی مال پر زکوٰۃ عائد ہوتی ہے۔'
        : 'Subject assets include Gold, Silver, Cash in Hand & Bank, Investments, Stocks, Rental Revenue, and Commercial Trade Merchandise.',
    },
  ];

  if (selectedTopic) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />
        <View style={[styles.headerRow, isRTL && styles.rtlRow]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setSelectedTopic(null)}
            activeOpacity={0.7}
          >
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={22} color={themeColors.primary} />
            <Text style={[styles.backText, { color: themeColors.primary }]}>{t('backBtn')}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]} numberOfLines={1}>
            {selectedTopic.title}
          </Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView contentContainerStyle={styles.detailContent}>
          {selectedTopic.body.map((paragraph, i) => (
            <Text key={i} style={[styles.paragraph, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
              {paragraph}
            </Text>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const renderRow = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.row, { borderBottomColor: themeColors.border }, isRTL && styles.rtlRow]}
      onPress={() => setSelectedTopic(item)}
      activeOpacity={0.6}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>{item.title}</Text>
        <Text style={[styles.rowSummary, { color: themeColors.textMuted }, isRTL && styles.rtlText]} numberOfLines={1}>
          {item.summary}
        </Text>
      </View>
      <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={themeColors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />

      <View style={[styles.headerRow, isRTL && styles.rtlRow]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={22} color={themeColors.primary} />
          <Text style={[styles.backText, { color: themeColors.primary }]}>{t('backBtn')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>{t('zakatGuidanceTitle')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={[styles.searchBar, { borderColor: themeColors.border, backgroundColor: themeColors.cardBg }, isRTL && styles.rtlRow]}>
        <Ionicons name="search" size={18} color={themeColors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={isUr ? 'عنوان یا سوال تلاش کریں...' : 'Search topics, rulings...'}
          placeholderTextColor={themeColors.textMuted}
          style={[styles.searchInput, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}
        />
      </View>

      {isSearching ? (
        <FlatList
          data={filteredTopics}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderRow(item)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>
              {isUr ? 'تلاش کا کوئی نتیجہ نہیں ملا۔' : 'No topics match your search.'}
            </Text>
          }
        />
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {guidanceTopics.map((item) => renderRow(item))}

          <View style={[styles.faqSection, { borderColor: themeColors.border }]}>
            {guidanceItems.map((item, idx) => (
              <View
                key={idx}
                style={[styles.faqCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
              >
                <View style={[styles.qRow, isRTL && styles.rtlRow]}>
                  <Ionicons name="help-circle" size={22} color={themeColors.primary} />
                  <Text style={[styles.qText, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>{item.q}</Text>
                </View>
                <Text style={[styles.aText, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>{item.a}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
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
  headerTitle: { fontSize: 18, fontWeight: '800', flex: 1, textAlign: 'center' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 20,
    gap: 8,
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  listContent: { paddingHorizontal: 20, paddingBottom: 32 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowSummary: { fontSize: 13, marginTop: 2 },
  emptyText: { marginTop: 24, textAlign: 'center' },
  detailContent: { padding: 20, gap: 14 },
  paragraph: { fontSize: 15, lineHeight: 24 },
  faqSection: { marginTop: 24, gap: 12, borderTopWidth: 1, paddingTop: 16 },
  faqCard: { padding: 18, borderRadius: 18, borderWidth: 1 },
  qRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  qText: { fontSize: 16, fontWeight: '800', flex: 1 },
  aText: { fontSize: 14, lineHeight: 22 },
  rtlText: { textAlign: 'right' },
});
