import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores";
import { useMutation } from "@tanstack/react-query";
import { Paper } from "@components/Paper";
import { Button, Stack, Textarea, Typography } from "@mutualzz/ui-web";
import { useModal } from "@contexts/Modal.context";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

interface Props {
  userId: string;
  username: string;
  onSuccess: () => void;
}

export const StaffUserForceLogoutConfirm = observer(
  ({ userId, username, onSuccess }: Props) => {
    const app = useAppStore();
    const { closeModal } = useModal();
    const { t } = useTranslation("staff");
    const { t: tCommon } = useTranslation("common");
    const [reason, setReason] = useState("");

    const { mutate: forceLogout, isPending } = useMutation({
      mutationKey: ["staff-force-logout", userId],
      mutationFn: async () =>
        app.rest.post(`/staff/users/${userId}/force-logout`, {
          reason: reason.trim() || undefined
        }),
      onSuccess: () => {
        onSuccess();
        closeModal();
      },
      onError: (err) => {
        toast.error(
          err instanceof Error
            ? err.message
            : t("user.actions.errors.forceLogout")
        );
      }
    });

    return (
      <Paper
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        p={5}
        borderRadius={12}
        direction="column"
        width="25vw"
        spacing={2.5}
      >
        <Typography level="h5" fontWeight="bold">
          {t("user.modals.forceLogout.title")}
        </Typography>
        <Typography>
          {t("user.modals.forceLogout.body", { username })}
        </Typography>
        <Stack direction="column" spacing={1.25}>
          <Typography fontWeight="bold">
            {t("user.modals.reasonOptional")}
          </Typography>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("user.modals.placeholderAudit")}
            rows={3}
          />
        </Stack>
        <Stack spacing={1.25} direction="row">
          <Button color="neutral" expand size="lg" onClick={() => closeModal()}>
            {tCommon("cancel")}
          </Button>
          <Button
            color="danger"
            expand
            onClick={() => forceLogout()}
            disabled={isPending}
            size="lg"
          >
            {t("user.modals.forceLogout.title")}
          </Button>
        </Stack>
      </Paper>
    );
  }
);
