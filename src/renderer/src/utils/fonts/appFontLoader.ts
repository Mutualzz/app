import { parseCustomFontHash, parseFontFamily } from "@mutualzz/ui-core";
import { ensureCustomFont } from "@utils/fonts/customFontLoader";
import { ensureGoogleFont } from "@utils/fonts/googleFontLoader";

export async function ensureAppFont(
  family: string | null | undefined,
  ownerUserId?: string | null,
) {
  if (!family) return;

  const customHash = parseCustomFontHash(family);
  if (customHash) {
    if (!ownerUserId) return;
    await ensureCustomFont(ownerUserId, customHash);
    return;
  }

  const parsed = parseFontFamily(family);
  await ensureGoogleFont(parsed?.type === "web" ? parsed.family : family);
}
