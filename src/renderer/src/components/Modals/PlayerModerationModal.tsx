import { InputWithLabel } from "@components/InputWithLabel";
import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useBridgeServerLabel } from "@hooks/useBridgeServerLabel";
import { useAppStore } from "@hooks/useStores";
import { Button, Stack, Typography } from "@mutualzz/ui-web";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export interface ModerationResult {
  serverId: string;
  ok: boolean;
  message: string;
}

interface Props {
  spaceId: string;
  bridgeId: string;
  action: "kick" | "ban";
  minecraftUuid: string;
  minecraftName: string;
}

const ModerationResultList = ({
  results,
  isBan,
  labelFor
}: {
  results: ModerationResult[];
  isBan: boolean;
  labelFor: (serverId: string) => string;
}) => {
  const { t } = useTranslation("settings");

  return (
    <Stack direction="column" spacing={1}>
      {isBan && (
        <Typography level="body-sm" variant="plain" color="success">
          ✓ {t("minecraftBridge.removedFromBridge")}
        </Typography>
      )}
      {results.length === 0 ? (
        <Typography level="body-sm" textColor="muted">
          {t("minecraftBridge.noServersConnected")}
        </Typography>
      ) : (
        results.map((result) => (
          <Typography
            key={result.serverId}
            level="body-sm"
            variant="plain"
            color={result.ok ? "success" : "danger"}
          >
            {result.ok ? "✓" : "✗"} {labelFor(result.serverId)}:{" "}
            {result.message}
          </Typography>
        ))
      )}
    </Stack>
  );
};

interface Props {
  spaceId: string;
  bridgeId: string;
  action: "kick" | "ban";
  minecraftUuid: string;
  minecraftName: string;
}

export const PlayerModerationModal = observer(
  ({ spaceId, bridgeId, action, minecraftUuid, minecraftName }: Props) => {
    const app = useAppStore();
    const { t } = useTranslation("settings");
    const { closeModal } = useModal();
    const queryClient = useQueryClient();
    const labelFor = useBridgeServerLabel(bridgeId);
    const [reason, setReason] = useState("");
    const [results, setResults] = useState<ModerationResult[] | null>(null);
    const isBan = action === "ban";

    const { mutate, isPending, error } = useMutation({
      mutationFn: () =>
        app.rest.post<{ results: ModerationResult[] }>(
          `/spaces/${spaceId}/bridge/players/${minecraftUuid}/${action}`,
          { reason: reason.trim() || undefined }
        ),
      onSuccess: (data) => {
        setResults(data.results);
        if (isBan) {
          void queryClient.invalidateQueries({
            queryKey: ["space", spaceId, "bridge"]
          });
        }
      }
    });

    return (
      <Paper
        surfaceRole="modal"
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        p={5}
        borderRadius={12}
        direction="column"
        spacing={4}
        minWidth={380}
        maxWidth={480}
      >
        <Stack direction="column" spacing={1}>
          <Typography level="h5" fontWeight="bold">
            {t(
              isBan ? "minecraftBridge.banTitle" : "minecraftBridge.kickTitle",
              {
                name: minecraftName
              }
            )}
          </Typography>
          <Typography level="body-sm" textColor="muted">
            {t(
              isBan
                ? "minecraftBridge.banDescription"
                : "minecraftBridge.kickDescription"
            )}
          </Typography>
        </Stack>

        {results ? (
          <ModerationResultList
            results={results}
            isBan={isBan}
            labelFor={labelFor}
          />
        ) : (
          <InputWithLabel
            name="moderation-reason"
            label={t("minecraftBridge.moderationReason")}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={200}
            placeholder={t("minecraftBridge.moderationReasonPlaceholder")}
          />
        )}

        {error && (
          <Typography level="body-sm" variant="plain" color="danger">
            {error.message}
          </Typography>
        )}

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          {results ? (
            <Button size="sm" onClick={() => closeModal()}>
              {t("minecraftBridge.done")}
            </Button>
          ) : (
            <>
              <Button size="sm" variant="plain" onClick={() => closeModal()}>
                {t("minecraftBridge.cancel")}
              </Button>
              <Button
                size="sm"
                color="danger"
                disabled={isPending}
                onClick={() => mutate()}
              >
                {t(
                  isBan
                    ? "minecraftBridge.ban"
                    : "minecraftBridge.kickFromServer"
                )}
              </Button>
            </>
          )}
        </Stack>
      </Paper>
    );
  }
);
