import {
  bundledLanguages,
  createHighlighter,
  type BundledLanguage,
  type Highlighter,
  type ThemedToken
} from "shiki";

export const CODE_THEMES = {
  dark: "github-dark",
  light: "github-light"
} as const;

export type CodeThemeType = keyof typeof CODE_THEMES;

let highlighterPromise: Promise<Highlighter> | null = null;
let readyHighlighter: Highlighter | null = null;
const loadingLanguages = new Map<BundledLanguage, Promise<void>>();

const getHighlighter = () => {
  highlighterPromise ??= createHighlighter({
    themes: Object.values(CODE_THEMES),
    langs: []
  }).then((highlighter) => {
    readyHighlighter = highlighter;
    return highlighter;
  });
  return highlighterPromise;
};

export const resolveCodeLanguage = (
  input: string | null | undefined
): BundledLanguage | null => {
  const name = input?.trim().toLowerCase();
  if (!name || !(name in bundledLanguages)) return null;
  return name as BundledLanguage;
};

const isLanguageLoaded = (
  highlighter: Highlighter,
  language: BundledLanguage
) => highlighter.getLoadedLanguages().includes(language);

export const loadCodeLanguage = async (language: BundledLanguage) => {
  const highlighter = await getHighlighter();
  if (isLanguageLoaded(highlighter, language)) return;

  let loading = loadingLanguages.get(language);
  if (!loading) {
    loading = highlighter.loadLanguage(language);
    loadingLanguages.set(language, loading);
  }
  await loading;
};

export const tokenizeCodeSync = (
  code: string,
  language: BundledLanguage,
  themeType: CodeThemeType
): ThemedToken[][] | null => {
  if (!readyHighlighter || !isLanguageLoaded(readyHighlighter, language)) {
    return null;
  }
  return readyHighlighter.codeToTokensBase(code, {
    lang: language,
    theme: CODE_THEMES[themeType]
  });
};

export const tokenizeCode = async (
  code: string,
  language: BundledLanguage,
  themeType: CodeThemeType
) => {
  await loadCodeLanguage(language);
  return tokenizeCodeSync(code, language, themeType);
};
