import { useTheme } from "@contexts/ThemeManager";
import { keyframes, type Theme } from "@emotion/react";
import Color from "color";
import type { FC } from "react";
import type {
    LinearProgressColor,
    LinearProgressProps,
    LinearProgressSize,
} from "./LinearProgress.types";

const indeterminateKeyframe = keyframes`
    0% {
    left: -40%;}
    50% {
    left: 30%;}
    100% {
    left: 100%;
    }
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
    determinate = false,
    value = 0,
}) => {
    const { theme } = useTheme();

    const height = thicknesses(size);
    const background = variantColors(theme, color)[variant];
    const barColor = theme.colors[color];
    const outlinedColor = Color(theme.colors[color]).alpha(0.6).hexa();

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
                        height: "100%",
                        width: `${Math.min(Math.max(value, 0), 100)}%`,
                        background: variant === "solid" ? "#fff" : barColor,
                        transition: "width 0.3s ease",
                        borderRadius: "inherit",
                    }}
                />
            ) : (
                <div
                    css={{
                        position: "absolute",
                        height: "100%",
                        width: "30%",
                        background: barColor,
                        animation: `${indeterminateKeyframe} 1.5s infinite ease-in-out`,
                        borderRadius: "inherit",
                    }}
                />
            )}
        </div>
    );
};
