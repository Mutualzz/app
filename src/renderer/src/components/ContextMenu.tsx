import { useAppStore } from "@hooks/useStores";
import { Menu, type MenuProps } from "@mutualzz/contexify";
import { forwardRef } from "react";
import { useTheme } from "@mutualzz/ui-web";

export const ContextMenu = forwardRef<HTMLDivElement, MenuProps>(
    ({ textColor, ...props }, ref) => {
        const app = useAppStore();
        const { theme } = useTheme();

        return (
            <Menu
                variant={
                    app.settings?.preferEmbossed ? "elevation" : "outlined"
                }
                elevation={props.variant === "soft" ? 0 : props.elevation}
                transparency={
                    app.settings?.preferEmbossed ? 90 : props.transparency
                }
                textColor={textColor ?? theme.typography.colors.primary}
                {...props}
                ref={ref}
            />
        );
    },
);
