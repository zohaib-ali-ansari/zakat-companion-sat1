import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';

const DEFAULT_LABELS = {
  home: 'Home',
  calculator: 'Calculator',
  track: 'Track',
  history: 'History',
  assistant: 'Assistant',
};

export const BottomNavigation = ({ activeTab, onSelectTab }) => {
  const { t, themeColors, language } = useLanguage();
  const insets = useSafeAreaInsets();

  const tabs = [
    { id: 'home', labelKey: 'navHome', fallback: 'Home', urFallback: '\u06C1\u0648\u0645', iconOutline: 'home-outline', iconFilled: 'home' },
    { id: 'calculator', labelKey: 'navCalculator', fallback: 'Calculator', urFallback: '\u06A9\u06CC\u0644\u06A9\u0648\u0644\u06CC\u0679\u0631', iconOutline: 'calculator-outline', iconFilled: 'calculator' },
    { id: 'track', labelKey: 'navTrack', fallback: 'Track', urFallback: '\u0679\u0631\u06CC\u06A9', iconOutline: 'stats-chart-outline', iconFilled: 'stats-chart' },
    { id: 'history', labelKey: 'navHistory', fallback: 'History', urFallback: '\u06C1\u0633\u0679\u0631\u06CC', iconOutline: 'time-outline', iconFilled: 'time' },
    { id: 'assistant', labelKey: 'navAssistant', fallback: 'Assistant', urFallback: '\u0627\u0633\u0633\u0679\u0646\u0679', iconOutline: 'hardware-chip-outline', iconFilled: 'hardware-chip' },
  ];

  const bottomInset = Math.max(insets.bottom, 10);

  const getLabel = (tab) => {
    const translated = t(tab.labelKey);
    // If translated string is missing or returns the raw key starting with 'nav', use fallback
    if (!translated || translated.startsWith('nav')) {
      return language === 'ur' ? tab.urFallback : tab.fallback;
    }
    return translated;
  };

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
              {getLabel(tab)}
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
