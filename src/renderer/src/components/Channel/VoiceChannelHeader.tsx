import { Paper } from "@components/Paper";
import { IconButton } from "@components/IconButton";
import { useElapsedClock } from "@hooks/useElapsedClock";
import { useAppStore } from "@hooks/useStores";
import { ButtonGroup, Divider, IconSlot, Stack, Typography } from "@mutualzz/ui-web";
import type { Channel } from "@stores/objects/Channel";
import { getChannelOccupiedAt } from "@utils/voiceElapsed";
import { observer } from "mobx-react-lite";
import { useNavigate } from "@tanstack/react-router";
import { ChatCircleIcon, XIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

interface Props {
  channel: Channel;
}

export const VoiceChannelHeader = observer(({ channel }: Props) => {
  const app = useAppStore();
  const navigate = useNavigate();
  const { t } = useTranslation("chat");
  const voiceStates = Array.from(channel.voiceStates.values());
  const channelElapsed = useElapsedClock(getChannelOccupiedAt(voiceStates));

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
      <Stack direction="row" alignItems="center" flex={1} spacing={1.25} minWidth={0}>
        <IconSlot size={16}>
          <ChatCircleIcon weight="bold" />
        </IconSlot>
        <Typography level="label-sm" weight="bold" minWidth={0}>
          {channel?.name}
        </Typography>
        <Stack flex="1 1 auto" direction="row" alignItems="center" minWidth={0}>
          {channel.topic && (
            <>
              <Divider
                style={{
                  margin: "0 8px"
                }}
                orientation="vertical"
              />
              <Typography level="label-sm" textColor="muted">
                {channel.topic}
              </Typography>
            </>
          )}
        </Stack>
        {channelElapsed && (
          <Typography
            level="label-xs"
            textColor="muted"
            css={{ flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
            aria-label={t("voice.channelOccupied", { time: channelElapsed })}
          >
            {channelElapsed}
          </Typography>
        )}
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        <ButtonGroup variant="plain" spacing={10}>
          <IconButton
            size="sm"
            onClick={() =>
              navigate({
                to: "/spaces/$spaceId/$channelId",
                params: {
                  spaceId: channel.spaceId as string,
                  channelId: channel.id
                }
              })
            }
          >
            <XIcon />
          </IconButton>
        </ButtonGroup>
      </Stack>
    </Paper>
  );
});
