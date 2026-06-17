import { ProfileMarkdownContent } from "@components/Profile/shared/ProfileMarkdownContent";
import type { ProfileQuoteBlock } from "@mutualzz/types";
import { Box, Stack, Typography } from "@mutualzz/ui-web";
import { QuotesIcon } from "@phosphor-icons/react";

interface Props {
  block: ProfileQuoteBlock;
}

const variantStyles = {
  default: {
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.12)",
    accent: "rgba(255,255,255,0.5)"
  },
  accent: {
    background: "rgba(99,102,241,0.18)",
    border: "1px solid rgba(99,102,241,0.35)",
    accent: "rgba(99,102,241,0.95)"
  },
  warning: {
    background: "rgba(245,158,11,0.14)",
    border: "1px solid rgba(245,158,11,0.35)",
    accent: "rgba(245,158,11,0.95)"
  }
} as const;

export const ProfileQuoteBlockView = ({ block }: Props) => {
  const variant = block.variant ?? "default";
  const styles = variantStyles[variant];

  return (
    <Stack
      direction="column"
      spacing={1}
      width="100%"
      height="100%"
      p={1.5}
      borderRadius={12}
      css={{
        background: styles.background,
        backdropFilter: "blur(10px)",
        border: styles.border,
        overflow: "auto"
      }}
    >
      <QuotesIcon size={20} weight="fill" color={styles.accent} />
      <Box css={{ flex: 1, minHeight: 0 }}>
        <ProfileMarkdownContent value={block.content} />
      </Box>
      {block.attribution && (
        <Typography level="body-xs" css={{ opacity: 0.7, fontStyle: "italic" }}>
          — {block.attribution}
        </Typography>
      )}
    </Stack>
  );
};
