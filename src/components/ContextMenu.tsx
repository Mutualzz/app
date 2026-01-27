import { useAppStore } from "@hooks/useStores";
import { Menu, type MenuProps } from "@mutualzz/contexify";
import { forwardRef } from "react";

export const ContextMenu = forwardRef<HTMLDivElement, MenuProps>(
    (props, ref) => {
        const app = useAppStore();

        return (
            <Menu
                variant={
                    app.settings?.preferEmbossed ? "elevation" : "outlined"
                }
                elevation={props.variant === "soft" ? 0 : props.elevation}
                transparency={
                    app.settings?.preferEmbossed ? 90 : props.transparency
                }
                {...props}
                ref={ref}
            />
        );
    },
);
