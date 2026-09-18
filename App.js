import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
import { SignUpScreen } from './src/screens/SignUpScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { TermsOfServiceScreen } from './src/screens/TermsOfServiceScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import { ZakatGuidanceScreen } from './src/screens/ZakatGuidanceScreen';

import DisasterReliefScreen from './src/screens/DisasterReliefScreen';
import OrganizationPortalScreen from './src/screens/OrganizationPortalScreen';
import LiveRatesScreen from './src/screens/LiveRatesScreen';
import { ReportExportModal } from './src/components/ReportExportModal';

function MainAppContent() {
  const { themeColors } = useLanguage();

  const [authFlow, setAuthFlow] = useState('splash');
  const [activeTab, setActiveTab] = useState('home');
  const [historyView, setHistoryView] = useState('list');
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [activeCalculationData, setActiveCalculationData] = useState(null);

  if (authFlow === 'splash') {
    return <SplashScreen onGetStarted={() => setAuthFlow('language')} />;
  }

  if (authFlow === 'language') {
    return <LanguageSelectionScreen onContinue={() => setAuthFlow('login')} />;
  }

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

  if (activeTab === 'settings') {
    return (
      <ProfileSettingsScreen
        onClose={() => setActiveTab('home')}
        onSignOut={() => setAuthFlow('login')}
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
