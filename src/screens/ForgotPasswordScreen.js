import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

export const ForgotPasswordScreen = ({
  onNavigateLogin,
  onNavigateReset,
  onSendResetRequest,
  isLoading = false,
  submitError = '',
}) => {
  const { t, themeColors, isRTL } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState(submitError || '');

  useEffect(() => {
    if (submitError) {
      setErrorMessage(submitError);
    }
  }, [submitError]);

  const handleSend = async () => {
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
    const result = await onSendResetRequest?.(trimmedEmail);
    if (result?.success) {
      setIsSent(true);
      onNavigateReset?.(trimmedEmail);
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
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerBox}>
              <View style={[styles.iconCircle, { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder }]}>
                <Ionicons name="keypad-outline" size={32} color={themeColors.primary} />
              </View>
              <Text style={[styles.title, { color: themeColors.textPrimary }]}>{t('forgotTitle')}</Text>
              <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>{t('forgotSub')}</Text>
            </View>

            {isSent ? (
              <View style={styles.form}>
                <View style={[styles.successCard, { backgroundColor: themeColors.successBg, borderColor: themeColors.success }]}>
                  <Ionicons name="checkmark-circle" size={28} color={themeColors.success} />
                  <Text style={[styles.successText, { color: themeColors.textPrimary }]}>
                    {t('resetSentSuccess')}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: themeColors.primary, marginBottom: 16 }]}
                  onPress={() => onNavigateReset?.(email.trim())}
                  activeOpacity={0.85}
                >
                  <Text style={styles.submitBtnText}>{t('enterOtpBtn')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.form}>
                <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
                  {t('emailLabel')}
                </Text>
                <View style={[styles.inputWrapper, { backgroundColor: themeColors.cardBg, borderColor: errorMessage ? '#E11D48' : themeColors.border }]}>
                  <Ionicons name="mail-outline" size={20} color={themeColors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: themeColors.textPrimary }, isRTL && styles.rtlInput]}
                    placeholder={t('emailPlaceholder')}
                    placeholderTextColor={themeColors.textMuted}
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: isLoading ? '#A0AEC0' : themeColors.primary }]}
                  onPress={handleSend}
                  activeOpacity={0.85}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>{t('sendResetLinkBtn')}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.alreadyHaveOtpBtn}
                  onPress={() => onNavigateReset?.(email.trim())}
                >
                  <Text style={[styles.alreadyHaveOtpText, { color: themeColors.primary }]}>
                    {t('enterOtpBtn')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

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
    paddingBottom: 60,
    flexGrow: 1,
    justifyContent: 'center',
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 32,
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
    height: 52,
    marginBottom: 20,
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
  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 26,
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
  errorText: {
    color: '#E11D48',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 24,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
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
  alreadyHaveOtpBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 8,
  },
  alreadyHaveOtpText: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
