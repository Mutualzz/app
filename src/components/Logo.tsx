import { useTheme } from "@mutualzz/ui";
import type { HTMLAttributes } from "react";

export const Logo = (props: HTMLAttributes<HTMLImageElement>) => {
    const { theme } = useTheme();

    return (
        <img
            src={theme.type === "light" ? "/logo.png" : "/logo-dark.png"}
            alt="Mutualzz Logo"
            {...props}
        />
    );
};
