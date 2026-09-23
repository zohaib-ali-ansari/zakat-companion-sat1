import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }

  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || '';
  const debuggerHost = hostUri ? hostUri.split(':')[0] : null;

  const host = debuggerHost || (Platform.OS === 'web' ? 'localhost' : 'localhost');
  return `http://${host}:5000/api`;
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Backend server non-responsive or unreachable.');
    }
    throw error;
  }
};

const api = getApiBaseUrl();

export const registerUser = async (name, email, password) => {
  const response = await fetchWithTimeout(`${api}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  return data;
};

export const forgotPassword = async (email) => {
  const response = await fetchWithTimeout(`${api}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Password reset request failed');
  }

  return data;
};

export const verifyRegistrationOtp = async (email, otp) => {
  const response = await fetchWithTimeout(`${api}/auth/verify-registration-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'OTP verification failed');
  }

  return data;
};

export const verifyResetOtpApi = async (email, otp) => {
  const response = await fetchWithTimeout(`${api}/auth/verify-reset-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'OTP verification failed');
  }

  return data;
};

export const resendOtpApi = async (email, purpose = 'register') => {
  const response = await fetchWithTimeout(`${api}/auth/resend-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, purpose }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to resend OTP');
  }

  return data;
};

export const resetPassword = async ({ email, otp, token, newPassword, confirmPassword }) => {
  const response = await fetchWithTimeout(`${api}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      otp: otp || token,
      token: token || otp,
      newPassword,
      confirmPassword,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Password reset failed');
  }

  return data;
};

export const loginUser = async (email, password) => {
  const response = await fetchWithTimeout(`${api}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.message || 'Login failed');
    err.isEmailVerified = data.isEmailVerified;
    err.email = data.email || email;
    throw err;
  }

  return data;
};

export const getUserProfile = async (token) => {
  const response = await fetchWithTimeout(`${api}/user/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch user profile');
  }

  return data.user;
};

export const updateUserProfile = async (updates, token) => {
  const response = await fetchWithTimeout(`${api}/user/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update user profile');
  }

  return data.user;
};

