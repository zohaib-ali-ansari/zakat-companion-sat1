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

export const SignUpScreen = ({ onSignUpSuccess, onNavigateLogin, isLoading = false, submitError = '' }) => {
  const { themeColors } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(true);
  const [errorMessage, setErrorMessage] = useState(submitError || '');

  const displayError = errorMessage || submitError;

  useEffect(() => {
    if (submitError) {
      setErrorMessage(submitError);
    }
  }, [submitError]);

  const handleSignUpPress = () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (trimmedPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (!agree) {
      setErrorMessage('Please accept the terms to continue.');
      return;
    }

    setErrorMessage('');
    onSignUpSuccess(trimmedName, trimmedEmail, trimmedPassword);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
        
        {/* Header */}
        <View style={styles.headerBox}>
          <View style={[styles.iconCircle, { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder }]}>
            <Ionicons name="person-add" size={32} color={themeColors.primary} />
          </View>
          <Text style={[styles.title, { color: themeColors.textPrimary }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Join us to manage your zakat journey</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Full Name */}
          <Text style={[styles.inputLabel, { color: themeColors.textPrimary }, styles.leftAlignedText]}>
            Full Name
          </Text>
          <View style={[styles.inputWrapper, { backgroundColor: themeColors.cardBg, borderColor: errorMessage ? '#E11D48' : themeColors.border }]}>
            <Ionicons name="person-outline" size={20} color={themeColors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: themeColors.textPrimary }, styles.leftAlignedInput]}
              placeholder="Enter your full name"
              placeholderTextColor={themeColors.textMuted}
              value={fullName}
              onChangeText={(value) => {
                setFullName(value);
                if (errorMessage) setErrorMessage('');
              }}
            />
          </View>

          {/* Email */}
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

          {/* Password */}
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
              secureTextEntry
            />
          </View>

          {displayError ? <Text style={styles.errorText}>{displayError}</Text> : null}

          {/* Agree Terms Checkbox */}
          <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgree(!agree)} activeOpacity={0.8}>
            <View style={[styles.checkbox, agree && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }]}>
              {agree && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
            <Text style={[styles.checkboxText, { color: themeColors.textSecondary }]}>I agree to the Terms and Conditions</Text>
          </TouchableOpacity>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: isLoading ? '#A0AEC0' : themeColors.primary }]}
            onPress={handleSignUpPress}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Sign Up</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>Already have an account?</Text>
          <TouchableOpacity onPress={onNavigateLogin}>
            <Text style={[styles.linkText, { color: themeColors.primary }]}>Sign In</Text>
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
    marginBottom: 24,
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
    marginTop: 10,
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
    height: 50,
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxText: {
    fontSize: 13,
    flex: 1,
  },
  errorText: {
    color: '#E11D48',
    fontSize: 12,
    marginTop: 6,
    marginBottom: 2,
    fontWeight: '600',
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
