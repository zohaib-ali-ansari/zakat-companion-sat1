import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

export const QuickActionGrid = ({ onSelectAction }) => {
  const { t, isRTL, themeColors } = useLanguage();

  const actions = [
    { id: 'track', labelKey: 'trackAction', icon: 'stats-chart-outline' },
    { id: 'guidance', labelKey: 'guidanceAction', icon: 'book-outline' },
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
            <Ionicons name={action.icon} size={24} color={themeColors.primary} />
          </View>
          <Text style={[styles.cardLabel, { color: themeColors.textPrimary }]}>{t(action.labelKey)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
  },
  cardItem: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
