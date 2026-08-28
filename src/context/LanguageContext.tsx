import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { translations, SUPPORTED_LANGUAGES } from '@/i18n/translations';
import { LanguageCode, LanguageMeta } from '@/types/game';

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (langCode: LanguageCode) => void;
  t: (keyPath: string, replacements?: Record<string, string | number>) => string;
  languages: LanguageMeta[];
  currentLanguageMeta: LanguageMeta;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Detect initial language: stored -> browser -> 'tr'
  const getInitialLanguage = (): LanguageCode => {
    const stored = localStorage.getItem('PW_LANGUAGE') as LanguageCode | null;
    if (stored && ['en', 'tr', 'fr', 'de'].includes(stored)) {
      return stored;
    }
    const navLang = navigator.language?.slice(0, 2) as LanguageCode | undefined;
    if (navLang && ['en', 'tr', 'fr', 'de'].includes(navLang)) {
      return navLang;
    }
    return 'tr';
  };

  const [language, setLanguageState] = useState<LanguageCode>(getInitialLanguage);

  const setLanguage = (langCode: LanguageCode) => {
    if (['en', 'tr', 'fr', 'de'].includes(langCode)) {
      setLanguageState(langCode);
      localStorage.setItem('PW_LANGUAGE', langCode);
    }
  };

  // Translation helper function `t('section.key', { param: 'val' })`
  const t = useCallback((keyPath: string, replacements: Record<string, string | number> = {}): string => {
    const keys = keyPath.split('.');
    let current: any = translations[language];

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to English if translation key is missing
        let fallback: any = translations.en;
        for (const fbKey of keys) {
          if (fallback && fallback[fbKey] !== undefined) {
            fallback = fallback[fbKey];
          } else {
            return keyPath;
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current !== 'string') {
      return keyPath;
    }

    // Replace placeholders like {count}, {roles}, {players}, {round}
    let formatted = current;
    for (const [param, val] of Object.entries(replacements)) {
      formatted = formatted.replaceAll(`{${param}}`, String(val));
    }

    return formatted;
  }, [language]);

  const currentLanguageMeta = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: SUPPORTED_LANGUAGES, currentLanguageMeta }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
