import { IconButton } from "@components/IconButton";
import { Paper } from "@components/Paper";
import { MessageSticker } from "@components/Message/MessageSticker";
import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import { useFeedComments } from "@components/Post/FeedCommentsLayout";
import { FEED_MEDIA_ASPECT_RATIO } from "@components/Post/feedLayout";
import { PostFeedActions } from "@components/Post/PostFeedActions";
import { PostFeedHeader } from "@components/Post/PostFeedHeader";
import { useAppStore } from "@hooks/useStores";
import {
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
  PlayIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon
} from "@phosphor-icons/react";

interface Props {
  post: Post;
}

const DEFAULT_VOLUME = 0;

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
      { threshold: 0.5 }
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

export const MediaPostCard = observer(({ post }: Props) => {
  const app = useAppStore();
  const { theme } = useTheme();
  const { t } = useTranslation("chat");
  const { commentsPostId, openComments } = useFeedComments();
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);

  const media = post.attachments;
  const hasVideo = media.some((a) => a.contentType.startsWith("video/"));
  const stickerExpressions = post.expressions.filter(
    (e) => e.type === ExpressionType.Sticker
  );

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
    <Paper
      ref={containerRef}
      direction="column"
      width="100%"
      overflow="hidden"
      borderRadius={12}
      elevation={app.settings?.preferEmbossed ? 4 : 0}
    >
      <Stack direction="column" spacing={2.5} p={3} width="100%">
        <PostFeedHeader post={post} />

        {post.content && <MarkdownRenderer value={post.content} level="body-sm" />}

        {stickerExpressions.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {stickerExpressions.map((sticker) => (
              <MessageSticker key={sticker.id} sticker={sticker} size={64} />
            ))}
          </Stack>
        )}

        <Stack
          direction="column"
          width="100%"
          borderRadius={10}
          overflow="hidden"
          css={{
            position: "relative",
            aspectRatio: FEED_MEDIA_ASPECT_RATIO,
            backgroundColor: theme.colors.background
          }}
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
              spacing={1}
              position="absolute"
              bottom={10}
              left="50%"
              p={0.75}
              borderRadius={999}
              css={{
                transform: "translateX(-50%)",
                backgroundColor: `${theme.colors.surface}cc`
              }}
            >
              {media.map((attachment, index) => (
                <button
                  key={attachment.id}
                  onClick={() => scrollToIndex(index)}
                  aria-label={t("feed.media.goToMediaA11y", {
                    index: index + 1
                  })}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    background:
                      index === activeIndex
                        ? theme.colors.primary
                        : theme.typography.colors.muted
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
                top: 10,
                right: 10,
                zIndex: 2
              }}
              trigger={
                <IconButton
                  size="sm"
                  variant="soft"
                  title={t("feed.media.volume")}
                >
                  {volume === 0 ? <SpeakerSlashIcon /> : <SpeakerHighIcon />}
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
        </Stack>

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
          onOpenComments={() => openComments(post.id, containerRef.current)}
        />
      </Stack>
    </Paper>
  );
});
