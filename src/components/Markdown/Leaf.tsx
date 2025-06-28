import { Typography } from "@ui/index";
import type { RenderLeafProps } from "slate-react";

export const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
    return (
        <Typography
            {...attributes}
            fontWeight={leaf.bold ? "bold" : undefined}
            fontStyle={leaf.italic ? "italic" : undefined}
            textDecoration={
                leaf.underline && leaf.strikethrough
                    ? "underline line-through"
                    : leaf.underline
                      ? "underline"
                      : leaf.strikethrough
                        ? "line-through"
                        : undefined
            }
            fontFamily={leaf.code ? "monospace" : "inherit"}
        >
            {children}
        </Typography>
    );
};
