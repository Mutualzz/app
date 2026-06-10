import { ButtonGroup, IconButton, Stack, Typography } from "@mutualzz/ui-web";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { observer } from "mobx-react-lite";
import { Channel } from "@stores/objects/Channel";
import { UserAvatar } from "@components/User/UserAvatar";
import { DMGroupAvatar } from "@components/DMChannel/DMGroupAvatar";
import { ChannelType } from "@mutualzz/types";
import { UsersIcon } from "@phosphor-icons/react";
import { Tooltip } from "@components/Tooltip";

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
    : (channel.dmRecipient?.displayName ?? "Deleted User");

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
            content={`${app.memberListVisible ? "Hide" : "Show"} Member List`}
            placement="bottom"
          >
            <IconButton
              color={app.memberListVisible ? "success" : "neutral"}
              onClick={() => app.toggleMemberList()}
            >
              <UsersIcon weight="fill" />
            </IconButton>
          </Tooltip>
        )}
      </ButtonGroup>
    </Paper>
  );
});
