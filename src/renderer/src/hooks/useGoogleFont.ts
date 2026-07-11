import {
  isCustomFontRef,
  parseCustomFontHash,
  resolveFontFamilyCss,
} from "@mutualzz/ui-core";
import i18n from "@renderer/i18n";
import { ensureAppFont } from "@utils/fonts/appFontLoader";
import { useEffect, useState } from "react";

export function useGoogleFont(
  family: string | null | undefined,
  ownerUserId?: string | null,
) {
  const [ready, setReady] = useState(!family);

  useEffect(() => {
    if (!family) {
      setReady(true);
      return;
    }

    let cancelled = false;
    setReady(false);

    void ensureAppFont(family, ownerUserId).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [family, ownerUserId]);

  return {
    ready,
    fontFamily: family ? resolveFontFamilyCss(family) : undefined,
    isCustom: isCustomFontRef(family ?? ""),
    customHash: parseCustomFontHash(family),
  };
}

export function getCustomFontLabel(family: string | null | undefined) {
  if (!family || !isCustomFontRef(family)) return null;
  return i18n.t("fonts.customFont", { ns: "settings" });
}
