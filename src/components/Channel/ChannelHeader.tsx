import { TooltipWrapper } from "@components/TooltipWrapper.tsx";
import { useAppStore } from "@hooks/useStores.ts";
import {
    ButtonGroup,
    Divider,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from "@mutualzz/ui-web";
import type { Channel } from "@stores/objects/Channel";
import { observer } from "mobx-react";
import { FaHashtag, FaUsers } from "react-icons/fa";

interface Props {
    channel?: Channel | null;
}

export const ChannelHeader = observer(({ channel }: Props) => {
    const app = useAppStore();

    return (
        <Paper
            elevation={5}
            p={2.5}
            style={{
                boxShadow: "none",
            }}
            height="100%"
            maxHeight="3rem"
            direction="row"
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
                    <FaHashtag /> {channel?.name}
                </Typography>
                <Stack flex="1 1 auto">
                    {channel?.topic && (
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
                    <Tooltip
                        content={
                            <TooltipWrapper>
                                {app.memberListVisible ? "Hide" : "Show"} Member
                                List
                            </TooltipWrapper>
                        }
                        placement="bottom"
                    >
                        <IconButton
                            color={
                                app.memberListVisible ? "success" : "neutral"
                            }
                            onClick={() => app.toggleMemberList()}
                        >
                            <FaUsers />
                        </IconButton>
                    </Tooltip>
                </ButtonGroup>
            </Stack>
        </Paper>
    );
});
