import { Paper } from "@components/Paper";
import { IconButton } from "@components/IconButton";
import { UserAvatar } from "@components/User/UserAvatar";
import { Tooltip } from "@components/Tooltip";
import { PostComments } from "@components/Post/PostComments";
import { SharePostModal } from "@components/Post/SharePostModal";
import { MessageAttachment } from "@components/Message/MessageAttachment";
import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import { useModal } from "@contexts/Modal.context";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import type { Post } from "@stores/objects/Post";
import { calendarStrings } from "@utils/i18n";
import dayjs from "dayjs";
import {
  BookmarkSimpleIcon,
  ChatCircleIcon,
  HeartIcon,
  RepeatIcon,
  TrashIcon
} from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useAppStore } from "@renderer/hooks/useStores";

interface Props {
  post: Post;
}

const RailAction = ({
  icon,
  count,
  onClick
}: {
  icon: React.ReactNode;
  count?: number;
  onClick?: () => void;
}) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <IconButton size="sm" onClick={onClick}>
      {icon}
    </IconButton>
    {count != null && <Typography level="body-sm">{count}</Typography>}
  </Stack>
);

export const PostCard = observer(({ post }: Props) => {
  const { theme } = useTheme();
  const app = useAppStore();
  const { openModal } = useModal();
  const [commentsOpen, setCommentsOpen] = useState(false);

  return (
    <Paper
      direction="column"
      elevation={app.settings?.preferEmbossed ? 4 : 0}
      width="50%"
      alignSelf="center"
      overflow="hidden"
      borderRadius={8}
    >
      <Stack direction="column" spacing={2.5} p={3} width="100%">
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <UserAvatar user={post.author} size="md" badge />
            <Stack direction="column" spacing={0}>
              <Typography fontWeight={600}>
                {post.author?.displayName ?? "Unknown User"}
              </Typography>
              <Tooltip
                content={dayjs(post.createdAt).format(
                  "dddd, MMMM D, YYYY h:mm A"
                )}
              >
                <Typography level="body-sm" textColor="secondary">
                  {dayjs(post.createdAt).calendar(undefined, calendarStrings)}
                </Typography>
              </Tooltip>
            </Stack>
          </Stack>

          {post.authorId === app.account?.id && (
            <Tooltip content="Delete post">
              <IconButton
                size="sm"
                color="danger"
                onClick={() => {
                  post.delete().catch(() => {});
                }}
              >
                <TrashIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {post.content && <MarkdownRenderer value={post.content} />}

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

        <Stack direction="row" spacing={4} alignItems="center">
          <RailAction
            icon={<HeartIcon weight={post.liked ? "fill" : "regular"} />}
            count={post.likeCount}
            onClick={() => {
              post.toggleLike().catch(() => {});
            }}
          />
          <RailAction
            icon={<ChatCircleIcon weight={commentsOpen ? "fill" : "regular"} />}
            count={post.commentCount}
            onClick={() => setCommentsOpen((prev) => !prev)}
          />
          <RailAction
            icon={<RepeatIcon weight={post.shared ? "fill" : "regular"} />}
            count={post.shareCount}
            onClick={() =>
              openModal(`share-post-${post.id}`, <SharePostModal post={post} />)
            }
          />
          <RailAction
            icon={
              <BookmarkSimpleIcon weight={post.saved ? "fill" : "regular"} />
            }
            onClick={() => {
              post.toggleSave().catch(() => {});
            }}
          />
        </Stack>

        {commentsOpen && <PostComments post={post} />}
      </Stack>
    </Paper>
  );
});
