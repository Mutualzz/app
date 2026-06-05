import { IconButton } from "@components/IconButton";
import { Paper } from "@components/Paper";
import { TooltipWrapper } from "@components/TooltipWrapper";
import { useAppStore } from "@hooks/useStores";
import { Stack, Tooltip } from "@mutualzz/ui-web";
import { Message } from "@stores/objects/Message";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import type { PropsWithChildren } from "react";
import { QueuedMessage } from "@stores/objects/QueuedMessage";
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";

interface Props extends PropsWithChildren {
  message: Message | QueuedMessage;
  header?: boolean;
}

const ToolbarContent = observer(({ message }: Props) => {
  const app = useAppStore();

  const { mutate: deleteMessage } = useMutation({
    mutationKey: ["delete-message", message.id],
    mutationFn: (): any => message.delete()
  });

  const me = message.space?.members.me;

  const hideSwitcher = () => {
    if (!app.memberListVisible) {
      app.setHideSwitcher(true);
    }
  };

  const showSwitcher = () => {
    if (!app.memberListVisible) {
      app.setHideSwitcher(false);
    }
  };

  const isSent = message instanceof Message;

  return (
    <Paper
      onMouseEnter={hideSwitcher}
      onMouseLeave={showSwitcher}
      p={2}
      borderRadius={10}
      elevation={app.settings?.preferEmbossed ? 5 : 2}
      transparency={25}
    >
      <Stack spacing={1.25}>
        {message.author?.id === app.account?.id && isSent && (
          <Tooltip offset={16} content={<TooltipWrapper>Edit</TooltipWrapper>}>
            <IconButton
              onClick={() => message.setEditing(true)}
              variant="plain"
              size="sm"
            >
              <PencilSimpleIcon weight="fill" />
            </IconButton>
          </Tooltip>
        )}
        {(message.author?.id === app.account?.id ||
          me?.hasPermission("ManageMessages")) && (
          <Tooltip
            offset={16}
            content={<TooltipWrapper>Delete</TooltipWrapper>}
          >
            <IconButton
              color="danger"
              variant="plain"
              size="sm"
              onClick={() => deleteMessage()}
            >
              <TrashIcon weight="fill" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Paper>
  );
});

export const MessageToolbar = observer(
  ({ message, header, children }: Props) => {
    if (message instanceof Message && message.editing) return children;

    return (
      <Tooltip
        placement="right-start"
        content={<ToolbarContent message={message} />}
        offset={{ crossAxis: header ? -20 : -30, mainAxis: -90 }}
        disablePortal
      >
        {children}
      </Tooltip>
    );
  }
);
