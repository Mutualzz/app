import { Link } from "@components/Link";
import { MessageEmbedSpoiler } from "@components/Message/MessageEmbedSpoiler";
import { MessageGifEmbed } from "@components/Message/MessageGifEmbed";
import { Paper } from "@components/Paper";
import { PostEmbedPreview } from "@components/Post/PostEmbedPreview";
import { UserAvatar } from "@components/User/UserAvatar";
import type { APIMessageEmbed } from "@mutualzz/types";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores";
import { useTranslation } from "react-i18next";

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

    const gifAutoplay = app.settings?.extendedSettings.gifAutoplay ?? true;

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

    return (
      <MessageEmbedSpoiler spoiler={embed.spoiler}>
        <Paper
          direction="column"
          width={compact ? "100%" : "25rem"}
          maxWidth="100%"
          borderRadius={5}
          p={2}
          spacing={1.25}
          border={`1px solid ${embed.color ?? theme.colors.primary} !important`}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            {embed.author?.iconUrl && (
              <UserAvatar src={embed.author?.iconUrl} />
            )}
            {embed.author?.name && (
              <Link
                href={embed.url}
                underline="hover"
                target="_blank"
                rel="noreferrer noopener"
              >
                {embed.author?.name}
              </Link>
            )}
          </Stack>
          {embed.title && (
            <Typography fontWeight="bold">{embed.title}</Typography>
          )}
          {embed.description && (
            <Typography level="body-sm">{embed.description}</Typography>
          )}
          {embed.image && !embed.media && (
            <Link
              href={embed.url}
              underline="hover"
              target="_blank"
              rel="noreferrer noopener"
            >
              <img
                src={embed.image}
                alt={embed.title || t("a11y.embedTitle")}
                css={{
                  maxWidth: "100%",
                  height: "auto",
                  display: "block"
                }}
              />
            </Link>
          )}
        </Paper>
      </MessageEmbedSpoiler>
    );
  }
);
