import { Avatar, ButtonGroup, IconButton, Stack, Typography } from "@mutualzz/ui-web";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { observer } from "mobx-react-lite";
import { Channel } from "@stores/objects/Channel";
import { UserAvatar } from "@components/User/UserAvatar";
import { DMGroupAvatar } from "@components/DMChannel/DMGroupAvatar";
import { UserPlusIcon, UsersIcon } from "@phosphor-icons/react";
import { Tooltip } from "@components/Tooltip";
import { useModal } from "@contexts/Modal.context";
import { GroupDMAddRecipientModal } from "@components/DMChannel/GroupDMAddRecipientModal";

interface Props {
  channel: Channel;
}

export const DMChannelHeader = observer(({ channel }: Props) => {
  const app = useAppStore();
  const { openModal } = useModal();

  const isGroupDM = channel.isGroupDM;

  const title = isGroupDM
    ? channel.name ||
      channel.dmRecipients
        .map((u) => u.displayName)
        .filter(Boolean)
        .join(", ")
    : (channel.dmRecipient?.displayName ?? "Deleted User");

  const isFull = (channel.recipientIds?.length ?? 0) >= 10;

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
          channel.iconUrl ? (
            <Avatar
              src={channel.iconUrl}
              shape={channel.flags.has("RoundedIcon") ? "circle" : "square"}
            />
          ) : (
            <DMGroupAvatar users={channel.dmRecipientsList} />
          )
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
        {isGroupDM && (
          <>
            <Tooltip
              content={isFull ? "Group is full" : "Add to Group"}
              placement="bottom"
            >
              <IconButton
                color="neutral"
                disabled={isFull}
                onClick={() =>
                  openModal(
                    `add-recipient-${channel.id}`,
                    <GroupDMAddRecipientModal channel={channel} />
                  )
                }
              >
                <UserPlusIcon weight="fill" />
              </IconButton>
            </Tooltip>
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
          </>
        )}
      </ButtonGroup>
    </Paper>
  );
});
