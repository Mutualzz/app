import type { CSSObject } from "@emotion/react";
import { formatColor } from "@mutualzz/ui-core";
import { Box, useTheme } from "@mutualzz/ui-web";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function useProfileScrimCss(): CSSObject {
  const { theme } = useTheme();

  return {
    backgroundColor: formatColor(theme.colors.surface, {
      format: "hexa",
      alpha: 72
    }),
    backdropFilter: "blur(12px) saturate(1.2)",
    border: `1px solid ${formatColor(theme.colors.neutral, {
      format: "hexa",
      alpha: 15
    })}`
  };
}

export const ProfileScrim = ({ children }: Props) => {
  const scrimCss = useProfileScrimCss();

  return (
    <Box px={1.25} py={1} borderRadius={10} css={scrimCss}>
      {children}
    </Box>
  );
};
