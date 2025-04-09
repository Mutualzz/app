import type { FC } from "react";
import { useTheme } from "../../contexts/ThemeManager";

import { keyframes, type Theme } from "@emotion/react";
import type {
    CircularProgressColor,
    CircularProgressProps,
    CircularProgressSize,
} from "./CircularProgress.types";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const variantColors = ({ colors }: Theme, color: CircularProgressColor) => {
    return {
        plain: "transparent",
        solid: colors[color].alpha(0.5).hexa(),
        soft: colors[color].alpha(0.1).hexa(),
        outlined: "transparent",
    };
};

const sizes: Record<CircularProgressSize, number> = {
    sm: 24,
    md: 36,
    lg: 48,
};

const thicknesses = (size: CircularProgressSize) =>
    ({
        sm: 2,
        md: 4,
        lg: 6,
    })[size];

// TODO: finish outlined variant
export const CircularProgress: FC<CircularProgressProps> = ({
    size = "md",
    variant = "soft",
    color = "primary",
    determinate = false,
    value = 0,
    ...props
}) => {
    const { theme } = useTheme();

    const pixelSize = sizes[size];

    const outerStroke = variantColors(theme, color)[variant];
    const innterStroke = theme.colors[color].hex();
    const strokeWidth = thicknesses(size);
    const radius = (pixelSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const strokeDashOffset = ((100 - value) / 100) * circumference;

    return (
        <div
            css={{
                position: "relative",
                display: "inline-flex",
                width: pixelSize,
                height: pixelSize,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <svg
                {...props}
                width={pixelSize}
                height={pixelSize}
                viewBox={`0 0 ${pixelSize} ${pixelSize}`}
                css={{
                    animation: !determinate
                        ? `${spin} 1.5s linear infinite`
                        : undefined,
                }}
            >
                <circle
                    cx={pixelSize / 2}
                    cy={pixelSize / 2}
                    r={radius}
                    stroke={outerStroke}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <circle
                    cx={pixelSize / 2}
                    cy={pixelSize / 2}
                    r={radius}
                    stroke={innterStroke}
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
