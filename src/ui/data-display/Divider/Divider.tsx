import { useTheme } from "@contexts/ThemeManager";
import { css } from "@emotion/react";
import type { FC } from "react";
import type { DividerProps } from "./Divider.types";

const insetMap = {
    none: css``,
    context: css`
        margin: 0 0.5rem;
    `,
    start: css`
        margin-left: 1rem;
    `,
    end: css`
        margin-right: 1rem;
    `,
};

export const Divider: FC<DividerProps> = ({
    orientation = "horizontal",
    inset = "none",
    children,
}) => {
    const { theme } = useTheme();

    const isVertical = orientation === "vertical";
    const hasContent = Boolean(children);

    const containerStyle = css`
        display: flex;
        align-items: center;
        flex-direction: ${isVertical ? "column" : "row"};
        color: ${theme.colors.neutral.hex()};
    `;

    const lineStyle = css`
        flex-grow: 1;
        background-color: currentColor;
        ${isVertical ? "width: 1px; height: 100%;" : "height: 1px;"}
    `;

    const textStyle = css`
        margin: ${isVertical ? "0.5rem 0" : "0 0.75rem"};
        font-size: 0.875rem;
        white-space: nowrap;
        color: inherit;
    `;

    return (
        <div role="separator" css={[containerStyle, insetMap[inset]]}>
            <div css={lineStyle} aria-hidden="true" />
            {hasContent && <span css={textStyle}>{children}</span>}
            <div css={lineStyle} aria-hidden="true" />
        </div>
    );
};
