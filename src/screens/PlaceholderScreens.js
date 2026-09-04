import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { Header } from '../components/Header';

const BasePlaceholderScreen = ({ iconName, titleKey, subKey, onOpenSettings, onAction }) => {
  const { t, isRTL } = useLanguage();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Header onOpenSettings={onOpenSettings} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name={iconName} size={40} color={colors.primary} />
          </View>
          <Text style={[styles.title, isRTL && styles.rtlText]}>{t(titleKey)}</Text>
          <Text style={[styles.sub, isRTL && styles.rtlText]}>{t(subKey)}</Text>

          {onAction && (
            <TouchableOpacity style={styles.actionBtn} onPress={onAction} activeOpacity={0.8}>
              <Text style={styles.actionBtnText}>{t('calculateZakatBtn')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export const CalculatorScreen = ({ onOpenSettings }) => (
  <BasePlaceholderScreen
    iconName="calculator"
    titleKey="calculatorTitle"
    subKey="calculatorSub"
    onOpenSettings={onOpenSettings}
    onAction={() => {}}
  />
);

export const TrackScreen = ({ onOpenSettings }) => (
  <BasePlaceholderScreen
    iconName="stats-chart"
    titleKey="trackTitle"
    subKey="trackSub"
    onOpenSettings={onOpenSettings}
  />
);

export const HistoryScreen = ({ onOpenSettings }) => (
  <BasePlaceholderScreen
    iconName="time"
    titleKey="historyTitle"
    subKey="historySub"
    onOpenSettings={onOpenSettings}
  />
);

export const AssistantScreen = ({ onOpenSettings, onChangeLanguage }) => (
  <SafeAreaView style={styles.safeArea}>
    <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
    <Header onOpenSettings={onOpenSettings} />

    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="hardware-chip" size={40} color={colors.primary} />
        </View>
        <Text style={styles.title}>Zakat AI Assistant</Text>
        <Text style={styles.sub}>
          Ask any questions regarding Islamic Zakat rulings, Nisab rates, or calculation formulas.
        </Text>

        {onChangeLanguage && (
          <TouchableOpacity style={styles.actionBtn} onPress={onChangeLanguage} activeOpacity={0.8}>
            <Ionicons name="globe-outline" size={18} color={colors.white} />
            <Text style={styles.actionBtnText}>Change Language</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  sub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  rtlText: {
    textAlign: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
  },
  actionBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
