import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { ButtonGroup, Divider, Stack, Typography } from "@mutualzz/ui-web";
import type { Channel } from "@stores/objects/Channel";
import { observer } from "mobx-react-lite";
import { HashIcon, UsersIcon } from "@phosphor-icons/react";
import { IconButton } from "../IconButton";
import { Tooltip } from "@components/Tooltip";

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
      <Stack flex={1} direction="row" alignItems="center" spacing={2}>
        <Typography
          display="flex"
          alignItems="center"
          spacing={1}
          fontWeight={600}
        >
          <HashIcon /> {channel?.name}
        </Typography>
        <Stack flex="1 1 auto">
          {channel?.topic && (
            <>
              <Divider
                style={{
                  margin: "0 8px"
                }}
                orientation="vertical"
              />
              <Typography textColor="muted">{channel.topic}</Typography>
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
