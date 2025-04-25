import { useTheme } from "@mutualzz/ui/hooks/useTheme";
import { isThemeColor } from "@mutualzz/ui/utils/isThemeColor";

import { formatHex8 } from "culori";
import type { FC } from "react";
import {
    resolveLength,
    resolveThickness,
    variantColors,
} from "./LinearProgress.helpers";
import { bounce, scaleInOut, slide, wave } from "./LinearProgress.keyframes";
import type {
    LinearProgressAnimation,
    LinearProgressProps,
} from "./LinearProgress.types";

export const LinearProgress: FC<LinearProgressProps> = ({
    thickness = "md",
    length = "md",
    variant = "soft",
    color = "primary",
    animation = "bounce",
    determinate = false,
    value = 0,
}) => {
    const { theme } = useTheme();

    const height = resolveThickness(thickness);
    const width = resolveLength(length);

    const background = variantColors(theme, color)[variant];
    const barColor = isThemeColor(color)
        ? theme.colors[color]
        : formatHex8(color);

    const outlinedColor = isThemeColor(color)
        ? formatHex8(theme.colors[color])
        : formatHex8(color);

    const baseBarStyle = {
        height: "100%",
        background: barColor,
        borderRadius: "inherit",
    };

    const animationStyles: Record<LinearProgressAnimation, any> = {
        slide: {
            position: "absolute",
            width: "50%",
            animation: `${slide} 1.5s infinite ease-in-out`,
        },
        wave: {
            width: "100%",
            animation: `${wave} 1.5s infinite ease-in-out`,
        },
        bounce: {
            position: "absolute",
            height: "100%",
            width: "30%",
            background: barColor,
            borderRadius: "inherit",
            animation: `${bounce} 1.5s infinite ease-in-out`,
        },
        "scale-in-out": {
            width: "100%",
            animation: `${scaleInOut} 1.5s infinite ease-in-out`,
        },
    };

    return (
        <div
            css={{
                position: "relative",
                width,
                height,
                background,
                borderRadius: "0.5rem",
                overflow: "hidden",
                ...(variant === "outlined" && {
                    border: `1px solid ${outlinedColor}`,
                }),
            }}
        >
            {determinate ? (
                <div
                    css={{
                        ...baseBarStyle,
                        width: `${Math.min(Math.max(value, 0), 100)}%`,
                        transition: "width 0.3s ease",
                    }}
                />
            ) : (
                <div
                    css={{
                        ...baseBarStyle,
                        ...animationStyles[animation],
                    }}
                />
            )}
        </div>
    );
};
