import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { Button } from "@renderer/components/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { BridgeSection, useCopyFeedback } from "./BridgeSettingsParts";
import {
  type BridgeDetail,
  type PluginConfig,
  pluginConfigTemplateYaml
} from "./types";

export const PluginSetupSection = observer(
  ({
    spaceId,
    detail,
    bindServerId,
    onConfig,
    onError
  }: {
    spaceId: string;
    detail: BridgeDetail;
    bindServerId: string;
    onConfig: (config: PluginConfig) => void;
    onError: (message: string | null) => void;
  }) => {
    const { t } = useTranslation("settings");
    const app = useAppStore();
    const queryClient = useQueryClient();
    const { copied, copyText } = useCopyFeedback<"template">();

    const rotateMutation = useMutation({
      mutationFn: () =>
        app.rest.post<{ token: string; pluginConfig: PluginConfig }>(
          `/spaces/${spaceId}/bridge/token`,
          { serverId: bindServerId.trim() || undefined }
        ),
      onSuccess: (result) => {
        onError(null);
        onConfig(result.pluginConfig);
        void queryClient.invalidateQueries({
          queryKey: ["space", spaceId, "bridge"]
        });
      },
      onError: (err: Error) => onError(err.message)
    });

    return (
      <BridgeSection
        title={t("minecraftBridge.pluginSetup")}
        description={t("minecraftBridge.configTemplateHint")}
      >
        <Typography level="body-xs" textColor="muted">
          {t("minecraftBridge.rotateWarning")}
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
                  detail.servers[0]?.serverId ?? "my-server"
                ),
                "template"
              )
            }
          >
            {copied === "template"
              ? t("minecraftBridge.copied")
              : t("minecraftBridge.copyConfigTemplate")}
          </Button>
        </Stack>
      </BridgeSection>
    );
  }
);
