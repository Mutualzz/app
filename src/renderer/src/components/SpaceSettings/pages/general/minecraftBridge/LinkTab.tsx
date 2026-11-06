import { InputWithLabel } from "@components/InputWithLabel";
import { MinecraftAvatar } from "@components/Minecraft/MinecraftAvatar";
import { UnlinkMinecraftModal } from "@components/Modals/UnlinkMinecraftModal";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Divider, Stack, Typography } from "@mutualzz/ui-web";
import { Button } from "@renderer/components/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { BridgeCard, useCopyFeedback } from "./BridgeSettingsParts";
import type { MinecraftLink } from "./types";

const LinkedAccount = observer(({ link }: { link: MinecraftLink }) => {
  const { t } = useTranslation("settings");
  const { openModal } = useModal();

  return (
    <Stack spacing={1.25} direction="column">
      <Stack direction="row" spacing={1.5} alignItems="center">
        <MinecraftAvatar
          uuid={link.minecraftUuid}
          name={link.minecraftName}
          size={48}
        />
        <Stack spacing={0.5} direction="column" minWidth={0}>
          <Typography level="body-md" fontWeight="bold">
            {t("minecraftBridge.linkedAs", { name: link.minecraftName })}
          </Typography>
          <Typography level="body-xs" textColor="muted">
            {t("minecraftBridge.linkedUuid", { uuid: link.minecraftUuid })}
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
              />
            )
          }
        >
          {t("minecraftBridge.unlink")}
        </Button>
      </Stack>
    </Stack>
  );
});

const LinkForms = observer(
  ({
    spaceId,
    selectedBridgeId,
    onError
  }: {
    spaceId: string;
    selectedBridgeId: string | null;
    onError: (message: string | null) => void;
  }) => {
    const { t } = useTranslation("settings");
    const app = useAppStore();
    const queryClient = useQueryClient();
    const { copied, copyText } = useCopyFeedback<"code">();
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [redeemCode, setRedeemCode] = useState("");

    const generateCodeMutation = useMutation({
      mutationFn: () =>
        app.rest.post<{
          code?: string;
          alreadyLinked?: boolean;
          minecraftName?: string;
        }>("/@me/bridges/link/code", {
          bridgeId: selectedBridgeId ?? undefined
        }),
      onSuccess: (result) => {
        onError(null);
        if (result.code) setGeneratedCode(result.code);
        void queryClient.invalidateQueries({
          queryKey: ["me", "bridges", "link"]
        });
      },
      onError: (err: Error) => onError(err.message)
    });

    const redeemMutation = useMutation({
      mutationFn: () =>
        app.rest.post<{
          ok: boolean;
          joinedCount?: number;
        }>("/@me/bridges/link/redeem", {
          code: redeemCode.trim()
        }),
      onSuccess: (data) => {
        onError(null);
        setRedeemCode("");
        void queryClient.invalidateQueries({
          queryKey: ["me", "bridges", "link"]
        });
        void queryClient.invalidateQueries({
          queryKey: ["space", spaceId, "bridge"]
        });
        if ((data.joinedCount ?? 0) > 0) {
          toast.success(
            t("minecraftBridge.joinedBridges", { count: data.joinedCount })
          );
        }
      },
      onError: (err: Error) => onError(err.message)
    });

    return (
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
              {t("minecraftBridge.codeCommand", { code: generatedCode })}
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
    );
  }
);

export const LinkTab = observer(
  ({
    spaceId,
    link,
    hasBridge,
    anyHubConnected,
    selectedBridgeId,
    onGoToSetup,
    onError
  }: {
    spaceId: string;
    link?: MinecraftLink | null;
    hasBridge: boolean;
    anyHubConnected: boolean;
    selectedBridgeId: string | null;
    onGoToSetup: () => void;
    onError: (message: string | null) => void;
  }) => {
    const { t } = useTranslation("settings");

    const goToSetup = (
      <Stack direction="row">
        <Button size="sm" onClick={onGoToSetup}>
          {t("minecraftBridge.goToSetup")}
        </Button>
      </Stack>
    );

    return (
      <Stack spacing={2.5} direction="column">
        <BridgeCard>
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
              {goToSetup}
            </>
          ) : link ? (
            <LinkedAccount link={link} />
          ) : !anyHubConnected ? (
            <>
              <Typography level="body-sm" color="warning">
                {t("minecraftBridge.hubDisconnected")}
              </Typography>
              <Typography level="body-sm" textColor="muted">
                {t("minecraftBridge.linkRequiresHub")}
              </Typography>
              {goToSetup}
            </>
          ) : (
            <LinkForms
              spaceId={spaceId}
              selectedBridgeId={selectedBridgeId}
              onError={onError}
            />
          )}
        </BridgeCard>
      </Stack>
    );
  }
);
