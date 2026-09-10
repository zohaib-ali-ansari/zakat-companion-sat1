import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

export const Header = ({ onOpenSettings }) => {
  const { t, isRTL, language, themeColors } = useLanguage();

  return (
    <View style={[styles.headerContainer, { backgroundColor: themeColors.background }, isRTL && styles.rtlContainer]}>
      <TouchableOpacity
        style={[styles.avatarBadge, { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder }]}
        onPress={onOpenSettings}
        activeOpacity={0.8}
      >
        <Text style={[styles.avatarText, { color: themeColors.primary }]}>{language.toUpperCase()}</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: themeColors.textPrimary }]}>{t('appTitle')}</Text>

      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
        onPress={onOpenSettings}
        activeOpacity={0.7}
      >
        <Ionicons name="menu-outline" size={26} color={themeColors.textPrimary} />
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
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  iconButton: {
    padding: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
});
