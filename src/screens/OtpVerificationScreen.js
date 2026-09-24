import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useLanguage } from '../context/LanguageContext';

export const OtpVerificationScreen = ({
  email,
  title,
  subtitle,
  buttonText,
  onVerifyOtp,
  onResendOtp,
  onNavigateLogin,
  isLoading = false,
  submitError = '',
}) => {
  const { t, themeColors, isRTL } = useLanguage();
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState(submitError || '');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

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
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = () => {
    if (isLoading) return;
    const trimmedOtp = otp.trim();
    if (!trimmedOtp) {
      setErrorMessage('Please enter the 6-digit OTP code.');
      return;
    }
    if (trimmedOtp.length !== 6 || !/^\d+$/.test(trimmedOtp)) {
      setErrorMessage('OTP code must be 6 numeric digits.');
      return;
    }

    setErrorMessage('');
    onVerifyOtp?.(trimmedOtp);
  };

  const handleResendPress = async () => {
    if (!canResend || isResending) return;
    setIsResending(true);
    setErrorMessage('');

    try {
      await onResendOtp?.();
      Alert.alert('OTP Resent', `A new verification code has been sent to ${email}`);
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to resend OTP.');
    } finally {
      setIsResending(false);
    }
  };

  const screenTitle = title || 'Verify OTP';
  const screenSubtitle = subtitle || `Enter the 6-digit verification code sent to`;
  const submitText = buttonText || 'Verify & Continue';

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
            <View style={styles.headerBox}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder },
                ]}
              >
                <Ionicons name="shield-checkmark-outline" size={34} color={themeColors.primary} />
              </View>
              <Text style={[styles.title, { color: themeColors.textPrimary }]}>{screenTitle}</Text>
              <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                {screenSubtitle}{'\n'}
                <Text style={{ fontWeight: '700', color: themeColors.textPrimary }}>{email || 'your email'}</Text>
              </Text>
            </View>

            <View style={styles.form}>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
                6-Digit Verification Code
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: themeColors.cardBg, borderColor: errorMessage ? '#E11D48' : themeColors.border },
                ]}
              >
                <Ionicons name="keypad-outline" size={20} color={themeColors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: themeColors.textPrimary }]}
                  placeholder="123456"
                  placeholderTextColor={themeColors.textMuted}
                  value={otp}
                  onChangeText={(val) => {
                    setOtp(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </View>

              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: isLoading ? '#A0AEC0' : themeColors.primary }]}
                onPress={handleVerify}
                activeOpacity={0.85}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>{submitText}</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                <Text style={[styles.resendText, { color: themeColors.textSecondary }]}>
                  Didn't receive code?{' '}
                </Text>
                <TouchableOpacity onPress={handleResendPress} disabled={!canResend || isResending}>
                  <Text
                    style={[
                      styles.resendBtnText,
                      { color: canResend ? themeColors.primary : themeColors.textMuted },
                    ]}
                  >
                    {isResending ? 'Resending...' : canResend ? 'Resend OTP' : `Resend in ${countdown}s`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.backBtn} onPress={onNavigateLogin}>
              <Ionicons name="arrow-back" size={18} color={themeColors.primary} />
              <Text style={[styles.backBtnText, { color: themeColors.primary }]}>Back to Sign In</Text>
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
    paddingBottom: 60,
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
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
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
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 6,
    textAlign: 'center',
  },
  errorText: {
    color: '#E11D48',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 26,
    marginTop: 12,
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
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
  },
  resendBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
