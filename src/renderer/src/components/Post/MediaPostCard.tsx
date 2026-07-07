import { IconButton } from "@components/IconButton";
import { UserAvatar } from "@components/User/UserAvatar";
import { PostComments } from "@components/Post/PostComments";
import { SharePostModal } from "@components/Post/SharePostModal";
import { MessageSticker } from "@components/Message/MessageSticker";
import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import { ReportContentModal } from "@components/Modals/ReportContentModal";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import {
  Paper,
  Popover,
  Slider,
  Stack,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import { type APIAttachment, ExpressionType } from "@mutualzz/types";
import type { Post } from "@stores/objects/Post";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import {
  BookmarkSimpleIcon,
  ChatCircleIcon,
  FlagIcon,
  HeartIcon,
  RepeatIcon,
  SpeakerHighIcon,
  SpeakerXIcon,
  TrashIcon,
  XIcon
} from "@phosphor-icons/react";

interface Props {
  post: Post;
  defaultCommentsOpen?: boolean;
}

const DEFAULT_VOLUME = 0.1;

const RailAction = ({
  icon,
  count,
  onClick
}: {
  icon: React.ReactNode;
  count?: number;
  onClick?: () => void;
}) => (
  <Stack direction="column" spacing={0.5} alignItems="center">
    <IconButton
      size="lg"
      variant="plain"
      onClick={onClick}
      css={{
        color: "#fff",
        filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.6))"
      }}
    >
      {icon}
    </IconButton>
    {count != null && (
      <Typography
        level="body-sm"
        fontWeight={600}
        css={{
          color: "#fff",
          textShadow: "0 1px 3px rgba(0,0,0,0.6)"
        }}
      >
        {count}
      </Typography>
    )}
  </Stack>
);

const MediaSlide = ({
  attachment,
  volume,
  onToggleMute
}: {
  attachment: APIAttachment;
  volume: number;
  onToggleMute: () => void;
}) => {
  const isVideo = attachment.contentType.startsWith("video/");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isVideo || !videoRef.current) return;
    videoRef.current.volume = volume;
  }, [isVideo, volume]);

  useEffect(() => {
    if (!isVideo || !videoRef.current) return;

    const video = videoRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.6 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [isVideo]);

  return (
    <div
      style={{
        flex: "0 0 100%",
        scrollSnapAlign: "start",
        position: "relative",
        width: "100%",
        height: "100%"
      }}
    >
      {isVideo ? (
        <video
          ref={videoRef}
          src={attachment.url}
          muted={volume === 0}
          loop
          playsInline
          onClick={onToggleMute}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            cursor: "pointer",
            display: "block"
          }}
        />
      ) : (
        <img
          src={attachment.url}
          alt={attachment.filename}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block"
          }}
        />
      )}
    </div>
  );
};

export const MediaPostCard = observer(
  ({ post, defaultCommentsOpen }: Props) => {
    const app = useAppStore();
    const { theme } = useTheme();
    const { openModal } = useModal();
    const [activeIndex, setActiveIndex] = useState(0);
    const [volume, setVolume] = useState(DEFAULT_VOLUME);
    const [commentsOpen, setCommentsOpen] = useState(
      defaultCommentsOpen ?? false
    );
    const [cardHeight, setCardHeight] = useState<number | null>(null);
    const scrollerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const media = post.attachments;
    const hasVideo = media.some((a) => a.contentType.startsWith("video/"));
    const stickerExpressions = post.expressions.filter(
      (e) => e.type === ExpressionType.Sticker
    );

    useEffect(() => {
      if (!containerRef.current) return;

      const el = containerRef.current;
      const observer = new ResizeObserver(([entry]) => {
        setCardHeight(entry.contentRect.height);
      });

      observer.observe(el);
      return () => observer.disconnect();
    }, []);

    useEffect(() => {
      if (defaultCommentsOpen || !containerRef.current) return;

      const el = containerRef.current;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) setCommentsOpen(false);
        },
        { threshold: 0.5 }
      );

      observer.observe(el);
      return () => observer.disconnect();
    }, [defaultCommentsOpen]);

    const onScroll = () => {
      const el = scrollerRef.current;
      if (!el) return;
      setActiveIndex(Math.round(el.scrollLeft / el.clientWidth));
    };

    const scrollToIndex = (index: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
    };

    const toggleMute = () => {
      setVolume((prev) => (prev === 0 ? DEFAULT_VOLUME : 0));
    };

    return (
      <Stack
        direction="row"
        alignItems="stretch"
        justifyContent="center"
        width="100%"
      >
        <Paper
          ref={containerRef}
          direction="column"
          position="relative"
          width="100%"
          maxWidth="26rem"
          css={{ aspectRatio: "9 / 16" }}
          borderRadius={12}
          overflow="hidden"
          elevation={app.settings?.preferEmbossed ? 4 : 0}
        >
          <Stack
            ref={scrollerRef}
            onScroll={onScroll}
            direction="row"
            width="100%"
            height="100%"
            css={{
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              "&::-webkit-scrollbar": {
                display: "none"
              }
            }}
          >
            {media.map((attachment) => (
              <MediaSlide
                key={attachment.id}
                attachment={attachment}
                volume={volume}
                onToggleMute={toggleMute}
              />
            ))}
          </Stack>

          {media.length > 1 && (
            <Stack
              direction="row"
              spacing={1.25}
              position="absolute"
              bottom={12}
              left="50%"
              p={1}
              borderRadius={999}
              css={{
                transform: "translateX(-50%)",
                backgroundColor: theme.colors.surface
              }}
            >
              {media.map((attachment, index) => (
                <button
                  key={attachment.id}
                  onClick={() => scrollToIndex(index)}
                  aria-label={`Go to media ${index + 1}`}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    background:
                      index === activeIndex
                        ? "#fff"
                        : "rgba(255, 255, 255, 0.4)"
                  }}
                />
              ))}
            </Stack>
          )}

          {hasVideo && (
            <Popover
              placement="left"
              closeOnClickOutside
              p={1}
              trigger={
                <IconButton
                  size="sm"
                  variant="plain"
                  css={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    color: "#fff",
                    filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.6))"
                  }}
                >
                  {volume === 0 ? <SpeakerXIcon /> : <SpeakerHighIcon />}
                </IconButton>
              }
            >
              <Stack
                direction="column"
                alignItems="center"
                spacing={0.5}
                p={1}
              >
                <div style={{ height: 80 }}>
                  <Slider
                    orientation="vertical"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(_, val) => setVolume(val as number)}
                    size="sm"
                  />
                </div>
                <Typography level="body-xs">
                  {Math.round(volume * 100)}%
                </Typography>
              </Stack>
            </Popover>
          )}

          {post.authorId === app.account?.id && (
            <IconButton
              size="sm"
              variant="plain"
              onClick={() => {
                post.delete().catch(() => {});
              }}
              css={{
                position: "absolute",
                top: 12,
                left: 12,
                color: "#fff",
                filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.6))"
              }}
            >
              <TrashIcon />
            </IconButton>
          )}

          {post.authorId !== app.account?.id && (
            <IconButton
              size="sm"
              variant="plain"
              onClick={() =>
                openModal(
                  `report-post-${post.id}`,
                  <ReportContentModal
                    targetType="post"
                    targetId={post.id}
                    contentLabel="this post"
                    modalId={`report-post-${post.id}`}
                  />
                )
              }
              css={{
                position: "absolute",
                top: 12,
                left: 12,
                color: "#fff",
                filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.6))"
              }}
            >
              <FlagIcon />
            </IconButton>
          )}

          <Stack
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            p={3}
            pr="4.5rem"
            direction="column"
            spacing={1.25}
            css={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 60%, transparent 100%)",
              pointerEvents: "none"
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <UserAvatar user={post.author} size="sm" />
              <Typography fontWeight={700} css={{ color: "#fff" }}>
                {post.author?.displayName ?? "Unknown User"}
              </Typography>
            </Stack>

            {post.content && (
              <MarkdownRenderer
                value={post.content}
                level="body-sm"
                textColor="#fff"
              />
            )}

            {stickerExpressions.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {stickerExpressions.map((sticker) => (
                  <MessageSticker key={sticker.id} sticker={sticker} size={64} />
                ))}
              </Stack>
            )}

            {post.hashtags.length > 0 && (
              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                {post.hashtags.map((hashtag) => (
                  <Typography
                    key={hashtag.id}
                    level="body-sm"
                    fontWeight={600}
                    css={{ color: "#fff" }}
                  >
                    #{hashtag.tag}
                  </Typography>
                ))}
              </Stack>
            )}
          </Stack>

          <Stack
            position="absolute"
            bottom={3}
            right={2}
            direction="column"
            spacing={3}
            alignItems="center"
          >
            <RailAction
              icon={<HeartIcon weight={post.liked ? "fill" : "regular"} />}
              count={post.likeCount}
              onClick={() => {
                post.toggleLike().catch(() => {});
              }}
            />

            <RailAction
              icon={<ChatCircleIcon weight="fill" />}
              count={post.commentCount}
              onClick={() => setCommentsOpen(true)}
            />

            <RailAction
              icon={<RepeatIcon weight={post.shared ? "fill" : "regular"} />}
              count={post.shareCount}
              onClick={() =>
                openModal(
                  `share-post-${post.id}`,
                  <SharePostModal post={post} />
                )
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
        </Paper>

        <Stack
          direction="column"
          overflow="hidden"
          css={{
            width: commentsOpen ? "20rem" : "0rem",
            height: cardHeight ? `${cardHeight}px` : "100%",
            transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)"
          }}
        >
          <Stack
            direction="column"
            width="20rem"
            height="100%"
            p={3}
            spacing={2}
            overflowY="auto"
            borderRadius={12}
            css={{
              backgroundColor: theme.colors.surface,
              boxShadow: theme.shadows[4]
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography level="h6">Comments</Typography>
              <IconButton size="sm" onClick={() => setCommentsOpen(false)}>
                <XIcon />
              </IconButton>
            </Stack>
            <PostComments post={post} />
          </Stack>
        </Stack>
      </Stack>
    );
  }
);
