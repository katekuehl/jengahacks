/**
 * Translation system for multi-language support
 */

import { getStoredLocale, type SupportedLocale } from "./locale";
import enTranslations from "../locales/en.json";
import swTranslations from "../locales/sw.json";

type TranslationKey = string;
type TranslationParams = Record<string, string | number>;

const translations: Record<SupportedLocale, typeof enTranslations> = {
  "en-KE": enTranslations,
  "sw-KE": swTranslations,
};

/**
 * Get translation for a key
 * Supports nested keys using dot notation (e.g., "hero.title")
 * Supports parameter interpolation using {param} syntax
 */
export const t = (
  key: TranslationKey,
  params?: TranslationParams,
  locale?: SupportedLocale
): string => {
  const currentLocale = locale || getStoredLocale();
  const translation = translations[currentLocale] || translations["en-KE"];

  // Navigate nested object using dot notation
  const keys = key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = translation;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      // Fallback to English if key not found
      if (currentLocale !== "en-KE") {
        return t(key, params, "en-KE");
      }
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  if (typeof value !== "string") {
    console.warn(`Translation value is not a string for key: ${key}`);
    return key;
  }

  // Replace parameters in translation string
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match;
    });
  }

  return value;
};

/**
 * Get all translations for a namespace
 */
export const getTranslations = (
  namespace: string,
  locale?: SupportedLocale
): Record<string, unknown> => {
  const currentLocale = locale || getStoredLocale();
  const translation = translations[currentLocale] || translations["en-KE"];

  const keys = namespace.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = translation;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return {};
    }
  }

  return value || {};
};

/**
 * Check if a translation key exists
 */
export const hasTranslation = (key: TranslationKey, locale?: SupportedLocale): boolean => {
  const currentLocale = locale || getStoredLocale();
  const translation = translations[currentLocale] || translations["en-KE"];

  const keys = key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = translation;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return false;
    }
  }

  return typeof value === "string";
};

