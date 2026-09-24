import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';

const RESET_EMAIL_KEY = '@zakat_reset_email';
const RESET_OTP_KEY = '@zakat_reset_otp';

export const ResetPasswordScreen = ({
  email = '',
  token = '',
  onSubmit,
  onNavigateLogin,
  onNavigateForgot,
  isLoading = false,
  submitError = '',
}) => {
  const { t, themeColors, isRTL } = useLanguage();
  const [activeEmail, setActiveEmail] = useState(email || '');
  const [activeToken, setActiveToken] = useState(token || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(submitError || '');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (submitError) {
      setErrorMessage(submitError);
    }
  }, [submitError]);

  useEffect(() => {
    const syncSession = async () => {
      try {
        if (email) {
          setActiveEmail(email);
          await AsyncStorage.setItem(RESET_EMAIL_KEY, email);
        } else {
          const storedEmail = await AsyncStorage.getItem(RESET_EMAIL_KEY);
          if (storedEmail) setActiveEmail(storedEmail);
        }

        if (token) {
          setActiveToken(token);
          await AsyncStorage.setItem(RESET_OTP_KEY, token);
        } else {
          const storedToken = await AsyncStorage.getItem(RESET_OTP_KEY);
          if (storedToken) setActiveToken(storedToken);
        }
      } catch (err) {
        console.warn('Error reading reset session storage:', err);
      }
    };

    syncSession();
  }, [email, token]);

  const handleSubmit = async () => {
    if (isSubmitting || isLoading) return;

    const trimmedPassword = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();
    const finalEmail = activeEmail || email;
    const finalToken = activeToken || token;

    if (!finalEmail || !finalToken) {
      setErrorMessage('Verification session expired. Please request a new OTP.');
      return;
    }

    if (!trimmedPassword || !trimmedConfirm) {
      setErrorMessage('Please enter and confirm your new password.');
      return;
    }

    if (trimmedPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await onSubmit?.({
        email: finalEmail,
        otp: finalToken,
        newPassword: trimmedPassword,
        confirmPassword: trimmedConfirm,
      });
      await AsyncStorage.multiRemove([RESET_EMAIL_KEY, RESET_OTP_KEY]);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasSession = Boolean(activeEmail || email);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.headerBox}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder },
                ]}
              >
                <Ionicons name="lock-closed-outline" size={32} color={themeColors.primary} />
              </View>
              <Text style={[styles.title, { color: themeColors.textPrimary }]}>
                {t('resetPasswordTitle') || 'Create New Password'}
              </Text>
              <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                {activeEmail || email
                  ? `Set a new secure password for ${activeEmail || email}`
                  : 'Set a new secure password for your account'}
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* New Password */}
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
                {t('newPasswordLabel') || 'New Password'}
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: themeColors.cardBg,
                    borderColor: errorMessage ? '#E11D48' : themeColors.border,
                  },
                ]}
              >
                <Ionicons name="key-outline" size={20} color={themeColors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: themeColors.textPrimary }, isRTL && styles.rtlInput]}
                  placeholder={t('newPasswordPlaceholder') || 'Enter new password (min 6 chars)'}
                  placeholderTextColor={themeColors.textMuted}
                  value={newPassword}
                  onChangeText={(val) => {
                    setNewPassword(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={themeColors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm Password */}
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
                {t('confirmNewPasswordLabel') || 'Confirm Password'}
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: themeColors.cardBg,
                    borderColor: errorMessage ? '#E11D48' : themeColors.border,
                  },
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={themeColors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: themeColors.textPrimary }, isRTL && styles.rtlInput]}
                  placeholder={t('confirmNewPasswordPlaceholder') || 'Confirm new password'}
                  placeholderTextColor={themeColors.textMuted}
                  value={confirmPassword}
                  onChangeText={(val) => {
                    setConfirmPassword(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
              </View>

              {/* Error */}
              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  { backgroundColor: isLoading ? '#A0AEC0' : themeColors.primary },
                ]}
                onPress={handleSubmit}
                activeOpacity={0.85}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {t('resetPasswordBtn') || 'Reset Password'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* In case user refreshed and session got lost */}
              {!hasSession && (
                <TouchableOpacity
                  style={styles.requestOtpLink}
                  onPress={onNavigateForgot}
                >
                  <Text style={[styles.requestOtpLinkText, { color: themeColors.primary }]}>
                    Session expired? Tap here to enter Email & OTP
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Back to Login */}
            <TouchableOpacity style={styles.backBtn} onPress={onNavigateLogin}>
              <Ionicons name="arrow-back" size={18} color={themeColors.primary} />
              <Text style={[styles.backBtnText, { color: themeColors.primary }]}>
                {t('backToLogin')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'center',
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  form: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 12,
  },
  rtlText: {
    textAlign: 'right',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 54,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  rtlInput: {
    textAlign: 'right',
  },
  eyeIcon: {
    padding: 6,
  },
  errorText: {
    color: '#E11D48',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
  },
  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 26,
    marginTop: 24,
    shadowColor: '#1A4FD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  requestOtpLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  requestOtpLinkText: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
