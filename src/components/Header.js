import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { useZakat } from '../context/ZakatContext';
import { Ionicons } from '@expo/vector-icons';

export const Header = ({ onOpenSettings }) => {
  const { t, isRTL, language, isDarkMode, toggleDarkMode, themeColors } = useLanguage();
  const { currentUser } = useZakat();
  const insets = useSafeAreaInsets();

  const avatars = ['wallet', 'person', 'star', 'sparkles'];
  const avatarIcon = avatars[currentUser?.avatar ?? 1] || 'person';

  return (
    <View
      style={[
        styles.headerContainer,
        {
          backgroundColor: themeColors.background,
          paddingTop: Math.max(insets.top + 6, 16),
        },
        isRTL && styles.rtlContainer,
      ]}
    >
      {/* Profile option button on left */}
      <TouchableOpacity
        style={[styles.avatarBadge, { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder }]}
        onPress={onOpenSettings}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Profile settings"
      >
        <Ionicons name={avatarIcon} size={20} color={themeColors.primary} />
      </TouchableOpacity>

      {/* App Title */}
      <Text style={[styles.title, { color: themeColors.textPrimary }]}>{t('appTitle')}</Text>

      {/* Dark / Light Theme Toggle Button on right (replacing menu icon) */}
      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
        onPress={toggleDarkMode}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        <Ionicons
          name={isDarkMode ? 'sunny' : 'moon'}
          size={22}
          color={isDarkMode ? '#F59E0B' : themeColors.primary}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  rtlContainer: {
    flexDirection: 'row-reverse',
  },
  avatarBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
