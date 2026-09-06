export const lightColors = {
  primary: '#1A4FD6',
  primaryDark: '#123BB4',
  primaryLight: '#EEF2FF',
  primaryBorder: '#C7D2FE',
  
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  cardBgAlt: '#F1F5F9',
  
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',
  
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  
  badgeBg: '#E0E7FF',
  badgeText: '#1A4FD6',
  
  danger: '#EF4444',
  dangerBg: '#FEE2E2',
  
  success: '#10B981',
  successBg: '#D1FAE5',
  
  black: '#000000',
  white: '#FFFFFF',
  gray: '#6B7280',
};

export const darkColors = {
  primary: '#3B82F6',
  primaryDark: '#1D4ED8',
  primaryLight: '#1E293B',
  primaryBorder: '#2563EB',
  
  background: '#0F172A',
  cardBg: '#1E293B',
  cardBgAlt: '#334155',
  
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  textWhite: '#FFFFFF',
  
  border: '#334155',
  borderLight: '#1E293B',
  
  badgeBg: '#1E293B',
  badgeText: '#60A5FA',
  
  danger: '#F87171',
  dangerBg: '#451A1A',
  
  success: '#34D399',
  successBg: '#064E3B',
  
  black: '#000000',
  white: '#FFFFFF',
  gray: '#9CA3AF',
};

export const colors = lightColors;

export const getThemeColors = (isDark) => (isDark ? darkColors : lightColors);
