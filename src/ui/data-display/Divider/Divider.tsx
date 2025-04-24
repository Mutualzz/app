import { css } from "@emotion/react";
import type { FC } from "react";

import styled from "@emotion/styled";
import { useTheme } from "@hooks/useTheme";
import {
    insetMap,
    resolveDividerColor,
    resolveDividerTextColor,
} from "./Divider.helpers";
import type { DividerProps } from "./Divider.types";

const DividerWrapper = styled.div<{ isVertical: boolean }>`
    display: flex;
    flex-direction: ${({ isVertical }) => (isVertical ? "column" : "row")};
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
`;

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
    const resolvedColor = resolveDividerColor(theme, lineColor);
    const resolvedTextColor = resolveDividerTextColor(theme, textColor);

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
            ${variant === "solid" && "border-left: 1px solid currentColor;"}
          `
            : `
            height: 1px;
            ${variant === "dashed" && "border-top: 1px dashed currentColor;"}
            ${variant === "solid" && "border-top: 1px solid currentColor;"}
          `};
    `;

    const textStyle = css`
        ${isVertical ? "padding: 0.5rem 0;" : "padding: 0 0.5rem;"}
        font-size: 0.875rem;
        color: ${resolvedTextColor};
    `;

    return (
        <DividerWrapper
            isVertical={isVertical}
            role="separator"
            aria-orientation={isVertical ? "vertical" : "horizontal"}
            css={[insetMap[inset], { color: resolvedColor }]}
        >
            <span css={lineStyle} />
            {children && <span css={textStyle}>{children}</span>}
            <span css={lineStyle} />
        </DividerWrapper>
    );
};
