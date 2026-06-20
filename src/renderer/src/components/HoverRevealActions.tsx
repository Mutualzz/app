import { Stack } from "@mutualzz/ui-web";
import type { ReactNode } from "react";

interface Props {
  visible: boolean;
  children: ReactNode;
  minWidth?: number | string;
  /** Reserve vertical space so hover never changes row height */
  minHeight?: number | string;
}


export const HoverRevealActions = ({
  visible,
  children,
  minWidth = "2.5rem",
  minHeight = 20
}: Props) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={0.5}
    minWidth={minWidth}
    minHeight={minHeight}
    justifyContent="flex-end"
    css={{
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? "auto" : "none",
      transition: "opacity 0.15s ease"
    }}
  >
    {children}
  </Stack>
);
