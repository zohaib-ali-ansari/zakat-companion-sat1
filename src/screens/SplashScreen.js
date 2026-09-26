import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
        {/* Official App Logo */}
        <Image
          source={require('../../assets/logo.png')}
          style={styles.splashLogo}
          resizeMode="contain"
        />
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
    paddingHorizontal: 30,
  },
  splashLogo: {
    width: 300,
    height: 220,
  },
});
