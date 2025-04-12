import { useTheme } from "@hooks/useTheme";
import type { FC } from "react";

import { isThemeColor } from "@utils";
import Color from "color";
import {
    CircularProgressDefaults,
    sizes,
    thicknesses,
    variantColors,
} from "./CircularProgress.helpers";
import { spin } from "./CircularProgress.keyframes";
import type { CircularProgressProps } from "./CircularProgress.types";

const {
    defaultSize,
    defaultVariant,
    defaultColor,
    defaultDeterminate,
    defaultValue,
} = CircularProgressDefaults;

export const CircularProgress: FC<CircularProgressProps> = ({
    size = defaultSize,
    variant = defaultVariant,
    color = defaultColor,
    determinate = defaultDeterminate,
    value = defaultValue,
    ...props
}) => {
    const { theme } = useTheme();

    const pixelSize = sizes[size];

    const outerStroke = variantColors(theme, color)[variant];
    const innerStroke = isThemeColor(color) ? theme.colors[color] : color;
    const strokeWidth = thicknesses(size);
    const radius = (pixelSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const strokeDashOffset = ((100 - value) / 100) * circumference;

    const outlinedStroke = Color(
        isThemeColor(color) ? theme.colors[color] : color,
    )
        .alpha(0.6)
        .hexa();

    return (
        <div
            css={{
                position: "relative",
                display: "inline-flex",
                width: pixelSize,
                height: pixelSize,
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center",
                ...(variant === "outlined" && {
                    "::before": {
                        content: '""',
                        position: "absolute",
                        top: strokeWidth / 2,
                        left: strokeWidth / 2,
                        right: strokeWidth / 2,
                        bottom: strokeWidth / 2,
                        borderRadius: "50%",
                        border: `1px solid ${outlinedStroke}`,
                        boxSizing: "border-box",
                    },
                    "::after": {
                        content: '""',
                        position: "absolute",
                        top: -1,
                        left: -1,
                        right: -1,
                        bottom: -1,
                        borderRadius: "50%",
                        border: `1px solid ${outlinedStroke}`,
                        boxSizing: "border-box",
                    },
                }),
            }}
        >
            <svg
                {...props}
                width={pixelSize}
                height={pixelSize}
                viewBox={`0 0 ${pixelSize} ${pixelSize}`}
                css={{
                    animation: !determinate
                        ? `${spin} 1s linear infinite`
                        : undefined,
                }}
            >
                <circle
                    cx={pixelSize / 2}
                    cy={pixelSize / 2}
                    r={radius}
                    stroke={variant === "outlined" ? "tranparent" : outerStroke}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <circle
                    cx={pixelSize / 2}
                    cy={pixelSize / 2}
                    r={radius}
                    stroke={innerStroke}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={
                        determinate
                            ? circumference
                            : `${circumference * 0.25} ${circumference}`
                    }
                    strokeDashoffset={determinate ? strokeDashOffset : 0}
                    strokeLinecap="round"
                    css={{
                        transform: "rotate(-90deg)",
                        transformOrigin: "center",
                        transition:
                            "stroke-dasharray 0.3s ease, stroke-dashoffset 0.3s ease, transform 0.3s ease",
                    }}
                />
            </svg>
        </div>
    );
};
