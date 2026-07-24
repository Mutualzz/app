import { useAppStore } from "@hooks/useStores";
import { Submenu, type SubMenuProps } from "@mutualzz/contexify";
import { type FC } from "react";
import { useTheme } from "@mutualzz/ui-web";

export const ContextSubmenu: FC<SubMenuProps> = ({ textColor, ...props }) => {
  const app = useAppStore();
  const { theme } = useTheme();
  const defaultElevation = app.settings?.preferEmbossed ? 5 : 1;
  const elevation =
    props.variant === "soft" ? 0 : (props.elevation ?? defaultElevation);
  const transparency = app.settings?.preferEmbossed
    ? 90
    : (props.transparency ?? 0);

  return (
    <Submenu
      variant="plain"
      elevation={elevation}
      transparency={transparency}
      textColor={textColor ?? theme.typography.colors.primary}
      {...props}
    />
  );
};
