import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { ButtonGroup, Divider, IconSlot, Stack, Typography } from "@mutualzz/ui-web";
import type { Channel } from "@stores/objects/Channel";
import { observer } from "mobx-react-lite";
import { HashIcon, UsersIcon } from "@phosphor-icons/react";
import { IconButton } from "../IconButton";
import { Tooltip } from "@components/Tooltip";
import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";

interface Props {
  channel?: Channel | null;
}

export const TextChannelHeader = observer(({ channel }: Props) => {
  const app = useAppStore();

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
      <Stack direction="row" alignItems="center" flex={1} spacing={2} minWidth={0}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconSlot size={16}>
            <HashIcon />
          </IconSlot>
          <Typography level="label-sm" weight="bold">
            {channel?.name}
          </Typography>
        </Stack>
        <Stack flex="1 1 auto" direction="row" alignItems="center">
          {channel?.topic && (
            <>
              <Divider
                style={{
                  margin: "0 8px"
                }}
                orientation="vertical"
              />
              <MarkdownRenderer value={channel.topic} />
            </>
          )}
        </Stack>
      </Stack>
      <ButtonGroup variant="plain" spacing={10}>
        <Tooltip
          content={`${app.memberListVisible ? "Hide" : "Show"} Member List`}
          placement="bottom"
        >
          <IconButton
            color={app.memberListVisible ? undefined : "neutral"}
            onClick={() => app.toggleMemberList()}
          >
            <UsersIcon weight="fill" />
          </IconButton>
        </Tooltip>
      </ButtonGroup>
    </Paper>
  );
});
