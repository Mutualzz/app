import { Typography } from "@ui/index";
import type { RenderLeafProps } from "slate-react";

export const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
    const { bold, italic, underline, strikethrough, code } = leaf;

    if (leaf.isMarker) {
        return (
            <Typography
                {...attributes}
                fontWeight="normal"
                fontStyle="normal"
                fontFamily="inherit"
                textDecoration="none"
                whiteSpace="pre-wrap"
            >
                {children}
            </Typography>
        );
    }

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
            fontFamily={code ? "monospace" : "inherit"}
            fontSize="inherit"
            whiteSpace="pre-wrap"
        >
            {children}
        </Typography>
    );
};
