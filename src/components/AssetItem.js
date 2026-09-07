import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

export const AssetItem = ({ label, value }) => {
  const { isRTL, themeColors } = useLanguage();

  return (
    <View style={[styles.rowContainer, isRTL && styles.rtlRow]}>
      <Text style={[styles.valueText, { color: themeColors.textPrimary }]}>{value}</Text>
      <View style={[styles.dottedLeader, { borderColor: themeColors.textMuted }]} />
      <Text style={[styles.labelText, { color: themeColors.textPrimary }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rtlRow: {
    flexDirection: 'row',
  },
  labelText: {
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
  },
  dottedLeader: {
    flex: 1,
    borderBottomWidth: 1.5,
    borderStyle: 'dotted',
    marginHorizontal: 12,
    marginTop: 6,
    opacity: 0.4,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
