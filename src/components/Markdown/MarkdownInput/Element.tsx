import { Typography, useTheme, type TypographyHeadingKey } from "@mutualzz/ui";
import type { RenderElementProps } from "slate-react";

export const Element = ({
    attributes,
    children,
    element,
}: RenderElementProps) => {
    const { theme } = useTheme();

    switch (element.type) {
        case "blockquote":
            return (
                <blockquote
                    {...attributes}
                    css={{
                        display: "block",
                        margin: 0,
                        paddingLeft: "0.5em",
                        borderLeft: `4px solid ${theme.typography.colors.disabled}`,
                        color: theme.typography.colors.primary,
                    }}
                >
                    {children}
                </blockquote>
            );

        case "heading": {
            const level = `h${element.level + 2}` as TypographyHeadingKey;
            return (
                <Typography
                    {...attributes}
                    display="block"
                    level={level}
                    fontWeight="bold"
                >
                    {children}
                </Typography>
            );
        }

        case "emoji":
            return (
                <span
                    {...attributes}
                    role="img"
                    css={{
                        display: "inline-block",
                        width: "1.375em",
                        height: "1.375em",
                        verticalAlign: "middle",
                        pointerEvents: "none",
                        userSelect: "none",
                    }}
                    aria-label={`:${element.name}:`}
                    contentEditable={false}
                    data-slate-void
                    data-slate-inline
                >
                    <img
                        css={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                        }}
                        src={element.url}
                        alt={element.unicode}
                        aria-label={`:${element.name}:`}
                        draggable={false}
                    />
                </span>
            );

        case "line":
        default:
            return <div {...attributes}>{children}</div>;
    }
};
