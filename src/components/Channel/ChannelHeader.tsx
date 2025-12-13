import { Paper } from "@components/Paper.tsx";
import { TooltipWrapper } from "@components/TooltipWrapper.tsx";
import { useAppStore } from "@hooks/useStores.ts";
import {
    ButtonGroup,
    Divider,
    IconButton,
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
            elevation={app.preferEmbossed ? 5 : 0}
            p={2.5}
            height="100%"
            borderLeft="0 !important"
            borderRight="0 !important"
            borderTop="0 !important"
            maxHeight="3rem"
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
