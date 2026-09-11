import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useZakat } from '../context/ZakatContext';

export const SummaryCard = ({ onCalculatePress }) => {
  const { t, isRTL, themeColors } = useLanguage();
  const { remaining } = useZakat();

  const formattedRemaining = `PKR ${Number(remaining || 0).toLocaleString('en-US')}`;

  return (
    <View style={styles.cardContainer}>
      <Text style={[styles.label, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
        {t('remainingZakatLabel')}
      </Text>

      <Text style={[styles.amountText, { color: themeColors.primary }, isRTL && styles.rtlText]}>
        {formattedRemaining}
      </Text>

      <TouchableOpacity
        style={[styles.pillButton, { backgroundColor: themeColors.primary }, isRTL && styles.rtlPillButton]}
        onPress={onCalculatePress}
        activeOpacity={0.85}
      >
        <Ionicons name="arrow-back" size={20} color="#FFFFFF" style={isRTL ? styles.leftArrow : styles.rightArrow} />
        <Text style={styles.pillButtonText}>{t('calculateZakatBtn')}</Text>
        <Ionicons name="calculator" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 6,
  },
  amountText: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  rtlText: {
    textAlign: 'center',
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: '100%',
    shadowColor: '#1A4FD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  rtlPillButton: {
    flexDirection: 'row',
  },
  pillButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginHorizontal: 12,
  },
  leftArrow: {
    marginRight: 4,
  },
  rightArrow: {
    marginLeft: 4,
    transform: [{ rotate: '180deg' }],
  },
});

