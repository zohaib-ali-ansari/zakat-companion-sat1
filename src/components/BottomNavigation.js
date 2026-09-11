import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';

export const BottomNavigation = ({ activeTab, onSelectTab }) => {
  const { t, themeColors } = useLanguage();
  const insets = useSafeAreaInsets();

  const tabs = [
    { id: 'home', labelKey: 'navHome', iconOutline: 'home-outline', iconFilled: 'home' },
    { id: 'calculator', labelKey: 'navCalculator', iconOutline: 'calculator-outline', iconFilled: 'calculator' },
    { id: 'track', labelKey: 'navTrack', iconOutline: 'stats-chart-outline', iconFilled: 'stats-chart' },
    { id: 'history', labelKey: 'navHistory', iconOutline: 'time-outline', iconFilled: 'time' },
    { id: 'assistant', labelKey: 'navAssistant', iconOutline: 'hardware-chip-outline', iconFilled: 'hardware-chip' },
  ];

  const bottomInset = Math.max(insets.bottom, 10);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: themeColors.cardBg,
          borderTopColor: themeColors.border,
          paddingBottom: bottomInset,
          height: 60 + bottomInset,
        },
      ]}
    >
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
              color={isActive ? themeColors.primary : themeColors.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? themeColors.primary : themeColors.textMuted },
                isActive && styles.activeTabLabel,
              ]}
              numberOfLines={1}
            >
              {t(tab.labelKey)}
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
    borderTopWidth: 1,
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
