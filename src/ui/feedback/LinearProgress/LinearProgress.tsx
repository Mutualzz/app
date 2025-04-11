import { useTheme } from "@contexts/ThemeManager";
import type { Theme } from "@emotion/react";
import type { FC } from "react";
import type {
    LinearProgressColor,
    LinearProgressProps,
    LinearProgressSize,
} from "./LinearProgress.types";

const variantColors = ({ colors }: Theme, color: LinearProgressColor) => {
    return {
        plain: "transparent",
        solid: colors[color].alpha(0.4).hexa(),
        soft: colors[color].alpha(0.1).hexa(),
        outlined: "transparent",
    };
};

const sizes: Record<LinearProgressSize, number> = {
    sm: 4,
    md: 6,
    lg: 8,
};

const thicknesses = (size: LinearProgressSize) =>
    ({
        sm: 4,
        md: 6,
        lg: 8,
    })[size];

export const LinearPrgoress: FC<LinearProgressProps> = ({
    size = "md",
    variant = "soft",
    color = "primary",
    determinate = false,
    value = 0,
    ...props
}) => {
    const { theme } = useTheme();
};
