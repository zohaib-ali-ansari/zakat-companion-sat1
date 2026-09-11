import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { useZakat } from '../context/ZakatContext';

export default function AddPaymentScreen({ onBack, editingPayment }) {
  const { t, themeColors, isRTL } = useLanguage();
  const { addPayment, editPayment } = useZakat();
  const insets = useSafeAreaInsets();

  const isEditing = Boolean(editingPayment?.id);

  const getTodayFormatted = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(editingPayment?.date || getTodayFormatted());
  const [amount, setAmount] = useState(editingPayment?.amount ? String(editingPayment.amount) : '');
  const [recipient, setRecipient] = useState(editingPayment?.recipient || '');
  const [notes, setNotes] = useState(editingPayment?.notes || '');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (editingPayment) {
      setDate(editingPayment.date || getTodayFormatted());
      setAmount(editingPayment.amount ? String(editingPayment.amount) : '');
      setRecipient(editingPayment.recipient || '');
      setNotes(editingPayment.notes || '');
    }
  }, [editingPayment]);

  const handleSubmit = () => {
    setErrorMessage('');
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0 || !recipient.trim()) {
      setErrorMessage(t('fillRequiredFieldsError'));
      return;
    }

    let success = false;
    if (isEditing) {
      success = editPayment(editingPayment.id, {
        date,
        amount: parsedAmount,
        recipient,
        notes,
      });
    } else {
      success = addPayment({
        date,
        amount: parsedAmount,
        recipient,
        notes,
      });
    }

    if (success) {
      onBack?.();
    } else {
      setErrorMessage(t('fillRequiredFieldsError'));
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />

      <View style={[styles.topHeader, { paddingTop: Math.max(insets.top + 4, 14) }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
          onPress={() => onBack?.()}
          activeOpacity={0.7}
        >
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={20} color={themeColors.primary} />
        </TouchableOpacity>
        <Text style={[styles.topHeaderTitle, { color: themeColors.textPrimary }]}>
          {isEditing ? t('editPaymentTitle') : t('addPaymentTitle')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {isEditing ? t('editPaymentTitle') : t('addPaymentTitle')}
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            {isEditing ? t('editPaymentSub') : t('addPaymentSub')}
          </Text>
        </View>

        {errorMessage ? (
          <View style={[styles.errorBox, { backgroundColor: themeColors.cardBgAlt, borderColor: themeColors.danger }]}>
            <Ionicons name="alert-circle" size={20} color={themeColors.danger} />
            <Text style={[styles.errorText, { color: themeColors.danger }]}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.formGroup}>
          {/* Date Input */}
          <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {t('dateLabel')}
          </Text>
          <View style={[styles.inputWrapper, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <Ionicons name="calendar-outline" size={20} color={themeColors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: themeColors.textPrimary }, isRTL && styles.rtlInput]}
              placeholder={t('datePlaceholder')}
              placeholderTextColor={themeColors.textMuted}
              value={date}
              onChangeText={setDate}
            />
          </View>

          {/* Amount Input */}
          <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {t('amountLabel')} *
          </Text>
          <View style={[styles.inputWrapper, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <Ionicons name="cash-outline" size={20} color={themeColors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: themeColors.textPrimary }, isRTL && styles.rtlInput]}
              placeholder={t('amountPlaceholder')}
              placeholderTextColor={themeColors.textMuted}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>

          {/* Recipient / Who's to paid Input */}
          <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {t('recipientLabel')} *
          </Text>
          <View style={[styles.inputWrapper, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <Ionicons name="person-outline" size={20} color={themeColors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: themeColors.textPrimary }, isRTL && styles.rtlInput]}
              placeholder={t('recipientPlaceholder')}
              placeholderTextColor={themeColors.textMuted}
              value={recipient}
              onChangeText={setRecipient}
            />
          </View>

          {/* Notes / Description Input */}
          <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {t('notesLabel')}
          </Text>
          <View style={[styles.inputWrapper, styles.multilineWrapper, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <Ionicons name="document-text-outline" size={20} color={themeColors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.multilineInput, { color: themeColors.textPrimary }, isRTL && styles.rtlInput]}
              placeholder={t('notesPlaceholder')}
              placeholderTextColor={themeColors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
        </View>

        {/* Submit & Cancel Buttons */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: themeColors.primary }]}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>{isEditing ? t('updatePaymentBtn') : t('submitPaymentBtn')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
          onPress={() => onBack?.()}
          activeOpacity={0.8}
        >
          <Text style={[styles.cancelButtonText, { color: themeColors.textSecondary }]}>
            {t('cancelBtn')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
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
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 52,
  },
  multilineWrapper: {
    height: 84,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
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
    marginBottom: 12,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    borderRadius: 25,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});