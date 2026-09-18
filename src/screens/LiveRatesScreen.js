import React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { useZakat } from '../context/ZakatContext';

const formatPkr = (val) => `PKR ${Number(val || 0).toLocaleString('en-US')}`;

export default function LiveRatesScreen({ onBack, onNavigateCalculator }) {
  const { t, isRTL, themeColors } = useLanguage();
  const { liveRates, applyLiveRates } = useZakat();
  const insets = useSafeAreaInsets();

  const handleApply = () => {
    // Dynamically apply current live rates to context state
    applyLiveRates(liveRates);
    Alert.alert(
      t('appTitle'),
      `Live rates applied successfully!\n\nNisab (Silver): PKR ${liveRates.silverNisabPkr.toLocaleString()}\nGold (24k/Tola): PKR ${liveRates.gold24kTola.toLocaleString()}`,
      [
        {
          text: 'Open Calculator',
          onPress: () => onNavigateCalculator?.(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />

      <View style={[styles.topHeader, { paddingTop: Math.max(insets.top + 4, 14) }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
          onPress={() => onBack?.()}
          activeOpacity={0.7}
        >
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={20} color={themeColors.primary} />
        </TouchableOpacity>
        <Text style={[styles.topHeaderTitle, { color: themeColors.textPrimary }]}>
          {t('liveRatesTitle')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {t('liveRatesTitle')}
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            Official daily metal & currency market rates in Pakistan
          </Text>
        </View>

        {/* Timestamp & Provider Badge */}
        <View style={[styles.metaCard, { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder }]}>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={16} color={themeColors.primary} />
            <Text style={[styles.metaText, { color: themeColors.primary }]}>
              Last updated: {liveRates.lastUpdated || 'Today, 9:45 PM'}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="shield-checkmark-outline" size={16} color={themeColors.primary} />
            <Text style={[styles.metaText, { color: themeColors.primary }]}>
              Source: {liveRates.source || 'Sarafa Market / State Bank of Pakistan'}
            </Text>
          </View>
        </View>

        {/* Nisab Benchmarks */}
        <View style={[styles.sectionCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.primaryBorder }]}>
          <View style={[styles.sectionHeader, isRTL && styles.rtlRow]}>
            <Ionicons name="sparkles" size={20} color={themeColors.primary} />
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Nisab Benchmarks</Text>
          </View>

          <View style={[styles.rateRow, isRTL && styles.rtlRow]}>
            <View>
              <Text style={[styles.rateLabel, { color: themeColors.textPrimary }]}>{t('nisabSilverLabel')}</Text>
              <Text style={[styles.unitSub, { color: themeColors.textMuted }]}>52.5 Tolas (612.36g Silver)</Text>
            </View>
            <Text style={[styles.rateVal, { color: themeColors.primary }]}>{formatPkr(liveRates.silverNisabPkr)}</Text>
          </View>

          <View style={[styles.rateRow, isRTL && styles.rtlRow]}>
            <View>
              <Text style={[styles.rateLabel, { color: themeColors.textPrimary }]}>{t('nisabGoldLabel')}</Text>
              <Text style={[styles.unitSub, { color: themeColors.textMuted }]}>7.5 Tolas (87.48g Gold)</Text>
            </View>
            <Text style={[styles.rateVal, { color: themeColors.textPrimary }]}>{formatPkr(liveRates.goldNisabPkr)}</Text>
          </View>
        </View>

        {/* Live Precious Metals */}
        <View style={[styles.sectionCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <View style={[styles.sectionHeader, isRTL && styles.rtlRow]}>
            <Ionicons name="cube-outline" size={20} color={themeColors.primary} />
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Precious Metals & Forex</Text>
          </View>

          <View style={[styles.rateRow, isRTL && styles.rtlRow]}>
            <Text style={[styles.rateLabel, { color: themeColors.textSecondary }]}>{t('goldRateLabel')}</Text>
            <Text style={[styles.rateVal, { color: themeColors.textPrimary }]}>{formatPkr(liveRates.gold24kTola)} / Tola</Text>
          </View>

          <View style={[styles.rateRow, isRTL && styles.rtlRow]}>
            <Text style={[styles.rateLabel, { color: themeColors.textSecondary }]}>{t('silverRateLabel')}</Text>
            <Text style={[styles.rateVal, { color: themeColors.textPrimary }]}>{formatPkr(liveRates.silver24kTola)} / Tola</Text>
          </View>

          <View style={[styles.rateRow, isRTL && styles.rtlRow]}>
            <Text style={[styles.rateLabel, { color: themeColors.textSecondary }]}>{t('usdRateLabel')}</Text>
            <Text style={[styles.rateVal, { color: themeColors.textPrimary }]}>PKR {liveRates.usdToPkr}</Text>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.applyBtn, { backgroundColor: themeColors.primary }]}
          onPress={handleApply}
          activeOpacity={0.85}
        >
          <Ionicons name="calculator-outline" size={20} color="#FFFFFF" />
          <Text style={styles.applyBtnText}>Apply Rates to Calculator</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  titleSection: {
    marginTop: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  rtlText: {
    textAlign: 'right',
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  metaCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    gap: 6,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 12, fontWeight: '700' },
  sectionCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    marginBottom: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rateLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  unitSub: {
    fontSize: 11,
    marginTop: 2,
  },
  rateVal: {
    fontSize: 15,
    fontWeight: '800',
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    borderRadius: 27,
    gap: 10,
    marginTop: 10,
    shadowColor: '#1A4FD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
