/**
 * Locale management with language switching support
 * Stores user preference in localStorage and provides React context
 */

import { safeLocalStorage } from "./polyfills";

export type SupportedLocale = "en-KE" | "sw-KE";

export interface LocaleInfo {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LOCALES: Record<SupportedLocale, LocaleInfo> = {
  "en-KE": {
    code: "en-KE",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
  },
  "sw-KE": {
    code: "sw-KE",
    name: "Swahili",
    nativeName: "Kiswahili",
    flag: "🇰🇪",
  },
};

const LOCALE_STORAGE_KEY = "jengahacks_locale";

/**
 * Get the current locale from storage or default
 */
export const getStoredLocale = (): SupportedLocale => {
  const stored = safeLocalStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && stored in SUPPORTED_LOCALES) {
    return stored as SupportedLocale;
  }
  return "en-KE"; // Default
};

/**
 * Set the locale in storage
 */
export const setStoredLocale = (locale: SupportedLocale): boolean => {
  return safeLocalStorage.setItem(LOCALE_STORAGE_KEY, locale);
};

/**
 * Get locale info
 */
export const getLocaleInfo = (locale: SupportedLocale): LocaleInfo => {
  return SUPPORTED_LOCALES[locale];
};

/**
 * Get all supported locales
 */
export const getSupportedLocales = (): LocaleInfo[] => {
  return Object.values(SUPPORTED_LOCALES);
};

