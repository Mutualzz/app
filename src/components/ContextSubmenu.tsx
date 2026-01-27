import { useAppStore } from "@hooks/useStores";
import { Submenu, type SubMenuProps } from "@mutualzz/contexify";
import { type FC } from "react";

export const ContextSubmenu: FC<SubMenuProps> = (props) => {
    const app = useAppStore();

    return (
        <Submenu
            variant={app.settings?.preferEmbossed ? "elevation" : "outlined"}
            elevation={props.variant === "soft" ? 0 : props.elevation}
            transparency={
                app.settings?.preferEmbossed ? 90 : props.transparency
            }
            {...props}
        />
    );
};
