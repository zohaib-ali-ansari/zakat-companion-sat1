import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';

export const ResetPasswordScreen = ({
  email,
  token,
  onSubmit,
  onNavigateLogin,
  isLoading = false,
  submitError = '',
}) => {
  const { t, themeColors, isRTL } = useLanguage();
  const [otpCode, setOtpCode] = useState(token || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(submitError || '');

  useEffect(() => {
    if (submitError) {
      setErrorMessage(submitError);
    }
  }, [submitError]);

  useEffect(() => {
    if (token) {
      setOtpCode(token);
    }
  }, [token]);

  const handleSubmit = async () => {
    const trimmedOtp = otpCode.trim();
    const trimmedPassword = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedOtp) {
      setErrorMessage('Please enter the 6-digit OTP code sent to your email.');
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
    const result = await onSubmit?.(trimmedOtp, trimmedPassword, trimmedConfirm);
    if (result?.success) {
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
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
            <View style={styles.headerBox}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder },
            ]}
          >
            <Ionicons name="lock-open-outline" size={32} color={themeColors.primary} />
          </View>
          <Text style={[styles.title, { color: themeColors.textPrimary }]}>{t('resetPasswordTitle')}</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            {token ? 'Enter and confirm your new password below.' : (email ? `${t('resetPasswordSub')} (${email})` : t('resetPasswordSub'))}
          </Text>
        </View>

        <View style={styles.form}>
          {/* OTP Code Input (only shown if not already verified via Step 2) */}
          {!token ? (
            <>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
                {t('otpLabel')}
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: themeColors.cardBg, borderColor: errorMessage ? '#E11D48' : themeColors.border },
                ]}
              >
                <Ionicons name="shield-checkmark-outline" size={20} color={themeColors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: themeColors.textPrimary, letterSpacing: 2 }, isRTL && styles.rtlInput]}
                  placeholder={t('otpPlaceholder')}
                  placeholderTextColor={themeColors.textMuted}
                  value={otpCode}
                  onChangeText={(value) => {
                    setOtpCode(value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  keyboardType="number-pad"
                  maxLength={12}
                />
              </View>
            </>
          ) : null}

          {/* New Password */}
          <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {t('newPasswordLabel')}
          </Text>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: themeColors.cardBg, borderColor: errorMessage ? '#E11D48' : themeColors.border },
            ]}
          >
            <Ionicons name="key-outline" size={20} color={themeColors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: themeColors.textPrimary }, isRTL && styles.rtlInput]}
              placeholder={t('newPasswordPlaceholder')}
              placeholderTextColor={themeColors.textMuted}
              value={newPassword}
              onChangeText={(value) => {
                setNewPassword(value);
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
            {t('confirmNewPasswordLabel')}
          </Text>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: themeColors.cardBg, borderColor: errorMessage ? '#E11D48' : themeColors.border },
            ]}
          >
            <Ionicons name="keypad-outline" size={20} color={themeColors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: themeColors.textPrimary }, isRTL && styles.rtlInput]}
              placeholder={t('confirmNewPasswordPlaceholder')}
              placeholderTextColor={themeColors.textMuted}
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                if (errorMessage) setErrorMessage('');
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: isLoading ? '#A0AEC0' : themeColors.primary }]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>{t('resetPasswordBtn')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={onNavigateLogin}>
          <Ionicons name="arrow-back" size={18} color={themeColors.primary} />
          <Text style={[styles.backBtnText, { color: themeColors.primary }]}>{t('backToLogin')}</Text>
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
  leftAlignedText: {
    textAlign: 'left',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  leftAlignedInput: {
    textAlign: 'left',
  },
  eyeIcon: {
    padding: 6,
  },
  errorText: {
    color: '#E11D48',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 12,
    fontWeight: '600',
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
    fontSize: 17,
    fontWeight: '700',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
