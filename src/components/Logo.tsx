import { Paper, useTheme } from "@mutualzz/ui-web";
import { type HTMLAttributes } from "react";

export const Logo = (props: HTMLAttributes<HTMLImageElement>) => {
    const { theme } = useTheme();

    let logoToUse = "/icon.png";
    let isDefault = false;

    switch (theme.id) {
        case "baseDark":
            logoToUse = "/icon.png";
            isDefault = true;
            break;
        case "baseLight":
            logoToUse = "/icon-light.png";
            isDefault = true;
            break;
        default:
            logoToUse =
                theme.type === "dark"
                    ? "/icon-adaptive.png"
                    : "/icon-light-adaptive.png";
            isDefault = false;
            break;
    }

    const logo = <img src={logoToUse} alt="Mutualzz Logo" {...props} />;

    return isDefault ? (
        logo
    ) : (
        <Paper variant="solid" color={"primary"} borderRadius="50%" {...props}>
            {logo}
        </Paper>
    );
};
