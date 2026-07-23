import { Tooltip } from "@components/Tooltip";
import {
  COMMENT_GIF_MAX_HEIGHT,
  COMMENT_GIF_MAX_WIDTH,
  computeContainedSize,
  MESSAGE_GIF_MAX_HEIGHT,
  MESSAGE_GIF_MAX_WIDTH
} from "@utils/gifs";
import styled from "@emotion/styled";
import { StarIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  mediaUrl: string;
  imageUrl?: string | null;
  pageUrl?: string | null;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  compact?: boolean;
  autoplay?: boolean;
}

type NaturalSize = { width: number; height: number };

const naturalSizeCache = new Map<string, NaturalSize>();

function cacheKeyFor(mediaUrl: string, imageUrl?: string | null) {
  return imageUrl || mediaUrl;
}

const GifFrame = styled("div")({
  position: "relative",
  display: "inline-block",
  maxWidth: "100%",
  lineHeight: 0,
  "&:hover .embed-fav-btn": {
    opacity: 1
  }
});

const EmbedFavoriteBtn = styled("button")<{ favorited?: boolean }>(
  ({ theme, favorited }) => ({
    position: "absolute",
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.5)",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    opacity: favorited ? 1 : 0,
    transition: "opacity 0.15s ease",
    color: favorited ? theme.colors.warning : "#fff",
    "&:hover": { background: "rgba(0,0,0,0.75)" }
  })
);

export function MessageGifEmbed({
  mediaUrl,
  imageUrl,
  pageUrl,
  isFavorited,
  onToggleFavorite,
  compact = false,
  autoplay = true
}: Props) {
  const { t } = useTranslation("chat");
  const maxWidth = compact ? COMMENT_GIF_MAX_WIDTH : MESSAGE_GIF_MAX_WIDTH;
  const maxHeight = compact ? COMMENT_GIF_MAX_HEIGHT : MESSAGE_GIF_MAX_HEIGHT;
  const isVideo = /\.(mp4|webm)(\?|$)/i.test(mediaUrl);
  const sizingUri = imageUrl || (!isVideo ? mediaUrl : null);
  const cacheKey = cacheKeyFor(mediaUrl, imageUrl);
  const videoRef = useRef<HTMLVideoElement>(null);

  const lockedRef = useRef(naturalSizeCache.has(cacheKey));
  const [naturalSize, setNaturalSize] = useState<NaturalSize | null>(
    () => naturalSizeCache.get(cacheKey) ?? null
  );

  const lockSize = useCallback(
    (width: number, height: number) => {
      if (lockedRef.current || !width || !height) return;
      lockedRef.current = true;
      const next = { width, height };
      naturalSizeCache.set(cacheKey, next);
      setNaturalSize(next);
    },
    [cacheKey]
  );

  useEffect(() => {
    lockedRef.current = naturalSizeCache.has(cacheKey);
    setNaturalSize(naturalSizeCache.get(cacheKey) ?? null);
  }, [cacheKey]);

  useEffect(() => {
    if (!sizingUri || lockedRef.current) return;

    const img = new window.Image();
    img.onload = () => lockSize(img.naturalWidth, img.naturalHeight);
    img.onerror = () => undefined;
    img.src = sizingUri;
  }, [sizingUri, lockSize]);

  const displaySize = useMemo(
    () =>
      computeContainedSize(
        naturalSize?.width ?? 0,
        naturalSize?.height ?? 0,
        maxWidth,
        maxHeight
      ),
    [naturalSize, maxWidth, maxHeight]
  );

  useEffect(() => {
    if (autoplay || !videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  }, [autoplay, mediaUrl]);

  const handleMouseEnter = useCallback(() => {
    if (autoplay || !isVideo || !videoRef.current) return;
    void videoRef.current.play();
  }, [autoplay, isVideo]);

  const handleMouseLeave = useCallback(() => {
    if (autoplay || !isVideo || !videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  }, [autoplay, isVideo]);

  const mediaCss = {
    display: "block" as const,
    width: displaySize.width,
    height: displaySize.height,
    maxWidth: "100%",
    objectFit: "contain" as const,
    borderRadius: 8,
    backgroundColor: "transparent"
  };

  return (
    <GifFrame
      style={{ width: displaySize.width, height: displaySize.height }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isVideo ? (
        <video
          ref={videoRef}
          src={mediaUrl}
          autoPlay={autoplay}
          loop
          muted
          playsInline
          onLoadedMetadata={() => {
            if (sizingUri || !videoRef.current) return;
            lockSize(videoRef.current.videoWidth, videoRef.current.videoHeight);
          }}
          css={mediaCss}
        />
      ) : pageUrl ? (
        <a
          href={pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "block", lineHeight: 0 }}
        >
          <img src={imageUrl || mediaUrl} alt="" css={mediaCss} />
        </a>
      ) : (
        <img src={imageUrl || mediaUrl} alt="" css={mediaCss} />
      )}

      <Tooltip
        content={isFavorited ? t("favorites.remove") : t("favorites.add")}
      >
        <EmbedFavoriteBtn
          type="button"
          className="embed-fav-btn"
          favorited={isFavorited}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite();
          }}
        >
          <StarIcon size={14} weight={isFavorited ? "fill" : undefined} />
        </EmbedFavoriteBtn>
      </Tooltip>
    </GifFrame>
  );
}
