import type { FC } from "react";

import styled from "@emotion/styled";
import { useTheme } from "@hooks/useTheme";
import {
    resolveDividerLineColor,
    resolveDividerTextColor,
    resolveDividerVariant,
} from "./Divider.helpers";
import type { DividerProps, DividerVariant } from "./Divider.types";

const DividerWrapper = styled.div<{
    isVertical?: boolean;
}>`
    position: relative;
    display: flex;
    flex-direction: ${({ isVertical }) => (isVertical ? "column" : "row")};
    align-items: center;
    ${({ isVertical }) =>
        isVertical ? "height: 100%; width: 1px;" : "width: 100%; height: 1px;"}

    margin: ${({ isVertical }) => (isVertical ? "0 8px" : "8px 0")};
`;

export const DividerLine = styled.span<{
    isVertical: boolean;
    lineColor: string;
    variant: DividerVariant;
    grow?: boolean;
}>`
    ${({ isVertical, variant, lineColor }) =>
        resolveDividerVariant(isVertical, lineColor, variant)}

    flex-grow: ${({ grow }) => (grow ? 1 : 0)};
    ${({ isVertical }) =>
        isVertical ? "min-height: 1rem;" : "min-width: 1rem;"}
`;

const DividerText = styled.span<{
    textColor: string;
    isVertical: boolean;
}>`
    color: ${({ textColor }) => textColor};
    padding: ${({ isVertical }) => (isVertical ? "8px 0" : "0 8px")};

    white-space: nowrap;
    font-size: 14px;
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
    const resolvedLineColor = resolveDividerLineColor(theme, lineColor);
    const resolvedTextColor = resolveDividerTextColor(theme, textColor);

    return (
        <DividerWrapper
            isVertical={isVertical}
            role="separator"
            aria-orientation={isVertical ? "vertical" : "horizontal"}
            css={{ color: resolvedLineColor }}
        >
            <DividerLine
                isVertical={isVertical}
                lineColor={resolvedLineColor}
                variant={variant}
                grow={inset !== "start"}
            />

            {children && (
                <DividerText
                    textColor={resolvedTextColor}
                    isVertical={isVertical}
                >
                    {children}
                </DividerText>
            )}
            <DividerLine
                isVertical={isVertical}
                lineColor={resolvedLineColor}
                variant={variant}
                grow={inset !== "end"}
            />
        </DividerWrapper>
    );
};
