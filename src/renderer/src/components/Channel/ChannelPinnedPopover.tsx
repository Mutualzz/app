import { IconButton } from "@components/IconButton";
import { PinnedMessageCard } from "@components/Channel/PinnedMessageCard";
import { useAppStore } from "@hooks/useStores";
import type { APIMessage } from "@mutualzz/types";
import { IconSlot, Popover, Stack, Typography } from "@mutualzz/ui-web";
import { styled } from "@mutualzz/ui-core";
import type { Channel } from "@stores/objects/Channel";
import { useQuery } from "@tanstack/react-query";
import { PushPinIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  channel: Channel;
}

export const PINNED_PANEL_WIDTH_PX = 432;

const PinnedPanel = styled(Stack)({
  whiteSpace: "normal",
  width: PINNED_PANEL_WIDTH_PX,
  maxWidth: PINNED_PANEL_WIDTH_PX,
  maxHeight: "min(70vh, 640px)",
  overflow: "hidden",
  boxSizing: "border-box",
});

const PinnedList = styled(Stack)({
  flex: "1 1 auto",
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",
  width: "100%",
});

export const ChannelPinnedPopover = observer(({ channel }: Props) => {
  const app = useAppStore();
  const { t } = useTranslation("chat");

  const { data = [] } = useQuery({
    queryKey: ["channel-pins", channel.id],
    queryFn: () =>
      app.rest.get<APIMessage[]>(`channels/${channel.id}/messages/pins`),
  });

  const pins = useMemo(() => [...data].reverse(), [data]);

  return (
    <Popover
      placement="bottom"
      p={0}
      width={PINNED_PANEL_WIDTH_PX}
      surfaceRole="popout"
      elevation={8}
      closeOnClickOutside
      css={{
        whiteSpace: "normal",
        overflow: "hidden",
        width: PINNED_PANEL_WIDTH_PX,
        maxWidth: PINNED_PANEL_WIDTH_PX,
      }}
      trigger={
        <IconButton aria-label={t("header.pins")}>
          <PushPinIcon weight="fill" />
        </IconButton>
      }
    >
      <PinnedPanel direction="column">
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          px={2}
          py={1.75}
          flexShrink={0}
          css={{
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <IconSlot size={18}>
            <PushPinIcon weight="fill" />
          </IconSlot>
          <Typography level="label-sm" weight="bold">
            {t("header.pins")}
          </Typography>
        </Stack>

        {pins.length === 0 ? (
          <Stack
            direction="column"
            alignItems="center"
            justifyContent="center"
            px={3}
            py={5}
          >
            <IconSlot size={28} css={{ opacity: 0.4 }}>
              <PushPinIcon weight="fill" />
            </IconSlot>
            <Typography level="body-sm" textColor="muted" textAlign="center" pt={1}>
              {t("pins.empty")}
            </Typography>
          </Stack>
        ) : (
          <PinnedList direction="column" pb={0.5}>
            {pins.map((message) => (
              <PinnedMessageCard
                key={message.id}
                message={message}
                space={channel.space}
                onJump={() => app.requestJumpToMessage(channel.id, message.id)}
              />
            ))}
          </PinnedList>
        )}
      </PinnedPanel>
    </Popover>
  );
});
