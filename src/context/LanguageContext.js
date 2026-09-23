import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../i18n/translations';
import { getThemeColors } from '../theme/colors';

const LanguageContext = createContext();

const LANG_STORAGE_KEY = '@zakat_app_language';
const THEME_STORAGE_KEY = '@zakat_dark_mode';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('ur'); // Default to Urdu
  const [isDarkMode, setIsDarkModeState] = useState(false);

  useEffect(() => {
    const loadStoredPreferences = async () => {
      try {
        const storedLang = await AsyncStorage.getItem(LANG_STORAGE_KEY);
        if (storedLang) {
          setLanguageState(storedLang);
        }
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme !== null) {
          setIsDarkModeState(storedTheme === 'true');
        }
      } catch (e) {
        console.warn('Failed to load language/theme preferences:', e);
      }
    };
    loadStoredPreferences();
  }, []);

  const setLanguage = async (newLang) => {
    setLanguageState(newLang);
    try {
      await AsyncStorage.setItem(LANG_STORAGE_KEY, newLang);
    } catch (e) {
      console.warn('Failed to save language preference:', e);
    }
  };

  const setIsDarkMode = async (val) => {
    setIsDarkModeState(val);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, String(val));
    } catch (e) {
      console.warn('Failed to save dark mode preference:', e);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkModeState((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_STORAGE_KEY, String(next)).catch(() => {});
      return next;
    });
  };

  const t = (key) => {
    const langDict = translations[language] || translations.en;
    return langDict[key] || translations.en[key] || key;
  };

  const isRTL = language === 'ur';
  const themeColors = getThemeColors(isDarkMode);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isRTL,
        isDarkMode,
        setIsDarkMode,
        toggleDarkMode,
        themeColors,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
