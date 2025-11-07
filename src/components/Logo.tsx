import { useTheme } from "@mutualzz/ui-web";
import { type HTMLAttributes } from "react";

export const Logo = (props: HTMLAttributes<HTMLImageElement>) => {
    const { theme } = useTheme();

    return (
        <img
            src={theme.type === "light" ? "/icon-light.png" : "/icon.png"}
            alt="Mutualzz Logo"
            {...props}
        />
    );
};
