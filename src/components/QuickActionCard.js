import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

export const QuickActionGrid = ({ onSelectAction }) => {
  const { t, isRTL, themeColors } = useLanguage();

  const actions = [
    { id: 'track', labelKey: 'trackAction', icon: 'stats-chart-outline' },
    { id: 'relief', labelKey: 'disasterReliefTitle', icon: 'heart-outline' },
    { id: 'liveRates', labelKey: 'liveRatesTitle', icon: 'trending-up-outline' },
    { id: 'history', labelKey: 'historyAction', icon: 'time-outline' },
  ];

  return (
    <View style={styles.gridContainer}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={[styles.cardItem, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
          onPress={() => onSelectAction(action.id)}
          activeOpacity={0.8}
        >
          <View style={[styles.iconCircle, { backgroundColor: themeColors.primaryLight }]}>
            <Ionicons name={action.icon} size={22} color={themeColors.primary} />
          </View>
          <Text style={[styles.cardLabel, { color: themeColors.textPrimary }]}>
            {t(action.labelKey)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 15,
    marginBottom: 20,
  },
  cardItem: {
    flex: 1,
    minHeight: 114,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginHorizontal: 4,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
    flexWrap: 'wrap',
  },
});
