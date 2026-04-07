import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores.ts";
import type { Snowflake } from "@mutualzz/types";
import { useEffect, useState } from "react";
import type { CSSObject } from "@emotion/react";
import type { Expression } from "@stores/objects/Expression.ts";
import { Divider, Stack, Typography } from "@mutualzz/ui-web";
import { Paper } from "@components/Paper.tsx";
import { SpaceIcon } from "@components/Space/SpaceIcon.tsx";
import { UserAvatar } from "@components/User/UserAvatar.tsx";

interface Props {
    emojiId: Snowflake;
    css?: CSSObject;
}

export const CustomEmojiPreviewPopup = observer(
    ({ emojiId, ...props }: Props) => {
        const app = useAppStore();

        const [emoji, setEmoji] = useState<Expression | null>(null);

        useEffect(() => {
            const fetchEmoji = async () => {
                const data = await app.expressions.resolve(emojiId);
                if (data) setEmoji(data);
            };

            fetchEmoji();
        }, [emojiId]);

        if (!emoji) return null;

        return (
            <Paper
                variant="elevation"
                py={2.5}
                px={2.5}
                elevation={app.settings?.preferEmbossed ? 1 : 3}
                spacing={2.5}
                borderRadius={8}
                width={250}
                direction="column"
                {...props}
            >
                <Stack
                    width="100%"
                    direction="row"
                    spacing={2.5}
                    alignItems="center"
                >
                    <img
                        src={emoji.url}
                        alt={emoji.id}
                        aria-label={`<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`}
                        draggable={false}
                        css={{
                            width: 48,
                            height: 48,
                        }}
                    />

                    <Stack spacing={1.25} direction="column">
                        <Typography level="body-sm" textColor="accent">
                            :{emoji.name}:
                        </Typography>
                        <Typography level="body-xs">
                            This emoji is
                            {emoji.spaceId
                                ? " from one of the spaces you belong in"
                                : emoji.authorId === app.account?.id
                                  ? " from you, you can use it in any chats"
                                  : " from a user"}
                        </Typography>
                    </Stack>
                </Stack>
                <Divider
                    lineColor="muted"
                    css={{
                        opacity: 0.5,
                    }}
                />
                <Stack spacing={2.5}>
                    {emoji.space ? (
                        <Stack spacing={1.25} direction="column">
                            <Typography level="body-sm">
                                This emoji is from a space
                            </Typography>
                            <Stack
                                direction="row"
                                spacing={1.25}
                                alignItems="center"
                            >
                                <SpaceIcon space={emoji.space} />
                                <Typography fontWeight="bold" level="body-sm">
                                    {emoji.space.name}
                                </Typography>
                            </Stack>
                        </Stack>
                    ) : (
                        <Stack spacing={1.25} direction="column">
                            <Typography level="body-xs">
                                This emoji is from a user
                            </Typography>
                            <Stack
                                direction="row"
                                spacing={1.25}
                                alignItems="center"
                            >
                                <UserAvatar user={emoji.author} />
                                <Typography fontWeight="bold" level="body-sm">
                                    {emoji.author?.displayName}
                                </Typography>
                            </Stack>
                        </Stack>
                    )}
                </Stack>
            </Paper>
        );
    },
);
