import { getDisplayNameCss } from "@components/Profile/shared/ProfileDisplayName";
import type { DisplayNameEffect } from "@mutualzz/types";
import { useTheme } from "@mutualzz/ui-web";
import type { ReactNode } from "react";

interface Props {
  effect: DisplayNameEffect;
  children: ReactNode;
}

export const TextEffect = ({ effect, children }: Props) => {
  const { theme } = useTheme();

  return (
    <span css={getDisplayNameCss({ effect }, theme, { animateOnHover: true })}>
      {children}
    </span>
  );
};
