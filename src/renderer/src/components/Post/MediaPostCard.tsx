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
import { useTranslation } from "react-i18next";
import {
  BookmarkSimpleIcon,
  ChatCircleIcon,
  FlagIcon,
  HeartIcon,
  PlayIcon,
  RepeatIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
  TrashIcon,
  XIcon
} from "@phosphor-icons/react";

interface Props {
  post: Post;
  defaultCommentsOpen?: boolean;
}

const DEFAULT_VOLUME = 0.1;
const OVERLAY_CHIP_BG = "rgba(0,0,0,0.32)";

const FeedOverlayChip = ({
  children,
  size = 40,
  style
}: {
  children: React.ReactNode;
  size?: number;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: OVERLAY_CHIP_BG,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      ...style
    }}
  >
    {children}
  </div>
);

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
      padding={0}
      css={{
        color: "#fff",
        "& svg": {
          width: 28,
          height: 28
        },
        "&:hover": {
          opacity: 0.9
        }
      }}
    >
      <FeedOverlayChip size={44}>{icon}</FeedOverlayChip>
    </IconButton>
    {count != null && (
      <Typography
        level="body-sm"
        fontWeight={600}
        css={{
          color: "#fff",
          textShadow: "0 1px 3px rgba(0,0,0,0.55)"
        }}
      >
        {count}
      </Typography>
    )}
  </Stack>
);

const MediaSlide = ({
  attachment,
  volume
}: {
  attachment: APIAttachment;
  volume: number;
}) => {
  const isVideo = attachment.contentType.startsWith("video/");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  useEffect(() => {
    if (!isVideo || !videoRef.current) return;
    videoRef.current.volume = volume;
  }, [isVideo, volume]);

  useEffect(() => {
    if (!isVideo || !videoRef.current) return;

    const video = videoRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsVisible((wasVisible) => {
          if (visible && !wasVisible) setUserPaused(false);
          return visible;
        });
      },
      { threshold: 0.6 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [isVideo]);

  useEffect(() => {
    if (!isVideo || !videoRef.current) return;

    const video = videoRef.current;
    if (isVisible && !userPaused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isVideo, isVisible, userPaused]);

  const togglePause = () => {
    if (!isVisible) return;
    setUserPaused((paused) => !paused);
  };

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
        <>
          <video
            ref={videoRef}
            src={attachment.url}
            muted={volume === 0}
            loop
            playsInline
            onClick={togglePause}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              cursor: "pointer",
              display: "block"
            }}
          />
          {isVisible && userPaused && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.25)",
                pointerEvents: "none"
              }}
            >
              <PlayIcon size={56} color="#fff" weight="fill" />
            </div>
          )}
        </>
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
    const { t } = useTranslation("chat");
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
                  aria-label={t("feed.media.goToMediaA11y", { index: index + 1 })}
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
              placement="bottom"
              closeOnClickOutside
              p={1}
              triggerCss={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 2
              }}
              trigger={
                <IconButton
                  size="lg"
                  variant="plain"
                  title={t("feed.media.volume")}
                  padding={0}
                  css={{
                    color: "#fff",
                    "& svg": { width: 18, height: 18 }
                  }}
                >
                  <FeedOverlayChip size={36}>
                    {volume === 0 ? <SpeakerSlashIcon /> : <SpeakerHighIcon />}
                  </FeedOverlayChip>
                </IconButton>
              }
            >
              <Stack direction="column" alignItems="center" spacing={0.5} p={1}>
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
              size="lg"
              variant="plain"
              title={t("feed.actions.deletePost")}
              padding={0}
              onClick={() => {
                post.delete().catch(() => {});
              }}
              css={{
                position: "absolute",
                top: 12,
                left: 12,
                zIndex: 2,
                color: "#fff",
                "& svg": { width: 18, height: 18 }
              }}
            >
              <FeedOverlayChip size={36}>
                <TrashIcon />
              </FeedOverlayChip>
            </IconButton>
          )}

          {post.authorId !== app.account?.id && (
            <IconButton
              size="lg"
              variant="plain"
              title={t("feed.actions.reportPost")}
              padding={0}
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
              css={{
                position: "absolute",
                top: 12,
                left: 12,
                zIndex: 2,
                color: theme.colors.danger,
                "& svg": { width: 18, height: 18 }
              }}
            >
              <FeedOverlayChip size={36}>
                <FlagIcon weight="fill" />
              </FeedOverlayChip>
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
                {post.author?.displayName ?? t("unknownUser")}
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
                  <MessageSticker
                    key={sticker.id}
                    sticker={sticker}
                    size={64}
                  />
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
              icon={
                <HeartIcon size={28} weight={post.liked ? "fill" : "regular"} />
              }
              count={post.likeCount}
              onClick={() => {
                post.toggleLike().catch(() => {});
              }}
            />

            <RailAction
              icon={<ChatCircleIcon size={28} weight="fill" />}
              count={post.commentCount}
              onClick={() => setCommentsOpen(true)}
            />

            <RailAction
              icon={
                <RepeatIcon
                  size={28}
                  weight={post.shared ? "fill" : "regular"}
                />
              }
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
                <BookmarkSimpleIcon
                  size={28}
                  weight={post.saved ? "fill" : "regular"}
                />
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
              <Typography level="h6">{t("feed.comments.title")}</Typography>
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
