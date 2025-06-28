import type { RenderElementProps } from "slate-react";
import { Typography } from "../../ui/src/components/data-display/Typography/Typography";
import { useTheme } from "../../ui/src/hooks/useTheme";
import type { TypographyHeadingKey } from "../../ui/src/types";

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
            const level = `h${element.level}` as TypographyHeadingKey;
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
                    css={{
                        userSelect: "none",
                    }}
                    contentEditable={false}
                >
                    <img
                        css={{
                            display: "inline-block",
                            width: "1.375em",
                            height: "1.375em",
                            verticalAlign: "middle",
                        }}
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
