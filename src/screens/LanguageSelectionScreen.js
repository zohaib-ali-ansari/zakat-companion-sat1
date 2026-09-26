import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../i18n/translations';

export const LanguageSelectionScreen = ({ onContinue }) => {
  const { setLanguage, themeColors } = useLanguage();
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
  const isUr = selected === 'ur';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />
      <View style={styles.content}>
        
        {/* App Logo */}
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />

        <Text style={[styles.title, { color: themeColors.textPrimary }]}>{dict.selectLanguageTitle}</Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>{dict.selectLanguageSubtitle}</Text>

        {/* Language Selection Cards */}
        <View style={styles.optionsContainer}>
          {/* Urdu Option */}
          <TouchableOpacity
            style={[
              styles.cardOption,
              { backgroundColor: themeColors.cardBg, borderColor: themeColors.border },
              selected === 'ur' && { borderColor: themeColors.primary, backgroundColor: themeColors.primaryLight },
            ]}
            onPress={() => handleSelect('ur')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.langNameUrdu, { color: themeColors.textPrimary }]}>اردو</Text>
              <View
                style={[
                  styles.radioCircle,
                  { borderColor: themeColors.textMuted },
                  selected === 'ur' && { borderColor: themeColors.primary, backgroundColor: themeColors.primary },
                ]}
              >
                {selected === 'ur' && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </View>
            </View>
            <Text style={[styles.langSubUrdu, { color: themeColors.textSecondary }]}>{dict.urduSub}</Text>
          </TouchableOpacity>

          {/* English Option */}
          <TouchableOpacity
            style={[
              styles.cardOption,
              { backgroundColor: themeColors.cardBg, borderColor: themeColors.border },
              selected === 'en' && { borderColor: themeColors.primary, backgroundColor: themeColors.primaryLight },
            ]}
            onPress={() => handleSelect('en')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.langNameEn, { color: themeColors.textPrimary }]}>English</Text>
              <View
                style={[
                  styles.radioCircle,
                  { borderColor: themeColors.textMuted },
                  selected === 'en' && { borderColor: themeColors.primary, backgroundColor: themeColors.primary },
                ]}
              >
                {selected === 'en' && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </View>
            </View>
            <Text style={[styles.langSubEn, { color: themeColors.textSecondary }]}>{dict.englishSub}</Text>
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: themeColors.primary }]}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueButtonText}>{dict.continue}</Text>
          <Ionicons
            name={isUr ? 'arrow-back' : 'arrow-forward'}
            size={20}
            color="#FFFFFF"
          />
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 190,
    height: 115,
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
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
    borderRadius: 18,
    padding: 20,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
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
  },
  langNameEn: {
    fontSize: 20,
    fontWeight: '700',
  },
  langSubUrdu: {
    fontSize: 14,
  },
  langSubEn: {
    fontSize: 14,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    gap: 10,
    shadowColor: '#1A4FD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
