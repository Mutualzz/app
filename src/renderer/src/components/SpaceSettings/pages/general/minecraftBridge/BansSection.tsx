import { MinecraftAvatar } from "@components/Minecraft/MinecraftAvatar";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { Button } from "@renderer/components/Button";
import type { ModerationResult } from "@renderer/components/Modals/PlayerModerationModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { BridgeSection } from "./BridgeSettingsParts";
import type { BridgeBanRow } from "./types";

export const BansSection = observer(
  ({
    spaceId,
    enabled,
    serverLabel,
    onError
  }: {
    spaceId: string;
    enabled: boolean;
    serverLabel: (serverId: string) => string;
    onError: (message: string) => void;
  }) => {
    const { t } = useTranslation("settings");
    const app = useAppStore();
    const queryClient = useQueryClient();
    const bansKey = ["space", spaceId, "bridge", "bans"];

    const bansQuery = useQuery({
      queryKey: bansKey,
      enabled,
      queryFn: () =>
        app.rest.get<{ bans: BridgeBanRow[] }>(`/spaces/${spaceId}/bridge/bans`)
    });

    const unbanMutation = useMutation({
      mutationFn: (minecraftUuid: string) =>
        app.rest.delete<{ results: ModerationResult[] }>(
          `/spaces/${spaceId}/bridge/players/${minecraftUuid}/ban`
        ),
      onSuccess: ({ results }) => {
        const failed = results.filter((result) => !result.ok);
        if (failed.length === 0) {
          toast.success(t("minecraftBridge.unbanDone"));
        } else {
          toast.warning(
            t("minecraftBridge.unbanPartial", {
              servers: failed
                .map((result) => serverLabel(result.serverId))
                .join(", ")
            })
          );
        }
        void queryClient.invalidateQueries({ queryKey: bansKey });
      },
      onError: (err: Error) => onError(err.message)
    });

    const bans = bansQuery.data?.bans ?? [];

    return (
      <BridgeSection
        title={t("minecraftBridge.bansTitle")}
        description={t("minecraftBridge.bansHint")}
      >
        {bans.length === 0 ? (
          <Typography level="body-xs" textColor="muted">
            {t("minecraftBridge.bansEmpty")}
          </Typography>
        ) : (
          bans.map((ban) => (
            <Stack
              key={ban.minecraftUuid}
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack
                direction="row"
                spacing={1.25}
                alignItems="center"
                minWidth={0}
              >
                <MinecraftAvatar
                  uuid={ban.minecraftUuid}
                  name={ban.minecraftName}
                  size={28}
                />
                <Stack direction="column" minWidth={0}>
                  <Typography level="body-sm">{ban.minecraftName}</Typography>
                  <Typography level="body-xs" textColor="muted">
                    {t("minecraftBridge.bannedBy", {
                      name:
                        ban.bannedBy?.globalName ||
                        ban.bannedBy?.username ||
                        t("minecraftBridge.unknownAdmin"),
                      date: new Date(ban.createdAt).toLocaleDateString()
                    })}
                    {ban.reason ? ` · ${ban.reason}` : ""}
                  </Typography>
                </Stack>
              </Stack>
              <Button
                size="sm"
                variant="soft"
                disabled={
                  unbanMutation.isPending &&
                  unbanMutation.variables === ban.minecraftUuid
                }
                onClick={() => unbanMutation.mutate(ban.minecraftUuid)}
              >
                {t("minecraftBridge.unban")}
              </Button>
            </Stack>
          ))
        )}
      </BridgeSection>
    );
  }
);
