import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores";
import { useMutation } from "@tanstack/react-query";
import { Paper } from "@components/Paper";
import { InputWithLabel } from "@components/InputWithLabel";
import { Button, Stack, Textarea, Typography } from "@mutualzz/ui-web";
import { useModal } from "@contexts/Modal.context";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

interface Props {
  userId: string;
  username: string;
}

export const StaffUserSetPasswordConfirm = observer(
  ({ userId, username }: Props) => {
    const app = useAppStore();
    const { closeModal } = useModal();
    const { t } = useTranslation("staff");
    const { t: tCommon } = useTranslation("common");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [reason, setReason] = useState("");

    const passwordsMatch = password.length > 0 && password === confirmPassword;

    const { mutate: setUserPassword, isPending } = useMutation({
      mutationKey: ["staff-set-password", userId],
      mutationFn: async () =>
        app.rest.post(`/staff/users/${userId}/password`, {
          password,
          reason: reason.trim() || undefined
        }),
      onSuccess: () => {
        toast.success(t("user.modals.setPassword.success", { username }));
        closeModal();
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : t("user.actions.errors.setPassword")
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
          {t("user.modals.setPassword.title")}
        </Typography>
        <Typography>
          {t("user.modals.setPassword.body", { username })}
        </Typography>
        <InputWithLabel
          name="newPassword"
          type="password"
          label={t("user.modals.setPassword.newPassword")}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <InputWithLabel
          name="confirmNewPassword"
          type="password"
          label={t("user.modals.setPassword.confirmPassword")}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        <Stack direction="column" spacing={1.25}>
          <Typography fontWeight="bold">
            {t("user.modals.reasonOptional")}
          </Typography>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
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
            size="lg"
            disabled={isPending || !passwordsMatch}
            onClick={() => setUserPassword()}
          >
            {t("user.modals.setPassword.submit")}
          </Button>
        </Stack>
      </Paper>
    );
  }
);
