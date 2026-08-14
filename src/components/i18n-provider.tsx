import React, { useEffect, useState } from "react";
import {
  I18nContext,
  translations,
  type Language,
  type TranslationKey,
} from "@/context/i18n-context";

type I18nProviderProps = {
  children: React.ReactNode;
  defaultLanguage?: Language;
  storageKey?: string;
};

export function I18nProvider({
  children,
  defaultLanguage = "en",
  storageKey = "resumenova_lang",
}: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      if (stored === "bn" || stored === "en") return stored;
    }
    return defaultLanguage;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem(storageKey);
      if (stored === "bn" || stored === "en") {
        setLanguageState(stored);
      }
    };

    window.addEventListener("languagechange", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("languagechange", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [storageKey]);

  const setLanguage = (lang: Language) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, lang);
      window.dispatchEvent(new Event("languagechange"));
    }
    setLanguageState(lang);
  };

  const t = (key: TranslationKey, fallback?: string): string => {
    return translations[language]?.[key] ?? translations.en[key] ?? fallback ?? key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>{children}</I18nContext.Provider>
  );
}
