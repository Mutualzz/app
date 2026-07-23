import { Paper } from "@components/Paper";
import { MessageAttachment } from "@components/Message/MessageAttachment";
import { MessageEmbed } from "@components/Message/MessageEmbed";
import { MessageSticker } from "@components/Message/MessageSticker";
import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import { useFeedComments } from "@components/Post/FeedCommentsLayout";
import { PostFeedActions } from "@components/Post/PostFeedActions";
import { PostFeedHeader } from "@components/Post/PostFeedHeader";
import { useAppStore } from "@hooks/useStores";
import { ExpressionType } from "@mutualzz/types";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import type { Post } from "@stores/objects/Post";
import { observer } from "mobx-react-lite";
import { useRef } from "react";

const GIF_URL_PATTERN =
  /^https?:\/\/(klipy\.com\/gifs\/|tenor\.com\/|c\.tenor\.com\/|media\.tenor\.com\/|giphy\.com\/|media\.giphy\.com\/|i\.giphy\.com\/|imgur\.com\/|i\.imgur\.com\/|redgifs\.com\/|.*\.gif(\?\S*)?$)\S*$/i;

interface Props {
  post: Post;
}

export const PostCard = observer(({ post }: Props) => {
  const { theme } = useTheme();
  const app = useAppStore();
  const { commentsPostId, openComments } = useFeedComments();
  const containerRef = useRef<HTMLDivElement>(null);

  const stickerExpressions = post.expressions.filter(
    (e) => e.type === ExpressionType.Sticker
  );

  const hasGifEmbed = post.embeds.some((e) => e.type === "gifv");
  const isOnlyGifUrl =
    hasGifEmbed &&
    !!post.content &&
    GIF_URL_PATTERN.test(post.content.trim()) &&
    !post.content.trim().includes(" ");

  return (
    <Paper
      ref={containerRef}
      direction="column"
      elevation={app.settings?.preferEmbossed ? 4 : 0}
      width="100%"
      overflow="hidden"
      borderRadius={12}
    >
      <Stack direction="column" spacing={2.5} p={3} width="100%">
        <PostFeedHeader post={post} />

        {stickerExpressions.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {stickerExpressions.map((sticker) => (
              <MessageSticker key={sticker.id} sticker={sticker} size={64} />
            ))}
          </Stack>
        )}

        {post.content && !isOnlyGifUrl && (
          <MarkdownRenderer value={post.content} />
        )}

        {post.embeds.length > 0 && (
          <Stack spacing={1}>
            {post.embeds.map((embed, index) => (
              <MessageEmbed key={index} embed={embed} />
            ))}
          </Stack>
        )}

        {post.attachments.length > 0 && (
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            {post.attachments.map((attachment) => (
              <MessageAttachment key={attachment.id} attachment={attachment} />
            ))}
          </Stack>
        )}

        {post.hashtags.length > 0 && (
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            {post.hashtags.map((hashtag) => (
              <Typography
                key={hashtag.id}
                level="body-sm"
                textColor={theme.colors.info}
              >
                #{hashtag.tag}
              </Typography>
            ))}
          </Stack>
        )}

        <PostFeedActions
          post={post}
          commentsActive={commentsPostId === post.id}
          onOpenComments={() =>
            openComments(post.id, containerRef.current)
          }
        />
      </Stack>
    </Paper>
  );
});
