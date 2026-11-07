import { formatColor, resolveProfileBackgroundFill } from "@mutualzz/ui-core";
import { Box, useTheme } from "@mutualzz/ui-web";
import type { CSSObject } from "@emotion/react";

export const profileBlockSurfaceCss: CSSObject = {
  position: "relative",
  isolation: "isolate"
};

export function ProfileBlockBackgroundFill({
  backgroundColor,
  scrimWhenEmpty = true
}: {
  backgroundColor?: string | null;
  scrimWhenEmpty?: boolean;
}) {
  const { theme } = useTheme();
  const fill = backgroundColor?.trim();
  if (!fill && !scrimWhenEmpty) return null;

  return (
    <Box
      aria-hidden
      css={{
        position: "absolute",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        ...(fill
          ? { background: resolveProfileBackgroundFill(fill, "transparent") }
          : {
              backgroundColor: formatColor(theme.colors.surface, {
                format: "hexa",
                alpha: 62
              }),
              backdropFilter: "blur(12px) saturate(1.2)"
            })
      }}
    />
  );
}
