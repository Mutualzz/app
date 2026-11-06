import { Stack, Typography } from "@mutualzz/ui-web";
import { Button } from "@renderer/components/Button";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { BridgeCard, NoticeCard, useCopyFeedback } from "./BridgeSettingsParts";
import { BridgeListSection } from "./BridgeListSection";
import { MembersSection } from "./MembersSection";
import { PluginSetupSection } from "./PluginSetupSection";
import { ServersSection } from "./ServersSection";
import {
  type BridgeDetail,
  type BridgeSummary,
  type PluginConfig,
  pluginConfigYaml
} from "./types";

const FreshConfigCard = ({
  config,
  onGoToDiscord
}: {
  config: PluginConfig;
  onGoToDiscord: () => void;
}) => {
  const { t } = useTranslation("settings");
  const { copied, copyText } = useCopyFeedback<"config">();

  return (
    <BridgeCard>
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
        {pluginConfigYaml(config)}
      </Typography>
      <Stack direction="row" spacing={1.25} flexWrap="wrap">
        <Button onClick={() => copyText(pluginConfigYaml(config), "config")}>
          {copied === "config"
            ? t("minecraftBridge.copied")
            : t("minecraftBridge.copyConfig")}
        </Button>
        <Button variant="soft" color="neutral" onClick={onGoToDiscord}>
          {t("minecraftBridge.goToDiscord")}
        </Button>
      </Stack>
      <Typography level="body-sm" textColor="muted">
        {t("minecraftBridge.pluginStep3")}
      </Typography>
    </BridgeCard>
  );
};

export const BridgesTab = observer(
  ({
    spaceId,
    bridges,
    selectedBridge,
    detail,
    isOwner,
    canManage,
    atBridgeLimit,
    freshConfig,
    bindServerId,
    serverLabel,
    onSelect,
    onRemoved,
    onCreate,
    onConfig,
    onGoToDiscord,
    onError
  }: {
    spaceId: string;
    bridges: BridgeSummary[];
    selectedBridge: BridgeSummary | null;
    detail?: BridgeDetail;
    isOwner: boolean;
    canManage: boolean;
    atBridgeLimit: boolean;
    freshConfig: PluginConfig | null;
    bindServerId: string;
    serverLabel: (serverId: string) => string;
    onSelect: (bridgeId: string) => void;
    onRemoved: (bridgeId: string) => void;
    onCreate: () => void;
    onConfig: (config: PluginConfig) => void;
    onGoToDiscord: () => void;
    onError: (message: string | null) => void;
  }) => {
    const { t } = useTranslation("settings");
    const hasBridge = bridges.length > 0;

    return (
      <Stack spacing={10} direction="column">
        {!hasBridge && (
          <NoticeCard>
            <Typography level="body-md">
              {t("minecraftBridge.getStartedHint")}
            </Typography>
            <Stack direction="row">
              <Button onClick={onCreate}>{t("minecraftBridge.create")}</Button>
            </Stack>
          </NoticeCard>
        )}

        {freshConfig && (
          <FreshConfigCard config={freshConfig} onGoToDiscord={onGoToDiscord} />
        )}

        {hasBridge && (
          <Stack spacing={3} direction="column">
            <Typography fontSize={18} fontWeight="bold">
              {t("minecraftBridge.spaceBridge")}
            </Typography>
            <BridgeListSection
              spaceId={spaceId}
              bridges={bridges}
              selectedBridge={selectedBridge}
              canManage={canManage}
              showManagement={Boolean(detail) && isOwner}
              atBridgeLimit={atBridgeLimit}
              serverLabel={serverLabel}
              onSelect={onSelect}
              onRemoved={onRemoved}
              onCreate={onCreate}
              onError={onError}
            />

            {detail && isOwner && (
              <>
                <ServersSection
                  spaceId={spaceId}
                  detail={detail}
                  onError={onError}
                />
                <PluginSetupSection
                  spaceId={spaceId}
                  detail={detail}
                  bindServerId={bindServerId}
                  onConfig={onConfig}
                  onError={onError}
                />
                <MembersSection
                  spaceId={spaceId}
                  bridgeId={detail.id}
                  enabled={canManage}
                />
              </>
            )}

            {detail && !isOwner && (
              <Typography level="body-sm" textColor="muted">
                {t("minecraftBridge.adminOnlySettings")}
              </Typography>
            )}
          </Stack>
        )}
      </Stack>
    );
  }
);
