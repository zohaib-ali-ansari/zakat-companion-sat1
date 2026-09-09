import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

export default function AddPaymentScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Add Payment</Text>
      <Text style={styles.subtitle}>Record a payment toward your Zakat obligation.</Text>
      <Pressable style={styles.button} onPress={() => navigation?.navigate('Track')}>
        <Text style={styles.buttonText}>BACK TO TRACK</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 36,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 18,
    lineHeight: 26,
    marginTop: 12,
    marginBottom: 28,
  },
  button: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.primaryDark,
  },
  buttonText: {
    color: colors.textWhite,
    fontWeight: '800',
    letterSpacing: 1,
  },
});