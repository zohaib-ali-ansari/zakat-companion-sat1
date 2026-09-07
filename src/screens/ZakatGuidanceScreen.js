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

// Mock data for the Zakat Guidance feature.
// This will later be replaced by real content from the backend/CMS.
const GUIDANCE_TOPICS = [
  {
    id: 'what-is-zakat',
    title: 'What is Zakat?',
    section: 'fundamentals',
    summary: 'The basic meaning and purpose of Zakat as one of the pillars of Islam.',
    body: [
      'Zakat is one of the five pillars of Islam. It is an obligatory act of worship that requires eligible Muslims to give a portion of their wealth to those in need.',
      'The word Zakat means "purification" and "growth" - giving Zakat purifies the remaining wealth and is believed to bring blessing (barakah) to it.',
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
      'It is commonly calculated using the value of 87.48 grams of gold or 612.36 grams of silver, whichever calculation the person follows.',
      'If your total zakatable wealth stays above the Nisab threshold for a full lunar year (Hawl), Zakat becomes due on it.',
    ],
  },
  {
    id: 'hawl',
    title: 'The Hawl (Zakat Year)',
    section: 'fundamentals',
    summary: 'The one lunar year a person must hold wealth above Nisab before Zakat is due.',
    body: [
      'Hawl refers to the completion of one full lunar (Islamic) year of ownership over wealth that remains above the Nisab threshold.',
      'If your wealth drops below Nisab at any point during the year, the Hawl typically restarts once it rises above the threshold again.',
      'Many people choose a fixed date each year (such as Ramadan) to calculate their Zakat consistently.',
    ],
  },
  {
    id: 'who-must-pay',
    title: 'Who Must Pay Zakat?',
    section: 'fundamentals',
    summary: 'The conditions that make Zakat obligatory on a person.',
    body: [
      'Zakat is obligatory on every adult Muslim who is sane and owns wealth equal to or above the Nisab threshold for a full lunar year.',
      'This applies regardless of gender, and includes wealth held in cash, gold, silver, business assets, and other applicable categories.',
      'Debts owed by the person may be deducted before calculating whether their net wealth meets the Nisab.',
    ],
  },
  {
    id: 'who-can-receive',
    title: 'Who Can Receive Zakat?',
    section: 'fundamentals',
    summary: 'The categories of people eligible to receive Zakat.',
    body: [
      'Zakat can only be given to specific categories of people, traditionally identified as: the poor, the needy, those employed to collect Zakat, those whose hearts are to be reconciled, people in bondage or captivity, those in debt, in the cause of Allah, and stranded travelers.',
      'Zakat cannot be given to your direct dependents (such as your own children or spouse) or to non-eligible categories outside these groups.',
      'Many people choose to give their Zakat through trusted, registered organizations to ensure it reaches eligible recipients correctly.',
    ],
  },
  {
    id: 'gold-silver',
    title: 'Gold & Silver',
    section: 'assets',
    summary: 'How Zakat applies to gold and silver holdings.',
    body: [
      'Gold and silver are zakatable assets regardless of whether they are held as jewelry, coins, or bullion, according to many scholars.',
      'The value is typically calculated using the current market rate at the time of your Zakat calculation.',
      'The standard Zakat rate of 2.5% applies to the total value of gold and silver owned.',
    ],
  },
  {
    id: 'cash-bank',
    title: 'Cash & Bank Accounts',
    section: 'assets',
    summary: 'How Zakat applies to cash on hand and bank balances.',
    body: [
      'All cash on hand, and balances in savings or current bank accounts, are zakatable at 2.5% of the total amount.',
      'This includes money held in different currencies, converted to your local currency at the time of calculation.',
    ],
  },
  {
    id: 'shares-investments',
    title: 'Shares & Investments',
    section: 'assets',
    summary: 'How Zakat applies to stocks, mutual funds, and similar investments.',
    body: [
      'Zakat treatment for shares depends on intent: shares held for trading are generally valued at full market price, while long-term investment holdings may only require Zakat on the underlying zakatable assets of the company.',
      'It is recommended to consult a knowledgeable source for investment portfolios with mixed asset types.',
    ],
  },
  {
    id: 'faq-crypto',
    title: 'Is cryptocurrency subject to Zakat?',
    section: 'faqs',
    summary: 'Most scholars treat cryptocurrency as a zakatable asset.',
    body: [
      'Most contemporary scholars consider cryptocurrency to be a zakatable asset, similar to cash, since it is held as a store of value or for trading.',
      'The value is calculated using the market rate on the date of your Zakat calculation.',
    ],
  },
  {
    id: 'faq-business',
    title: 'How is Zakat calculated on business inventory?',
    section: 'faqs',
    summary: 'Business inventory held for sale is zakatable at its current market value.',
    body: [
      'Inventory held for the purpose of resale is zakatable at its current market value, not its original purchase cost.',
      'Fixed assets used to run the business, such as equipment or shop fittings, are generally not zakatable.',
    ],
  },
];

const SECTIONS = [
  { key: 'fundamentals', title: 'Fundamentals' },
  { key: 'assets', title: 'Asset Types' },
  { key: 'faqs', title: 'FAQs' },
];

export const ZakatGuidanceScreen = ({ onBack }) => {
  const { t, themeColors } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);

  const filteredTopics = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return GUIDANCE_TOPICS.filter(
      (topicItem) =>
        topicItem.title.toLowerCase().includes(q) || topicItem.summary.toLowerCase().includes(q)
    );
  }, [query]);

  const isSearching = query.trim().length > 0;

  // ---------- Detail view ----------
  if (selectedTopic) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setSelectedTopic(null)}
            activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={themeColors.primary} />
            <Text style={[styles.backText, { color: themeColors.primary }]}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]} numberOfLines={1}>
            {selectedTopic.title}
          </Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView contentContainerStyle={styles.detailContent}>
          {selectedTopic.body.map((paragraph, i) => (
            <Text key={i} style={[styles.paragraph, { color: themeColors.textSecondary }]}>
              {paragraph}
            </Text>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ---------- List view ----------
  const renderRow = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.row, { borderBottomColor: themeColors.border }]}
      onPress={() => setSelectedTopic(item)}
      activeOpacity={0.6}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: themeColors.textPrimary }]}>{item.title}</Text>
        <Text style={[styles.rowSummary, { color: themeColors.textMuted }]} numberOfLines={1}>
          {item.summary}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={themeColors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />

      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={themeColors.primary} />
          <Text style={[styles.backText, { color: themeColors.primary }]}>{t('backBtn')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
          {t('zakatGuidanceTitle')}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={[styles.searchBar, { borderColor: themeColors.border, backgroundColor: themeColors.cardBg }]}>
        <Ionicons name="search" size={18} color={themeColors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search topics, rulings..."
          placeholderTextColor={themeColors.textMuted}
          style={[styles.searchInput, { color: themeColors.textPrimary }]}
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
              No topics match your search.
            </Text>
          }
        />
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {SECTIONS.map((section) => {
            const items = GUIDANCE_TOPICS.filter((topicItem) => topicItem.section === section.key);
            if (items.length === 0) return null;
            return (
              <View key={section.key}>
                <Text style={[styles.sectionHeader, { color: themeColors.textMuted }]}>
                  {section.title.toUpperCase()}
                </Text>
                {items.map((item) => renderRow(item))}
              </View>
            );
          })}
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
  sectionHeader: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginTop: 18, marginBottom: 6 },
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
});
