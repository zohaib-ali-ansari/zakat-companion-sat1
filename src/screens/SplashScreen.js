import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

export const SplashScreen = ({ onGetStarted }) => {
  const { themeColors } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      onGetStarted?.();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onGetStarted]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />

      <View style={styles.content}>
        {/* App Logo Only */}
        <View style={[styles.logoGlow, { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder }]}>
          <Ionicons name="sparkles" size={56} color={themeColors.primary} />
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoGlow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A4FD6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
});
