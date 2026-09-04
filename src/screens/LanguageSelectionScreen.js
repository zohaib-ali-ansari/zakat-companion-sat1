import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../i18n/translations';

export const LanguageSelectionScreen = ({ onContinue }) => {
  const { setLanguage } = useLanguage();
  const [selected, setSelected] = useState('ur'); // Default Urdu

  const handleSelect = (lang) => {
    setSelected(lang);
    setLanguage(lang);
  };

  const handleContinue = () => {
    setLanguage(selected);
    onContinue(selected);
  };

  const dict = translations[selected] || translations.ur;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.content}>
        
        {/* App Logo/Icon */}
        <View style={styles.logoWrapper}>
          <Ionicons name="sparkles" size={32} color={colors.primary} />
        </View>

        <Text style={styles.title}>{dict.selectLanguageTitle}</Text>
        <Text style={styles.subtitle}>{dict.selectLanguageSubtitle}</Text>

        {/* Language Selection Cards */}
        <View style={styles.optionsContainer}>
          {/* Urdu Option */}
          <TouchableOpacity
            style={[
              styles.cardOption,
              selected === 'ur' && styles.cardOptionSelected,
            ]}
            onPress={() => handleSelect('ur')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.langNameUrdu}>اردو</Text>
              <View style={[styles.radioCircle, selected === 'ur' && styles.radioCircleSelected]}>
                {selected === 'ur' && <Ionicons name="checkmark" size={16} color={colors.white} />}
              </View>
            </View>
            <Text style={styles.langSubUrdu}>{dict.urduSub}</Text>
          </TouchableOpacity>

          {/* English Option */}
          <TouchableOpacity
            style={[
              styles.cardOption,
              selected === 'en' && styles.cardOptionSelected,
            ]}
            onPress={() => handleSelect('en')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.langNameEn}>English</Text>
              <View style={[styles.radioCircle, selected === 'en' && styles.radioCircleSelected]}>
                {selected === 'en' && <Ionicons name="checkmark" size={16} color={colors.white} />}
              </View>
            </View>
            <Text style={styles.langSubEn}>{dict.englishSub}</Text>
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueButtonText}>{dict.continue}</Text>
          <Ionicons
            name={selected === 'ur' ? 'arrow-back' : 'arrow-forward'}
            size={20}
            color={colors.white}
          />
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 36,
    paddingHorizontal: 16,
    lineHeight: 22,
  },
  optionsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 40,
  },
  cardOption: {
    backgroundColor: colors.cardBg,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  langNameUrdu: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  langNameEn: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  langSubUrdu: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  langSubEn: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    gap: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
