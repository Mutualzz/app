import { useAppStore } from "@hooks/useStores";
import { Submenu, type SubMenuProps } from "@mutualzz/contexify";
import { type FC } from "react";
import { useTheme } from "@mutualzz/ui-web";

export const ContextSubmenu: FC<SubMenuProps> = ({ textColor, ...props }) => {
    const app = useAppStore();
    const { theme } = useTheme();

    return (
        <Submenu
            variant="plain"
            elevation={props.variant === "soft" ? 0 : props.elevation}
            transparency={
                app.settings?.preferEmbossed ? 90 : props.transparency
            }
            textColor={textColor ?? theme.typography.colors.primary}
            {...props}
        />
    );
};
