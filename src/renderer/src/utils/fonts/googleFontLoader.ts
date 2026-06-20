import {
  getFontByFamily,
  getFontWeights,
  type FontDefinition,
} from "@mutualzz/ui-core";

const loaded = new Set<string>();
const pending = new Map<string, Promise<void>>();

function buildBunnyUrl(family: string, weights: readonly number[]) {
  const familyParam = encodeURIComponent(family).replace(/%20/g, "+");
  const weightParam = [...new Set(weights)].sort((a, b) => a - b).join(";");
  return `https://fonts.bunny.net/css2?family=${familyParam}:wght@${weightParam}&display=swap`;
}

function buildGoogleUrl(family: string, weights: readonly number[]) {
  const familyParam = encodeURIComponent(family).replace(/%20/g, "+");
  const weightParam = [...new Set(weights)].sort((a, b) => a - b).join(";");
  return `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weightParam}&display=swap`;
}

function buildFontshareUrl(family: string, weights: readonly number[]) {
  const slug = family.toLowerCase().replace(/\s+/g, "-");
  const weightParam = [...new Set(weights)].sort((a, b) => a - b).join(",");
  return `https://api.fontshare.com/v2/css?f[]=${slug}@${weightParam}&display=swap`;
}

function buildStylesheetUrls(font: FontDefinition, family: string, weights: readonly number[]) {
  if (font.provider === "fontshare") {
    return [buildFontshareUrl(family, weights)];
  }

  return [buildBunnyUrl(family, weights), buildGoogleUrl(family, weights)];
}

function injectStylesheet(href: string) {
  const existing = document.querySelector<HTMLLinkElement>(
    `link[data-font-stylesheet="${href}"]`,
  );
  if (existing) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.fontStylesheet = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load font: ${href}`));
    document.head.appendChild(link);
  });
}

async function loadStylesheetUrls(urls: string[]) {
  let lastError: unknown;

  for (const url of urls) {
    try {
      await injectStylesheet(url);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Failed to load font stylesheet");
}

export async function ensureGoogleFont(
  family: string | null | undefined,
  weights?: readonly number[],
) {
  if (!family) return;

  const font = getFontByFamily(family);
  const resolvedFamily = font?.family ?? family;
  const resolvedWeights = weights ?? font?.weights ?? getFontWeights(family);
  const key = `${resolvedFamily}:${resolvedWeights.join(",")}`;

  if (loaded.has(key)) return;

  const inflight = pending.get(key);
  if (inflight) return inflight;

  const urls = buildStylesheetUrls(
    font ?? {
      id: resolvedFamily.toLowerCase(),
      family: resolvedFamily,
      category: "sans-serif",
      weights: resolvedWeights,
      provider: "google",
    },
    resolvedFamily,
    resolvedWeights,
  );

  const request = loadStylesheetUrls(urls)
    .then(() => {
      loaded.add(key);
    })
    .finally(() => {
      pending.delete(key);
    });

  pending.set(key, request);
  return request;
}

export const ensureFont = ensureGoogleFont;
