import { Typography, useTheme, type TypographyHeadingKey } from "@ui/index";
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
                        paddingLeft: "0.725em",
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
                <Typography {...attributes} display="block" level={level}>
                    {children}
                </Typography>
            );
        }

        case "emoji":
            return (
                <span
                    {...attributes}
                    aria-label={element.name}
                    role="img"
                    title={element.name}
                    css={{
                        display: "inline-block",
                        width: "1.375em",
                        height: "1.375em",
                        verticalAlign: "middle",
                        userSelect: "none",
                    }}
                    contentEditable={false}
                >
                    <img
                        src={element.url}
                        draggable={false}
                        alt={element.name}
                    />
                </span>
            );

        case "paragraph":
        default:
            return <div {...attributes}>{children}</div>;
    }
};
