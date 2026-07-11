import { Paper } from "@components/Paper";
import { IconButton } from "@components/IconButton";
import { UserAvatar } from "@components/User/UserAvatar";
import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import { useAppStore } from "@hooks/useStores";
import type { APIAttachment, APIMessageEmbed } from "@mutualzz/types";
import { Box, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { calendarStrings } from "@utils/i18n";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  ArrowSquareOutIcon,
  FileIcon,
  PlayIcon,
  ProhibitIcon
} from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

interface Props {
  post: NonNullable<APIMessageEmbed["post"]>;
}

const THUMB_SIZE = 64;
const MAX_VISIBLE_ATTACHMENTS = 4;

const AttachmentThumb = ({
  attachment,
  overlayCount
}: {
  attachment: APIAttachment;
  overlayCount?: number;
}) => {
  const isImage = attachment.contentType.startsWith("image/");
  const isVideo = attachment.contentType.startsWith("video/");

  return (
    <Box
      position="relative"
      width={THUMB_SIZE}
      height={THUMB_SIZE}
      borderRadius={8}
      overflow="hidden"
      flexShrink={0}
      css={{ background: "rgba(255, 255, 255, 0.06)" }}
    >
      {isImage && (
        <img
          src={attachment.url}
          alt={attachment.filename}
          css={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block"
          }}
        />
      )}

      {isVideo && (
        <>
          <video
            src={attachment.url}
            muted
            preload="metadata"
            css={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block"
            }}
          />
          <Stack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            alignItems="center"
            justifyContent="center"
            css={{ background: "rgba(0, 0, 0, 0.25)" }}
          >
            <PlayIcon weight="fill" color="#fff" size={18} />
          </Stack>
        </>
      )}

      {!isImage && !isVideo && (
        <Stack
          width="100%"
          height="100%"
          alignItems="center"
          justifyContent="center"
        >
          <FileIcon size={20} />
        </Stack>
      )}

      {overlayCount != null && (
        <Stack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          alignItems="center"
          justifyContent="center"
          css={{ background: "rgba(0, 0, 0, 0.55)" }}
        >
          <Typography fontWeight={700} css={{ color: "#fff" }}>
            +{overlayCount}
          </Typography>
        </Stack>
      )}
    </Box>
  );
};

export const PostEmbedPreview = observer(({ post: postData }: Props) => {
  const app = useAppStore();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation("chat");

  const { isLoading, isError } = useQuery({
    queryKey: ["post-embed", postData.id],
    queryFn: () => app.posts.resolve(postData.id)
  });

  const post = app.posts.get(postData.id);

  if (isError || (!isLoading && !post)) {
    return (
      <Paper
        direction="row"
        spacing={1.5}
        alignItems="center"
        width="20rem"
        borderRadius={8}
        p={2}
        border={`1px solid ${theme.colors.surface} !important`}
      >
        <ProhibitIcon />
        <Typography level="body-sm" textColor="secondary">
          {t("feed.empty.postUnavailable")}
        </Typography>
      </Paper>
    );
  }

  if (!post) {
    return (
      <Paper
        width="20rem"
        borderRadius={8}
        p={2}
        border={`1px solid ${theme.colors.surface} !important`}
      >
        <Typography level="body-sm" textColor="secondary">
          {t("feed.embed.loadingPost")}
        </Typography>
      </Paper>
    );
  }

  const visibleAttachments = post.attachments.slice(0, MAX_VISIBLE_ATTACHMENTS);
  const hiddenAttachmentCount =
    post.attachments.length - visibleAttachments.length;

  return (
    <Paper
      direction="column"
      width="20rem"
      borderRadius={8}
      p={2}
      spacing={1.25}
      border={`1px solid ${theme.colors.primary} !important`}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <UserAvatar user={post.author} size="sm" />
          <Stack direction="column" spacing={0}>
            <Typography level="body-sm" fontWeight={600}>
              {post.author?.displayName ?? t("unknownUser")}
            </Typography>
            <Typography level="body-sm" textColor="secondary">
              {dayjs(post.createdAt).calendar(undefined, calendarStrings)}
            </Typography>
          </Stack>
        </Stack>

        <IconButton
          size="sm"
          title={t("feed.actions.openPost")}
          onClick={() =>
            navigate({
              to: "/feed/posts/$postId",
              params: { postId: post.id }
            })
          }
        >
          <ArrowSquareOutIcon />
        </IconButton>
      </Stack>

      {post.content ? (
        <MarkdownRenderer
          value={post.content}
          level="body-sm"
          css={{
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}
        />
      ) : (
        post.attachments.length > 0 && (
          <Stack direction="row" spacing={1}>
            {visibleAttachments.map((attachment, index) => (
              <AttachmentThumb
                key={attachment.id}
                attachment={attachment}
                overlayCount={
                  index === visibleAttachments.length - 1 &&
                  hiddenAttachmentCount > 0
                    ? hiddenAttachmentCount
                    : undefined
                }
              />
            ))}
          </Stack>
        )
      )}

      {post.content && post.attachments.length > 0 && (
        <Typography level="body-xs" textColor="secondary">
          {t("feed.embed.attachments", { count: post.attachments.length })}
        </Typography>
      )}

      {post.hashtags.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap">
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
    </Paper>
  );
});
