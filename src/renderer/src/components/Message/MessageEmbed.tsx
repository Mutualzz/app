import { Link } from "@components/Link";
import { MessageEmbedSpoiler } from "@components/Message/MessageEmbedSpoiler";
import { MessageGifEmbed } from "@components/Message/MessageGifEmbed";
import { Paper } from "@components/Paper";
import { PostEmbedPreview } from "@components/Post/PostEmbedPreview";
import type { APIMessageEmbed } from "@mutualzz/types";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores";
import { useTranslation } from "react-i18next";
import { themeColorVar } from "@mutualzz/ui-core";

const hostnameOf = (url?: string) => {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
};

export const MessageEmbed = observer(
  ({ embed, compact }: { embed: APIMessageEmbed; compact?: boolean }) => {
    const { t } = useTranslation("chat");
    const { theme } = useTheme();
    const app = useAppStore();

    const gifUrl = embed.type === "gifv" ? (embed.url ?? "") : "";
    const gifPreview = embed.image ?? embed.media ?? "";
    const isFavoritedGif =
      app.settings?.favoriteGifs?.some((f) => f.startsWith(gifUrl)) ?? false;

    const handleToggleGifFavorite = () => {
      if (!gifUrl) return;
      const entry = gifPreview ? `${gifUrl}|${gifPreview}` : gifUrl;
      app.settings?.toggleFavoriteGif(entry);
    };

    if (embed.spotify)
      return (
        <MessageEmbedSpoiler
          width={compact ? "100%" : 400}
          height={80}
          borderRadius={8}
          spoiler={embed.spoiler}
        >
          <iframe
            css={{
              borderRadius: 8,
              border: 0,
              width: "100%",
              maxWidth: "100%"
            }}
            src={embed.spotify.embedUrl}
            width={compact ? "100%" : 400}
            height={80}
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
        </MessageEmbedSpoiler>
      );

    if (embed.youtube)
      return (
        <MessageEmbedSpoiler
          width={compact ? "100%" : 560}
          maxWidth={compact ? "100%" : undefined}
          height={compact ? undefined : 315}
          borderRadius={8}
          spoiler={embed.spoiler}
        >
          <iframe
            width={compact ? "100%" : 560}
            height={compact ? "100%" : 315}
            src={embed.youtube.embedUrl}
            title={t("a11y.youtubePlayer")}
            css={{
              borderRadius: 8,
              border: `1px solid ${embed.color ?? theme.colors.primary} !important`,
              maxWidth: "100%",
              ...(compact && {
                width: "100%",
                aspectRatio: "16 / 9",
                height: "auto"
              })
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </MessageEmbedSpoiler>
      );

    if (
      embed.apple &&
      (embed.apple.type === "song" ||
        embed.apple.type === "playlist" ||
        embed.apple.type === "album")
    ) {
      const isSong = embed.apple.type === "song";

      return (
        <MessageEmbedSpoiler
          width="100%"
          height={isSong ? 175 : 450}
          maxWidth={compact ? "100%" : 660}
          spoiler={embed.spoiler}
          borderRadius={10}
        >
          <iframe
            allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
            height={isSong ? 175 : 450}
            width="100%"
            css={{
              maxWidth: compact ? "100%" : 660,
              width: "100%",
              borderRadius: 10,
              border: 0,
              overflow: "hidden"
            }}
            sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
            src={
              theme.type === "dark"
                ? `${embed.apple.embedUrl}?theme=dark`
                : embed.apple.embedUrl
            }
            loading="lazy"
          ></iframe>
        </MessageEmbedSpoiler>
      );
    }

    if (embed.type === "post" && embed.post)
      return <PostEmbedPreview post={embed.post} compact={compact} />;

    const gifAutoplay = app.settings?.gifAutoplay ?? true;

    if (embed.type === "gifv") {
      const mediaUrl = embed.media || embed.image || embed.url || "";
      if (!mediaUrl) return null;

      return (
        <MessageEmbedSpoiler spoiler={embed.spoiler}>
          <MessageGifEmbed
            mediaUrl={mediaUrl}
            imageUrl={embed.image}
            pageUrl={embed.url}
            isFavorited={isFavoritedGif}
            onToggleFavorite={handleToggleGifFavorite}
            compact={compact}
            autoplay={gifAutoplay}
          />
        </MessageEmbedSpoiler>
      );
    }

    const accentColor = embed.color ?? themeColorVar("primary");
    const siteName = embed.author?.name || hostnameOf(embed.url);
    const siteUrl = embed.author?.url ?? embed.url;
    const footerText = [
      embed.footer?.text,
      embed.timestamp ? new Date(embed.timestamp).toLocaleString() : null
    ]
      .filter(Boolean)
      .join(" • ");

    if (
      !siteName &&
      !embed.title &&
      !embed.description &&
      !embed.image &&
      !footerText
    )
      return null;

    return (
      <MessageEmbedSpoiler spoiler={embed.spoiler}>
        <Paper
          direction="column"
          width={compact ? "100%" : "27rem"}
          maxWidth="100%"
          borderRadius={6}
          p={2}
          spacing={1}
          css={{ borderLeft: `4px solid ${accentColor} !important` }}
        >
          {siteName && (
            <Stack direction="row" alignItems="center" spacing={1} minWidth={0}>
              {embed.author?.iconUrl && (
                <img
                  src={embed.author.iconUrl}
                  alt=""
                  width={16}
                  height={16}
                  css={{ borderRadius: 4, flexShrink: 0 }}
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              )}
              <Link
                href={siteUrl}
                underline="hover"
                target="_blank"
                rel="noreferrer noopener"
              >
                <Typography
                  level="body-xs"
                  textColor="secondary"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  {siteName}
                </Typography>
              </Link>
            </Stack>
          )}
          {embed.title &&
            (embed.url ? (
              <Link
                href={embed.url}
                underline="hover"
                target="_blank"
                rel="noreferrer noopener"
              >
                <Typography fontWeight="bold" textColor="inherit">
                  {embed.title}
                </Typography>
              </Link>
            ) : (
              <Typography fontWeight="bold">{embed.title}</Typography>
            ))}
          {embed.description && (
            <Typography
              level="body-sm"
              textColor="secondary"
              css={{
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }}
            >
              {embed.description}
            </Typography>
          )}
          {embed.image && !embed.media && (
            <Link href={embed.url} target="_blank" rel="noreferrer noopener">
              <img
                src={embed.image}
                alt={embed.title || t("a11y.embedTitle")}
                loading="lazy"
                css={{
                  display: "block",
                  width: "100%",
                  maxHeight: 300,
                  objectFit: "cover",
                  borderRadius: 4,
                  marginTop: 4
                }}
              />
            </Link>
          )}
          {footerText && (
            <Stack direction="row" alignItems="center" spacing={1}>
              {embed.footer?.iconUrl && (
                <img
                  src={embed.footer.iconUrl}
                  alt=""
                  width={16}
                  height={16}
                  css={{ borderRadius: "50%", flexShrink: 0 }}
                />
              )}
              <Typography level="body-xs" textColor="muted">
                {footerText}
              </Typography>
            </Stack>
          )}
        </Paper>
      </MessageEmbedSpoiler>
    );
  }
);
