import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { ButtonGroup, Divider, Stack, Typography } from "@mutualzz/ui-web";
import type { Channel } from "@stores/objects/Channel";
import { observer } from "mobx-react-lite";
import { MdChatBubble } from "react-icons/md";
import { FaX } from "react-icons/fa6";
import { IconButton } from "@components/IconButton.tsx";
import { useNavigate } from "@tanstack/react-router";

interface Props {
    channel: Channel;
}

export const VoiceChannelHeader = observer(({ channel }: Props) => {
    const app = useAppStore();
    const navigate = useNavigate();

    return (
        <Paper
            elevation={app.settings?.preferEmbossed ? 5 : 0}
            p={2.5}
            height="100%"
            borderLeft="0 !important"
            borderRight="0 !important"
            borderTop="0 !important"
            maxHeight="2.95rem"
            direction="row"
            boxShadow="0 !important"
            alignItems="center"
            justifyContent="space-between"
        >
            <Stack flex={1} direction="row" alignItems="center" spacing={2}>
                <Typography
                    display="flex"
                    alignItems="center"
                    spacing={1}
                    fontWeight={600}
                >
                    <MdChatBubble /> {channel?.name}
                </Typography>
                <Stack flex="1 1 auto">
                    {channel.topic && (
                        <>
                            <Divider
                                style={{
                                    margin: "0 8px",
                                }}
                                orientation="vertical"
                            />
                            <Typography textColor="muted">
                                {channel.topic}
                            </Typography>
                        </>
                    )}
                </Stack>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
                <ButtonGroup variant="plain" spacing={10}>
                    <IconButton
                        size="sm"
                        onClick={() =>
                            navigate({
                                to: "/spaces/$spaceId/$channelId",
                                params: {
                                    spaceId: channel.spaceId as string,
                                    channelId: channel.id,
                                },
                            })
                        }
                    >
                        <FaX />
                    </IconButton>
                </ButtonGroup>
            </Stack>
        </Paper>
    );
});
