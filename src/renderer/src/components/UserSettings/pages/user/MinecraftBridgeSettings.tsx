import { Paper } from "@components/Paper";
import { InputWithLabel } from "@components/InputWithLabel";
import { MinecraftAvatar } from "@components/Minecraft/MinecraftAvatar";
import {
  CreateBridgeModal,
  type CreatedBridgeResult
} from "@components/Modals/CreateBridgeModal";
import { DeleteBridgeModal } from "@components/Modals/DeleteBridgeModal";
import { UnlinkMinecraftModal } from "@components/Modals/UnlinkMinecraftModal";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Divider, Option, Select, Stack, Typography } from "@mutualzz/ui-web";
import { isElectron } from "@utils/index";
import styled from "@emotion/styled";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { type PropsWithChildren, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircleIcon,
  CircleIcon,
} from "@phosphor-icons/react";
import { Button } from "@renderer/components/Button";

type BridgeTab = "bridges" | "discord" | "voice" | "link";

const tabs: BridgeTab[] = ["bridges", "discord", "voice", "link"];

const sanitizeServerId = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9_-]/g, "");

const isDiscordSnowflake = (value: string) => /^\d{17,20}$/.test(value.trim());

const looksLikeDiscordSnowflake = (value: string) => /^\d{16,22}$/.test(value.trim());

interface TabProps extends PropsWithChildren {
  selected: boolean;
}

const Tab = styled("div")<TabProps>(({ theme, selected }) => ({
  ...(selected && {
    borderBottom: `1px solid ${theme.typography.colors.accent}`,
    borderRadius: 6
  }),
  userSelect: "none",
  cursor: "pointer",
  padding: "5px 10px",
  ...(!selected && {
    "&:hover": {
      borderBottom: `1px solid ${theme.typography.colors.muted}`,
      borderRadius: 6
    }
  })
}));

interface BridgeSummary {
  id: string;
  name: string;
  status: number;
  createdAt: string;
  hubConnected?: boolean;
}

interface PluginConfig {
  hubUrl: string;
  token: string;
  serverId: string;
}

interface BridgeDetail extends BridgeSummary {
  hubConnected: boolean;
  connectedServers: string[];
  servers: {
    id: string;
    serverId: string;
    displayName: string;
    lastSeenAt?: string | null;
  }[];
  discordBindings: {
    id: string;
    serverId: string;
    guildId: string;
    channelId: string;
    guildName?: string | null;
    channelName?: string | null;
    hasWebhook: boolean;
  }[];
  voiceBindings: {
    id: string;
    serverId: string;
    name: string;
    spaceId: string;
    channelId: string;
  }[];
  tokens: {
    id: string;
    name: string;
    tokenPrefix: string;
    lastUsedAt: string | null;
    createdAt: string;
  }[];
}

interface MinecraftLink {
  minecraftUuid: string;
  minecraftName: string;
  discordId: string | null;
  createdAt: string;
}

const pluginConfigYaml = (config: PluginConfig) =>
  `hubUrl: ${config.hubUrl}\ntoken: ${config.token}\nserverId: ${config.serverId}\n`;

const pluginConfigTemplateYaml = (serverId: string) =>
  `hubUrl: ws://localhost:3015\ntoken: YOUR_TOKEN_HERE\nserverId: ${serverId || "my-server"}\n`;

const formatLastSeen = (iso?: string | null) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return null;
  }
};

const ChecklistItem = ({ done, label }: { done: boolean; label: string }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    {done ? (
      <CheckCircleIcon weight="fill" size={18} />
    ) : (
      <CircleIcon size={18} />
    )}
    <Typography
      level="body-sm"
      textColor={done ? undefined : "muted"}
      fontWeight={done ? "bold" : undefined}
    >
      {label}
    </Typography>
  </Stack>
);

export const MinecraftBridgeSettings = observer(() => {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const { openModal } = useModal();
  const queryClient = useQueryClient();

  const [currentTab, setCurrentTab] = useState<BridgeTab>("bridges");
  const [selectedBridgeId, setSelectedBridgeId] = useState<string | null>(null);
  const [freshConfig, setFreshConfig] = useState<PluginConfig | null>(null);
  const [copied, setCopied] = useState<
    "config" | "token" | "code" | "template" | null
  >(null);

  const [bindServerId, setBindServerId] = useState("");
  const [guildId, setGuildId] = useState("");
  const [channelId, setChannelId] = useState("");
  const [voiceSpaceId, setVoiceSpaceId] = useState("");
  const [voiceChannelId, setVoiceChannelId] = useState("");
  const [voiceRoomName, setVoiceRoomName] = useState("default");
  const [redeemCode, setRedeemCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  type DiscordStatus = {
    botInviteUrl: string | null;
  };

  const bridgesQuery = useQuery({
    queryKey: ["me", "bridges"],
    queryFn: () => app.rest.get<BridgeSummary[]>("/@me/bridges"),
    // Link status also arrives via MinecraftLinkUpdate gateway event.
    refetchInterval: currentTab === "link" ? 15_000 : false,
  });

  const detailQuery = useQuery({
    queryKey: ["me", "bridges", selectedBridgeId],
    enabled: !!selectedBridgeId,
    queryFn: () =>
      app.rest.get<BridgeDetail>(`/@me/bridges/${selectedBridgeId}`),
  });

  const linkQuery = useQuery({
    queryKey: ["me", "bridges", "link"],
    queryFn: () => app.rest.get<MinecraftLink | null>("/@me/bridges/link")
  });

  const discordStatusQuery = useQuery({
    queryKey: ["me", "bridges", "discord", "status"],
    queryFn: () =>
      app.rest.get<DiscordStatus>("/@me/bridges/discord/status"),
    enabled: currentTab === "discord",
  });

  const copyText = async (
    text: string,
    kind: "config" | "token" | "code" | "template",
  ) => {
    if (isElectron) await window.api.clipboard.write(text);
    else await navigator.clipboard.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleBridgeCreated = (created: CreatedBridgeResult) => {
    setError(null);
    setFreshConfig(created.pluginConfig);
    setSelectedBridgeId(created.id);
    setBindServerId(created.pluginConfig.serverId);
    setCurrentTab("bridges");
  };

  const openCreateBridge = () => {
    if ((bridgesQuery.data?.length ?? 0) >= 5) return;
    openModal(
      "create-bridge",
      <CreateBridgeModal onCreated={handleBridgeCreated} />
    );
  };

  const rotateMutation = useMutation({
    mutationFn: () => {
      if (!selectedBridgeId) throw new Error("No bridge selected");
      return app.rest.post<{ token: string; pluginConfig: PluginConfig }>(
        `/@me/bridges/${selectedBridgeId}/token`,
        { serverId: bindServerId.trim() || undefined }
      );
    },
    onSuccess: (result) => {
      setError(null);
      setFreshConfig(result.pluginConfig);
      void queryClient.invalidateQueries({
        queryKey: ["me", "bridges", selectedBridgeId]
      });
    },
    onError: (err: Error) => setError(err.message)
  });

  const renameMutation = useMutation({
    mutationFn: (name: string) => {
      if (!selectedBridgeId) throw new Error("No bridge selected");
      return app.rest.patch(`/@me/bridges/${selectedBridgeId}`, { name });
    },
    onSuccess: () => {
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ["me", "bridges"] });
      void queryClient.invalidateQueries({
        queryKey: ["me", "bridges", selectedBridgeId],
      });
    },
    onError: (err: Error) => setError(err.message),
  });

  const archiveMutation = useMutation({
    mutationFn: (status: 0 | 1) => {
      if (!selectedBridgeId) throw new Error("No bridge selected");
      return app.rest.patch(`/@me/bridges/${selectedBridgeId}`, { status });
    },
    onSuccess: () => {
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ["me", "bridges"] });
      void queryClient.invalidateQueries({
        queryKey: ["me", "bridges", selectedBridgeId],
      });
    },
    onError: (err: Error) => setError(err.message),
  });

  const bindMutation = useMutation({
    mutationFn: () => {
      if (!selectedBridgeId) throw new Error("No bridge selected");
      return app.rest.put(`/@me/bridges/${selectedBridgeId}/discord`, {
        serverId: bindServerId.trim(),
        guildId: guildId.trim(),
        channelId: channelId.trim()
      });
    },
    onSuccess: () => {
      setError(null);
      void queryClient.invalidateQueries({
        queryKey: ["me", "bridges", selectedBridgeId],
      });
    },
    onError: (err: Error) => setError(err.message)
  });

  const bindVoiceMutation = useMutation({
    mutationFn: () => {
      if (!selectedBridgeId) throw new Error("No bridge selected");
      return app.rest.put(`/@me/bridges/${selectedBridgeId}/voice`, {
        serverId: bindServerId.trim(),
        name: voiceRoomName.trim() || "default",
        spaceId: voiceSpaceId.trim(),
        channelId: voiceChannelId.trim(),
      });
    },
    onSuccess: () => {
      setError(null);
      void queryClient.invalidateQueries({
        queryKey: ["me", "bridges", selectedBridgeId],
      });
    },
    onError: (err: Error) => setError(err.message),
  });

  const unbindDiscordMutation = useMutation({
    mutationFn: (bindingId: string) => {
      if (!selectedBridgeId) throw new Error("No bridge selected");
      return app.rest.delete(
        `/@me/bridges/${selectedBridgeId}/discord/${bindingId}`,
      );
    },
    onSuccess: () => {
      setError(null);
      setGuildId("");
      setChannelId("");
      void queryClient.invalidateQueries({
        queryKey: ["me", "bridges", selectedBridgeId],
      });
    },
    onError: (err: Error) => setError(err.message),
  });

  const openBotInvite = async () => {
    const url = discordStatusQuery.data?.botInviteUrl;
    if (!url) return;
    if (isElectron) await window.api.shell.openExternal(url);
    else window.open(url, "_blank", "noopener,noreferrer");
  };

  const unbindVoiceMutation = useMutation({
    mutationFn: (bindingId: string) => {
      if (!selectedBridgeId) throw new Error("No bridge selected");
      return app.rest.delete(
        `/@me/bridges/${selectedBridgeId}/voice/${bindingId}`,
      );
    },
    onSuccess: () => {
      setError(null);
      setVoiceSpaceId("");
      setVoiceChannelId("");
      void queryClient.invalidateQueries({
        queryKey: ["me", "bridges", selectedBridgeId],
      });
    },
    onError: (err: Error) => setError(err.message),
  });

  const generateCodeMutation = useMutation({
    mutationFn: () =>
      app.rest.post<{
        code?: string;
        alreadyLinked?: boolean;
        minecraftName?: string;
      }>("/@me/bridges/link/code", {
        bridgeId: selectedBridgeId ?? undefined,
      }),
    onSuccess: (result) => {
      setError(null);
      if (result.code) setGeneratedCode(result.code);
      void queryClient.invalidateQueries({
        queryKey: ["me", "bridges", "link"],
      });
    },
    onError: (err: Error) => setError(err.message),
  });

  const redeemMutation = useMutation({
    mutationFn: () =>
      app.rest.post("/@me/bridges/link/redeem", {
        code: redeemCode.trim()
      }),
    onSuccess: () => {
      setError(null);
      setRedeemCode("");
      void queryClient.invalidateQueries({
        queryKey: ["me", "bridges", "link"]
      });
    },
    onError: (err: Error) => setError(err.message)
  });

  const bridges = bridgesQuery.data ?? [];
  const selectedBridge = bridges.find((b) => b.id === selectedBridgeId) ?? null;
  const detail =
    selectedBridge && detailQuery.data?.id === selectedBridge.id
      ? detailQuery.data
      : undefined;
  const link = linkQuery.data;

  useEffect(() => {
    if (bridges.length === 0) {
      if (selectedBridgeId !== null) setSelectedBridgeId(null);
      return;
    }
    if (!selectedBridgeId || !bridges.some((b) => b.id === selectedBridgeId)) {
      setSelectedBridgeId(bridges[0].id);
    }
  }, [bridges, selectedBridgeId]);

  useEffect(() => {
    if (!selectedBridge) {
      setBindServerId("");
      setGuildId("");
      setChannelId("");
      setFreshConfig(null);
      setGeneratedCode(null);
      setRenameValue("");
    } else {
      setRenameValue(selectedBridge.name);
    }
  }, [selectedBridge]);

  useEffect(() => {
    if (detail?.servers[0]?.serverId) {
      setBindServerId(detail.servers[0].serverId);
    }
  }, [detail?.id]);

  useEffect(() => {
    if (!detail) return;
    const binding = detail.discordBindings.find(
      (b) => b.serverId === bindServerId,
    );
    setGuildId(binding?.guildId ?? "");
    setChannelId(binding?.channelId ?? "");
  }, [bindServerId, detail?.id, detail?.discordBindings.length]);

  useEffect(() => {
    if (!detail) return;
    const binding = (detail.voiceBindings ?? []).find(
      (b) =>
        b.serverId === bindServerId &&
        b.name === (voiceRoomName.trim() || "default"),
    );
    setVoiceSpaceId(binding?.spaceId ?? "");
    setVoiceChannelId(binding?.channelId ?? "");
  }, [
    bindServerId,
    voiceRoomName,
    detail?.id,
    detail?.voiceBindings?.length,
  ]);

  useEffect(() => {
    if (link) setGeneratedCode(null);
  }, [link]);

  const hasBridge = bridges.length > 0;
  const atBridgeLimit = bridges.length >= 5;
  const hasPluginConfig = !!freshConfig || (detail?.tokens.length ?? 0) > 0;
  const hasDiscord = (detail?.discordBindings.length ?? 0) > 0;
  const hasVoice = (detail?.voiceBindings?.length ?? 0) > 0;
  const hasLink = !!link;
  const anyHubConnected = bridges.some((b) => b.hubConnected === true);
  const activeDiscordBinding = detail?.discordBindings.find(
    (b) => b.serverId === bindServerId,
  );
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
  const knownServerIds = [
    ...new Set([
      ...(detail?.servers.map((s) => s.serverId) ?? []),
      ...(detail?.connectedServers ?? []),
      ...(detail?.discordBindings.map((b) => b.serverId) ?? []),
      ...(detail?.voiceBindings?.map((b) => b.serverId) ?? []),
    ]),
  ].filter(Boolean);

  const resetAfterBridgeDelete = (bridgeId: string) => {
    setError(null);
    setFreshConfig(null);
    setGeneratedCode(null);
    app.bridgeChat.clear(bridgeId);
    if (selectedBridgeId === bridgeId) {
      setSelectedBridgeId(null);
      setBindServerId("");
      setGuildId("");
      setChannelId("");
    }
  };

  return (
    <Stack direction="column" width="100%" height="100%">
      <Typography level="body-md" textColor="muted" mb={2}>
        {t("minecraftBridge.intro")}
      </Typography>

      <Paper
        variant="outlined"
        borderRadius={10}
        py={2}
        px={3}
        mb={2}
        spacing={1.25}
        direction="column"
      >
        <Typography level="body-sm" fontWeight="bold">
          {t("minecraftBridge.checklist.title")}
        </Typography>
        <ChecklistItem
          done={hasBridge}
          label={t("minecraftBridge.checklist.bridge")}
        />
        <ChecklistItem
          done={hasPluginConfig}
          label={t("minecraftBridge.checklist.plugin")}
        />
        <ChecklistItem
          done={hasDiscord}
          label={t("minecraftBridge.checklist.discord")}
        />
        <ChecklistItem
          done={hasVoice}
          label={t("minecraftBridge.checklist.voice")}
        />
        <ChecklistItem
          done={hasLink}
          label={t("minecraftBridge.checklist.link")}
        />
      </Paper>

      <Stack direction="row" gap={5} mb={2}>
        {tabs.map((tab) => (
          <Tab
            key={tab}
            onClick={() => setCurrentTab(tab)}
            selected={currentTab === tab}
          >
            {t(`minecraftBridge.tabs.${tab}`)}
          </Tab>
        ))}
      </Stack>

      {error && (
        <Typography level="body-sm" color="danger" mb={2}>
          {error}
        </Typography>
      )}

      {currentTab === "bridges" && (
        <Stack spacing={10} direction="column">
          {!hasBridge && (
            <Paper
              variant="outlined"
              borderRadius={10}
              py={3}
              px={4}
              spacing={2}
              direction="column"
            >
              <Typography level="body-md">
                {t("minecraftBridge.getStartedHint")}
              </Typography>
              <Stack direction="row">
                <Button onClick={openCreateBridge}>
                  {t("minecraftBridge.create")}
                </Button>
              </Stack>
            </Paper>
          )}

          {freshConfig && (
            <Paper
              variant="outlined"
              borderRadius={10}
              py={2.5}
              px={4}
              spacing={2}
              direction="column"
            >
              <Typography fontSize={18} fontWeight="bold">
                {t("minecraftBridge.pluginStepsTitle")}
              </Typography>
              <Typography level="body-sm" color="warning">
                {t("minecraftBridge.tokenOnce")}
              </Typography>
              <Typography level="body-sm" textColor="muted">
                {t("minecraftBridge.pluginStep1")}
              </Typography>
              <Typography level="body-sm" textColor="muted">
                {t("minecraftBridge.pluginStep2")}
              </Typography>
              <Typography
                level="body-sm"
                fontFamily="monospace"
                css={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}
              >
                {pluginConfigYaml(freshConfig)}
              </Typography>
              <Stack direction="row" spacing={1.25} flexWrap="wrap">
                <Button
                  onClick={() =>
                    copyText(pluginConfigYaml(freshConfig), "config")
                  }
                >
                  {copied === "config"
                    ? t("minecraftBridge.copied")
                    : t("minecraftBridge.copyConfig")}
                </Button>
                <Button
                  variant="soft"
                  color="neutral"
                  onClick={() => setCurrentTab("discord")}
                >
                  {t("minecraftBridge.goToDiscord")}
                </Button>
              </Stack>
              <Typography level="body-sm" textColor="muted">
                {t("minecraftBridge.pluginStep3")}
              </Typography>
            </Paper>
          )}

          {hasBridge && (
            <Stack spacing={2} direction="column">
              <Typography fontSize={18} fontWeight="bold">
                {t("minecraftBridge.yourBridges")}
              </Typography>
              <Divider textColor="muted" css={{ opacity: 0.5 }} />
              <Paper
                variant="outlined"
                borderRadius={10}
                py={2.5}
                px={4}
                spacing={1.5}
                direction="column"
              >
                {bridges.map((bridge) => (
                  <Stack
                    key={bridge.id}
                    direction="row"
                    spacing={1.25}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Button
                      size="sm"
                      variant={
                        selectedBridgeId === bridge.id ? "soft" : "solid"
                      }
                      color={
                        selectedBridgeId === bridge.id ? "success" : undefined
                      }
                      horizontalAlign="left"
                      onClick={() => setSelectedBridgeId(bridge.id)}
                    >
                      {bridge.name}
                    </Button>
                    <Button
                      size="sm"
                      variant="soft"
                      color="danger"
                      onClick={() =>
                        openModal(
                          "delete-bridge",
                          <DeleteBridgeModal
                            bridgeId={bridge.id}
                            bridgeName={bridge.name}
                            onDeleted={() => resetAfterBridgeDelete(bridge.id)}
                          />
                        )
                      }
                    >
                      {t("minecraftBridge.delete")}
                    </Button>
                  </Stack>
                ))}

                {detail && (
                  <Stack direction="column" spacing={1.25}>
                    <InputWithLabel
                      name="bridge-rename"
                      label={t("minecraftBridge.rename")}
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      placeholder={t("minecraftBridge.renamePlaceholder")}
                    />
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Button
                        size="sm"
                        disabled={
                          renameMutation.isPending ||
                          !renameValue.trim() ||
                          renameValue.trim() === selectedBridge?.name
                        }
                        onClick={() =>
                          renameMutation.mutate(renameValue.trim())
                        }
                      >
                        {t("minecraftBridge.rename")}
                      </Button>
                      <Button
                        size="sm"
                        variant="soft"
                        color="warning"
                        disabled={archiveMutation.isPending}
                        onClick={() =>
                          archiveMutation.mutate(
                            selectedBridge?.status === 1 ? 0 : 1,
                          )
                        }
                      >
                        {selectedBridge?.status === 1
                          ? t("minecraftBridge.restore")
                          : t("minecraftBridge.archive")}
                      </Button>
                    </Stack>
                    <Typography level="body-sm" textColor="muted">
                      {t("minecraftBridge.servers")}:
                    </Typography>
                    {detail.servers.length === 0 ? (
                      <Typography level="body-xs" textColor="muted">
                        {t("minecraftBridge.none")}
                      </Typography>
                    ) : (
                      detail.servers.map((s) => {
                        const seen = formatLastSeen(s.lastSeenAt);
                        return (
                          <Typography
                            key={s.id}
                            level="body-xs"
                            textColor="muted"
                          >
                            {s.serverId}
                            {" — "}
                            {seen
                              ? t("minecraftBridge.lastSeen", { when: seen })
                              : t("minecraftBridge.lastSeenNever")}
                          </Typography>
                        );
                      })
                    )}
                    <Typography level="body-xs" textColor="muted">
                      {t("minecraftBridge.rotateWarning")}
                    </Typography>
                    <Typography level="body-xs" textColor="muted">
                      {t("minecraftBridge.configTemplateHint")}
                    </Typography>
                    <Stack direction="row" spacing={1.25} flexWrap="wrap">
                      <Button
                        color="warning"
                        size="sm"
                        disabled={rotateMutation.isPending}
                        onClick={() => rotateMutation.mutate()}
                      >
                        {rotateMutation.isPending
                          ? t("minecraftBridge.rotating")
                          : t("minecraftBridge.rotateToken")}
                      </Button>
                      <Button
                        size="sm"
                        variant="soft"
                        onClick={() =>
                          copyText(
                            pluginConfigTemplateYaml(
                              detail.servers[0]?.serverId ?? "my-server",
                            ),
                            "template",
                          )
                        }
                      >
                        {copied === "template"
                          ? t("minecraftBridge.copied")
                          : t("minecraftBridge.copyConfigTemplate")}
                      </Button>
                      <Button
                        size="sm"
                        disabled={atBridgeLimit}
                        onClick={openCreateBridge}
                      >
                        {t("minecraftBridge.create")}
                      </Button>
                    </Stack>
                    {atBridgeLimit && (
                      <Typography level="body-xs" textColor="muted">
                        {t("minecraftBridge.bridgeLimitReached", { limit: 5 })}
                      </Typography>
                    )}
                  </Stack>
                )}
              </Paper>
            </Stack>
          )}
        </Stack>
      )}

      {currentTab === "discord" && (
        <Stack spacing={2.5} direction="column">
          {!hasBridge || !selectedBridge || !detail ? (
            <Paper
              variant="outlined"
              borderRadius={10}
              py={3}
              px={4}
              spacing={2}
              direction="column"
            >
              <Typography level="body-sm" textColor="muted">
                {t("minecraftBridge.selectBridgeFirst")}
              </Typography>
              <Stack direction="row">
                <Button size="sm" onClick={() => setCurrentTab("bridges")}>
                  {t("minecraftBridge.goToSetup")}
                </Button>
              </Stack>
            </Paper>
          ) : (
            <>
              <Typography level="body-sm" textColor="muted">
                {t("minecraftBridge.discordBindHint")}
              </Typography>

              {hasDiscord ? (
                <Paper
                  variant="outlined"
                  borderRadius={10}
                  py={2.5}
                  px={4}
                  spacing={1.5}
                  direction="column"
                >
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
                                server: b.serverId,
                                channel: b.channelName,
                                guild: b.guildName,
                              })
                            : t("minecraftBridge.discordConnectedFor", {
                                server: b.serverId,
                                channel: b.channelId,
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
                        disabled={unbindDiscordMutation.isPending}
                        onClick={() => unbindDiscordMutation.mutate(b.id)}
                      >
                        {t("minecraftBridge.unbind")}
                      </Button>
                    </Stack>
                  ))}
                </Paper>
              ) : (
                <Typography level="body-sm" textColor="muted">
                  {t("minecraftBridge.noBindingsYet")}
                </Typography>
              )}

              <Paper
                variant="outlined"
                borderRadius={10}
                py={2.5}
                px={4}
                spacing={1.25}
                direction="column"
              >
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
                {discordStatusQuery.data?.botInviteUrl && (
                  <Stack direction="row">
                    <Button
                      size="sm"
                      variant="soft"
                      onClick={() => void openBotInvite()}
                    >
                      {t("minecraftBridge.discordInviteBot")}
                    </Button>
                  </Stack>
                )}
              </Paper>

              <Paper
                variant="outlined"
                borderRadius={10}
                py={2.5}
                px={4}
                spacing={2}
                direction="column"
              >
                <Typography fontSize={18} fontWeight="bold">
                  {activeDiscordBinding
                    ? t("minecraftBridge.discordFormUpdateTitle")
                    : t("minecraftBridge.discordFormTitle")}
                </Typography>
                <Typography level="body-sm" textColor="muted">
                  {activeDiscordBinding
                    ? t("minecraftBridge.discordChangeHint")
                    : t("minecraftBridge.discordFormHint")}
                </Typography>

                <InputWithLabel
                  name="bindServerId"
                  label={t("minecraftBridge.discordServerPickerLabel")}
                  value={bindServerId}
                  onChange={(e) =>
                    setBindServerId(sanitizeServerId(e.target.value))
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
                          onClick={() => setBindServerId(id)}
                        >
                          {id}
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
                    onClick={() => {
                      if (looksLikeDiscordSnowflake(bindServerId)) {
                        setError(
                          t("minecraftBridge.discordInvalidMinecraftServer"),
                        );
                        return;
                      }
                      if (
                        !isDiscordSnowflake(guildId) ||
                        !isDiscordSnowflake(channelId)
                      ) {
                        setError(t("minecraftBridge.discordInvalidId"));
                        return;
                      }
                      setError(null);
                      bindMutation.mutate();
                    }}
                  >
                    {bindMutation.isPending
                      ? t("minecraftBridge.saving")
                      : activeDiscordBinding
                        ? t("minecraftBridge.updateBinding")
                        : t("minecraftBridge.saveBinding")}
                  </Button>
                </Stack>
              </Paper>

            </>
          )}
        </Stack>
      )}

      {currentTab === "voice" && (
        <Stack spacing={2.5} direction="column">
          {!hasBridge || !selectedBridge || !detail ? (
            <Paper
              variant="outlined"
              borderRadius={10}
              py={3}
              px={4}
              spacing={2}
              direction="column"
            >
              <Typography level="body-sm" textColor="muted">
                {t("minecraftBridge.selectBridgeFirst")}
              </Typography>
              <Stack direction="row">
                <Button size="sm" onClick={() => setCurrentTab("bridges")}>
                  {t("minecraftBridge.goToSetup")}
                </Button>
              </Stack>
            </Paper>
          ) : (
            <>
              {hasVoice && (
                <Paper
                  variant="outlined"
                  borderRadius={10}
                  py={2.5}
                  px={4}
                  spacing={1.5}
                  direction="column"
                >
                  <Typography fontSize={18} fontWeight="bold">
                    {t("minecraftBridge.voiceConnectedTitle")}
                  </Typography>
                  {(detail.voiceBindings ?? []).map((b) => {
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
                            server: b.serverId,
                            name: b.name,
                            channel: channel?.name ?? b.channelId,
                            space: space?.name ?? b.spaceId,
                          })}
                        </Typography>
                        <Button
                          size="sm"
                          variant="soft"
                          color="danger"
                          disabled={unbindVoiceMutation.isPending}
                          onClick={() => unbindVoiceMutation.mutate(b.id)}
                        >
                          {t("minecraftBridge.unbind")}
                        </Button>
                      </Stack>
                    );
                  })}
                </Paper>
              )}

              <Paper
                variant="outlined"
                borderRadius={10}
                py={2.5}
                px={4}
                spacing={2}
                direction="column"
              >
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
                    setBindServerId(sanitizeServerId(e.target.value))
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
                      placeholder={t(
                        "minecraftBridge.voiceChannelPlaceholder",
                      )}
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
                      bindVoiceMutation.isPending ||
                      !bindServerId.trim() ||
                      !voiceSpaceId.trim() ||
                      !voiceChannelId.trim()
                    }
                    onClick={() => bindVoiceMutation.mutate()}
                  >
                    {bindVoiceMutation.isPending
                      ? t("minecraftBridge.saving")
                      : hasVoice
                        ? t("minecraftBridge.updateBinding")
                        : t("minecraftBridge.saveBinding")}
                  </Button>
                </Stack>
              </Paper>
            </>
          )}
        </Stack>
      )}

      {currentTab === "link" && (
        <Stack spacing={2.5} direction="column">
          <Paper
            variant="outlined"
            borderRadius={10}
            py={2.5}
            px={4}
            spacing={2}
            direction="column"
          >
            <Typography fontSize={18} fontWeight="bold">
              {t("minecraftBridge.linkTitle")}
            </Typography>
            <Typography level="body-sm" textColor="muted">
              {t("minecraftBridge.linkHint")}
            </Typography>

            {!hasBridge && !link ? (
              <>
                <Typography level="body-sm" textColor="muted">
                  {t("minecraftBridge.linkNeedsBridge")}
                </Typography>
                <Stack direction="row">
                  <Button size="sm" onClick={() => setCurrentTab("bridges")}>
                    {t("minecraftBridge.goToSetup")}
                  </Button>
                </Stack>
              </>
            ) : link ? (
              <Stack spacing={1.25} direction="column">
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <MinecraftAvatar
                    uuid={link.minecraftUuid}
                    name={link.minecraftName}
                    size={48}
                  />
                  <Stack spacing={0.5} direction="column" minWidth={0}>
                    <Typography level="body-md" fontWeight="bold">
                      {t("minecraftBridge.linkedAs", {
                        name: link.minecraftName,
                      })}
                    </Typography>
                    <Typography level="body-xs" textColor="muted">
                      {t("minecraftBridge.linkedUuid", {
                        uuid: link.minecraftUuid,
                      })}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack direction="row">
                  <Button
                    size="sm"
                    variant="soft"
                    color="danger"
                    onClick={() =>
                      openModal(
                        "unlink-minecraft",
                        <UnlinkMinecraftModal
                          minecraftName={link.minecraftName}
                          minecraftUuid={link.minecraftUuid}
                        />,
                      )
                    }
                  >
                    {t("minecraftBridge.unlink")}
                  </Button>
                </Stack>
              </Stack>
            ) : !anyHubConnected ? (
              <>
                <Typography level="body-sm" color="warning">
                  {t("minecraftBridge.hubDisconnected")}
                </Typography>
                <Typography level="body-sm" textColor="muted">
                  {t("minecraftBridge.linkRequiresHub")}
                </Typography>
                <Stack direction="row">
                  <Button size="sm" onClick={() => setCurrentTab("bridges")}>
                    {t("minecraftBridge.goToSetup")}
                  </Button>
                </Stack>
              </>
            ) : (
              <>
                <Typography level="body-sm" color="success">
                  {t("minecraftBridge.hubConnected")}
                </Typography>

                <Typography level="body-sm" fontWeight="bold">
                  {t("minecraftBridge.linkPathApp")}
                </Typography>
                <Stack direction="row">
                  <Button
                    disabled={generateCodeMutation.isPending}
                    onClick={() => generateCodeMutation.mutate()}
                  >
                    {generateCodeMutation.isPending
                      ? t("minecraftBridge.generating")
                      : t("minecraftBridge.generateCode")}
                  </Button>
                </Stack>
                {generatedCode && (
                  <Stack spacing={1} direction="column">
                    <Typography level="body-sm">
                      {t("minecraftBridge.yourCode")}
                    </Typography>
                    <Typography fontFamily="monospace" level="h6">
                      {t("minecraftBridge.codeCommand", {
                        code: generatedCode,
                      })}
                    </Typography>
                    <Stack direction="row">
                      <Button
                        size="sm"
                        variant="soft"
                        onClick={() =>
                          void copyText(`/mzlink ${generatedCode}`, "code")
                        }
                      >
                        {copied === "code"
                          ? t("minecraftBridge.copied")
                          : t("minecraftBridge.copyConfig")}
                      </Button>
                    </Stack>
                  </Stack>
                )}

                <Divider textColor="muted" css={{ opacity: 0.4 }} />

                <Typography level="body-sm" fontWeight="bold">
                  {t("minecraftBridge.linkPathGame")}
                </Typography>
                <InputWithLabel
                  name="redeemCode"
                  label={t("minecraftBridge.redeemTitle")}
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  placeholder={t("minecraftBridge.redeemPlaceholder")}
                />
                <Stack direction="row">
                  <Button
                    disabled={redeemMutation.isPending || !redeemCode.trim()}
                    onClick={() => redeemMutation.mutate()}
                  >
                    {redeemMutation.isPending
                      ? t("minecraftBridge.redeeming")
                      : t("minecraftBridge.redeem")}
                  </Button>
                </Stack>
              </>
            )}
          </Paper>
        </Stack>
      )}
    </Stack>
  );
});
