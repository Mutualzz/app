import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { useAppStore } from "@renderer/hooks/useStores";
import { Relationship } from "@renderer/stores/objects/Relationship";
import { useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { Paper } from "../Paper";
import { dynamicElevation } from "@mutualzz/ui-core";
import { UserAvatar } from "../User/UserAvatar";
import { SmallActivityStatus } from "../SmallActivityStatus";
import { IconButton } from "../IconButton";
import { Tooltip } from "../Tooltip";
import { ChatCircleIcon, CheckIcon, XIcon } from "@phosphor-icons/react";

export const UserItem = observer(
  ({ relationship }: { relationship: Relationship }) => {
    const { theme } = useTheme();
    const app = useAppStore();
    const { t } = useTranslation("chat");
    const user = relationship.otherUser;
    const navigate = useNavigate();
    if (!user) return null;

    const presence = app.presence.get(user.id);

    return (
      <Paper
        css={{
          cursor: "pointer",
          ":hover": {
            background: dynamicElevation(
              theme.colors.surface,
              app.settings?.preferEmbossed ? 4 : 1
            )
          }
        }}
        key={relationship.id}
        p={4}
        justifyContent="space-between"
        alignItems="center"
        borderRadius={6}
        borderLeft="0 !important"
        borderRight="0 !important"
        elevation={app.settings?.preferEmbossed ? 3 : 0}
        onClick={async () => {
          const channel = await app.channels.openDM(user.id);
          navigate({
            to: "/@me/$channelId",
            params: { channelId: channel.id }
          });
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2.5}>
          <UserAvatar user={user} badge />
          <Stack direction="column" flex={1}>
            <Typography>{user.displayName}</Typography>
            {presence && <SmallActivityStatus presence={presence} />}
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={2.5}>
          {relationship.isFriend && (
            <Tooltip content={t("contextMenu.message")}>
              <IconButton
                color="neutral"
                padding={8}
                variant="solid"
                onClick={async (e) => {
                  e.stopPropagation();
                  const channel = await app.channels.openDM(user.id);
                  navigate({
                    to: "/@me/$channelId",
                    params: { channelId: channel.id }
                  });
                }}
              >
                <ChatCircleIcon weight="fill" />
              </IconButton>
            </Tooltip>
          )}
          {relationship.isOutgoingRequest && (
            <Tooltip content={t("contextMenu.cancelFriendRequest")}>
              <IconButton
                color="neutral"
                padding={8}
                variant="solid"
                onClick={(e) => {
                  e.stopPropagation();
                  app.relationships.cancelFriendRequest(user.id);
                }}
              >
                <XIcon />
              </IconButton>
            </Tooltip>
          )}
          {relationship.isIncomingRequest && (
            <>
              <Tooltip content={t("contextMenu.acceptFriendRequest")}>
                <IconButton
                  color="neutral"
                  padding={8}
                  variant="solid"
                  onClick={(e) => {
                    e.stopPropagation();
                    app.relationships.acceptFriendRequest(user.id);
                  }}
                >
                  <CheckIcon />
                </IconButton>
              </Tooltip>
              <Tooltip content={t("contextMenu.declineFriendRequest")}>
                <IconButton
                  color="neutral"
                  padding={8}
                  variant="solid"
                  onClick={(e) => {
                    e.stopPropagation();
                    app.relationships.declineFriendRequest(user.id);
                  }}
                >
                  <XIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      </Paper>
    );
  }
);
