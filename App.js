import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { SplashScreen } from './src/screens/SplashScreen';
import { LanguageSelectionScreen } from './src/screens/LanguageSelectionScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { SignUpScreen } from './src/screens/SignUpScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { CalculatorScreen } from './src/screens/CalculatorScreen';
import { ProfileSettingsScreen } from './src/screens/ProfileSettingsScreen';
import { PrivacyPolicyScreen } from './src/screens/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from './src/screens/TermsOfServiceScreen';
import { ZakatGuidanceScreen } from './src/screens/ZakatGuidanceScreen';
import { CalculatedZakatExplanationScreen } from './src/screens/CalculatedZakatExplanationScreen';
import { TrackScreen, HistoryScreen } from './src/screens/PlaceholderScreens';
import { AssistantScreen } from './src/screens/AssistantScreen';
import { BottomNavigation } from './src/components/BottomNavigation';

function MainAppContent() {
  const { isDarkMode, themeColors } = useLanguage();
  
  // Navigation Flow State: 'splash' -> 'language' -> 'login' -> 'app'
  const [authFlow, setAuthFlow] = useState('splash');
  const [activeTab, setActiveTab] = useState('home');

  // 1. Splash Screen
  if (authFlow === 'splash') {
    return <SplashScreen onGetStarted={() => setAuthFlow('language')} />;
  }

  // 2. Language Selection Onboarding
  if (authFlow === 'language') {
    return <LanguageSelectionScreen onContinue={() => setAuthFlow('login')} />;
  }

  // 3. Auth Screens
  if (authFlow === 'login') {
    return (
      <LoginScreen
        onLoginSuccess={() => setAuthFlow('app')}
        onNavigateSignUp={() => setAuthFlow('signup')}
        onNavigateForgot={() => setAuthFlow('forgot')}
      />
    );
  }

  if (authFlow === 'signup') {
    return (
      <SignUpScreen
        onSignUpSuccess={() => setAuthFlow('app')}
        onNavigateLogin={() => setAuthFlow('login')}
      />
    );
  }

  if (authFlow === 'forgot') {
    return <ForgotPasswordScreen onNavigateLogin={() => setAuthFlow('login')} />;
  }

  // 4. Dedicated Full-Screen Modals / Legal Screens
  if (activeTab === 'settings') {
    return (
      <ProfileSettingsScreen
        onClose={() => setActiveTab('home')}
        onSignOut={() => setAuthFlow('login')}
        onOpenPrivacy={() => setActiveTab('privacy')}
        onOpenTerms={() => setActiveTab('terms')}
        onOpenGuidance={() => setActiveTab('guidance')}
        onOpenExplanation={() => setActiveTab('explanation')}
      />
    );
  }

  if (activeTab === 'privacy') {
    return <PrivacyPolicyScreen onBack={() => setActiveTab('settings')} />;
  }

  if (activeTab === 'terms') {
    return <TermsOfServiceScreen onBack={() => setActiveTab('settings')} />;
  }

  if (activeTab === 'guidance') {
    return <ZakatGuidanceScreen onBack={() => setActiveTab('settings')} />;
  }

  if (activeTab === 'explanation') {
    return <CalculatedZakatExplanationScreen onBack={() => setActiveTab('settings')} />;
  }

  // 5. Main Tab Controller View
  const renderScreen = () => {
    switch (activeTab) {
      case 'calculator':
        return <CalculatorScreen onOpenSettings={() => setActiveTab('settings')} />;
      case 'track':
        return <TrackScreen onOpenSettings={() => setActiveTab('settings')} />;
      case 'history':
        return <HistoryScreen onOpenSettings={() => setActiveTab('settings')} />;
      case 'assistant':
        return (
          <AssistantScreen
            onOpenSettings={() => setActiveTab('settings')}
            onChangeLanguage={() => setAuthFlow('language')}
          />
        );
      case 'home':
      default:
        return (
          <DashboardScreen
            onOpenSettings={() => setActiveTab('settings')}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        );
    }
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: themeColors.background }]}>
      <View style={styles.screenContainer}>{renderScreen()}</View>
      <BottomNavigation
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId)}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={styles.appContainer}>
      <StatusBar style="auto" />
      <LanguageProvider>
        <MainAppContent />
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
});