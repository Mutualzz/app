import { css } from "@emotion/react";
import { useTheme } from "@hooks/useTheme";
import type { FC } from "react";
import {
    insetMap,
    resolveDividerColor,
    resolveDividerTextColor,
} from "./Divider.helpers";
import type { DividerProps } from "./Divider.types";

export const Divider: FC<DividerProps> = ({
    orientation = "horizontal",
    inset = "none",
    lineColor = "neutral",
    textColor = "neutral",
    variant = "solid",
    children,
}) => {
    const { theme } = useTheme();

    const isVertical = orientation === "vertical";

    const resolvedLineColor = resolveDividerColor(theme, lineColor);
    const resolvedTextColor = resolveDividerTextColor(theme, textColor);

    const containerStyle = css`
        display: flex;
        align-items: center;
        flex-direction: ${isVertical ? "column" : "row"};
        color: ${resolvedLineColor};
    `;

    const lineStyle = css`
        flex-grow: 1;
        background-color: ${variant === "solid"
            ? "currentColor"
            : "transparent"};
        ${isVertical
            ? `
            width: 1px;
            height: 100%;
            ${variant === "dashed" && "border-left: 1px dashed currentColor;"}
            ${variant === "dotted" && "border-left: 1px dotted currentColor;"}
            ${variant === "solid" && "border-left: 1px solid currentColor;"}
          `
            : `
            height: 1px;
            ${variant === "dashed" && "border-top: 1px dashed currentColor;"}
            ${variant === "dotted" && "border-top: 1px dotted currentColor;"}
            ${variant === "solid" && "border-top: 1px solid currentColor;"}
          `}
    `;

    const textStyle = css`
        margin: ${isVertical ? "0.75rem 0" : "0 0.75rem"};
        font-size: 0.875rem;
        white-space: nowrap;
        color: ${resolvedTextColor};
        writing-mode: ${isVertical ? "vertical-rl" : "horizontal-tb"};
        text-align: center;
    `;

    return (
        <div
            role="separator"
            aria-orientation={isVertical ? "vertical" : "horizontal"}
            css={[containerStyle, insetMap[inset]]}
        >
            <div css={lineStyle} aria-hidden="true" />
            {children && <span css={textStyle}>{children}</span>}
            <div css={lineStyle} aria-hidden="true" />
        </div>
    );
};
