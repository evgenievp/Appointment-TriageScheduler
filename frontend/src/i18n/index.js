import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import bg from './locales/bg.json';
import en from './locales/en.json';

export const LANGUAGES = ['bg', 'en'];

// Български е езикът по подразбиране — клиниката е българска. Английският е за
// пациенти, които не четат кирилица. Изборът се помни в localStorage; при първо
// посещение се пробва езикът на браузъра.
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      bg: { translation: bg },
      en: { translation: en },
    },
    fallbackLng: 'bg',
    supportedLngs: LANGUAGES,
    load: 'languageOnly', // "en-GB" от браузъра се свежда до "en"
    detection: {
      // ?lng=en е удобно за споделяне на линк и за проверка без клик по бутона.
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lng',
      lookupLocalStorage: 'lang',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false }, // React вече escape-ва
  });

// `lang` атрибутът и заглавието на таба следват избрания език.
function syncDocument(lng) {
  document.documentElement.lang = lng;
  document.title = i18n.t('common.documentTitle');
}
i18n.on('languageChanged', syncDocument);
syncDocument(i18n.resolvedLanguage);

export default i18n;
