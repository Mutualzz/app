import { useTheme } from "@mutualzz/ui";
import type { HTMLAttributes } from "react";

export const Logo = (props: HTMLAttributes<HTMLImageElement>) => {
    const { theme } = useTheme();

    return (
        <img
            src={theme.type === "light" ? "/logo-light.png" : "/logo.png"}
            alt="Mutualzz Logo"
            {...props}
        />
    );
};
