import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BottomNavigation } from './src/components/BottomNavigation';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { ZakatProvider } from './src/context/ZakatContext';
import AddPaymentScreen from './src/screens/AddPaymentScreen';
import { AssistantScreen } from './src/screens/AssistantScreen';
import { CalculatedZakatExplanationScreen } from './src/screens/CalculatedZakatExplanationScreen';
import { CalculatorScreen } from './src/screens/CalculatorScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import HistoryRecordsScreen from './src/screens/HistoryRecordsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import HistoryYearDetailScreen from './src/screens/HistoryYearDetailScreen';
import { LanguageSelectionScreen } from './src/screens/LanguageSelectionScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { PrivacyPolicyScreen } from './src/screens/PrivacyPolicyScreen';
import { ProfileSettingsScreen } from './src/screens/ProfileSettingsScreen';
import { ResetPasswordScreen } from './src/screens/ResetPasswordScreen';
import { SignUpScreen } from './src/screens/SignUpScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { TermsOfServiceScreen } from './src/screens/TermsOfServiceScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import { ZakatGuidanceScreen } from './src/screens/ZakatGuidanceScreen';
import { forgotPassword, loginUser, registerUser, resetPassword } from './src/services/authApi';

function MainAppContent() {
  const { themeColors } = useLanguage();

  const [authFlow, setAuthFlow] = useState('splash');
  const [activeTab, setActiveTab] = useState('home');
  const [historyView, setHistoryView] = useState('list');
  const [selectedYear, setSelectedYear] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');

  useEffect(() => {
    const parseResetUrl = (url) => {
      if (!url) return;

      try {
        const parsedUrl = new URL(url);
        const token = parsedUrl.searchParams.get('token');
        const email = parsedUrl.searchParams.get('email');

        if (token && email) {
          setResetToken(token);
          setResetEmail(email);
          setAuthFlow('reset');
          setAuthError('');
          return;
        }
      } catch (error) {
        console.warn('Unable to parse reset link:', error);
      }

      Alert.alert('Invalid reset link', 'The reset link is missing the required token or email.');
    };

    const subscription = Linking.addEventListener('url', ({ url }) => parseResetUrl(url));

    Linking.getInitialURL().then((url) => {
      if (url) {
        parseResetUrl(url);
      }
    });

    return () => {
      subscription?.remove?.();
    };
  }, []);

  const handleLogin = async (emailValue, passwordValue) => {
    const trimmedEmail = emailValue?.trim();
    const trimmedPassword = passwordValue?.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setAuthError('Email or password is wrong');
      Alert.alert('Login failed', 'Email or password is wrong');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setAuthError('Email or password is wrong');
      Alert.alert('Login failed', 'Email or password is wrong');
      return;
    }

    if (trimmedPassword.length < 6) {
      setAuthError('Email or password is wrong');
      Alert.alert('Login failed', 'Email or password is wrong');
      return;
    }

    setAuthError('');
    setIsAuthenticating(true);

    try {
      const result = await loginUser(trimmedEmail, trimmedPassword);
      if (result?.token) {
        setAuthFlow('app');
      }
    } catch (error) {
      const message = 'Email or password is wrong';
      setAuthError(message);
      Alert.alert('Login failed', message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignUp = async (nameValue, emailValue, passwordValue) => {
    const trimmedName = nameValue?.trim();
    const trimmedEmail = emailValue?.trim();
    const trimmedPassword = passwordValue?.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      setAuthError('Please fill in all fields.');
      Alert.alert('Missing details', 'Please fill in your name, email, and password.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setAuthError('Please enter a valid email address.');
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    if (trimmedPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    setAuthError('');
    setIsAuthenticating(true);

    try {
      const result = await registerUser(trimmedName, trimmedEmail, trimmedPassword);
      if (result?.success) {
        Alert.alert(
          'OTP sent',
          'A 6-digit OTP has been sent to your email address. Please verify it to complete registration.'
        );
        setAuthFlow('login');
      }
    } catch (error) {
      const message = error?.message || 'Unable to create account.';
      setAuthError(message);
      Alert.alert('Signup failed', message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleForgotPassword = async (emailValue) => {
    const trimmedEmail = emailValue?.trim();

    if (!trimmedEmail) {
      setAuthError('Please enter your email address.');
      Alert.alert('Missing email', 'Please enter your email address.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setAuthError('Please enter a valid email address.');
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    setAuthError('');
    setIsAuthenticating(true);

    try {
      const result = await forgotPassword(trimmedEmail);
      if (result?.success) {
        Alert.alert('Reset link sent', 'A password reset link has been sent to your email address.');
      }
      return result;
    } catch (error) {
      const message = error?.message || 'Unable to send reset instructions.';
      setAuthError(message);
      Alert.alert('Reset failed', message);
      return null;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleResetPassword = async (newPasswordValue, confirmPasswordValue) => {
    if (!resetEmail || !resetToken) {
      const message = 'This reset link is invalid or expired.';
      setAuthError(message);
      Alert.alert('Invalid reset link', message);
      return { success: false };
    }

    setAuthError('');
    setIsAuthenticating(true);

    try {
      const result = await resetPassword({
        email: resetEmail,
        token: resetToken,
        newPassword: newPasswordValue,
        confirmPassword: confirmPasswordValue,
      });

      if (result?.success) {
        Alert.alert('Password updated', 'Your password has been reset successfully.');
        setResetToken('');
        setResetEmail('');
        setAuthFlow('login');
        return { success: true };
      }

      return { success: false };
    } catch (error) {
      const message = error?.message || 'Unable to reset your password.';
      setAuthError(message);
      Alert.alert('Reset failed', message);
      return { success: false };
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (authFlow === 'splash') {
    return <SplashScreen onGetStarted={() => setAuthFlow('language')} />;
  }

  if (authFlow === 'language') {
    return <LanguageSelectionScreen onContinue={() => setAuthFlow('login')} />;
  }

  if (authFlow === 'login') {
    return (
      <LoginScreen
        onLoginSuccess={handleLogin}
        onNavigateSignUp={() => setAuthFlow('signup')}
        onNavigateForgot={() => setAuthFlow('forgot')}
        isLoading={isAuthenticating}
        submitError={authError}
      />
    );
  }

  if (authFlow === 'signup') {
    return (
      <SignUpScreen
        onSignUpSuccess={handleSignUp}
        onNavigateLogin={() => setAuthFlow('login')}
        isLoading={isAuthenticating}
        submitError={authError}
      />
    );
  }

  if (authFlow === 'forgot') {
    return (
      <ForgotPasswordScreen
        onNavigateLogin={() => setAuthFlow('login')}
        onSendResetRequest={handleForgotPassword}
        isLoading={isAuthenticating}
        submitError={authError}
      />
    );
  }

  if (authFlow === 'reset') {
    return (
      <ResetPasswordScreen
        email={resetEmail}
        token={resetToken}
        onSubmit={handleResetPassword}
        onNavigateLogin={() => {
          setResetToken('');
          setResetEmail('');
          setAuthFlow('login');
        }}
        isLoading={isAuthenticating}
        submitError={authError}
      />
    );
  }

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

  const renderScreen = () => {
    if (activeTab === 'addPayment') {
      return <AddPaymentScreen onBack={() => setActiveTab('track')} />;
    }

    if (activeTab === 'history' && historyView === 'detail') {
      return (
        <HistoryYearDetailScreen
          year={selectedYear}
          onBack={() => {
            setHistoryView('list');
            setSelectedYear(null);
          }}
        />
      );
    }

    if (activeTab === 'history' && historyView === 'records') {
      return (
        <HistoryRecordsScreen
          onBack={() => setHistoryView('list')}
          onOpenSettings={() => setActiveTab('settings')}
        />
      );
    }

    switch (activeTab) {
      case 'calculator':
        return <CalculatorScreen onOpenSettings={() => setActiveTab('settings')} />;
      case 'track':
        return (
          <TrackingScreen
            onOpenSettings={() => setActiveTab('settings')}
            onAddPayment={() => setActiveTab('addPayment')}
          />
        );
      case 'history':
        return (
          <HistoryScreen
            onOpenSettings={() => setActiveTab('settings')}
            onOpenYearDetail={(year) => {
              setSelectedYear(year);
              setHistoryView('detail');
            }}
            onOpenAllRecords={() => setHistoryView('records')}
          />
        );
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
      <BottomNavigation activeTab={activeTab} onSelectTab={(tabId) => setActiveTab(tabId)} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={styles.appContainer}>
      <StatusBar style="auto" />
      <LanguageProvider>
        <ZakatProvider>
          <MainAppContent />
        </ZakatProvider>
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
