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

export const LoginScreen = ({ onLoginSuccess, onNavigateSignUp, onNavigateForgot, isLoading = false, submitError = '' }) => {
  const { themeColors } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(submitError || '');

  const displayError = errorMessage || submitError;

  useEffect(() => {
    if (submitError) {
      setErrorMessage(submitError);
    }
  }, [submitError]);

  const handleLoginPress = () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage('Email or password is wrong');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setErrorMessage('Email or password is wrong');
      return;
    }

    if (trimmedPassword.length < 6) {
      setErrorMessage('Email or password is wrong');
      return;
    }

    setErrorMessage('');
    onLoginSuccess(trimmedEmail, trimmedPassword);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />

      <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
        
        {/* Top Header Card */}
        <View style={styles.headerBox}>
          <View style={[styles.iconCircle, { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder }]}>
            <Ionicons name="lock-closed" size={32} color={themeColors.primary} />
          </View>
          <Text style={[styles.title, { color: themeColors.textPrimary }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Sign in to continue</Text>
        </View>

        {/* Form Container */}
        <View style={styles.form}>
          {/* Email Input */}
          <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, styles.leftAlignedText]}>
            Email
          </Text>
          <View style={[styles.inputWrapper, { backgroundColor: themeColors.cardBg, borderColor: errorMessage ? '#E11D48' : themeColors.border }]}>
            <Ionicons name="mail-outline" size={20} color={themeColors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: themeColors.textPrimary }, styles.leftAlignedInput]}
              placeholder="Enter your email"
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

          {/* Password Input */}
          <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, styles.leftAlignedText]}>
            Password
          </Text>
          <View style={[styles.inputWrapper, { backgroundColor: themeColors.cardBg, borderColor: errorMessage ? '#E11D48' : themeColors.border }]}>
            <Ionicons name="key-outline" size={20} color={themeColors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: themeColors.textPrimary }, styles.leftAlignedInput]}
              placeholder="Enter your password"
              placeholderTextColor={themeColors.textMuted}
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (errorMessage) setErrorMessage('');
              }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={themeColors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {displayError ? <Text style={styles.errorText}>{displayError}</Text> : null}

          {/* Forgot Password Link */}
          <TouchableOpacity style={styles.forgotBtn} onPress={onNavigateForgot}>
            <Text style={[styles.forgotText, { color: themeColors.primary }]}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: isLoading ? '#A0AEC0' : themeColors.primary }]}
            onPress={handleLoginPress}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Sign In</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Navigation */}
        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>Don’t have an account?</Text>
          <TouchableOpacity onPress={onNavigateSignUp}>
            <Text style={[styles.linkText, { color: themeColors.primary }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
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
    paddingVertical: 32,
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '700',
  },
  errorText: {
    color: '#E11D48',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '600',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 26,
    gap: 8,
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
