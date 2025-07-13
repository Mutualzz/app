import { Paper, Typography, useTheme } from "@mutualzz/ui";
import type { RenderLeafProps } from "slate-react";

export const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
    const { theme } = useTheme();

    const { bold, italic, underline, strikethrough, code, spoiler, isMarker } =
        leaf;

    if (isMarker) {
        return (
            <Typography
                {...attributes}
                fontWeight="normal"
                fontStyle="normal"
                fontFamily="inherit"
                textDecoration="none"
                whiteSpace="pre-wrap"
                color={theme.typography.colors.secondary}
                variant="plain"
            >
                {children}
            </Typography>
        );
    }

    if (code)
        return (
            <Paper {...attributes} display="inline" elevation={5} px={5}>
                <Typography
                    {...attributes}
                    fontWeight={bold ? "bold" : undefined}
                    fontStyle={italic ? "italic" : undefined}
                    textDecoration={
                        underline && strikethrough
                            ? "underline line-through"
                            : underline
                              ? "underline"
                              : strikethrough
                                ? "line-through"
                                : undefined
                    }
                    fontFamily="monospace"
                    fontSize="inherit"
                    whiteSpace="pre-wrap"
                >
                    {children}
                </Typography>
            </Paper>
        );

    if (spoiler)
        return (
            <Paper {...attributes} display="inline" elevation={5} px={2}>
                <Typography
                    {...attributes}
                    fontWeight={bold ? "bold" : undefined}
                    fontStyle={italic ? "italic" : undefined}
                    textDecoration={
                        underline && strikethrough
                            ? "underline line-through"
                            : underline
                              ? "underline"
                              : strikethrough
                                ? "line-through"
                                : undefined
                    }
                    fontFamily="inherit"
                    fontSize="inherit"
                    whiteSpace="pre-wrap"
                    color={theme.typography.colors.secondary}
                    variant="plain"
                >
                    {children}
                </Typography>
            </Paper>
        );

    return (
        <Typography
            {...attributes}
            fontWeight={bold ? "bold" : undefined}
            fontStyle={italic ? "italic" : undefined}
            textDecoration={
                underline && strikethrough
                    ? "underline line-through"
                    : underline
                      ? "underline"
                      : strikethrough
                        ? "line-through"
                        : undefined
            }
            fontFamily="inherit"
            fontSize="inherit"
            whiteSpace="pre-wrap"
        >
            {children}
        </Typography>
    );
};
