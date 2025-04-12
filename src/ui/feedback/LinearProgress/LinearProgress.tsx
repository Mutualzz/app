import { useTheme } from "@contexts/ThemeManager";
import { keyframes, type Theme } from "@emotion/react";
import Color from "color";
import type { FC } from "react";
import type {
    LinearProgressAnimation,
    LinearProgressColor,
    LinearProgressProps,
    LinearProgressSize,
} from "./LinearProgress.types";

const slide = keyframes`
    0% { left: -40%; }
    50% { left: 30%; }
    100% { left: 100%; }
`;

const wave = keyframes`
  0% { transform: translateX(-100%) scaleX(0.8); opacity: 0.5; }
  50% { transform: translateX(50%) scaleX(1); opacity: 1; }
  100% { transform: translateX(100%) scaleX(0.8); opacity: 0.5; }
`;

const bounce = keyframes`
  0%, 100% { left: 0; width: 20%; }
  50% { left: 80%; width: 20%; }
`;

const scaleInOut = keyframes`
  0%, 100% { transform: scaleX(0.5); opacity: 0.5; }
  50% { transform: scaleX(1); opacity: 1; }
`;

const variantColors = ({ colors }: Theme, color: LinearProgressColor) => ({
    plain: "transparent",
    solid: Color(colors[color]).alpha(0.4).hexa(),
    soft: Color(colors[color]).alpha(0.1).hexa(),
    outlined: "transparent",
});

const thicknesses = (size: LinearProgressSize) =>
    ({
        sm: 4,
        md: 6,
        lg: 8,
    })[size];

export const LinearProgress: FC<LinearProgressProps> = ({
    size = "md",
    variant = "soft",
    color = "primary",
    animation = "slide",
    determinate = false,
    value = 0,
}) => {
    const { theme } = useTheme();

    const height = thicknesses(size);
    const background = variantColors(theme, color)[variant];
    const barColor = theme.colors[color];
    const outlinedColor = Color(theme.colors[color]).alpha(0.6).hexa();

    const baseBarStyle = {
        height: "100%",
        background: barColor,
        borderRadius: "inherit",
    };

    const animationStyles: Record<LinearProgressAnimation, any> = {
        slide: {
            position: "absolute",
            width: "30%",
            animation: `${slide} 1.5s infinite ease-in-out`,
        },
        wave: {
            width: "100%",
            animation: `${wave} 1.5s infinite ease-in-out`,
        },
        bounce: {
            position: "absolute",
            height: "100%",
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
                width: "100%",
                height,
                background,
                borderRadius: height / 2,
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
