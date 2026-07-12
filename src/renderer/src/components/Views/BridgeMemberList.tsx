import { Paper } from "@components/Paper";
import { MinecraftAvatar } from "@components/Minecraft/MinecraftAvatar";
import { UserAvatar } from "@components/User/UserAvatar";
import { useAppStore } from "@hooks/useStores";
import { Button, Popover, Stack, Typography } from "@mutualzz/ui-web";
import { isElectron } from "@utils/index";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { BridgeOnlinePlayer } from "@stores/BridgeChat.store";

interface Props {
  bridgeId: string;
}

const PlayerPopout = observer(
  ({
    player,
    onCopied,
    copied,
  }: {
    player: BridgeOnlinePlayer;
    copied: "name" | "uuid" | null;
    onCopied: (kind: "name" | "uuid") => void;
  }) => {
    const { t } = useTranslation("settings");
    const app = useAppStore();
    const linkedUser =
      player.linkedUser?.id != null
        ? (app.users.get(player.linkedUser.id) ?? null)
        : null;

    const copy = async (value: string, kind: "name" | "uuid") => {
      try {
        if (isElectron) await window.api.clipboard.write(value);
        else await navigator.clipboard.writeText(value);
        onCopied(kind);
      } catch {
        // ignore
      }
    };

    return (
      <Paper
        elevation={app.settings?.preferEmbossed ? 5 : 2}
        direction="column"
        spacing={1}
        p={1.5}
        borderRadius={10}
        minWidth={220}
        maxWidth={280}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          {linkedUser ? (
            <UserAvatar user={linkedUser} size={40} />
          ) : (
            <MinecraftAvatar uuid={player.uuid} name={player.name} size={40} />
          )}
          <Stack direction="column" spacing={0} minWidth={0}>
            <Typography level="body-sm" fontWeight="bold">
              {player.name}
            </Typography>
            {player.linkedUser && (
              <Typography level="body-xs" textColor="muted">
                {t("minecraftBridge.linkedMutualzz", {
                  name:
                    player.linkedUser.globalName || player.linkedUser.username,
                })}
              </Typography>
            )}
          </Stack>
        </Stack>
        <Typography
          level="body-xs"
          textColor="muted"
          css={{ wordBreak: "break-all" }}
        >
          {player.uuid}
        </Typography>
        <Stack direction="row" spacing={0.75}>
          <Button
            size="sm"
            variant="soft"
            onClick={() => copy(player.name, "name")}
          >
            {copied === "name"
              ? t("minecraftBridge.copied")
              : t("minecraftBridge.copyName")}
          </Button>
          <Button
            size="sm"
            variant="soft"
            onClick={() => copy(player.uuid, "uuid")}
          >
            {copied === "uuid"
              ? t("minecraftBridge.copied")
              : t("minecraftBridge.copyUuid")}
          </Button>
        </Stack>
      </Paper>
    );
  },
);

export const BridgeMemberList = observer(({ bridgeId }: Props) => {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const [copied, setCopied] = useState<"name" | "uuid" | null>(null);
  const players = [...app.bridgeChat.playersFor(bridgeId)].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const handleCopied = (kind: "name" | "uuid") => {
    setCopied(kind);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 0}
      direction="column"
      flex="0 0 240px"
      overflowX="hidden"
      borderTop="0 !important"
      borderRight="0 !important"
      borderBottom="0 !important"
      px={1.75}
      py={1.25}
    >
      <Typography textColor="muted">
        {t("minecraftBridge.onlineCount", { count: players.length })}
      </Typography>
      <Stack direction="column" flex="1 1 auto" overflowY="auto" spacing={0.25}>
        {players.length === 0 ? (
          <Typography level="body-sm" textColor="muted" mt={1}>
            {t("minecraftBridge.onlineNone")}
          </Typography>
        ) : (
          players.map((player) => {
            const linked =
              player.linkedUser?.id != null
                ? app.users.get(player.linkedUser.id)
                : null;

            return (
              <Popover
                key={player.uuid}
                placement="left"
                closeOnClickOutside
                variant="plain"
                elevation={0}
                transparency={100}
                css={{
                  padding: 0,
                  background: "transparent",
                  boxShadow: "none",
                  overflow: "visible",
                }}
                trigger={
                  <Paper
                    variant="plain"
                    direction="row"
                    alignItems="center"
                    spacing={1.25}
                    px={1}
                    py={0.75}
                    borderRadius={8}
                    width="100%"
                    css={{ cursor: "pointer" }}
                  >
                    {linked ? (
                      <UserAvatar user={linked} size={28} />
                    ) : (
                      <MinecraftAvatar
                        uuid={player.uuid}
                        name={player.name}
                        size={28}
                      />
                    )}
                    <Typography
                      level="body-sm"
                      css={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      {player.name}
                    </Typography>
                  </Paper>
                }
              >
                <PlayerPopout
                  player={player}
                  copied={copied}
                  onCopied={handleCopied}
                />
              </Popover>
            );
          })
        )}
      </Stack>
    </Paper>
  );
});
