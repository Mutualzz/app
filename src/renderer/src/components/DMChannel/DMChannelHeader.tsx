import {
    ButtonGroup,
    IconButton,
    Stack,
    Tooltip,
    Typography
} from "@mutualzz/ui-web";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { observer } from "mobx-react-lite";
import { Channel } from "@stores/objects/Channel";
import { UserAvatar } from "@components/User/UserAvatar";
import { DMGroupAvatar } from "@components/DMChannel/DMGroupAvatar";
import { TooltipWrapper } from "@components/TooltipWrapper";
import { FaUsers } from "react-icons/fa";
import { ChannelType } from "@mutualzz/types";

interface Props {
    channel: Channel;
}

export const DMChannelHeader = observer(({ channel }: Props) => {
    const app = useAppStore();

    const isGroupDM = channel.isGroupDM;

    const title = isGroupDM
        ? channel.name ||
          channel.dmRecipients
              .map((u) => u.displayName)
              .filter(Boolean)
              .join(", ")
        : (channel.dmRecipient?.displayName ?? "Unknown User");

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
                {isGroupDM ? (
                    <DMGroupAvatar users={channel.dmRecipients} />
                ) : (
                    <UserAvatar user={channel.dmRecipient ?? null} />
                )}
                <Typography
                    display="flex"
                    alignItems="center"
                    spacing={1}
                    fontWeight={600}
                >
                    {title}
                </Typography>
            </Stack>
            <ButtonGroup variant="plain" spacing={10}>
                {channel.type === ChannelType.GroupDM && (
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
                )}
            </ButtonGroup>
        </Paper>
    );
});
