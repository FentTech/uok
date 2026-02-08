import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enCommon from "./locales/en/common.json";
import enHome from "./locales/en/home.json";
import enAuth from "./locales/en/auth.json";
import enDashboard from "./locales/en/dashboard.json";
import enContact from "./locales/en/contact.json";
import enPages from "./locales/en/pages.json";
import enValidation from "./locales/en/validation.json";

// Add other languages
import zhCommon from "./locales/zh/common.json";
import zhHome from "./locales/zh/home.json";
import zhAuth from "./locales/zh/auth.json";
import zhDashboard from "./locales/zh/dashboard.json";
import zhContact from "./locales/zh/contact.json";
import zhPages from "./locales/zh/pages.json";
import zhValidation from "./locales/zh/validation.json";

import jaCommon from "./locales/ja/common.json";
import jaHome from "./locales/ja/home.json";
import jaAuth from "./locales/ja/auth.json";
import jaDashboard from "./locales/ja/dashboard.json";
import jaContact from "./locales/ja/contact.json";
import jaPages from "./locales/ja/pages.json";
import jaValidation from "./locales/ja/validation.json";

import arCommon from "./locales/ar/common.json";
import arHome from "./locales/ar/home.json";
import arAuth from "./locales/ar/auth.json";
import arDashboard from "./locales/ar/dashboard.json";
import arContact from "./locales/ar/contact.json";
import arPages from "./locales/ar/pages.json";
import arValidation from "./locales/ar/validation.json";

import frCommon from "./locales/fr/common.json";
import frHome from "./locales/fr/home.json";
import frAuth from "./locales/fr/auth.json";
import frDashboard from "./locales/fr/dashboard.json";
import frContact from "./locales/fr/contact.json";
import frPages from "./locales/fr/pages.json";
import frValidation from "./locales/fr/validation.json";

import koCommon from "./locales/ko/common.json";
import koHome from "./locales/ko/home.json";
import koAuth from "./locales/ko/auth.json";
import koDashboard from "./locales/ko/dashboard.json";
import koContact from "./locales/ko/contact.json";
import koPages from "./locales/ko/pages.json";
import koValidation from "./locales/ko/validation.json";

import esCommon from "./locales/es/common.json";
import esHome from "./locales/es/home.json";
import esAuth from "./locales/es/auth.json";
import esDashboard from "./locales/es/dashboard.json";
import esContact from "./locales/es/contact.json";
import esPages from "./locales/es/pages.json";
import esValidation from "./locales/es/validation.json";

import ptCommon from "./locales/pt/common.json";
import ptHome from "./locales/pt/home.json";
import ptAuth from "./locales/pt/auth.json";
import ptDashboard from "./locales/pt/dashboard.json";
import ptContact from "./locales/pt/contact.json";
import ptPages from "./locales/pt/pages.json";
import ptValidation from "./locales/pt/validation.json";

export const SUPPORTED_LANGUAGES = {
  en: { name: "English", flag: "🇬🇧" },
  zh: { name: "中文", flag: "🇨🇳" },
  ja: { name: "日本語", flag: "🇯🇵" },
  ar: { name: "العربية", flag: "🇸🇦" },
  fr: { name: "Français", flag: "🇫🇷" },
  ko: { name: "한국어", flag: "🇰🇷" },
  es: { name: "Español", flag: "🇪🇸" },
  pt: { name: "Português", flag: "🇵🇹" },
};

const resources = {
  en: {
    common: enCommon,
    home: enHome,
    auth: enAuth,
    dashboard: enDashboard,
    contact: enContact,
    pages: enPages,
    validation: enValidation,
  },
  zh: {
    common: zhCommon,
    home: zhHome,
    auth: zhAuth,
    dashboard: zhDashboard,
    contact: zhContact,
    pages: zhPages,
    validation: zhValidation,
  },
  ja: {
    common: jaCommon,
    home: jaHome,
    auth: jaAuth,
    dashboard: jaDashboard,
    contact: jaContact,
    pages: jaPages,
    validation: jaValidation,
  },
  ar: {
    common: arCommon,
    home: arHome,
    auth: arAuth,
    dashboard: arDashboard,
    contact: arContact,
    pages: arPages,
    validation: arValidation,
  },
  fr: {
    common: frCommon,
    home: frHome,
    auth: frAuth,
    dashboard: frDashboard,
    contact: frContact,
    pages: frPages,
    validation: frValidation,
  },
  ko: {
    common: koCommon,
    home: koHome,
    auth: koAuth,
    dashboard: koDashboard,
    contact: koContact,
    pages: koPages,
    validation: koValidation,
  },
  es: {
    common: esCommon,
    home: esHome,
    auth: esAuth,
    dashboard: esDashboard,
    contact: esContact,
    pages: esPages,
    validation: esValidation,
  },
  pt: {
    common: ptCommon,
    home: ptHome,
    auth: ptAuth,
    dashboard: ptDashboard,
    contact: ptContact,
    pages: ptPages,
    validation: ptValidation,
  },
};

const savedLanguage =
  typeof window !== "undefined"
    ? localStorage.getItem("preferredLanguage")
    : "en";

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage || "en",
  fallbackLng: "en",
  defaultNS: "common",
  ns: ["common", "home", "auth", "dashboard", "contact", "pages", "validation"],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
