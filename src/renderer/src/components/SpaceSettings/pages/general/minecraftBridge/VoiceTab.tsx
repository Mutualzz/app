import { InputWithLabel } from "@components/InputWithLabel";
import { useAppStore } from "@hooks/useStores";
import { Option, Select, Stack, Typography } from "@mutualzz/ui-web";
import { Button } from "@renderer/components/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BridgeCard, BridgeTabGate } from "./BridgeSettingsParts";
import { type BridgeDetail, knownServerIdsOf, sanitizeServerId } from "./types";

const VoiceBindings = observer(
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
        app.rest.delete(`/spaces/${spaceId}/bridge/voice/${bindingId}`),
      onSuccess: () => {
        onError(null);
        onUnbound();
        void queryClient.invalidateQueries({
          queryKey: ["space", spaceId, "bridge"]
        });
      },
      onError: (err: Error) => onError(err.message)
    });

    return (
      <BridgeCard spacing={1.5}>
        <Typography fontSize={18} fontWeight="bold">
          {t("minecraftBridge.voiceConnectedTitle")}
        </Typography>
        {detail.voiceBindings.map((b) => {
          const space = app.spaces.get(b.spaceId);
          const channel = app.channels.get(b.channelId);
          return (
            <Stack
              key={b.id}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1.5}
            >
              <Typography level="body-md" minWidth={0} flex={1}>
                {t("minecraftBridge.voiceConnectedNamed", {
                  server: serverLabel(b.serverId),
                  name: b.name,
                  channel: channel?.name ?? b.channelId,
                  space: space?.name ?? b.spaceId
                })}
              </Typography>
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
          );
        })}
      </BridgeCard>
    );
  }
);

export const VoiceTab = observer(
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
    const [voiceSpaceId, setVoiceSpaceId] = useState("");
    const [voiceChannelId, setVoiceChannelId] = useState("");
    const [voiceRoomName, setVoiceRoomName] = useState("default");

    useEffect(() => {
      if (!detail) return;
      const binding = (detail.voiceBindings ?? []).find(
        (b) =>
          b.serverId === bindServerId &&
          b.name === (voiceRoomName.trim() || "default")
      );
      setVoiceSpaceId(binding?.spaceId ?? "");
      setVoiceChannelId(binding?.channelId ?? "");
    }, [
      bindServerId,
      voiceRoomName,
      detail?.id,
      detail?.voiceBindings?.length
    ]);

    const bindMutation = useMutation({
      mutationFn: () =>
        app.rest.put(`/spaces/${spaceId}/bridge/voice`, {
          serverId: bindServerId.trim(),
          name: voiceRoomName.trim() || "default",
          spaceId: voiceSpaceId.trim(),
          channelId: voiceChannelId.trim()
        }),
      onSuccess: () => {
        onError(null);
        void queryClient.invalidateQueries({
          queryKey: ["space", spaceId, "bridge"]
        });
      },
      onError: (err: Error) => onError(err.message)
    });

    const hasVoice = (detail?.voiceBindings?.length ?? 0) > 0;
    const knownServerIds = knownServerIdsOf(detail);
    const spaces = app.spaces.positioned;
    const selectedSpace =
      spaces.find((s) => s.id === voiceSpaceId) ??
      (voiceSpaceId ? app.spaces.get(voiceSpaceId) : undefined) ??
      null;
    const voiceChannels = selectedSpace
      ? selectedSpace.channels
          .filter((c) => c.isVoiceChannel)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      : [];

    return (
      <Stack spacing={2.5} direction="column">
        <BridgeTabGate
          ready={Boolean(detail)}
          isOwner={isOwner}
          onGoToSetup={onGoToSetup}
        >
          {detail && (
            <>
              {hasVoice && (
                <VoiceBindings
                  spaceId={spaceId}
                  detail={detail}
                  serverLabel={serverLabel}
                  onUnbound={() => {
                    setVoiceSpaceId("");
                    setVoiceChannelId("");
                  }}
                  onError={onError}
                />
              )}

              <BridgeCard>
                <Typography fontSize={18} fontWeight="bold">
                  {t("minecraftBridge.voiceBindTitle")}
                </Typography>
                <Typography level="body-sm" textColor="muted">
                  {t("minecraftBridge.voiceBindHint")}
                </Typography>

                <InputWithLabel
                  name="voiceServerId"
                  label={t("minecraftBridge.serverId")}
                  value={bindServerId}
                  onChange={(e) =>
                    onBindServerIdChange(sanitizeServerId(e.target.value))
                  }
                  placeholder={
                    knownServerIds[0] ??
                    t("minecraftBridge.serverIdPlaceholder")
                  }
                />
                <InputWithLabel
                  name="voiceRoomName"
                  label={t("minecraftBridge.voiceRoomName")}
                  description={t("minecraftBridge.voiceRoomNameHint")}
                  value={voiceRoomName}
                  onChange={(e) =>
                    setVoiceRoomName(sanitizeServerId(e.target.value))
                  }
                  placeholder="default"
                />

                <Stack direction="column" spacing={0.5} width="100%">
                  <Typography fontWeight={500} level="body-md">
                    {t("minecraftBridge.voiceSpace")}
                  </Typography>
                  {spaces.length === 0 ? (
                    <Typography level="body-sm" textColor="muted">
                      {t("minecraftBridge.voiceNoSpaces")}
                    </Typography>
                  ) : (
                    <Select
                      value={voiceSpaceId}
                      placeholder={t("minecraftBridge.voiceSpacePlaceholder")}
                      onValueChange={(value) => {
                        if (typeof value !== "string") return;
                        setVoiceSpaceId(value);
                        setVoiceChannelId("");
                      }}
                    >
                      {spaces.map((space) => (
                        <Option key={space.id} value={space.id}>
                          {space.name}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Stack>

                <Stack direction="column" spacing={0.5} width="100%">
                  <Typography fontWeight={500} level="body-md">
                    {t("minecraftBridge.voiceChannel")}
                  </Typography>
                  {!voiceSpaceId ? (
                    <Typography level="body-sm" textColor="muted">
                      {t("minecraftBridge.voicePickSpaceFirst")}
                    </Typography>
                  ) : voiceChannels.length === 0 ? (
                    <Typography level="body-sm" textColor="muted">
                      {t("minecraftBridge.voiceNoChannels")}
                    </Typography>
                  ) : (
                    <Select
                      value={voiceChannelId}
                      placeholder={t("minecraftBridge.voiceChannelPlaceholder")}
                      onValueChange={(value) => {
                        if (typeof value !== "string") return;
                        setVoiceChannelId(value);
                      }}
                    >
                      {voiceChannels.map((channel) => (
                        <Option key={channel.id} value={channel.id}>
                          {channel.name ?? channel.id}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Stack>

                <Stack direction="row">
                  <Button
                    disabled={
                      bindMutation.isPending ||
                      !bindServerId.trim() ||
                      !voiceSpaceId.trim() ||
                      !voiceChannelId.trim()
                    }
                    onClick={() => bindMutation.mutate()}
                  >
                    {bindMutation.isPending
                      ? t("minecraftBridge.saving")
                      : hasVoice
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
