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

export const StaffUserWarnConfirm = observer(
  ({ userId, username, onSuccess }: Props) => {
    const app = useAppStore();
    const { closeModal } = useModal();
    const { t } = useTranslation("staff");
    const { t: tCommon } = useTranslation("common");
    const [reason, setReason] = useState("");

    const { mutate: warnUser, isPending } = useMutation({
      mutationKey: ["staff-warn-user", userId],
      mutationFn: () =>
        app.rest.post<{ success: boolean; emailSent: boolean }>(
          `/staff/users/${userId}/warn`,
          { reason: reason.trim() }
        ),
      onSuccess: (data) => {
        onSuccess();
        closeModal();
        toast.success(
          data.emailSent
            ? t("user.modals.warn.toastSent")
            : t("user.modals.warn.toastEmailFailed")
        );
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : t("user.actions.errors.warnUser")
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
          {t("user.modals.warn.title")}
        </Typography>
        <Typography>{t("user.modals.warn.body", { username })}</Typography>
        <Stack direction="column" spacing={1.25}>
          <Typography fontWeight="bold">
            {t("user.modals.reasonRequired")}
          </Typography>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("user.modals.warn.placeholder")}
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
            onClick={() => warnUser()}
            disabled={isPending || !reason.trim()}
            size="lg"
          >
            {t("user.modals.warn.submit")}
          </Button>
        </Stack>
      </Paper>
    );
  }
);
