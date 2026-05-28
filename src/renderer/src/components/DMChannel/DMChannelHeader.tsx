import { Stack, Typography } from "@mutualzz/ui-web";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { observer } from "mobx-react-lite";
import { Channel } from "@stores/objects/Channel";
import { ChannelType } from "@mutualzz/types";
import { UserAvatar } from "@components/User/UserAvatar";

interface Props {
    channel: Channel;
}

export const DMChannelHeader = observer(({ channel }: Props) => {
    const app = useAppStore();

    const title =
        channel.type === ChannelType.DM
            ? (channel.dmRecipient?.displayName ?? "Unknown User")
            : (channel.name ??
                  channel.dmRecipients
                      .map((u) => u.displayName)
                      .filter(Boolean)
                      .join(", ")) ||
              "Group DMChannel";

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
                <UserAvatar size={36} user={channel.dmRecipient} />
                <Typography
                    display="flex"
                    alignItems="center"
                    spacing={1}
                    fontWeight={600}
                >
                    {title}
                </Typography>
            </Stack>
        </Paper>
    );
});
