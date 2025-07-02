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
            let level: TypographyHeadingKey | null = null;
            switch (element.level) {
                case 1:
                    level = "h1";
                    break;
                case 2:
                    level = "h3";
                    break;
                case 3:
                    level = "h4";
                    break;
            }
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
