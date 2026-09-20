import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
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

const ASNAF_CATEGORIES = [
  { id: '1', name: 'Al-Fuqara (The Poor)', arabic: 'الفقراء', desc: 'Those without any income or means to meet basic survival needs.' },
  { id: '2', name: 'Al-Masakin (The Needy)', arabic: 'المساكين', desc: 'Those whose income falls below the essential cost of living.' },
  { id: '3', name: 'Al-Amilina Alayha (Zakat Admin)', arabic: 'العاملين عليها', desc: 'Appointed collectors and administrators of Zakat distribution.' },
  { id: '4', name: 'Al-Mu\'allafatu Qulubuhum (Reconciling Hearts)', arabic: 'المؤلفة قلوبهم', desc: 'New Muslims or those whose hearts are being inclined towards Islam.' },
  { id: '5', name: 'Fir-Riqab (Freeing Slaves/Captives)', arabic: 'في الرقاب', desc: 'Assisting individuals to gain freedom from bondage or captivity.' },
  { id: '6', name: 'Al-Gharimin (Debtors)', arabic: 'الغارمين', desc: 'Those burdened with overwhelming debts incurred for permissible needs.' },
  { id: '7', name: 'Fi Sabilillah (In the Cause of Allah)', arabic: 'في سبيل الله', desc: 'Striving in the cause of Allah, community welfare, and Islamic education.' },
  { id: '8', name: 'Ibn us-Sabil (Stranded Travelers)', arabic: 'ابن السبيل', desc: 'Travelers stranded away from home without financial resources.' },
];

const GUIDANCE_TOPICS_EN = [
  {
    id: 'what-is-zakat',
    title: 'What is Zakat?',
    summary: 'The basic meaning and purpose of Zakat as one of the pillars of Islam.',
    body: [
      'Zakat is one of the five pillars of Islam. It is an obligatory act of worship requiring eligible Muslims to give 2.5% of their qualifying wealth to designated recipients.',
      'Zakat purifies wealth, removes greed, and fosters social security in the Muslim ummah.',
    ],
  },
  {
    id: 'understanding-nisab',
    title: 'Understanding Nisab',
    summary: 'The minimum wealth threshold before Zakat becomes due.',
    body: [
      'Nisab is the minimum monetary threshold of wealth a Muslim must own before Zakat becomes due.',
      'Calculated as 52.5 Tolas (612.36g) of Silver or 7.5 Tolas (87.48g) of Gold.',
      'If net wealth remains above Nisab for a full lunar year (Hawl), 2.5% Zakat is due.',
    ],
  },
  {
    id: 'crypto-zakat',
    title: 'Cryptocurrency Zakat Rules',
    summary: 'How Zakat applies to Bitcoin, Ethereum, and digital assets.',
    body: [
      'Crypto held for trading or investment is zakatable at 2.5% of its current market exchange value in local currency (PKR) at your Zakat anniversary.',
      'NFTs and digital assets bought for reselling are treated as commercial trade merchandise.',
    ],
  },
  {
    id: 'pension-zakat',
    title: 'Pension & Provident Fund Zakat',
    summary: 'Zakat rules on retirement accounts and EPF.',
    body: [
      'Zakat is payable on pension funds that you voluntarily contribute to and have unconditional access/withdrawal rights over.',
      'Compulsory non-withdrawable employer pension funds are zakatable upon actual receipt.',
    ],
  },
  {
    id: 'stocks-zakat',
    title: 'Stocks & Mutual Funds',
    summary: 'Calculating Zakat on share portfolios.',
    body: [
      'If held for short-term trading: Zakat is paid on 100% of current portfolio market value at 2.5%.',
      'If held for long-term dividends: Zakat is paid on net liquid assets of the underlying company (~25-30% estimate) or dividend income.',
    ],
  },
];

export const ZakatGuidanceScreen = ({ onBack }) => {
  const { t, language, themeColors, isRTL } = useLanguage();
  const isUr = language === 'ur';

  const [query, setQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);

  const guidanceTopics = GUIDANCE_TOPICS_EN;

  const filteredTopics = useMemo(() => {
    if (!query.trim()) return guidanceTopics;
    const q = query.trim().toLowerCase();
    return guidanceTopics.filter(
      (item) => item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q)
    );
  }, [query, guidanceTopics]);

  if (selectedTopic) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />
        <View style={[styles.headerRow, isRTL && styles.rtlRow]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedTopic(null)} activeOpacity={0.7}>
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
          placeholder="Search topics, rulings, Crypto, Stocks..."
          placeholderTextColor={themeColors.textMuted}
          style={[styles.searchInput, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {/* 8 Asnaf Categories Section */}
        <View style={[styles.asnafCard, { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder }]}>
          <View style={styles.asnafHeader}>
            <Ionicons name="heart" size={20} color={themeColors.primary} />
            <Text style={[styles.asnafTitle, { color: themeColors.primary }]}>The 8 Eligible Asnaf (Recipients)</Text>
          </View>
          <Text style={[styles.asnafSub, { color: themeColors.textSecondary }]}>
            Surah At-Tawbah (9:60) specifies exactly 8 categories eligible to receive Zakat:
          </Text>

          <View style={styles.asnafGrid}>
            {ASNAF_CATEGORIES.map((cat) => (
              <View key={cat.id} style={[styles.asnafItem, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
                <View style={styles.asnafTopRow}>
                  <Text style={[styles.asnafName, { color: themeColors.textPrimary }]}>{cat.name}</Text>
                  <Text style={[styles.asnafArabic, { color: themeColors.primary }]}>{cat.arabic}</Text>
                </View>
                <Text style={[styles.asnafDesc, { color: themeColors.textSecondary }]}>{cat.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Guidance Topics */}
        <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }]}>Knowledge & Rulings</Text>
        {filteredTopics.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.row, { borderBottomColor: themeColors.border }, isRTL && styles.rtlRow]}
            onPress={() => setSelectedTopic(item)}
            activeOpacity={0.6}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: themeColors.textPrimary }]}>{item.title}</Text>
              <Text style={[styles.rowSummary, { color: themeColors.textMuted }]} numberOfLines={1}>
                {item.summary}
              </Text>
            </View>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={themeColors.textMuted} />
          </TouchableOpacity>
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
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  asnafCard: { padding: 18, borderRadius: 20, borderWidth: 1.5, marginBottom: 20 },
  asnafHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  asnafTitle: { fontSize: 17, fontWeight: '800' },
  asnafSub: { fontSize: 12, lineHeight: 18, marginBottom: 14 },
  asnafGrid: { gap: 10 },
  asnafItem: { padding: 12, borderRadius: 12, borderWidth: 1 },
  asnafTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  asnafName: { fontSize: 13, fontWeight: '800' },
  asnafArabic: { fontSize: 14, fontWeight: '700' },
  asnafDesc: { fontSize: 12, lineHeight: 16 },
  sectionHeading: { fontSize: 18, fontWeight: '800', marginBottom: 10, marginTop: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  rowTitle: { fontSize: 15, fontWeight: '700' },
  rowSummary: { fontSize: 13, marginTop: 2 },
  detailContent: { padding: 20, gap: 14 },
  paragraph: { fontSize: 15, lineHeight: 24 },
  rtlText: { textAlign: 'right' },
});
