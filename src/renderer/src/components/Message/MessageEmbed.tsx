import { Link } from "@components/Link";
import { MessageEmbedSpoiler } from "@components/Message/MessageEmbedSpoiler";
import { Paper } from "@components/Paper";
import { UserAvatar } from "@components/User/UserAvatar";
import type { APIMessageEmbed } from "@mutualzz/types";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";

export const MessageEmbed = observer(
    ({ embed }: { embed: APIMessageEmbed }) => {
        const { theme } = useTheme();

        if (embed.spotify)
            return (
                <MessageEmbedSpoiler
                    width={400}
                    height={80}
                    borderRadius={8}
                    spoiler={embed.spoiler}
                >
                    <iframe
                        css={{
                            borderRadius: 8,
                            border: 0,
                        }}
                        src={embed.spotify.embedUrl}
                        width={400}
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
                    width={560}
                    height={315}
                    borderRadius={8}
                    spoiler={embed.spoiler}
                >
                    <iframe
                        width={560}
                        height={315}
                        src={embed.youtube.embedUrl}
                        title="YouTube video player"
                        css={{
                            borderRadius: 8,
                            border: `1px solid ${embed.color ?? theme.colors.primary} !important`,
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
                    maxWidth={660}
                    spoiler={embed.spoiler}
                    borderRadius={10}
                >
                    <iframe
                        allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                        height={isSong ? 175 : 450}
                        width="100%"
                        css={{
                            maxWidth: 660,
                            borderRadius: 10,
                            border: 0,
                            overflow: "hidden",
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

        return (
            <MessageEmbedSpoiler spoiler={embed.spoiler}>
                <Paper
                    direction="column"
                    width="25rem"
                    borderRadius={5}
                    p={2}
                    spacing={1.25}
                    border={`1px solid ${embed.color ?? theme.colors.primary} !important`}
                >
                    <Stack direction="row" spacing={1.25} alignItems="center">
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
                        <Typography level="body-sm">
                            {embed.description}
                        </Typography>
                    )}
                    {embed.image && !embed.media && (
                        <Link
                            href={embed.url}
                            underline="hover"
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            <img src={embed.image} alt={embed.title} />
                        </Link>
                    )}
                </Paper>
            </MessageEmbedSpoiler>
        );
    },
);
