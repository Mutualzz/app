import { resolveProfileBackgroundFill } from "@mutualzz/ui-core";
import { Box } from "@mutualzz/ui-web";

export function ProfileBlockBackgroundFill({
  backgroundColor,
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
        zIndex: 0,
        background: resolveProfileBackgroundFill(fill, "transparent"),
        pointerEvents: "none",
      }}
    />
  );
}
