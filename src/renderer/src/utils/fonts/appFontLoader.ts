import { parseCustomFontRef, parseFontFamily } from "@mutualzz/ui-core";
import { ensureCustomFont } from "@utils/fonts/customFontLoader";
import { ensureGoogleFont } from "@utils/fonts/googleFontLoader";

export async function ensureAppFont(
  family: string | null | undefined,
  ownerUserId?: string | null,
) {
  if (!family) return;

  const customFont = parseCustomFontRef(family);
  if (customFont) {
    if (!ownerUserId) return;
    await ensureCustomFont(ownerUserId, customFont.hash, customFont.ext);
    return;
  }

  const parsed = parseFontFamily(family);
  await ensureGoogleFont(parsed?.type === "web" ? parsed.family : family);
}
