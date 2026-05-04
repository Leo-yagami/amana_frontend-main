import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import arTranslations from './locales/ar.json';
import amTranslations from './locales/am.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  ar: {
    translation: arTranslations,
  },
  am: {
    translation: amTranslations,
  },
};

// Get stored language from localStorage or default to English
const storedLanguage = localStorage.getItem('language') || 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: storedLanguage,
  fallbackLng: 'en',
  defaultNS: 'translation',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
