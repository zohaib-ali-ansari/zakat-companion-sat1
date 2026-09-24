import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BottomNavigation } from './src/components/BottomNavigation';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { ZakatProvider, useZakat } from './src/context/ZakatContext';
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
import DisasterReliefScreen from './src/screens/DisasterReliefScreen';
import OrganizationPortalScreen from './src/screens/OrganizationPortalScreen';
import LiveRatesScreen from './src/screens/LiveRatesScreen';
import { ReportExportModal } from './src/components/ReportExportModal';
import { CustomAlertModal } from './src/components/CustomAlertModal';
import { OtpVerificationScreen } from './src/screens/OtpVerificationScreen';
import { forgotPassword, loginUser, registerUser, resetPassword, resendOtpApi, verifyRegistrationOtp, verifyResetOtpApi } from './src/services/authApi';
import { getAuthToken, saveAuthToken, getUserData, saveUserData, clearAuthStorage } from './src/services/storage';

function MainAppContent() {
  const { themeColors } = useLanguage();
  const { setAuthToken, setCurrentUser } = useZakat();

  const [authFlow, setAuthFlow] = useState('splash');
  const [activeTab, setActiveTab] = useState('home');
  const [historyView, setHistoryView] = useState('list');
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [activeCalculationData, setActiveCalculationData] = useState(null);

  // Auth state
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  // Custom Alert Modal state
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: null,
    onConfirm: null,
    onCancel: null,
  });

  const showAlert = (title, message, type = 'info', confirmText = 'OK', onConfirm = null, cancelText = null, onCancel = null) => {
    setCustomAlert({
      visible: true,
      title,
      message,
      type,
      confirmText,
      cancelText,
      onConfirm: () => {
        setCustomAlert((prev) => ({ ...prev, visible: false }));
        onConfirm?.();
      },
      onCancel: () => {
        setCustomAlert((prev) => ({ ...prev, visible: false }));
        onCancel?.();
      },
    });
  };

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await getAuthToken();
        const storedUser = await getUserData();

        if (storedToken) {
          setAuthToken(storedToken);
          if (storedUser) setCurrentUser(storedUser);
          setAuthFlow('app');
        }
      } catch (err) {
        console.warn('Error loading stored auth:', err);
      }
    };

    loadStoredAuth();
  }, []);

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
      showAlert('Login Failed', 'Email or password is wrong', 'error');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setAuthError('Email or password is wrong');
      showAlert('Login Failed', 'Email or password is wrong', 'error');
      return;
    }

    if (trimmedPassword.length < 6) {
      setAuthError('Email or password is wrong');
      showAlert('Login Failed', 'Email or password is wrong', 'error');
      return;
    }

    setAuthError('');
    setIsAuthenticating(true);

    try {
      const result = await loginUser(trimmedEmail, trimmedPassword);
      if (result?.token) {
        setAuthToken(result.token);
        await saveAuthToken(result.token);
        if (result.user) {
          setCurrentUser(result.user);
          await saveUserData(result.user);
        }
        setAuthFlow('app');
      }
    } catch (error) {
      if (error?.isEmailVerified === false) {
        setPendingEmail(error.email || trimmedEmail);
        setAuthError('Your email address is not verified yet.');
        showAlert(
          'Verification Required',
          'Your account is not verified yet. Please enter the 6-digit OTP sent to your email address.',
          'warning',
          'Verify OTP Now',
          () => setAuthFlow('otp')
        );
        return;
      }

      const message = error?.message || 'Email or password is wrong';
      setAuthError(message);
      showAlert('Login Failed', message, 'error');
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
      showAlert('Missing Details', 'Please fill in your name, email, and password.', 'warning');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setAuthError('Please enter a valid email address.');
      showAlert('Invalid Email', 'Please enter a valid email address.', 'warning');
      return;
    }

    if (trimmedPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      showAlert('Weak Password', 'Password must be at least 6 characters long.', 'warning');
      return;
    }

    setAuthError('');
    setIsAuthenticating(true);

    try {
      const result = await registerUser(trimmedName, trimmedEmail, trimmedPassword);
      if (result?.success) {
        setPendingEmail(trimmedEmail);
        setAuthFlow('otp');
        showAlert(
          'OTP Code Sent',
          `A 6-digit verification OTP has been sent to ${trimmedEmail}. Please enter it below to activate your account.`,
          'success'
        );
      }
    } catch (error) {
      const message = error?.message || 'Unable to create account.';
      setAuthError(message);
      showAlert('Sign Up Failed', message, 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleVerifyRegistrationOtp = async (otpValue) => {
    if (!pendingEmail) {
      setAuthError('Email missing for verification.');
      return;
    }

    setAuthError('');
    setIsAuthenticating(true);

    try {
      const result = await verifyRegistrationOtp(pendingEmail, otpValue);
      if (result?.success) {
        if (result.token) {
          setAuthToken(result.token);
          await saveAuthToken(result.token);
        }
        if (result.user) {
          setCurrentUser(result.user);
          await saveUserData(result.user);
        }
        setAuthFlow('app');
        setPendingEmail('');
        showAlert(
          'Account Verified',
          'Your email has been verified successfully. Welcome to Zakat Companion!',
          'success'
        );
      }
    } catch (error) {
      const message = error?.message || 'Invalid or expired OTP code.';
      setAuthError(message);
      showAlert('Verification Failed', message, 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleResendOtp = async (purpose = 'register') => {
    const targetEmail = pendingEmail || resetEmail;
    if (!targetEmail) {
      throw new Error('Email address not found.');
    }
    const result = await resendOtpApi(targetEmail, purpose);
    return result;
  };

  const handleForgotPassword = async (emailValue) => {
    const trimmedEmail = emailValue?.trim();

    if (!trimmedEmail) {
      setAuthError('Please enter your email address.');
      throw new Error('Please enter your email address.');
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setAuthError('Please enter a valid email address.');
      throw new Error('Please enter a valid email address.');
    }

    setAuthError('');
    setIsAuthenticating(true);

    try {
      const result = await forgotPassword(trimmedEmail);
      if (result?.success) {
        setResetEmail(trimmedEmail);
        setPendingEmail(trimmedEmail);
      }
      return result;
    } catch (error) {
      const message = error?.message || 'Unable to send reset code.';
      setAuthError(message);
      throw new Error(message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleVerifyResetOtp = async (emailValue, otpValue) => {
    const targetEmail = emailValue || resetEmail || pendingEmail;
    if (!targetEmail || !otpValue) {
      setAuthError('Email and OTP code are required.');
      throw new Error('Email and OTP code are required.');
    }

    setAuthError('');
    setIsAuthenticating(true);

    try {
      const result = await verifyResetOtpApi(targetEmail, otpValue);
      if (result?.success) {
        setResetEmail(targetEmail);
        setResetToken(otpValue);
        setAuthFlow('reset');
      }
      return result;
    } catch (error) {
      const message = error?.message || 'Invalid or expired OTP code.';
      setAuthError(message);
      throw new Error(message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleResetPassword = async (payload, newPasswordValue, confirmPasswordValue) => {
    let targetEmail = resetEmail || pendingEmail;
    let finalOtp = resetToken;
    let finalNewPass = newPasswordValue;
    let finalConfirmPass = confirmPasswordValue;

    if (payload && typeof payload === 'object') {
      targetEmail = payload.email || targetEmail;
      finalOtp = payload.otp || payload.token || finalOtp;
      finalNewPass = payload.newPassword || finalNewPass;
      finalConfirmPass = payload.confirmPassword || finalConfirmPass;
    } else if (typeof payload === 'string') {
      finalOtp = payload || finalOtp;
    }

    if (!targetEmail || !finalOtp) {
      const message = 'Missing verification session. Please request OTP again.';
      setAuthError(message);
      showAlert('Session Expired', message, 'warning');
      return { success: false };
    }

    setAuthError('');
    setIsAuthenticating(true);

    try {
      const result = await resetPassword({
        email: targetEmail,
        otp: finalOtp,
        newPassword: finalNewPass,
        confirmPassword: finalConfirmPass,
      });

      if (result?.success) {
        setResetToken('');
        setResetEmail('');
        setPendingEmail('');
        setAuthFlow('login');
        showAlert(
          'Password Reset Successful',
          'Your password has been updated. Please sign in with your new password.',
          'success'
        );
        return { success: true };
      }

      return { success: false };
    } catch (error) {
      const message = error?.message || 'Unable to reset your password.';
      setAuthError(message);
      showAlert('Reset Failed', message, 'error');
      return { success: false };
    } finally {
      setIsAuthenticating(false);
    }
  };

  const renderAuthScreens = () => {
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

    if (authFlow === 'otp') {
      return (
        <OtpVerificationScreen
          email={pendingEmail}
          onVerifyOtp={handleVerifyRegistrationOtp}
          onResendOtp={() => handleResendOtp('register')}
          onNavigateLogin={() => setAuthFlow('login')}
          isLoading={isAuthenticating}
          submitError={authError}
        />
      );
    }

    if (authFlow === 'forgot') {
      return (
        <ForgotPasswordScreen
          initialEmail={resetEmail || pendingEmail}
          onSendResetRequest={handleForgotPassword}
          onVerifyOtp={handleVerifyResetOtp}
          onNavigateLogin={() => {
            setAuthError('');
            setAuthFlow('login');
          }}
          isLoading={isAuthenticating}
          submitError={authError}
        />
      );
    }

    if (authFlow === 'reset') {
      return (
        <ResetPasswordScreen
          email={resetEmail || pendingEmail}
          token={resetToken}
          onSubmit={handleResetPassword}
          onNavigateForgot={() => {
            setAuthError('');
            setAuthFlow('forgot');
          }}
          onNavigateLogin={() => {
            setResetToken('');
            setResetEmail('');
            setPendingEmail('');
            setAuthFlow('login');
          }}
          isLoading={isAuthenticating}
          submitError={authError}
        />
      );
    }

    return null;
  };

  if (authFlow !== 'app') {
    return (
      <View style={{ flex: 1, backgroundColor: themeColors.background }}>
        {renderAuthScreens()}
        <CustomAlertModal {...customAlert} />
      </View>
    );
  }

  if (activeTab === 'settings') {
    return (
      <ProfileSettingsScreen
        onClose={() => setActiveTab('home')}
        onSignOut={async () => {
          await clearAuthStorage();
          setAuthToken(null);
          setCurrentUser(null);
          setAuthFlow('login');
        }}
        onOpenPrivacy={() => setActiveTab('privacy')}
        onOpenTerms={() => setActiveTab('terms')}
        onOpenGuidance={() => setActiveTab('guidance')}
        onOpenExplanation={() => setActiveTab('explanation')}
        onOpenDisasterRelief={() => setActiveTab('relief')}
        onOpenOrgPortal={() => setActiveTab('orgPortal')}
        onOpenLiveRates={() => setActiveTab('liveRates')}
        onExportReport={() => setReportModalVisible(true)}
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
    return (
      <CalculatedZakatExplanationScreen
        calculatedData={activeCalculationData}
        onBack={() => setActiveTab('calculator')}
        onStartTracking={() => setActiveTab('track')}
      />
    );
  }

  if (activeTab === 'relief') {
    return (
      <DisasterReliefScreen
        onBack={() => setActiveTab('home')}
        onNavigateAddPayment={(initialData) => {
          setEditingPayment(initialData);
          setActiveTab('addPayment');
        }}
        onNavigateOrgPortal={() => setActiveTab('orgPortal')}
      />
    );
  }

  if (activeTab === 'orgPortal') {
    return <OrganizationPortalScreen onBack={() => setActiveTab('relief')} />;
  }

  if (activeTab === 'liveRates') {
    return (
      <LiveRatesScreen
        onBack={() => setActiveTab('home')}
        onNavigateCalculator={() => setActiveTab('calculator')}
      />
    );
  }

  const renderScreen = () => {
    if (activeTab === 'addPayment') {
      return (
        <AddPaymentScreen
          onBack={() => {
            setActiveTab('track');
            setEditingPayment(null);
          }}
          editingPayment={editingPayment}
        />
      );
    }

    if (activeTab === 'history' && historyView === 'detail') {
      return (
        <HistoryYearDetailScreen
          year={selectedYear}
          cycle={selectedCycle}
          onBack={() => {
            setHistoryView('list');
            setSelectedYear(null);
            setSelectedCycle(null);
          }}
          onNavigateEditPayment={(rec) => {
            setEditingPayment(rec);
            setActiveTab('addPayment');
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
        return (
          <CalculatorScreen
            onOpenSettings={() => setActiveTab('settings')}
            onNavigateExplanation={(calcData) => {
              setActiveCalculationData(calcData);
              setActiveTab('explanation');
            }}
          />
        );
      case 'track':
        return (
          <TrackingScreen
            onOpenSettings={() => setActiveTab('settings')}
            onAddPayment={(paymentToEdit) => {
              setEditingPayment(paymentToEdit || null);
              setActiveTab('addPayment');
            }}
            onNavigateHistory={() => {
              setActiveTab('history');
              setHistoryView('list');
            }}
          />
        );
      case 'history':
        return (
          <HistoryScreen
            onOpenSettings={() => setActiveTab('settings')}
            onOpenYearDetail={(year, cycle) => {
              setSelectedYear(year);
              setSelectedCycle(cycle);
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
      <ReportExportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        year="2024"
      />
      <CustomAlertModal {...customAlert} />
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
