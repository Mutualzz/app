import { Paper } from "@components/Paper";
import { ProfileBlockBackgroundFill } from "@components/Profile/shared/ProfileBlockBackgroundFill";
import { ProfileMarkdownContent } from "@components/Profile/shared/ProfileMarkdownContent";
import type { ProfileTextBlock } from "@mutualzz/types";
import { resolveProfileBlockCornerRadius } from "@mutualzz/ui-core";
import { Box, Typography } from "@mutualzz/ui-web";
import { useAppStore } from "@renderer/hooks/useStores";
import { useTranslation } from "react-i18next";

export const ProfileTextBlockView = ({
  block
}: {
  block: ProfileTextBlock;
}) => {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const cornerRadius = resolveProfileBlockCornerRadius(block, "desktop");

  return (
    <Paper
      width="100%"
      height="100%"
      borderRadius={cornerRadius}
      p={1.5}
      css={{ overflow: "hidden", position: "relative" }}
      elevation={app.settings?.preferEmbossed ? 5 : 1}
    >
      <ProfileBlockBackgroundFill backgroundColor={block.backgroundColor} />
      {block.content ? (
        <Box css={{ fontSize: "var(--pcf-md)", position: "relative" }}>
          <ProfileMarkdownContent value={block.content} />
        </Box>
      ) : (
        <Typography
          level="body-md"
          css={{ opacity: 0.5, fontSize: "var(--pcf-md)", position: "relative" }}
        >
          {t("profile.blocks.text")}
        </Typography>
      )}
    </Paper>
  );
};
