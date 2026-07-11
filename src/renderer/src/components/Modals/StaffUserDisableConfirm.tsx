import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores";
import { useMutation } from "@tanstack/react-query";
import { Paper } from "@components/Paper";
import { Button, Stack, Textarea, Typography } from "@mutualzz/ui-web";
import { useModal } from "@contexts/Modal.context";
import type { APIPrivateUser } from "@mutualzz/types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

interface Props {
  userId: string;
  username: string;
  disable: boolean;
  onSuccess: (user: APIPrivateUser) => void;
}

export const StaffUserDisableConfirm = observer(
  ({ userId, username, disable, onSuccess }: Props) => {
    const app = useAppStore();
    const { closeModal } = useModal();
    const { t } = useTranslation("staff");
    const { t: tCommon } = useTranslation("common");
    const [reason, setReason] = useState("");

    const { mutate: setDisabled, isPending } = useMutation({
      mutationKey: ["staff-set-disabled", userId, disable],
      mutationFn: async () =>
        app.rest.patch<APIPrivateUser>(`/staff/users/${userId}/disabled`, {
          disabled: disable,
          reason: reason.trim() || undefined
        }),
      onSuccess: (user) => {
        onSuccess(user);
        closeModal();
      },
      onError: (err) => {
        toast.error(
          err instanceof Error
            ? err.message
            : t("user.actions.errors.updateUser")
        );
      }
    });

    return (
      <Paper
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        p={4.75}
        borderRadius={12}
        direction="column"
        width="25vw"
        spacing={2.5}
      >
        <Typography level="h5" fontWeight="bold">
          {disable
            ? t("user.modals.disable.title")
            : t("user.modals.disable.enableTitle")}
        </Typography>
        <Typography>
          {disable
            ? t("user.modals.disable.bodyDisable", { username })
            : t("user.modals.disable.bodyEnable", { username })}
        </Typography>
        <Stack direction="column" spacing={1.25}>
          <Typography fontWeight="bold">
            {disable
              ? t("user.modals.reasonRequired")
              : t("user.modals.reasonOptional")}
          </Typography>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              disable
                ? t("user.modals.disable.placeholder")
                : t("user.modals.placeholderAudit")
            }
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
            onClick={() => setDisabled()}
            disabled={isPending || (disable && !reason.trim())}
            size="lg"
          >
            {disable
              ? t("user.modals.disable.title")
              : t("user.modals.disable.enableTitle")}
          </Button>
        </Stack>
      </Paper>
    );
  }
);
