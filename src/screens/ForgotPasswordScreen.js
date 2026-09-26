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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

export const ForgotPasswordScreen = ({
  initialEmail = '',
  onSendResetRequest,
  onVerifyOtp,
  onNavigateLogin,
  isLoading = false,
  submitError = '',
}) => {
  const { t, themeColors, isRTL } = useLanguage();
  const [email, setEmail] = useState(initialEmail || '');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState(submitError || '');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (submitError) {
      setErrorMessage(submitError);
    }
  }, [submitError]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    const trimmedEmail = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setErrorMessage('');
    setIsSendingOtp(true);

    try {
      const result = await onSendResetRequest?.(trimmedEmail);
      if (result?.success !== false) {
        setIsOtpSent(true);
        setCountdown(60);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send OTP code.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerify = async () => {
    const trimmedEmail = email.trim();
    const trimmedOtp = otp.trim();

    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address first.');
      return;
    }

    if (!isOtpSent) {
      setErrorMessage('Please tap "Send OTP" to receive your code first.');
      return;
    }

    if (!trimmedOtp) {
      setErrorMessage('Please enter the 6-digit OTP code.');
      return;
    }

    if (trimmedOtp.length !== 6 || !/^\d+$/.test(trimmedOtp)) {
      setErrorMessage('OTP code must be exactly 6 digits.');
      return;
    }

    setErrorMessage('');
    setIsVerifyingOtp(true);

    try {
      await onVerifyOtp?.(trimmedEmail, trimmedOtp);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid or expired OTP.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

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
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={[styles.title, { color: themeColors.textPrimary }]}>
                {t('forgotTitle') || 'Forgot Password'}
              </Text>
              <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                Enter your email, receive a 6-digit OTP code, and verify to set a new password.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Email Label */}
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
                {t('emailLabel')}
              </Text>

              {/* Email Input + Send Button */}
              <View
                style={[
                  styles.emailRowWrapper,
                  { backgroundColor: themeColors.cardBg, borderColor: themeColors.border },
                ]}
              >
                <Ionicons name="mail-outline" size={20} color={themeColors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: themeColors.textPrimary }, isRTL && styles.rtlInput]}
                  placeholder={t('emailPlaceholder')}
                  placeholderTextColor={themeColors.textMuted}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isSendingOtp && !isVerifyingOtp && !isLoading}
                />
                <TouchableOpacity
                  style={[
                    styles.sendOtpBtn,
                    {
                      backgroundColor:
                        countdown > 0 || isSendingOtp ? '#E2E8F0' : themeColors.primary,
                    },
                  ]}
                  onPress={handleSendOtp}
                  disabled={countdown > 0 || isSendingOtp || isLoading}
                  activeOpacity={0.8}
                >
                  {isSendingOtp ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.sendOtpBtnText,
                        { color: countdown > 0 ? '#64748B' : '#FFFFFF' },
                      ]}
                    >
                      {countdown > 0 ? `${countdown}s` : isOtpSent ? 'Resend' : 'Send OTP'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {isOtpSent && (
                <View style={styles.sentInfoBox}>
                  <Ionicons name="checkmark-circle" size={16} color={themeColors.success || '#10B981'} />
                  <Text style={[styles.sentInfoText, { color: themeColors.success || '#10B981' }]}>
                    OTP code has been sent to your email!
                  </Text>
                </View>
              )}

              {/* OTP Field (shown always or ready once sent) */}
              <Text
                style={[
                  styles.inputLabel,
                  { color: themeColors.textPrimary, marginTop: 16 },
                  isRTL && styles.rtlText,
                ]}
              >
                {t('otpLabel') || '6-Digit OTP Code'}
              </Text>

              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: themeColors.cardBg,
                    borderColor: errorMessage ? '#E11D48' : themeColors.border,
                    opacity: isOtpSent ? 1 : 0.75,
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
                  style={[
                    styles.input,
                    styles.otpInput,
                    { color: themeColors.textPrimary },
                    isRTL && styles.rtlInput,
                  ]}
                  placeholder="e.g. 123456"
                  placeholderTextColor={themeColors.textMuted}
                  value={otp}
                  onChangeText={(val) => {
                    const cleaned = val.replace(/\D/g, '').slice(0, 6);
                    setOtp(cleaned);
                    if (errorMessage) setErrorMessage('');
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              {/* Error Message */}
              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

              {/* Verify & Proceed Button */}
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  {
                    backgroundColor:
                      isVerifyingOtp || isLoading ? '#A0AEC0' : themeColors.primary,
                  },
                ]}
                onPress={handleVerify}
                disabled={isVerifyingOtp || isLoading}
                activeOpacity={0.85}
              >
                {isVerifyingOtp || isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Verify OTP & Continue</Text>
                )}
              </TouchableOpacity>
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
    marginBottom: 20,
  },
  logoImage: {
    width: '100%',
    height: 165,
    marginBottom: 12,
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
  },
  rtlText: {
    textAlign: 'right',
  },
  emailRowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingLeft: 14,
    paddingRight: 6,
    height: 54,
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
  otpInput: {
    letterSpacing: 4,
    fontWeight: '700',
    fontSize: 18,
  },
  rtlInput: {
    textAlign: 'right',
  },
  sendOtpBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 84,
  },
  sendOtpBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sentInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  sentInfoText: {
    fontSize: 12,
    fontWeight: '600',
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
