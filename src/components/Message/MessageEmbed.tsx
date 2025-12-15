import { Link } from "@components/Link";
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
                <iframe
                    data-testid="embed-iframe"
                    css={{ borderRadius: 8, border: 0 }}
                    src={embed.spotify.embedUrl}
                    width={400}
                    height={80}
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                ></iframe>
            );

        if (embed.youtube)
            return (
                <iframe
                    width={560}
                    height={315}
                    src={embed.youtube.embedUrl}
                    title="YouTube video player"
                    css={{
                        borderRadius: 8,
                        border: 0,
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                ></iframe>
            );

        return (
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
                    <Typography level="body-sm">{embed.description}</Typography>
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
        );
    },
);
