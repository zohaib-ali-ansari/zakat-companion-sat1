import React, { createContext, useContext, useState } from 'react';
import { translations } from '../i18n/translations';
import { getThemeColors } from '../theme/colors';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ur'); // Default to Urdu
  const [isDarkMode, setIsDarkMode] = useState(false);

  const t = (key) => {
    const langDict = translations[language] || translations.en;
    return langDict[key] || translations.en[key] || key;
  };

  const isRTL = language === 'ur';
  const themeColors = getThemeColors(isDarkMode);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

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
