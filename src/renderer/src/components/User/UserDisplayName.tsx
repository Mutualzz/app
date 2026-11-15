import { getDisplayNameCss } from "@components/Profile/shared/ProfileDisplayName";
import { useGoogleFont } from "@hooks/useGoogleFont";
import type { APIDisplayNameStyle } from "@mutualzz/types";
import { useTheme } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";

interface Props {
  userId?: string | null;
  nameStyle?: APIDisplayNameStyle | null;
  fallbackColor?: string | null;
  children: ReactNode;
}

export const UserDisplayName = observer(
  ({ userId, nameStyle, fallbackColor, children }: Props) => {
    const { theme } = useTheme();
    const { fontFamily } = useGoogleFont(nameStyle?.font, userId);

    if (!nameStyle) return <>{children}</>;

    return (
      <span
        css={{
          fontFamily,
          ...getDisplayNameCss(nameStyle, theme, {
            animateOnHover: true,
            fallbackColor
          })
        }}
      >
        {children}
      </span>
    );
  }
);
