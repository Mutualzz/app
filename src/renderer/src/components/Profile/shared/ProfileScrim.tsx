import { formatColor } from "@mutualzz/ui-core";
import { Box, useTheme } from "@mutualzz/ui-web";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export const ProfileScrim = ({ children }: Props) => {
  const { theme } = useTheme();

  return (
    <Box
      px={1.25}
      py={1}
      borderRadius={10}
      css={{
        backgroundColor: formatColor(theme.colors.surface, {
          format: "hexa",
          alpha: 72
        })
      }}
    >
      {children}
    </Box>
  );
};
