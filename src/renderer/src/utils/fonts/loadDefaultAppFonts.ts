import { DEFAULT_FONT_FAMILY } from "@mutualzz/ui-core";
import { ensureGoogleFont } from "./googleFontLoader";

export async function loadDefaultAppFonts() {
  await Promise.all([
    ensureGoogleFont(DEFAULT_FONT_FAMILY),
    ensureGoogleFont("Inter"),
  ]);
}
