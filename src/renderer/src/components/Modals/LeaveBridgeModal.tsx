import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Button, Stack, Typography } from "@mutualzz/ui-web";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

interface Props {
  bridgeId: string;
  bridgeName: string;
  onLeft?: () => void;
}

export const LeaveBridgeModal = observer(
  ({ bridgeId, bridgeName, onLeft }: Props) => {
    const { t } = useTranslation("settings");
    const { t: tCommon } = useTranslation("common");
    const app = useAppStore();
    const { closeModal } = useModal();
    const queryClient = useQueryClient();

    const { mutate: leaveBridge, isPending } = useMutation({
      mutationKey: ["leave-bridge", bridgeId],
      mutationFn: () =>
        app.rest.delete(`/@me/bridges/${bridgeId}/members/@me`),
      onSuccess: () => {
        queryClient.setQueryData<Array<{ id: string }>>(
          ["me", "bridges"],
          (prev) => (prev ?? []).filter((b) => b.id !== bridgeId),
        );
        queryClient.removeQueries({ queryKey: ["me", "bridges", bridgeId] });
        app.bridgeChat.clear(bridgeId);
        void queryClient.invalidateQueries({ queryKey: ["me", "bridges"] });
        onLeft?.();
        closeModal();
      },
    });

    return (
      <Paper
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        p={5}
        borderRadius={12}
        direction="column"
        justifyContent="space-between"
        spacing={1.25}
      >
        <Stack direction="column" spacing={5}>
          <Typography level="h5" fontWeight="bold">
            {t("minecraftBridge.leaveTitle", { name: bridgeName })}
          </Typography>
          <Typography level="body-sm" textColor="secondary">
            {t("minecraftBridge.leaveConfirm", { name: bridgeName })}
          </Typography>
          <Typography level="body-sm" textColor="muted">
            {t("minecraftBridge.leaveRejoinHint")}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1.25}>
          <Button
            color="neutral"
            variant="soft"
            expand
            disabled={isPending}
            onClick={() => closeModal()}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            color="danger"
            expand
            disabled={isPending}
            onClick={() => leaveBridge()}
          >
            {isPending
              ? t("minecraftBridge.leaving")
              : t("minecraftBridge.leave")}
          </Button>
        </Stack>
      </Paper>
    );
  },
);
