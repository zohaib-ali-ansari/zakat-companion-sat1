import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

export const SettingRow = ({
  icon,
  title,
  type = 'link',
  value,
  onValueChange,
  onPress,
  options = [],
}) => {
  const { themeColors } = useLanguage();

  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: themeColors.borderLight }]}
      onPress={type === 'link' ? onPress : undefined}
      disabled={type !== 'link'}
      activeOpacity={0.7}
    >
      <View style={styles.leftGroup}>
        {icon && (
          <View style={styles.iconWrapper}>
            <Ionicons name={icon} size={22} color={themeColors.textPrimary} />
          </View>
        )}
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>{title}</Text>
      </View>

      {type === 'link' && (
        <Ionicons name="chevron-forward" size={18} color={themeColors.textMuted} />
      )}

      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: themeColors.border, true: themeColors.primary }}
          thumbColor="#FFFFFF"
        />
      )}

      {type === 'segmented' && (
        <View style={[styles.segmentedContainer, { backgroundColor: themeColors.borderLight }]}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.segmentItem,
                value === opt.value && { backgroundColor: themeColors.primary },
              ]}
              onPress={() => onValueChange(opt.value)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: value === opt.value ? '#FFFFFF' : themeColors.textSecondary },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    marginRight: 14,
    width: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    flexWrap: 'wrap',
  },
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 3,
  },
  segmentItem: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
