import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import AuthScreens from './AuthScreens';
import ZakatCalculator from './ZakatCalculator';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#005b9f" barStyle="light-content" />
      {isLoggedIn ? (
        <ZakatCalculator onLogout={() => setIsLoggedIn(false)} />
      ) : (
        <AuthScreens onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
});