import { ProfileMarkdownContent } from "@components/Profile/shared/ProfileMarkdownContent";
import { Theme } from "@emotion/react";
import type { ProfileQuoteBlock } from "@mutualzz/types";
import { dynamicElevation, formatColor, resolveProfileBlockCornerRadius } from "@mutualzz/ui-core";
import { Box, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { QuotesIcon } from "@phosphor-icons/react";
import { useAppStore } from "@renderer/hooks/useStores";
import { AppStore } from "@renderer/stores/App.store";

interface Props {
  block: ProfileQuoteBlock;
}

const variantStyles = (app: AppStore, theme: Theme) => ({
  default: {
    background: dynamicElevation(
      theme.colors.surface,
      app.settings?.preferEmbossed ? 5 : 1
    ),
    border: `1px solid ${theme.colors.neutral}`,
    accent: theme.typography.colors.primary
  },
  accent: {
    background: formatColor(theme.colors.primary, {
      darken: 25,
      format: "hexa"
    }),
    border: `1px solid ${theme.colors.primary}`,
    accent: theme.typography.colors.accent
  },
  warning: {
    background: dynamicElevation(
      formatColor(theme.colors.warning, {
        darken: 25,
        format: "hexa"
      }),
      app.settings?.preferEmbossed ? 5 : 1
    ),
    border: `1px solid ${theme.colors.warning}`,
    accent: theme.typography.colors.secondary
  }
});

export const ProfileQuoteBlockView = ({ block }: Props) => {
  const app = useAppStore();
  const { theme } = useTheme();
  const variant = block.variant ?? "default";
  const styles = variantStyles(app, theme)[variant];
  const cornerRadius = resolveProfileBlockCornerRadius(block, "desktop");

  return (
    <Stack
      direction="column"
      spacing={1}
      width="100%"
      height="100%"
      p={1.5}
      borderRadius={cornerRadius}
      css={{
        background: styles.background,
        backdropFilter: "blur(10px)",
        border: styles.border,
        overflow: "auto"
      }}
    >
      <QuotesIcon size={20} weight="fill" color={styles.accent} />
      <Box css={{ flex: 1, minHeight: 0, fontSize: "var(--pcf-md)" }}>
        <ProfileMarkdownContent value={block.content} />
      </Box>
      {block.attribution && (
        <Typography level="body-xs" css={{ opacity: 0.7, fontStyle: "italic", fontSize: "var(--pcf-xs)" }}>
          — {block.attribution}
        </Typography>
      )}
    </Stack>
  );
};
