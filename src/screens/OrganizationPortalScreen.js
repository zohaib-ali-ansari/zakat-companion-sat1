import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { useZakat } from '../context/ZakatContext';

export default function OrganizationPortalScreen({ onBack }) {
  const { t, isRTL, themeColors } = useLanguage();
  const { addCampaign } = useZakat();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [orgName, setOrgName] = useState('Alkhidmat Foundation');
  const [category, setCategory] = useState('Disaster Relief');
  const [goalAmount, setGoalAmount] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handlePublish = () => {
    setErrorMessage('');
    const numericGoal = parseFloat(goalAmount);
    if (!title.trim() || !orgName.trim() || !numericGoal || numericGoal <= 0) {
      setErrorMessage(t('fillRequiredFieldsError'));
      return;
    }

    const success = addCampaign({
      title,
      orgName,
      category,
      goalAmount: numericGoal,
      description,
    });

    if (success) {
      Alert.alert(t('appTitle'), t('campaignCreatedSuccess'));
      onBack?.();
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />

      <View style={[styles.topHeader, { paddingTop: 10, paddingBottom: 10 }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
          onPress={() => onBack?.()}
          activeOpacity={0.7}
        >
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={20} color={themeColors.primary} />
        </TouchableOpacity>
        <Text style={[styles.topHeaderTitle, { color: themeColors.textPrimary }]}>
          {t('orgPortalTitle')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {t('orgPortalTitle')}
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            {t('orgPortalSub')}
          </Text>
        </View>

        {errorMessage ? (
          <View style={[styles.errorBox, { backgroundColor: themeColors.cardBgAlt, borderColor: themeColors.danger }]}>
            <Ionicons name="alert-circle" size={20} color={themeColors.danger} />
            <Text style={[styles.errorText, { color: themeColors.danger }]}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.formGroup}>
          <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {t('campaignTitleLabel')} *
          </Text>
          <View style={[styles.inputWrapper, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <TextInput
              style={[styles.input, { color: themeColors.textPrimary }, isRTL && styles.rtlInput]}
              placeholder="e.g. Earthquake Emergency Shelter"
              placeholderTextColor={themeColors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {t('orgNameLabel')} *
          </Text>
          <View style={[styles.inputWrapper, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <TextInput
              style={[styles.input, { color: themeColors.textPrimary }, isRTL && styles.rtlInput]}
              placeholder="e.g. Alkhidmat Foundation"
              placeholderTextColor={themeColors.textMuted}
              value={orgName}
              onChangeText={setOrgName}
            />
          </View>

          <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {t('goalAmountLabel')} *
          </Text>
          <View style={[styles.inputWrapper, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <TextInput
              style={[styles.input, { color: themeColors.textPrimary }, isRTL && styles.rtlInput]}
              placeholder="e.g. 5000000"
              placeholderTextColor={themeColors.textMuted}
              value={goalAmount}
              onChangeText={setGoalAmount}
              keyboardType="numeric"
            />
          </View>

          <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {t('descriptionLabel')}
          </Text>
          <View style={[styles.inputWrapper, styles.multilineWrapper, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <TextInput
              style={[styles.input, styles.multilineInput, { color: themeColors.textPrimary }, isRTL && styles.rtlInput]}
              placeholder="Provide campaign details..."
              placeholderTextColor={themeColors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: themeColors.primary }]}
          onPress={handlePublish}
          activeOpacity={0.85}
        >
          <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>{t('publishCampaignBtn')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  titleSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  rtlText: {
    textAlign: 'right',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  formGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 12,
  },
  inputWrapper: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 52,
    justifyContent: 'center',
  },
  multilineWrapper: {
    height: 90,
    paddingVertical: 12,
  },
  input: {
    fontSize: 15,
    fontWeight: '600',
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  rtlInput: {
    textAlign: 'right',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderRadius: 28,
    gap: 8,
    shadowColor: '#1A4FD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
