import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

export const SplashScreen = ({ onGetStarted }) => {
  const { t, themeColors } = useLanguage();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />

      <View style={styles.content}>
        {/* Emblem Logo */}
        <View style={[styles.logoGlow, { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder }]}>
          <Ionicons name="sparkles" size={54} color={themeColors.primary} />
        </View>

        <Text style={[styles.appTitle, { color: themeColors.textPrimary }]}>
          {t('appTitle')}
        </Text>

        <Text style={[styles.tagline, { color: themeColors.textSecondary }]}>
          {t('splashTagline')}
        </Text>

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: themeColors.primary }]}
          onPress={onGetStarted}
          activeOpacity={0.85}
        >
          <Text style={styles.startButtonText}>{t('getStarted')}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoGlow: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#1A4FD6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  appTitle: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 50,
    paddingHorizontal: 12,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 30,
    gap: 10,
    shadowColor: '#1A4FD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
