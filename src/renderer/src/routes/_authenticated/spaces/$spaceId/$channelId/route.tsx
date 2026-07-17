import { Paper } from "@components/Paper";
import { TextChannelView } from "@components/Views/TextChannelView";
import { VoiceChannelView } from "@components/Views/VoiceChannelView";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_authenticated/spaces/$spaceId/$channelId"
)({
  component: observer(RouteComponent),
  validateSearch: (search) => ({
    ...(search.chat === undefined ? {} : { chat: search.chat })
  })
});

function RouteComponent() {
  const { t } = useTranslation("chat");
  const app = useAppStore();
  const { spaceId, channelId } = Route.useParams();
  const { chat } = Route.useSearch();
  const navigate = useNavigate();

  const space = app.spaces.get(spaceId);

  const channel = space?.channels.find((ch) => ch.id === channelId) ?? null;
  const activeChannel =
    channel?.canRedirect && space?.members.me?.canViewChannel(channel)
      ? channel
      : null;

  const openChat = Boolean(activeChannel?.isVoiceChannel && chat === true);

  useEffect(() => {
    if (!space) return;

    if (!activeChannel) {
      navigate({
        to: "/spaces/$spaceId",
        params: { spaceId },
        replace: true
      });
      return;
    }

    app.spaces.setActive(spaceId);
    app.spaces.setMostRecentSpace(spaceId);
    app.channels.setActive(channelId);
    app.channels.setMostRecentChannelForSpace(spaceId, channelId);

    app.gateway.onChannelOpen(spaceId, channelId);
  }, [app, navigate, space, activeChannel, spaceId, channelId]);

  if (!activeChannel) {
    return (
      <Paper
        surfaceRole="content"
        elevation={0}
        direction="column"
        flex="1 1 auto"
        overflow="hidden"
      >
        <Stack alignItems="center" justifyContent="center" flex="1">
          <Typography level="h5">{t("loadingChannel")}</Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <>
      {activeChannel.isTextChannel && (
        <TextChannelView channel={activeChannel} />
      )}
      {activeChannel.isVoiceChannel && (
        <Paper
          surfaceRole="content"
          elevation={0}
          direction="column"
          flex="1 1 auto"
          overflow="hidden"
          height="100%"
          borderRadius={0}
        >
          <VoiceChannelView channel={activeChannel} showChat={openChat} />
        </Paper>
      )}
    </>
  );
}
