import { Paper } from "@components/Paper";
import {
  CreateBridgeModal,
  type CreatedBridgeResult
} from "@components/Modals/CreateBridgeModal";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { minecraftServerLabel } from "@mutualzz/client";
import { Stack, Typography } from "@mutualzz/ui-web";
import { useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BridgesTab } from "./minecraftBridge/BridgesTab";
import { ChecklistItem, Tab } from "./minecraftBridge/BridgeSettingsParts";
import { DiscordTab } from "./minecraftBridge/DiscordTab";
import { LinkTab } from "./minecraftBridge/LinkTab";
import {
  BRIDGE_LIMIT,
  type BridgeDetail,
  type BridgeSummary,
  type BridgeTab,
  type MinecraftLink,
  type PluginConfig,
  tabs
} from "./minecraftBridge/types";
import { VoiceTab } from "./minecraftBridge/VoiceTab";

export const SpaceMinecraftBridgeSettings = observer(
  ({ spaceId }: { spaceId: string }) => {
    const { t } = useTranslation("settings");
    const app = useAppStore();
    const { openModal } = useModal();
    const spaceBridgePath = `/spaces/${spaceId}/bridge`;

    const [currentTab, setCurrentTab] = useState<BridgeTab>("bridges");
    const [selectedBridgeId, setSelectedBridgeId] = useState<string | null>(
      null
    );
    const [freshConfig, setFreshConfig] = useState<PluginConfig | null>(null);
    const [bindServerId, setBindServerId] = useState("");
    const [error, setError] = useState<string | null>(null);

    const bridgesQuery = useQuery({
      queryKey: ["space", spaceId, "bridge", "list"],
      queryFn: async () => {
        try {
          const detail = await app.rest.get<BridgeDetail>(spaceBridgePath);
          return [detail];
        } catch {
          return [] as BridgeSummary[];
        }
      },
      refetchInterval: currentTab === "link" ? 15_000 : false
    });

    const detailQuery = useQuery({
      queryKey: ["space", spaceId, "bridge"],
      enabled: (bridgesQuery.data?.length ?? 0) > 0,
      queryFn: () => app.rest.get<BridgeDetail>(spaceBridgePath)
    });

    const linkQuery = useQuery({
      queryKey: ["me", "bridges", "link"],
      queryFn: () => app.rest.get<MinecraftLink | null>("/@me/bridges/link")
    });

    const bridges = bridgesQuery.data ?? [];
    const ownedBridges = bridges.filter((b) => b.role !== "member");
    const selectedBridge =
      bridges.find((b) => b.id === selectedBridgeId) ?? null;
    const detail =
      selectedBridge && detailQuery.data?.id === selectedBridge.id
        ? detailQuery.data
        : undefined;
    const link = linkQuery.data;
    const isOwner =
      (detail?.role ?? selectedBridge?.role ?? "admin") !== "member";
    const canManageSelectedBridge =
      !!selectedBridgeId && (selectedBridge?.role ?? "admin") !== "member";

    useEffect(() => {
      if (bridges.length === 0) {
        if (selectedBridgeId !== null) setSelectedBridgeId(null);
        return;
      }
      if (
        !selectedBridgeId ||
        !bridges.some((b) => b.id === selectedBridgeId)
      ) {
        setSelectedBridgeId(bridges[0].id);
      }
    }, [bridges, selectedBridgeId]);

    useEffect(() => {
      if (selectedBridge) return;
      setBindServerId("");
      setFreshConfig(null);
    }, [selectedBridge]);

    useEffect(() => {
      if (detail?.servers[0]?.serverId) {
        setBindServerId(detail.servers[0].serverId);
      }
    }, [detail?.id]);

    const hasBridge = bridges.length > 0;
    const atBridgeLimit = ownedBridges.length >= BRIDGE_LIMIT;
    const hasPluginConfig =
      isOwner && (!!freshConfig || (detail?.tokens.length ?? 0) > 0);
    const hasDiscord = isOwner && (detail?.discordBindings.length ?? 0) > 0;
    const hasVoice = isOwner && (detail?.voiceBindings?.length ?? 0) > 0;
    const anyHubConnected = bridges.some((b) => b.hubConnected === true);

    const serverLabel = (serverId: string) =>
      minecraftServerLabel(
        detail?.servers.find((s) => s.serverId === serverId) ?? { serverId }
      );

    const handleBridgeCreated = (created: CreatedBridgeResult) => {
      setError(null);
      setFreshConfig(created.pluginConfig);
      setSelectedBridgeId(created.id);
      setBindServerId(created.pluginConfig.serverId);
      setCurrentTab("bridges");
    };

    const openCreateBridge = () => {
      if (atBridgeLimit) return;
      openModal(
        "create-bridge",
        <CreateBridgeModal spaceId={spaceId} onCreated={handleBridgeCreated} />
      );
    };

    const resetAfterBridgeDelete = (bridgeId: string) => {
      setError(null);
      setFreshConfig(null);
      app.bridgeChat.clear(bridgeId);
      if (selectedBridgeId === bridgeId) {
        setSelectedBridgeId(null);
        setBindServerId("");
      }
    };

    const goToSetup = () => setCurrentTab("bridges");

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
            onPress={goToSetup}
          />
          <ChecklistItem
            done={hasPluginConfig}
            label={t("minecraftBridge.checklist.plugin")}
            onPress={goToSetup}
          />
          <ChecklistItem
            done={hasDiscord}
            label={t("minecraftBridge.checklist.discord")}
            onPress={() => setCurrentTab("discord")}
          />
          <ChecklistItem
            done={hasVoice}
            label={t("minecraftBridge.checklist.voice")}
            onPress={() => setCurrentTab("voice")}
          />
          <ChecklistItem
            done={!!link}
            label={t("minecraftBridge.checklist.link")}
            onPress={() => setCurrentTab("link")}
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
          <BridgesTab
            spaceId={spaceId}
            bridges={bridges}
            selectedBridge={selectedBridge}
            detail={detail}
            isOwner={isOwner}
            canManage={canManageSelectedBridge}
            atBridgeLimit={atBridgeLimit}
            freshConfig={freshConfig}
            bindServerId={bindServerId}
            serverLabel={serverLabel}
            onSelect={setSelectedBridgeId}
            onRemoved={resetAfterBridgeDelete}
            onCreate={openCreateBridge}
            onConfig={setFreshConfig}
            onGoToDiscord={() => setCurrentTab("discord")}
            onError={setError}
          />
        )}

        {currentTab === "discord" && (
          <DiscordTab
            spaceId={spaceId}
            detail={detail}
            isOwner={isOwner}
            bindServerId={bindServerId}
            serverLabel={serverLabel}
            onBindServerIdChange={setBindServerId}
            onGoToSetup={goToSetup}
            onError={setError}
          />
        )}

        {currentTab === "voice" && (
          <VoiceTab
            spaceId={spaceId}
            detail={detail}
            isOwner={isOwner}
            bindServerId={bindServerId}
            serverLabel={serverLabel}
            onBindServerIdChange={setBindServerId}
            onGoToSetup={goToSetup}
            onError={setError}
          />
        )}

        {currentTab === "link" && (
          <LinkTab
            spaceId={spaceId}
            link={link}
            hasBridge={hasBridge}
            anyHubConnected={anyHubConnected}
            selectedBridgeId={selectedBridgeId}
            onGoToSetup={goToSetup}
            onError={setError}
          />
        )}
      </Stack>
    );
  }
);
