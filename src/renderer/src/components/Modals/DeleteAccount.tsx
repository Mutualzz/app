import { observer } from "mobx-react-lite";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { Button, Stack, Typography } from "@mutualzz/ui-web";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useModal } from "@contexts/Modal.context";
import { HttpException } from "@mutualzz/types";
import { InputWithLabel } from "@components/InputWithLabel";
import { useTranslation } from "react-i18next";

export const DeleteAccount = observer(() => {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");
  const app = useAppStore();
  const { closeModal } = useModal();
  const account = app.account;

  const [confirmUsername, setConfirmUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { mutate: deleteAccount, isPending } = useMutation({
    mutationKey: ["delete-account", account?.id],
    mutationFn: () =>
      app.rest.post("/@me/delete", {
        confirmUsername: confirmUsername.trim().toLowerCase(),
        password
      }),
    onSuccess: () => {
      closeModal();
      app.logout();
    },
    onError: (err: HttpException) => setError(err.message)
  });

  if (!account) return null;

  const canDelete =
    confirmUsername.trim().toLowerCase() === account.username &&
    password.length > 0;

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      p={5}
      borderRadius={12}
      direction="column"
      justifyContent="space-between"
      spacing={2.5}
      width="30vw"
    >
      <Typography level="h5" fontWeight="bold" color="danger">
        {t("account.deleteAccount")}
      </Typography>
      <Typography level="body-sm">
        {t("account.deleteAccountConfirm")}
      </Typography>
      <Stack direction="column" spacing={5}>
        <InputWithLabel
          name="confirmUsername"
          label={t("account.typeUsernameToConfirm", {
            username: account.username
          })}
          type="text"
          onChange={(e) => setConfirmUsername(e.target.value)}
          value={confirmUsername}
          required
          autoComplete="off"
        />
        <InputWithLabel
          name="password"
          label={t("account.password")}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          required
        />
        {error && (
          <Typography level="body-sm" color="danger">
            {error}
          </Typography>
        )}
      </Stack>

      <Stack direction="row" spacing={1.25} justifyContent="flex-end">
        <Button
          color="neutral"
          disabled={isPending}
          onClick={() => closeModal()}
          expand
          size="lg"
        >
          {tCommon("cancel")}
        </Button>
        <Button
          color="danger"
          onClick={() => deleteAccount()}
          disabled={!canDelete || isPending}
          expand
          size="lg"
        >
          {isPending
            ? t("account.deleting")
            : t("account.deleteAccountAction")}
        </Button>
      </Stack>
    </Paper>
  );
});
