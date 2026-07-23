import { IconButton } from "@components/IconButton";
import { PostComments } from "@components/Post/PostComments";
import { FEED_COMMENTS_WIDTH } from "@components/Post/feedLayout";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import type { Post } from "@stores/objects/Post";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { XIcon } from "@phosphor-icons/react";

interface Props {
  post: Post;
  onClose: () => void;
}

export const PostCommentsPanel = observer(({ post, onClose }: Props) => {
  const { theme } = useTheme();
  const { t } = useTranslation("chat");

  return (
    <Stack
      direction="column"
      width={FEED_COMMENTS_WIDTH}
      minWidth={FEED_COMMENTS_WIDTH}
      height="100%"
      flexShrink={0}
      css={{
        backgroundColor: theme.colors.surface,
        borderLeft: `1px solid ${theme.typography.colors.muted}33`
      }}
    >
      <Stack
        direction="row"
        width="100%"
        px={2.5}
        py={2}
        alignItems="center"
        justifyContent="space-between"
        flexShrink={0}
        css={{
          borderBottom: `1px solid ${theme.typography.colors.muted}33`
        }}
      >
        <Typography level="h6">
          {t("feed.comments.title")}
          {post.commentCount > 0 ? ` · ${post.commentCount}` : ""}
        </Typography>
        <IconButton
          variant="plain"
          size="sm"
          onClick={onClose}
          aria-label={t("feed.comments.close")}
        >
          <XIcon />
        </IconButton>
      </Stack>

      <Stack
        flex={1}
        px={2.5}
        pb={2.5}
        pt={2.5}
        css={{ minHeight: 0, minWidth: 0, overflow: "hidden" }}
      >
        <PostComments post={post} variant="panel" autoFocus />
      </Stack>
    </Stack>
  );
});
