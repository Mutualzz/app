import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
  type AppLocale,
  dayjsLocaleIds,
  LOCALE_STORAGE_KEY,
  resolveLocale,
  resources,
  supportedLocales
} from "@mutualzz/i18n";
import "@mutualzz/i18n/types";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import "dayjs/locale/de";
import "dayjs/locale/es";
import "dayjs/locale/fr";
import "dayjs/locale/it";
import "dayjs/locale/ja";
import "dayjs/locale/ko";
import "dayjs/locale/nl";
import "dayjs/locale/pl";
import "dayjs/locale/pt-br";
import "dayjs/locale/ru";
import "dayjs/locale/sv";
import "dayjs/locale/tr";
import "dayjs/locale/uk";
import "dayjs/locale/zh-cn";
import "dayjs/locale/zh-tw";
import { calendarStrings } from "@mutualzz/client";

function readStoredLocale(): AppLocale | null {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (!stored) return null;
    if (stored === "system") return null;
    return resolveLocale(stored);
  } catch {
    return null;
  }
}

function syncDayjsLocale(lng: string) {
  const locale = resolveLocale(lng);
  dayjs.locale(dayjsLocaleIds[locale]);
  calendarStrings.sameDay = i18n.t("calendar.sameDay", { ns: "common" });
  calendarStrings.nextDay = i18n.t("calendar.nextDay", { ns: "common" });
  calendarStrings.lastDay = i18n.t("calendar.lastDay", { ns: "common" });
  calendarStrings.lastWeek = i18n.t("calendar.lastWeek", { ns: "common" });
  calendarStrings.sameElse = i18n.t("calendar.sameElse", { ns: "common" });
}

const storedLocale = readStoredLocale();
const initialLng = storedLocale ?? resolveLocale(navigator.language);

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLng,
  fallbackLng: "en",
  defaultNS: "common",
  interpolation: { escapeValue: false },
  supportedLngs: Object.keys(resources)
});

syncDayjsLocale(initialLng);
i18n.on("languageChanged", syncDayjsLocale);

/** `null` = follow device/browser language. */
export function getPreferredLocale(): AppLocale | null {
  return readStoredLocale();
}

export function setPreferredLocale(locale: AppLocale | "system") {
  if (locale === "system") {
    localStorage.removeItem(LOCALE_STORAGE_KEY);
    void i18n.changeLanguage(resolveLocale(navigator.language));
    return;
  }

  if (!supportedLocales.includes(locale)) return;
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  void i18n.changeLanguage(locale);
}

export default i18n;
