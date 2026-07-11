import { Paper } from "@components/Paper";
import { IconButton } from "@components/IconButton";
import { UserAvatar } from "@components/User/UserAvatar";
import { Tooltip } from "@components/Tooltip";
import { PostComments } from "@components/Post/PostComments";
import { SharePostModal } from "@components/Post/SharePostModal";
import { MessageAttachment } from "@components/Message/MessageAttachment";
import { MessageEmbed } from "@components/Message/MessageEmbed";
import { MessageSticker } from "@components/Message/MessageSticker";
import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import { ReportContentModal } from "@components/Modals/ReportContentModal";
import { useModal } from "@contexts/Modal.context";
import { ExpressionType } from "@mutualzz/types";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import type { Post } from "@stores/objects/Post";
import { calendarStrings } from "@utils/i18n";
import dayjs from "dayjs";
import {
  BookmarkSimpleIcon,
  ChatCircleIcon,
  FlagIcon,
  HeartIcon,
  RepeatIcon,
  TrashIcon
} from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useAppStore } from "@renderer/hooks/useStores";
import { useTranslation } from "react-i18next";

const GIF_URL_PATTERN =
  /^https?:\/\/(klipy\.com\/gifs\/|tenor\.com\/|c\.tenor\.com\/|media\.tenor\.com\/|giphy\.com\/|media\.giphy\.com\/|i\.giphy\.com\/|imgur\.com\/|i\.imgur\.com\/|redgifs\.com\/|.*\.gif(\?\S*)?$)\S*$/i;

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
  const { t } = useTranslation("chat");
  const [commentsOpen, setCommentsOpen] = useState(false);

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
                {post.author?.displayName ?? t("unknownUser")}
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
            <Tooltip content={t("feed.actions.deletePost")}>
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

          {post.authorId !== app.account?.id && (
            <Tooltip content={t("feed.actions.reportPost")}>
              <IconButton
                size="sm"
                color="danger"
                onClick={() =>
                  openModal(
                    `report-post-${post.id}`,
                    <ReportContentModal
                      targetType="post"
                      targetId={post.id}
                      contentLabel={t("feed.report.thisPost")}
                      modalId={`report-post-${post.id}`}
                    />
                  )
                }
              >
                <FlagIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {stickerExpressions.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {stickerExpressions.map((sticker) => (
              <MessageSticker key={sticker.id} sticker={sticker} />
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
