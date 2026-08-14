import { useContext } from "react";
import { I18nContext, type I18nContextType } from "@/context/i18n-context";

export const useLanguage = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useLanguage must be used within an I18nProvider");
  }
  return context;
};

export type { Language, TranslationKey } from "@/context/i18n-context";
