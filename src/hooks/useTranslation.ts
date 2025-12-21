/**
 * React hook for translations
 * Automatically updates when locale changes
 */

import { useState, useEffect, useCallback } from "react";
import { t as translate, getTranslations, hasTranslation } from "@/lib/translations";
import { getStoredLocale, type SupportedLocale } from "@/lib/locale";

export const useTranslation = () => {
  const [locale, setLocale] = useState<SupportedLocale>(getStoredLocale());

  // Listen for locale changes
  useEffect(() => {
    const handleLocaleChange = (event: CustomEvent<{ locale: SupportedLocale }>) => {
      setLocale(event.detail.locale);
    };

    const handleStorageChange = () => {
      setLocale(getStoredLocale());
    };

    window.addEventListener("localechange", handleLocaleChange as EventListener);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("localechange", handleLocaleChange as EventListener);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return translate(key, params, locale);
    },
    [locale]
  );

  const getNamespace = useCallback(
    (namespace: string) => {
      return getTranslations(namespace, locale);
    },
    [locale]
  );

  const hasKey = useCallback(
    (key: string) => {
      return hasTranslation(key, locale);
    },
    [locale]
  );

  return {
    t,
    locale,
    getNamespace,
    hasKey,
  };
};

