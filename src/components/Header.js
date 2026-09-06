import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export const Header = ({ onOpenSettings }) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.avatarBadge}
        onPress={onOpenSettings}
        activeOpacity={0.8}
      >
        <Ionicons name="apps" size={25} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.brandArea}>
        <View style={styles.brandMark}>
          <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
        </View>
        <Text style={styles.title}>Zakat Companion</Text>
      </View>

      <TouchableOpacity 
        style={styles.languageButton}
        onPress={onOpenSettings}
        activeOpacity={0.7}
      >
        <Text style={styles.languageText}>UR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 96,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarBadge: {
    width: 34,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    gap: 14,
  },
  brandMark: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  languageButton: {
    minWidth: 52,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  languageText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
});
