
'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
// If loading translations from public/locales:
// import HttpApi from 'i18next-http-backend';

// Import translations directly
import enTranslation from '../../public/locales/en/translation.json';
import siTranslation from '../../public/locales/si/translation.json';
import taTranslation from '../../public/locales/ta/translation.json';

const resources = {
  en: {
    translation: enTranslation,
  },
  si: {
    translation: siTranslation,
  },
  ta: {
    translation: taTranslation,
  },
};

i18n
  // .use(HttpApi) // Uncomment if using HttpApi to load translations from public/locales
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources, // Use imported resources
    // backend: { // Configuration for HttpApi
    //   loadPath: '/locales/{{lng}}/translation.json',
    // },
    lng: typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') || 'en' : 'en', // Default language
    fallbackLng: 'en', // Fallback language if translation is missing
    supportedLngs: ['en', 'si', 'ta'],
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
    },
  });

export default i18n;
