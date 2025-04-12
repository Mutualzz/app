import { useTheme } from "@contexts/ThemeManager";
import { keyframes, type Theme } from "@emotion/react";
import { isThemeColor } from "@utils/*";
import Color from "color";
import type { FC } from "react";
import type {
    LinearProgressAnimation,
    LinearProgressColor,
    LinearProgressLength,
    LinearProgressProps,
    LinearProgressThickness,
} from "./LinearProgress.types";

const slide = keyframes`
    0% { left: -50%; }
    50% { left: 25%; }
    100% { left: 100%; }
`;

const wave = keyframes`
  0% { transform: translateX(-100%) scaleX(0.8); opacity: 0.5; }
  50% { transform: translateX(50%) scaleX(1); opacity: 1; }
  100% { transform: translateX(100%) scaleX(0.8); opacity: 0.5; }
`;

const bounce = keyframes`
  0%, 100% { left: 0; width: 30%; }
  50% { left: 70%; width: 30%; }
`;

const scaleInOut = keyframes`
  0%, 100% { transform: scaleX(0.5); opacity: 0.5; }
  50% { transform: scaleX(1); opacity: 1; }
`;

const variantColors = ({ colors }: Theme, color: LinearProgressColor) => {
    const isCustomColor = !isThemeColor(color);
    const resolvedColor = isCustomColor ? Color(color).hexa() : colors[color];

    return {
        plain: "transparent",
        solid: Color(resolvedColor).alpha(0.4).hexa(),
        soft: Color(resolvedColor).alpha(0.1).hexa(),
        outlined: "transparent",
    };
};

const thicknessMap: Record<LinearProgressThickness, number> = {
    sm: 4,
    md: 6,
    lg: 8,
};

const lengthMap: Record<LinearProgressThickness, number> = {
    sm: 120,
    md: 160,
    lg: 200,
};

const resolveThickness = (
    thickness: LinearProgressThickness,
): string | number => {
    if (thickness in thicknessMap) return thicknessMap[thickness];
    if (typeof thickness === "number") return thickness;

    return thickness;
};

const resolveLength = (length: LinearProgressLength): string | number => {
    if (length in lengthMap) return lengthMap[length];
    if (typeof length === "number") return length;

    return length;
};

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
        : Color(color).hexa();
    const outlinedColor = isThemeColor(color)
        ? Color(theme.colors[color]).alpha(0.6).hexa()
        : Color(color).hexa();

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
