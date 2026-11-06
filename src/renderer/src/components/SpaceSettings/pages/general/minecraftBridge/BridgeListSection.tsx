import { InputWithLabel } from "@components/InputWithLabel";
import { DeleteBridgeModal } from "@components/Modals/DeleteBridgeModal";
import { LeaveBridgeModal } from "@components/Modals/LeaveBridgeModal";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { Button } from "@renderer/components/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BansSection } from "./BansSection";
import { BridgeSection } from "./BridgeSettingsParts";
import { BRIDGE_LIMIT, type BridgeSummary } from "./types";

const BridgeRow = observer(
  ({
    spaceId,
    bridge,
    selected,
    onSelect,
    onRemoved
  }: {
    spaceId: string;
    bridge: BridgeSummary;
    selected: boolean;
    onSelect: () => void;
    onRemoved: () => void;
  }) => {
    const { t } = useTranslation("settings");
    const { openModal } = useModal();

    const onlineLabel =
      bridge.onlineCount === 0
        ? t("minecraftBridge.onlineNone")
        : t("minecraftBridge.onlineCount", { count: bridge.onlineCount });

    return (
      <Stack
        direction="row"
        spacing={1.25}
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack direction="column" spacing={0.25} minWidth={0} flex={1}>
          <Button
            size="sm"
            variant={selected ? "soft" : "solid"}
            color={selected ? "success" : undefined}
            horizontalAlign="left"
            onClick={onSelect}
          >
            {bridge.name}
          </Button>
          {bridge.role === "member" && (
            <Typography level="body-xs" textColor="muted">
              {t("minecraftBridge.joinedViaMinecraft")}
              {bridge.onlineCount != null ? ` · ${onlineLabel}` : ""}
            </Typography>
          )}
          {bridge.role !== "member" &&
            bridge.onlineCount != null &&
            bridge.hubConnected && (
              <Typography level="body-xs" textColor="muted">
                {onlineLabel}
              </Typography>
            )}
        </Stack>
        {bridge.role === "member" ? (
          <Button
            size="sm"
            variant="soft"
            color="danger"
            onClick={() =>
              openModal(
                "leave-bridge",
                <LeaveBridgeModal
                  bridgeId={bridge.id}
                  bridgeName={bridge.name}
                  onLeft={onRemoved}
                />
              )
            }
          >
            {t("minecraftBridge.leave")}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="soft"
            color="danger"
            onClick={() =>
              openModal(
                "delete-bridge",
                <DeleteBridgeModal
                  spaceId={spaceId}
                  bridgeId={bridge.id}
                  bridgeName={bridge.name}
                  onDeleted={onRemoved}
                />
              )
            }
          >
            {t("minecraftBridge.delete")}
          </Button>
        )}
      </Stack>
    );
  }
);

const BridgeManagement = observer(
  ({
    spaceId,
    bridge,
    atBridgeLimit,
    onCreate,
    onError
  }: {
    spaceId: string;
    bridge: BridgeSummary;
    atBridgeLimit: boolean;
    onCreate: () => void;
    onError: (message: string | null) => void;
  }) => {
    const { t } = useTranslation("settings");
    const app = useAppStore();
    const queryClient = useQueryClient();
    const [renameValue, setRenameValue] = useState(bridge.name);

    useEffect(() => {
      setRenameValue(bridge.name);
    }, [bridge]);

    const onUpdated = () => {
      onError(null);
      void queryClient.invalidateQueries({
        queryKey: ["space", spaceId, "bridge"]
      });
      void queryClient.invalidateQueries({ queryKey: ["me", "bridges"] });
    };

    const renameMutation = useMutation({
      mutationFn: (name: string) =>
        app.rest.patch(`/spaces/${spaceId}/bridge`, { name }),
      onSuccess: onUpdated,
      onError: (err: Error) => onError(err.message)
    });

    const archiveMutation = useMutation({
      mutationFn: (status: 0 | 1) =>
        app.rest.patch(`/spaces/${spaceId}/bridge`, { status }),
      onSuccess: onUpdated,
      onError: (err: Error) => onError(err.message)
    });

    return (
      <Stack direction="column" spacing={1.25}>
        <InputWithLabel
          name="bridge-rename"
          label={t("minecraftBridge.bridgeName")}
          description={t("minecraftBridge.bridgeNameHint")}
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
              renameValue.trim() === bridge.name
            }
            onClick={() => renameMutation.mutate(renameValue.trim())}
          >
            {t("minecraftBridge.rename")}
          </Button>
          <Button
            size="sm"
            variant="soft"
            color="warning"
            disabled={archiveMutation.isPending}
            onClick={() => archiveMutation.mutate(bridge.status === 1 ? 0 : 1)}
          >
            {bridge.status === 1
              ? t("minecraftBridge.restore")
              : t("minecraftBridge.archive")}
          </Button>
          <Button size="sm" disabled={atBridgeLimit} onClick={onCreate}>
            {t("minecraftBridge.create")}
          </Button>
        </Stack>
        {atBridgeLimit && (
          <Typography level="body-xs" textColor="muted">
            {t("minecraftBridge.bridgeLimitReached", { limit: BRIDGE_LIMIT })}
          </Typography>
        )}
      </Stack>
    );
  }
);

export const BridgeListSection = observer(
  ({
    spaceId,
    bridges,
    selectedBridge,
    canManage,
    showManagement,
    atBridgeLimit,
    serverLabel,
    onSelect,
    onRemoved,
    onCreate,
    onError
  }: {
    spaceId: string;
    bridges: BridgeSummary[];
    selectedBridge: BridgeSummary | null;
    canManage: boolean;
    showManagement: boolean;
    atBridgeLimit: boolean;
    serverLabel: (serverId: string) => string;
    onSelect: (bridgeId: string) => void;
    onRemoved: (bridgeId: string) => void;
    onCreate: () => void;
    onError: (message: string | null) => void;
  }) => {
    const { t } = useTranslation("settings");

    return (
      <BridgeSection title={t("minecraftBridge.bridgeSection")}>
        {bridges.map((bridge) => (
          <BridgeRow
            key={bridge.id}
            spaceId={spaceId}
            bridge={bridge}
            selected={selectedBridge?.id === bridge.id}
            onSelect={() => onSelect(bridge.id)}
            onRemoved={() => onRemoved(bridge.id)}
          />
        ))}

        <BansSection
          spaceId={spaceId}
          enabled={canManage}
          serverLabel={serverLabel}
          onError={onError}
        />

        {showManagement && selectedBridge && (
          <BridgeManagement
            spaceId={spaceId}
            bridge={selectedBridge}
            atBridgeLimit={atBridgeLimit}
            onCreate={onCreate}
            onError={onError}
          />
        )}
      </BridgeSection>
    );
  }
);
