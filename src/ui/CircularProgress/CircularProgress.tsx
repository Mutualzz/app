import type { FC } from "react";
import { useTheme } from "../../contexts/ThemeManager";
import type { CircularProgressProps } from "./CircularProgress.types";

// TODO: finish this
export const CircularProgress: FC<CircularProgressProps> = ({
    size = "md",
    variant = "solid",
    color = "primary",
    thickness = "medium",
    determinate = false,
    value = 0,
    children,
    ...props
}) => {
    const { theme } = useTheme();

    const progressColor = theme.colors[color].hex();

    console.log(progressColor);

    return <></>;
};
