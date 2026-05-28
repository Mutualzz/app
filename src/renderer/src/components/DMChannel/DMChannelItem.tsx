import { observer } from "mobx-react-lite";
import { useNavigate } from "@tanstack/react-router";
import { Channel } from "@stores/objects/Channel";
import { useAppStore } from "@hooks/useStores";
import { ChannelType } from "@mutualzz/types";
import { Paper } from "@components/Paper";
import { Stack, Typography } from "@mutualzz/ui-web";
import { UserAvatar } from "@components/User/UserAvatar";
import { DMGroupAvatar } from "@components/DMChannel/DMGroupAvatar";
import { useMenu } from "@contexts/ContextMenu.context";

interface Props {
    channel: Channel;
}

const AVATAR_SIZE = 36;

export const DMChannelItem = observer(({ channel }: Props) => {
    const app = useAppStore();
    const active = app.channels.activeId === channel.id;
    const navigate = useNavigate();
    const { openContextMenu } = useMenu();

    const recipient = channel.dmRecipient;
    const recipients = channel.dmRecipients;

    const title = (() => {
        if (channel.type === ChannelType.DM)
            return recipient?.displayName ?? "Unknown User";

        if (channel.name) return channel.name;

        const names = recipients.map((u) => u.displayName).filter(Boolean);

        if (!names.length) return "Group DM Channel";
        if (names.length <= 2) return names.join(", ");
        return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
    })();

    let preview: string | null = null;
    const lastMessage = channel.lastMessage;
    if (lastMessage)
        preview = `${lastMessage.author?.displayName}: ${lastMessage.content}`;

    return (
        <Paper
            variant={active ? "soft" : "plain"}
            width="100%"
            borderRadius={10}
            px={1}
            py={0.75}
            css={{
                cursor: "pointer",
                opacity: active ? 1 : 0.94,
                transition: "background-color 120ms ease, opacity 120ms ease",
                "&:hover": active ? {} : { opacity: 1 }
            }}
            onContextMenu={(e) => {
                if (!recipient) return;
                openContextMenu(e, {
                    type: "user",
                    user: recipient,
                    insideDMs: true
                });
            }}
            onClick={() => {
                if (!active) {
                    navigate({
                        to: "/@me/$channelId",
                        params: {
                            channelId: channel.id
                        }
                    });
                }
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                spacing={1.25}
                width="100%"
            >
                {channel.type === ChannelType.DM ? (
                    <UserAvatar
                        user={recipient}
                        size={AVATAR_SIZE}
                        badge
                        showInvisible
                    />
                ) : (
                    <DMGroupAvatar users={recipients} />
                )}

                <Stack direction="column" minWidth={0} flex={1}>
                    <Typography
                        level="body-sm"
                        weight={active ? "bold" : "medium"}
                        textColor={active ? "primary" : "inherit"}
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        {title}
                    </Typography>

                    {preview && (
                        <Typography
                            level="body-xs"
                            variant="plain"
                            color="neutral"
                            whiteSpace="nowrap"
                            overflow="hidden"
                            textOverflow="ellipsis"
                        >
                            {preview}
                        </Typography>
                    )}
                </Stack>
            </Stack>
        </Paper>
    );
});
