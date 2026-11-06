import { InputWithLabel } from "@components/InputWithLabel";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { Button } from "@renderer/components/Button";
import { isElectron } from "@utils/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BridgeCard, BridgeTabGate } from "./BridgeSettingsParts";
import {
  type BridgeDetail,
  type DiscordStatus,
  isDiscordSnowflake,
  knownServerIdsOf,
  looksLikeDiscordSnowflake,
  sanitizeServerId
} from "./types";

const DiscordBindings = observer(
  ({
    spaceId,
    detail,
    serverLabel,
    onUnbound,
    onError
  }: {
    spaceId: string;
    detail: BridgeDetail;
    serverLabel: (serverId: string) => string;
    onUnbound: () => void;
    onError: (message: string | null) => void;
  }) => {
    const { t } = useTranslation("settings");
    const app = useAppStore();
    const queryClient = useQueryClient();

    const unbindMutation = useMutation({
      mutationFn: (bindingId: string) =>
        app.rest.delete(`/spaces/${spaceId}/bridge/discord/${bindingId}`),
      onSuccess: () => {
        onError(null);
        onUnbound();
        void queryClient.invalidateQueries({
          queryKey: ["space", spaceId, "bridge"]
        });
      },
      onError: (err: Error) => onError(err.message)
    });

    if (detail.discordBindings.length === 0) {
      return (
        <Typography level="body-sm" textColor="muted">
          {t("minecraftBridge.noBindingsYet")}
        </Typography>
      );
    }

    return (
      <BridgeCard spacing={1.5}>
        <Typography fontSize={18} fontWeight="bold">
          {t("minecraftBridge.discordConnectedTitle")}
        </Typography>
        {detail.discordBindings.map((b) => (
          <Stack
            key={b.id}
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            spacing={1.5}
          >
            <Stack direction="column" spacing={0.25} minWidth={0} flex={1}>
              <Typography level="body-md" fontWeight="bold">
                {b.guildName && b.channelName
                  ? t("minecraftBridge.discordConnectedNamed", {
                      server: serverLabel(b.serverId),
                      channel: b.channelName,
                      guild: b.guildName
                    })
                  : t("minecraftBridge.discordConnectedFor", {
                      server: serverLabel(b.serverId),
                      channel: b.channelId
                    })}
              </Typography>
              {(b.guildName || b.channelName) && (
                <Typography level="body-xs" textColor="muted">
                  {b.guildId} / {b.channelId}
                </Typography>
              )}
              <Typography
                level="body-xs"
                color={b.hasWebhook ? "success" : "warning"}
              >
                {b.hasWebhook
                  ? t("minecraftBridge.discordWebhookReady")
                  : t("minecraftBridge.discordWebhookPending")}
              </Typography>
            </Stack>
            <Button
              size="sm"
              variant="soft"
              color="danger"
              disabled={unbindMutation.isPending}
              onClick={() => unbindMutation.mutate(b.id)}
            >
              {t("minecraftBridge.unbind")}
            </Button>
          </Stack>
        ))}
      </BridgeCard>
    );
  }
);

const DiscordHowTo = observer(() => {
  const { t } = useTranslation("settings");
  const app = useAppStore();

  const discordStatusQuery = useQuery({
    queryKey: ["me", "bridges", "discord", "status"],
    queryFn: () => app.rest.get<DiscordStatus>("/@me/bridges/discord/status")
  });

  const botInviteUrl = discordStatusQuery.data?.botInviteUrl;

  const openBotInvite = async () => {
    if (!botInviteUrl) return;
    if (isElectron) await window.api.shell.openExternal(botInviteUrl);
    else window.open(botInviteUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <BridgeCard spacing={1.25}>
      <Typography fontSize={18} fontWeight="bold">
        {t("minecraftBridge.discordHowToTitle")}
      </Typography>
      <Typography level="body-sm" textColor="muted">
        {t("minecraftBridge.discordHowToStep1")}
      </Typography>
      <Typography level="body-sm" textColor="muted">
        {t("minecraftBridge.discordHowToStep2")}
      </Typography>
      <Typography level="body-sm" textColor="muted">
        {t("minecraftBridge.discordHowToStep3")}
      </Typography>
      <Typography level="body-sm" textColor="muted">
        {t("minecraftBridge.discordHowToStep4")}
      </Typography>
      <Typography level="body-sm" textColor="muted">
        {t("minecraftBridge.discordHowToStep5")}
      </Typography>
      <Typography level="body-xs" textColor="muted">
        {t("minecraftBridge.discordBotPermissions")}
      </Typography>
      {botInviteUrl && (
        <Stack direction="row">
          <Button size="sm" variant="soft" onClick={() => void openBotInvite()}>
            {t("minecraftBridge.discordInviteBot")}
          </Button>
        </Stack>
      )}
    </BridgeCard>
  );
});

export const DiscordTab = observer(
  ({
    spaceId,
    detail,
    isOwner,
    bindServerId,
    serverLabel,
    onBindServerIdChange,
    onGoToSetup,
    onError
  }: {
    spaceId: string;
    detail?: BridgeDetail;
    isOwner: boolean;
    bindServerId: string;
    serverLabel: (serverId: string) => string;
    onBindServerIdChange: (serverId: string) => void;
    onGoToSetup: () => void;
    onError: (message: string | null) => void;
  }) => {
    const { t } = useTranslation("settings");
    const app = useAppStore();
    const queryClient = useQueryClient();
    const [guildId, setGuildId] = useState("");
    const [channelId, setChannelId] = useState("");

    useEffect(() => {
      if (!detail) return;
      const binding = detail.discordBindings.find(
        (b) => b.serverId === bindServerId
      );
      setGuildId(binding?.guildId ?? "");
      setChannelId(binding?.channelId ?? "");
    }, [bindServerId, detail?.id, detail?.discordBindings.length]);

    const bindMutation = useMutation({
      mutationFn: () =>
        app.rest.put(`/spaces/${spaceId}/bridge/discord`, {
          serverId: bindServerId.trim(),
          guildId: guildId.trim(),
          channelId: channelId.trim()
        }),
      onSuccess: () => {
        onError(null);
        void queryClient.invalidateQueries({
          queryKey: ["space", spaceId, "bridge"]
        });
      },
      onError: (err: Error) => onError(err.message)
    });

    const activeBinding = detail?.discordBindings.find(
      (b) => b.serverId === bindServerId
    );
    const knownServerIds = knownServerIdsOf(detail);

    const save = () => {
      if (looksLikeDiscordSnowflake(bindServerId)) {
        onError(t("minecraftBridge.discordInvalidMinecraftServer"));
        return;
      }
      if (!isDiscordSnowflake(guildId) || !isDiscordSnowflake(channelId)) {
        onError(t("minecraftBridge.discordInvalidId"));
        return;
      }
      onError(null);
      bindMutation.mutate();
    };

    return (
      <Stack spacing={2.5} direction="column">
        <BridgeTabGate
          ready={Boolean(detail)}
          isOwner={isOwner}
          onGoToSetup={onGoToSetup}
        >
          {detail && (
            <>
              <Typography level="body-sm" textColor="muted">
                {t("minecraftBridge.discordBindHint")}
              </Typography>

              <DiscordBindings
                spaceId={spaceId}
                detail={detail}
                serverLabel={serverLabel}
                onUnbound={() => {
                  setGuildId("");
                  setChannelId("");
                }}
                onError={onError}
              />

              <DiscordHowTo />

              <BridgeCard>
                <Typography fontSize={18} fontWeight="bold">
                  {activeBinding
                    ? t("minecraftBridge.discordFormUpdateTitle")
                    : t("minecraftBridge.discordFormTitle")}
                </Typography>
                <Typography level="body-sm" textColor="muted">
                  {activeBinding
                    ? t("minecraftBridge.discordChangeHint")
                    : t("minecraftBridge.discordFormHint")}
                </Typography>

                <InputWithLabel
                  name="bindServerId"
                  label={t("minecraftBridge.discordServerPickerLabel")}
                  value={bindServerId}
                  onChange={(e) =>
                    onBindServerIdChange(sanitizeServerId(e.target.value))
                  }
                  placeholder={t("minecraftBridge.serverIdPlaceholder")}
                  description={t("minecraftBridge.discordServerPickerHint")}
                  type="text"
                />
                {knownServerIds.length > 0 && (
                  <Stack direction="column" spacing={0.5}>
                    <Typography level="body-xs" textColor="muted">
                      {t("minecraftBridge.discordPickKnownServer")}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {knownServerIds.map((id) => (
                        <Button
                          key={id}
                          size="sm"
                          variant="soft"
                          color={bindServerId === id ? "primary" : "neutral"}
                          onClick={() => onBindServerIdChange(id)}
                        >
                          {serverLabel(id)}
                        </Button>
                      ))}
                    </Stack>
                  </Stack>
                )}

                <InputWithLabel
                  name="guildId"
                  label={t("minecraftBridge.guildId")}
                  value={guildId}
                  onChange={(e) =>
                    setGuildId(e.target.value.replace(/\s/g, ""))
                  }
                  placeholder={t("minecraftBridge.guildIdPlaceholder")}
                  description={t("minecraftBridge.guildIdHint")}
                />
                <InputWithLabel
                  name="channelId"
                  label={t("minecraftBridge.channelId")}
                  value={channelId}
                  onChange={(e) =>
                    setChannelId(e.target.value.replace(/\s/g, ""))
                  }
                  placeholder={t("minecraftBridge.channelIdPlaceholder")}
                  description={t("minecraftBridge.channelIdHint")}
                />

                <Stack direction="row">
                  <Button
                    disabled={
                      bindMutation.isPending ||
                      !bindServerId.trim() ||
                      !guildId.trim() ||
                      !channelId.trim()
                    }
                    onClick={save}
                  >
                    {bindMutation.isPending
                      ? t("minecraftBridge.saving")
                      : activeBinding
                        ? t("minecraftBridge.updateBinding")
                        : t("minecraftBridge.saveBinding")}
                  </Button>
                </Stack>
              </BridgeCard>
            </>
          )}
        </BridgeTabGate>
      </Stack>
    );
  }
);
