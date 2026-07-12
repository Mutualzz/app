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
  onDeleted?: () => void;
}

export const DeleteBridgeModal = observer(
  ({ bridgeId, bridgeName, onDeleted }: Props) => {
    const { t } = useTranslation("settings");
    const { t: tCommon } = useTranslation("common");
    const app = useAppStore();
    const { closeModal } = useModal();
    const queryClient = useQueryClient();

    const { mutate: deleteBridge, isPending } = useMutation({
      mutationKey: ["delete-bridge", bridgeId],
      mutationFn: () => app.rest.delete(`/@me/bridges/${bridgeId}`),
      onSuccess: () => {
        queryClient.setQueryData<Array<{ id: string }>>(
          ["me", "bridges"],
          (prev) => (prev ?? []).filter((b) => b.id !== bridgeId),
        );
        queryClient.removeQueries({ queryKey: ["me", "bridges", bridgeId] });
        void queryClient.invalidateQueries({ queryKey: ["me", "bridges"] });
        onDeleted?.();
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
            {t("minecraftBridge.deleteTitle", { name: bridgeName })}
          </Typography>
          <Typography level="body-sm" textColor="secondary">
            {t("minecraftBridge.deleteConfirm", { name: bridgeName })}
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
            onClick={() => deleteBridge()}
          >
            {isPending
              ? t("minecraftBridge.deleting")
              : t("minecraftBridge.delete")}
          </Button>
        </Stack>
      </Paper>
    );
  },
);
