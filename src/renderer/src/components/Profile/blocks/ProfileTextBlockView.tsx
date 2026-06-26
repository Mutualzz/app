import { Paper } from "@components/Paper";
import { ProfileMarkdownContent } from "@components/Profile/shared/ProfileMarkdownContent";
import type { ProfileTextBlock } from "@mutualzz/types";
import { Box, Typography } from "@mutualzz/ui-web";

export const ProfileTextBlockView = ({
  block
}: {
  block: ProfileTextBlock;
}) => (
    <Paper
      width="100%"
      height="100%"
      variant="soft"
      borderRadius={8}
      p={1.5}
      css={{ overflow: "hidden" }}
    >
      {block.content ? (
        <Box css={{ fontSize: "var(--pcf-md)" }}>
          <ProfileMarkdownContent value={block.content} />
        </Box>
      ) : (
        <Typography level="body-md" css={{ opacity: 0.5, fontSize: "var(--pcf-md)" }}>
          Text
        </Typography>
      )}
    </Paper>
);
