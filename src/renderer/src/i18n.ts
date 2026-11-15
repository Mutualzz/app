import i18n, {
  type Resource,
  type ResourceKey,
  type ResourceLanguage
} from "i18next";
import { initReactI18next } from "react-i18next";
import {
  type AppLocale,
  dayjsLocaleIds,
  LOCALE_STORAGE_KEY,
  resolveLocale,
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

const englishFiles = import.meta.glob<ResourceKey>("@i18n-locales/en/*.json", {
  eager: true,
  import: "default"
});

const localeFileLoaders = import.meta.glob<ResourceKey>(
  ["@i18n-locales/*/*.json", "!@i18n-locales/en/*.json"],
  { import: "default" }
);

function namespaceOf(filePath: string) {
  return filePath.slice(filePath.lastIndexOf("/") + 1, -".json".length);
}

function localeOf(filePath: string) {
  const parts = filePath.split("/");
  return parts[parts.length - 2];
}

const englishResources: ResourceLanguage = Object.fromEntries(
  Object.entries(englishFiles).map(([filePath, content]) => [
    namespaceOf(filePath),
    content
  ])
);

if (!englishResources.common) {
  throw new Error(
    "English translations not found: check the @i18n-locales alias"
  );
}

async function fetchLocaleResources(
  locale: AppLocale
): Promise<ResourceLanguage> {
  const entries = await Promise.all(
    Object.entries(localeFileLoaders)
      .filter(([filePath]) => localeOf(filePath) === locale)
      .map(
        async ([filePath, load]) =>
          [namespaceOf(filePath), await load()] as const
      )
  );
  return Object.fromEntries(entries);
}

async function ensureLocaleLoaded(locale: AppLocale) {
  if (locale === "en" || i18n.hasResourceBundle(locale, "common")) return;
  const localeResources = await fetchLocaleResources(locale);
  for (const [namespace, content] of Object.entries(localeResources)) {
    i18n.addResourceBundle(locale, namespace, content, true, true);
  }
}

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

const initialResources: Resource = { en: englishResources };
if (initialLng !== "en") {
  initialResources[initialLng] = await fetchLocaleResources(initialLng);
}

await i18n.use(initReactI18next).init({
  resources: initialResources,
  lng: initialLng,
  fallbackLng: "en",
  returnEmptyString: false,
  defaultNS: "common",
  interpolation: { escapeValue: false },
  supportedLngs: supportedLocales
});

syncDayjsLocale(initialLng);
i18n.on("languageChanged", syncDayjsLocale);

/** `null` = follow device/browser language. */
export function getPreferredLocale(): AppLocale | null {
  return readStoredLocale();
}

export function setPreferredLocale(locale: AppLocale | "system") {
  if (locale !== "system" && !supportedLocales.includes(locale)) return;

  const nextLocale =
    locale === "system" ? resolveLocale(navigator.language) : locale;

  if (locale === "system") localStorage.removeItem(LOCALE_STORAGE_KEY);
  else localStorage.setItem(LOCALE_STORAGE_KEY, locale);

  void ensureLocaleLoaded(nextLocale).then(() =>
    i18n.changeLanguage(nextLocale)
  );
}

export default i18n;
