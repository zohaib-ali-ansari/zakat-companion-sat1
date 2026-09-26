import { StatusBar, StyleSheet, Image, TouchableOpacity, View } from 'react-native';
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

  const topPadding = Math.max(insets.top || 0, StatusBar.currentHeight || 0, 20);

  return (
    <View
      style={[
        styles.headerContainer,
        {
          backgroundColor: themeColors.background,
          paddingTop: 10,
          paddingBottom: 10,
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

      {/* App Logo */}
      <View style={styles.titleWrapper}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>

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
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  rtlContainer: {
    flexDirection: 'row-reverse',
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 165,
  },
  headerLogo: {
    width: '100%',
    height: 165,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
