import { styled } from "@mutualzz/ui";

const Blockquote = styled("blockquote")(({ theme }) => ({
    display: "block",
    margin: 0,
    borderLeft: `4px solid ${theme.typography.colors.muted}`,
    paddingLeft: "0.5em",
    color: theme.typography.colors.primary,
}));

export { Blockquote };
