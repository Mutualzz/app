import { resolveProfileBackgroundFill } from "@mutualzz/ui-core";
import { Box } from "@mutualzz/ui-web";
import type { CSSObject } from "@emotion/react";

export const profileBlockSurfaceCss: CSSObject = {
  position: "relative",
  isolation: "isolate"
};

export function ProfileBlockBackgroundFill({
  backgroundColor
}: {
  backgroundColor?: string | null;
}) {
  const fill = backgroundColor?.trim();
  if (!fill) return null;

  return (
    <Box
      aria-hidden
      css={{
        position: "absolute",
        inset: 0,
        zIndex: -1,
        background: resolveProfileBackgroundFill(fill, "transparent"),
        pointerEvents: "none"
      }}
    />
  );
}
