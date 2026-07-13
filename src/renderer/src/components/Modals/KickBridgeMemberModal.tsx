import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Button, Stack, Typography } from "@mutualzz/ui-web";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

interface Props {
  bridgeId: string;
  userId: string;
  displayName: string;
}

export const KickBridgeMemberModal = observer(
  ({ bridgeId, userId, displayName }: Props) => {
    const { t } = useTranslation("settings");
    const { t: tCommon } = useTranslation("common");
    const app = useAppStore();
    const { closeModal } = useModal();
    const queryClient = useQueryClient();

    const { mutate: kick, isPending } = useMutation({
      mutationKey: ["kick-bridge-member", bridgeId, userId],
      mutationFn: () =>
        app.rest.delete(`/@me/bridges/${bridgeId}/members/${userId}`),
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: ["me", "bridges", bridgeId, "members"],
        });
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
            {t("minecraftBridge.kickMemberTitle", { name: displayName })}
          </Typography>
          <Typography level="body-sm" textColor="secondary">
            {t("minecraftBridge.kickMemberConfirm", { name: displayName })}
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
            onClick={() => kick()}
          >
            {isPending
              ? t("minecraftBridge.kickingMember")
              : t("minecraftBridge.kickMember")}
          </Button>
        </Stack>
      </Paper>
    );
  },
);
