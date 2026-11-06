import { InputWithLabel } from "@components/InputWithLabel";
import { useAppStore } from "@hooks/useStores";
import { minecraftServerLabel } from "@mutualzz/client";
import { Stack, Typography } from "@mutualzz/ui-web";
import { Button } from "@renderer/components/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BridgeSection } from "./BridgeSettingsParts";
import { type BridgeDetail, formatLastSeen } from "./types";

export const ServersSection = observer(
  ({
    spaceId,
    detail,
    onError
  }: {
    spaceId: string;
    detail: BridgeDetail;
    onError: (message: string | null) => void;
  }) => {
    const { t } = useTranslation("settings");
    const app = useAppStore();
    const queryClient = useQueryClient();
    const [drafts, setDrafts] = useState<Record<string, string>>({});

    useEffect(() => {
      const next: Record<string, string> = {};
      for (const s of detail.servers) {
        next[s.serverId] = minecraftServerLabel(s);
      }
      setDrafts(next);
    }, [detail.id, detail.servers]);

    const renameServerMutation = useMutation({
      mutationFn: ({
        serverId,
        displayName
      }: {
        serverId: string;
        displayName: string;
      }) =>
        app.rest.patch(
          `/spaces/${spaceId}/bridge/servers/${encodeURIComponent(serverId)}`,
          { displayName }
        ),
      onSuccess: () => {
        onError(null);
        void queryClient.invalidateQueries({
          queryKey: ["space", spaceId, "bridge"]
        });
        void queryClient.invalidateQueries({
          queryKey: ["me", "bridges", detail.id]
        });
      },
      onError: (err: Error) => onError(err.message)
    });

    return (
      <BridgeSection
        title={t("minecraftBridge.servers")}
        description={t("minecraftBridge.serverDisplayNameHint")}
      >
        {detail.servers.length === 0 ? (
          <Typography level="body-xs" textColor="muted">
            {t("minecraftBridge.none")}
          </Typography>
        ) : (
          detail.servers.map((s) => {
            const seen = formatLastSeen(s.lastSeenAt);
            const draft = drafts[s.serverId] ?? minecraftServerLabel(s);
            const dirty = draft.trim() !== minecraftServerLabel(s).trim();
            const saving =
              renameServerMutation.isPending &&
              renameServerMutation.variables?.serverId === s.serverId;

            return (
              <Stack key={s.id} direction="column" spacing={0.75} width="100%">
                <Typography level="body-xs" textColor="muted">
                  {t("minecraftBridge.serverIdLabel", { id: s.serverId })}
                  {" — "}
                  {seen
                    ? t("minecraftBridge.lastSeen", { when: seen })
                    : t("minecraftBridge.lastSeenNever")}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="flex-end"
                  width="100%"
                  flexWrap="wrap"
                >
                  <InputWithLabel
                    name={`server-display-${s.serverId}`}
                    label={t("minecraftBridge.serverDisplayName")}
                    value={draft}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [s.serverId]: e.target.value
                      }))
                    }
                    placeholder={t(
                      "minecraftBridge.serverDisplayNamePlaceholder"
                    )}
                    maxLength={64}
                    css={{ flex: 1, minWidth: 180 }}
                  />
                  <Button
                    size="sm"
                    disabled={!dirty || !draft.trim() || saving}
                    onClick={() =>
                      renameServerMutation.mutate({
                        serverId: s.serverId,
                        displayName: draft.trim()
                      })
                    }
                  >
                    {saving
                      ? t("minecraftBridge.savingServerName")
                      : t("minecraftBridge.saveServerName")}
                  </Button>
                </Stack>
              </Stack>
            );
          })
        )}
      </BridgeSection>
    );
  }
);
