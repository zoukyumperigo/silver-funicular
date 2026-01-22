import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pt from './pt';
import zh from './zh';

const resources = {
  pt: { translation: pt },
  zh: { translation: zh },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'pt',
  fallbackLng: 'pt',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;

export const changeLanguage = (language: 'pt' | 'zh') => {
  i18n.changeLanguage(language);
};

export const getCurrentLanguage = (): 'pt' | 'zh' => {
  return i18n.language as 'pt' | 'zh';
};
