import { IconButton } from "@components/IconButton";
import { useAppStore } from "@hooks/useStores";
import type { ProfileGalleryBlock } from "@mutualzz/types";
import { ImageFormat } from "@mutualzz/types";
import {
  isProfileImageVideoUrl,
  resolveProfileBackgroundFill,
  resolveProfileBlockCornerRadius,
  resolveProfileImageBlockUrl
} from "@mutualzz/ui-core";
import { Typography } from "@mutualzz/ui-web";
import {
  CaretLeftIcon,
  CaretRightIcon,
  ImagesIcon
} from "@phosphor-icons/react";
import type { UserProfile } from "@stores/objects/UserProfile";
import { observer } from "mobx-react-lite";
import { useReducedMotion } from "motion/react";
import { useEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";

const SLIDESHOW_INTERVAL_MS = 4000;
const SLIDESHOW_FADE_MS = 600;

const getGridColumns = (imageCount: number) => {
  if (imageCount <= 1) return 1;
  if (imageCount <= 4) return 2;
  if (imageCount <= 6) return 3;
  return 4;
};

const GalleryMedia = ({
  url,
  fit = "cover",
  style
}: {
  url: string;
  fit?: "cover" | "contain";
  style?: CSSProperties;
}) => {
  const mediaCss = {
    display: "block",
    objectFit: fit,
    ...style
  };

  return isProfileImageVideoUrl(url) ? (
    <video
      src={url}
      autoPlay
      loop
      muted
      playsInline
      draggable={false}
      css={mediaCss}
    />
  ) : (
    <img src={url} alt="" draggable={false} css={mediaCss} />
  );
};

const fillStyle: CSSProperties = { width: "100%", height: "100%" };

export const ProfileGalleryBlockView = observer(
  ({
    block,
    profile
  }: {
    block: ProfileGalleryBlock;
    profile: UserProfile;
  }) => {
    const { t } = useTranslation("settings");
    const app = useAppStore();
    const prefersReducedMotion = useReducedMotion();
    const [activeIndex, setActiveIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const cornerRadius = resolveProfileBlockCornerRadius(block, "desktop");
    const customBackground = block.backgroundColor?.trim() || null;
    const layout = block.layout ?? "grid";

    const imageUrls = block.images
      .map((image) =>
        resolveProfileImageBlockUrl(image.src, (hash, animated) =>
          profile.constructBlockImageUrl(hash, ImageFormat.WebP, 512, animated)
        )
      )
      .filter((imageUrl): imageUrl is string => !!imageUrl);

    const imageCount = imageUrls.length;
    const safeIndex =
      imageCount > 0 ? Math.min(activeIndex, imageCount - 1) : 0;
    const goTo = (index: number) =>
      setActiveIndex((index + imageCount) % imageCount);

    const autoAdvance =
      layout === "slideshow" &&
      imageCount > 1 &&
      !paused &&
      !prefersReducedMotion &&
      !app.settings?.reducedMotion;

    useEffect(() => {
      if (!autoAdvance) return;
      const intervalId = window.setInterval(
        () => setActiveIndex((current) => (current + 1) % imageCount),
        SLIDESHOW_INTERVAL_MS
      );
      return () => window.clearInterval(intervalId);
    }, [autoAdvance, imageCount]);

    const containerCss = {
      position: "relative" as const,
      width: "100%",
      height: "100%",
      borderRadius: cornerRadius,
      overflow: "hidden",
      background: customBackground
        ? resolveProfileBackgroundFill(customBackground, "transparent")
        : "rgba(0,0,0,0.15)"
    };

    if (imageCount === 0) {
      return (
        <div
          css={{
            ...containerCss,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6
          }}
        >
          <ImagesIcon size={28} css={{ opacity: 0.5 }} />
          <Typography
            level="body-xs"
            textColor="muted"
            css={{ fontSize: "var(--pcf-xs)", textAlign: "center" }}
          >
            {t("profile.gallery.empty")}
          </Typography>
        </div>
      );
    }

    const dots = (
      <div
        css={{
          position: "absolute",
          bottom: 8,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 6,
          zIndex: 1
        }}
      >
        {imageUrls.map((imageUrl, index) => (
          <button
            key={imageUrl + index}
            type="button"
            aria-label={t("profile.gallery.goTo", { number: index + 1 })}
            aria-current={index === safeIndex}
            onClick={() => goTo(index)}
            css={{
              width: 8,
              height: 8,
              padding: 0,
              border: "none",
              borderRadius: "50%",
              cursor: "pointer",
              background: "#ffffff",
              opacity: index === safeIndex ? 1 : 0.45
            }}
          />
        ))}
      </div>
    );

    const arrows = (
      <>
        <IconButton
          size="sm"
          variant="soft"
          aria-label={t("profile.gallery.previous")}
          onClick={() => goTo(safeIndex - 1)}
          css={{
            position: "absolute",
            left: 8,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 1
          }}
        >
          <CaretLeftIcon weight="bold" />
        </IconButton>
        <IconButton
          size="sm"
          variant="soft"
          aria-label={t("profile.gallery.next")}
          onClick={() => goTo(safeIndex + 1)}
          css={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 1
          }}
        >
          <CaretRightIcon weight="bold" />
        </IconButton>
      </>
    );

    if (layout === "carousel") {
      return (
        <div css={containerCss}>
          <GalleryMedia url={imageUrls[safeIndex]} style={fillStyle} />
          {imageCount > 1 && (
            <>
              {arrows}
              {dots}
            </>
          )}
        </div>
      );
    }

    if (layout === "slideshow") {
      return (
        <div
          css={containerCss}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {imageUrls.map((imageUrl, index) => (
            <GalleryMedia
              key={imageUrl + index}
              url={imageUrl}
              style={{
                ...fillStyle,
                position: "absolute",
                inset: 0,
                opacity: index === safeIndex ? 1 : 0,
                transition: `opacity ${SLIDESHOW_FADE_MS}ms ease`
              }}
            />
          ))}
          {imageCount > 1 && dots}
        </div>
      );
    }

    if (layout === "featured") {
      return (
        <div css={{ ...containerCss, display: "flex", gap: 4 }}>
          <div css={{ flex: 3, minWidth: 0, height: "100%" }}>
            <GalleryMedia url={imageUrls[safeIndex]} style={fillStyle} />
          </div>
          {imageCount > 1 && (
            <div
              css={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                gap: 4,
                overflowY: "auto"
              }}
            >
              {imageUrls.map((imageUrl, index) => (
                <button
                  key={imageUrl + index}
                  type="button"
                  aria-label={t("profile.gallery.goTo", { number: index + 1 })}
                  aria-current={index === safeIndex}
                  onClick={() => setActiveIndex(index)}
                  css={{
                    flexShrink: 0,
                    padding: 0,
                    border: "none",
                    cursor: "pointer",
                    aspectRatio: "1 / 1",
                    overflow: "hidden",
                    borderRadius: 4,
                    opacity: index === safeIndex ? 1 : 0.6,
                    background: "transparent"
                  }}
                >
                  <GalleryMedia url={imageUrl} style={fillStyle} />
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (layout === "masonry") {
      return (
        <div
          css={{
            ...containerCss,
            overflowY: "auto",
            columnCount: imageCount <= 2 ? imageCount : 3,
            columnGap: 4
          }}
        >
          {imageUrls.map((imageUrl, index) => (
            <GalleryMedia
              key={imageUrl + index}
              url={imageUrl}
              style={{
                width: "100%",
                height: "auto",
                marginBottom: 4,
                breakInside: "avoid"
              }}
            />
          ))}
        </div>
      );
    }

    if (layout === "filmstrip") {
      return (
        <div
          css={{
            ...containerCss,
            display: "flex",
            gap: 4,
            overflowX: "auto",
            scrollSnapType: "x mandatory"
          }}
        >
          {imageUrls.map((imageUrl, index) => (
            <GalleryMedia
              key={imageUrl + index}
              url={imageUrl}
              style={{
                height: "100%",
                width: "auto",
                flexShrink: 0,
                scrollSnapAlign: "start"
              }}
            />
          ))}
        </div>
      );
    }

    const columns = getGridColumns(imageCount);

    return (
      <div
        css={{
          ...containerCss,
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridAutoRows: "1fr",
          gap: 4
        }}
      >
        {imageUrls.map((imageUrl, index) => (
          <GalleryMedia
            key={imageUrl + index}
            url={imageUrl}
            style={{ ...fillStyle, minHeight: 0 }}
          />
        ))}
      </div>
    );
  }
);
