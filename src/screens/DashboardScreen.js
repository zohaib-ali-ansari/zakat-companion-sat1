import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { Header } from '../components/Header';
import { SummaryCard } from '../components/SummaryCard';
import { QuickActionGrid } from '../components/QuickActionCard';
import { StatusBanner } from '../components/StatusBanner';
import { AssetItem } from '../components/AssetItem';
import { LiveRatesWidget } from '../components/LiveRatesWidget';

export const DashboardScreen = ({ onOpenSettings, onNavigateTab }) => {
  const { t, isRTL, themeColors } = useLanguage();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />
      
      {/* Top Navigation Header */}
      <Header onOpenSettings={onOpenSettings} />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Greeting Section */}
        <View style={[styles.greetingContainer, isRTL && styles.rtlAlign]}>
          <Text style={[styles.greetingText, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {t('greeting')}
          </Text>
          <Text style={[styles.greetingSubText, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            {t('greetingSub')}
          </Text>
        </View>

        {/* Zakat Remaining Summary Card */}
        <SummaryCard onCalculatePress={() => onNavigateTab('calculator')} />

        {/* Quick Action Grid */}
        <QuickActionGrid onSelectAction={(actionId) => onNavigateTab(actionId)} />

        {/* Live Asset Rates Widget */}
        <LiveRatesWidget onPress={() => onNavigateTab('liveRates')} />

        {/* Nisab Status Banner */}
        <StatusBanner />

        {/* Assets Breakdown Section */}
        <View style={styles.assetsSection}>
          <View style={[styles.assetsHeader, isRTL && styles.rtlRow]}>
            <Text style={[styles.assetsTitle, { color: themeColors.textPrimary }]}>
              {t('assetDetailsTitle')}
            </Text>
            <View style={[styles.yearTag, { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder }]}>
              <Text style={[styles.yearTagText, { color: themeColors.primary }]}>
                {t('yearTag')}
              </Text>
            </View>
          </View>

          <View style={[styles.assetsCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <AssetItem
              label={t('goldSilver')}
              value={t('goldSilverValue')}
            />
            <AssetItem
              label={t('cashInBank')}
              value={t('cashInBankValue')}
            />
            <AssetItem
              label={t('investments')}
              value={t('investmentsValue')}
            />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  greetingContainer: {
    paddingHorizontal: 24,
    marginTop: 10,
    marginBottom: 8,
  },
  rtlAlign: {
    alignItems: 'flex-end',
  },
  greetingText: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 38,
  },
  greetingSubText: {
    fontSize: 14,
    marginTop: 4,
  },
  rtlText: {
    textAlign: 'right',
  },
  assetsSection: {
    paddingHorizontal: 20,
    marginTop: 6,
  },
  assetsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  assetsTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  yearTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  yearTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  assetsCard: {
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
});
