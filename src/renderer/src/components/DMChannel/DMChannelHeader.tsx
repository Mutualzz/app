import {
  Avatar,
  ButtonGroup,
  Stack,
  Typography,
  useTheme,
} from "@mutualzz/ui-web";
import { IconButton } from "@components/IconButton";
import { formatColor } from "@mutualzz/ui-core";
import { useAppStore } from "@hooks/useStores";
import { observer } from "mobx-react-lite";
import { Channel } from "@stores/objects/Channel";
import { UserAvatar } from "@components/User/UserAvatar";
import { DMGroupAvatar } from "@components/DMChannel/DMGroupAvatar";
import {
  CaretDownIcon,
  CaretUpIcon,
  UserPlusIcon,
  UsersIcon,
  PhoneIcon,
} from "@phosphor-icons/react";
import { Tooltip } from "@components/Tooltip";
import { useModal } from "@contexts/Modal.context";
import { GroupDMAddRecipientModal } from "@components/DMChannel/GroupDMAddRecipientModal";
import { useTranslation } from "react-i18next";

interface Props {
  channel: Channel;
  callExpanded?: boolean;
  onToggleCallExpanded?: () => void;
}

export const DMChannelHeader = observer(
  ({ channel, callExpanded, onToggleCallExpanded }: Props) => {
    const app = useAppStore();
    const { theme } = useTheme();
    const { openModal } = useModal();
    const { t } = useTranslation("chat");

    const isGroupDM = channel.isGroupDM;

    const title = isGroupDM
      ? channel.name ||
        channel.dmRecipients
          .map((u) => u.displayName)
          .filter(Boolean)
          .join(", ")
      : (channel.dmRecipient?.displayName ?? t("deletedUser"));

    const isFull = (channel.recipientIds?.length ?? 0) >= 10;
    const callActive = app.calls.isActive(channel.id);
    const inThisCall =
      app.voice.currentChannelId === channel.id &&
      app.voice.connectionStatus !== "idle";
    const ringingForMe = app.calls.isRingingForMe(channel.id);
    const outgoing = app.calls.isOutgoing(channel.id);
    const participantCount = Array.from(channel.voiceStates.values()).length;

    const callStatus = !callActive
      ? null
      : ringingForMe
        ? t("call.incoming")
        : outgoing
          ? t("call.calling")
          : inThisCall
            ? t("call.inCall")
            : t("call.active");

    return (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
        px={2.5}
        py={callStatus ? 1 : 0}
        height={callStatus ? "auto" : "2.95rem"}
        minHeight="2.95rem"
        css={{
          flexShrink: 0,
          borderBottom: callActive
            ? `1px solid ${formatColor(theme.colors.neutral, {
                alpha: 0.28,
                format: "hexa",
              })}`
            : undefined,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          flex={1}
          spacing={2}
          minWidth={0}
        >
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
          <Stack direction="column" minWidth={0}>
            <Typography level="label-sm" weight="bold">
              {title}
            </Typography>
            {callStatus && (
              <Typography level="body-xs" textColor="muted">
                {participantCount > 0
                  ? `${callStatus} · ${participantCount}`
                  : callStatus}
              </Typography>
            )}
          </Stack>
        </Stack>
        <ButtonGroup variant="plain" spacing={10}>
          {callActive && onToggleCallExpanded && (
            <IconButton onClick={onToggleCallExpanded}>
              {callExpanded ? <CaretUpIcon /> : <CaretDownIcon />}
            </IconButton>
          )}
          <Tooltip
            content={
              inThisCall
                ? t("call.inCall")
                : callActive
                  ? t("call.join")
                  : t("call.start")
            }
            placement="bottom"
          >
            <IconButton
              color={callActive || inThisCall ? "success" : undefined}
              disabled={inThisCall}
              onClick={(e) => {
                if (inThisCall) return;
                if (ringingForMe) {
                  void app.calls.accept(channel.id);
                  return;
                }
                if (callActive) {
                  void app.voice.join({
                    spaceId: null,
                    channelId: channel.id,
                  });
                  return;
                }
                void app.calls.startCall(channel.id, {
                  silent: e.shiftKey,
                });
              }}
            >
              <PhoneIcon weight="fill" />
            </IconButton>
          </Tooltip>
          {isGroupDM && (
            <>
              <Tooltip
                content={
                  isFull
                    ? t("header.dm.groupFull")
                    : t("header.dm.addToGroup")
                }
                placement="bottom"
              >
                <IconButton
                  disabled={isFull}
                  onClick={() =>
                    openModal(
                      `add-recipient-${channel.id}`,
                      <GroupDMAddRecipientModal channel={channel} />,
                    )
                  }
                >
                  <UserPlusIcon weight="fill" />
                </IconButton>
              </Tooltip>
              <Tooltip
                content={
                  app.memberListVisible
                    ? t("header.memberList.hide")
                    : t("header.memberList.show")
                }
                placement="bottom"
              >
                <IconButton
                  color={app.memberListVisible ? "success" : undefined}
                  onClick={() => app.toggleMemberList()}
                >
                  <UsersIcon weight="fill" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </ButtonGroup>
      </Stack>
    );
  },
);
