import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export const BottomNavigation = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'home', label: 'Home', iconOutline: 'home-outline', iconFilled: 'home' },
    { id: 'calculator', label: 'Calculator', iconOutline: 'calculator-outline', iconFilled: 'calculator' },
    { id: 'track', label: 'Track', iconOutline: 'stats-chart-outline', iconFilled: 'stats-chart' },
    { id: 'history', label: 'History', iconOutline: 'time-outline', iconFilled: 'time' },
    { id: 'assistant', label: 'Assistant', iconOutline: 'hardware-chip-outline', iconFilled: 'hardware-chip' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const iconName = isActive ? tab.iconFilled : tab.iconOutline;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => onSelectTab(tab.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={iconName}
              size={24}
              color={isActive ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? colors.primary : colors.textMuted },
                isActive && styles.activeTabLabel,
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 70,
    borderTopWidth: 1,
    paddingBottom: 10,
    paddingTop: 6,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: '500',
  },
  activeTabLabel: {
    fontWeight: '700',
  },
});
