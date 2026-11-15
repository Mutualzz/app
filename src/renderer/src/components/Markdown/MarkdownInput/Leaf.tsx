import { Paper } from "@components/Paper";
import { Typography, useTheme } from "@mutualzz/ui-web";
import type { ColorLike } from "@mutualzz/ui-core";
import type { RenderLeafProps } from "slate-react";
import { type DisplayNameEffect } from "@mutualzz/types";
import { getDisplayNameCss } from "@renderer/components/Profile/shared/ProfileDisplayName";

export const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  const { theme } = useTheme();

  const {
    bold,
    italic,
    underline,
    strikethrough,
    code,
    spoiler,
    color,
    effect,
    codeBlock,
    codeColor,
    isMarker
  } = leaf;
  const colorProps = color ? { textColor: color as ColorLike } : {};
  const effectCss = effect
    ? getDisplayNameCss({ effect: effect as DisplayNameEffect }, theme, {
        animateOnHover: true
      })
    : undefined;

  if (isMarker) {
    return (
      <Typography
        {...attributes}
        fontWeight="normal"
        fontStyle="normal"
        fontFamily={codeBlock ? "monospace" : "inherit"}
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
      <Paper {...attributes} display="inline" elevation={5} px={1.25}>
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
          {...colorProps}
        >
          {children}
        </Typography>
      </Paper>
    );

  if (spoiler)
    return (
      <Paper {...attributes} display="inline" elevation={5} px={0.25}>
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
      fontFamily={codeBlock ? "monospace" : "inherit"}
      fontSize="inherit"
      whiteSpace="pre-wrap"
      {...colorProps}
      css={{ ...effectCss, ...(codeColor ? { color: codeColor } : {}) }}
    >
      {children}
    </Typography>
  );
};
