import React from 'react';
import { StyleSheet, Image, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useZakat } from '../context/ZakatContext';
import { Ionicons } from '@expo/vector-icons';

export const Header = ({ onOpenSettings }) => {
  const { isRTL, isDarkMode, toggleDarkMode, themeColors } = useLanguage();
  const { currentUser } = useZakat();

  const avatars = ['wallet', 'person', 'star', 'sparkles'];
  const avatarIcon = avatars[currentUser?.avatar ?? 1] || 'person';

  return (
    <View
      style={[
        styles.headerContainer,
        {
          backgroundColor: themeColors.background,
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
        <Ionicons name={avatarIcon} size={22} color={themeColors.primary} />
      </TouchableOpacity>

      {/* App Logo */}
      <View style={styles.titleWrapper}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>

      {/* Dark / Light Theme Toggle Button on right */}
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
    height: 72,
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
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 72,
    marginHorizontal: 8,
  },
  headerLogo: {
    width: '100%',
    height: 70,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
