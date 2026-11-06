import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { Tooltip } from "../Tooltip";
import { useBridgeServerLabel } from "@renderer/hooks/useBridgeServerLabel";

export interface BridgeServerStatus {
  serverId: string;
  tps: number;
  mspt: number;
  maxPlayers: number;
  version: string;
  motd: string;
  updatedAt: string;
}

export interface BridgeServerInfo {
  serverId: string;
  displayName: string;
}

const tpsColor = (tps: number): "success" | "warning" | "danger" => {
  if (tps >= 19) return "success";
  if (tps >= 15) return "warning";
  return "danger";
};

const Stat = ({
  value,
  label,
  hint,
  color
}: {
  value: string;
  label: string;
  hint: string;
  color?: "success" | "warning" | "danger";
}) => (
  <Tooltip content={hint} placement="bottom">
    <Stack direction="column" alignItems="center" flex={1} minWidth={0}>
      <Typography
        level="body-sm"
        fontWeight="bold"
        variant={color ? "plain" : "none"}
        color={color}
      >
        {value}
      </Typography>
      <Typography level="body-xs" textColor="muted">
        {label}
      </Typography>
    </Stack>
  </Tooltip>
);

export const BridgeServerCard = observer(
  ({
    bridgeId,
    statuses
  }: {
    bridgeId: string;
    statuses: BridgeServerStatus[];
  }) => {
    const app = useAppStore();
    const { t } = useTranslation("settings");
    const labelFor = useBridgeServerLabel(bridgeId);
    const players = app.bridgeChat.playersFor(bridgeId);

    if (statuses.length === 0) return null;

    const sorted = [...statuses].sort((a, b) =>
      labelFor(a.serverId).localeCompare(labelFor(b.serverId))
    );

    return (
      <Stack direction="column" spacing={1} mb={2}>
        {sorted.map((status) => {
          const online = players.filter(
            (player) => player.serverId === status.serverId
          ).length;

          return (
            <Paper
              key={status.serverId}
              elevation={app.settings?.preferEmbossed ? 3 : 1}
              borderRadius={10}
              p={2}
              direction="column"
              spacing={1.75}
            >
              <Stack direction="column" spacing={0.5} minWidth={0}>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <Typography
                    level="body-sm"
                    variant="plain"
                    color={tpsColor(status.tps)}
                  >
                    ●
                  </Typography>
                  <Typography
                    level="body-sm"
                    fontWeight="bold"
                    css={{
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {labelFor(status.serverId)}
                  </Typography>
                  <Typography level="body-xs" textColor="muted">
                    {status.version}
                  </Typography>
                </Stack>
                {status.motd && (
                  <Typography
                    level="body-xs"
                    textColor="muted"
                    css={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {status.motd}
                  </Typography>
                )}
              </Stack>

              <Paper
                elevation={app.settings?.preferEmbossed ? 4 : 2}
                borderRadius={8}
                py={1}
                px={0.5}
                direction="row"
                spacing={0.5}
              >
                <Stat
                  value={`${online}/${status.maxPlayers}`}
                  label={t("minecraftBridge.serverCardPlayersLabel")}
                  hint={t("minecraftBridge.serverCardPlayersHint")}
                />
                <Stat
                  value={status.tps.toFixed(1)}
                  label="TPS"
                  hint={t("minecraftBridge.serverCardTpsHint")}
                  color={tpsColor(status.tps)}
                />
                <Stat
                  value={`${Math.round(status.mspt)} ms`}
                  label="MSPT"
                  hint={t("minecraftBridge.serverCardMsptHint")}
                />
              </Paper>
            </Paper>
          );
        })}
      </Stack>
    );
  }
);
