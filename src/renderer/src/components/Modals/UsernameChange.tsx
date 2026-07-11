import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores";
import { Paper } from "@components/Paper";
import { Button, Stack, Typography } from "@mutualzz/ui-web";
import { InputWithLabel } from "@components/InputWithLabel";
import { useState } from "react";
import { useModal } from "@contexts/Modal.context";
import { HttpException } from "@mutualzz/types";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export const UsernameChange = observer(() => {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");
  const app = useAppStore();
  const [newUsername, setNewUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { closeModal } = useModal();

  const { mutate: changeUsername, isPending: isChanging } = useMutation({
    mutationKey: ["changeUsername", [newUsername, password]],
    mutationFn: () =>
      app.rest.post("/@me/change-username", {
        username: newUsername,
        password
      }),
    onSuccess: () => closeModal(),
    onError: (err: HttpException) => {
      err.errors?.forEach(({ path, message }) => {
        setErrors({
          ...errors,
          [path]: message
        });
      });
    }
  });

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      p={5}
      borderRadius={12}
      direction="column"
      justifyContent="space-between"
      spacing={2.5}
    >
      <Typography level="h5" fontWeight="bold">
        {t("account.changingUsername")}
      </Typography>
      <InputWithLabel
        name="username"
        label={t("account.newUsername")}
        value={newUsername}
        onChange={(e) => setNewUsername(e.target.value)}
        apiError={errors.username}
        type="text"
        required
      />
      <InputWithLabel
        name="password"
        label={t("account.currentPasswordShort")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        apiError={errors.password}
        type="password"
        required
      />
      <Stack spacing={1.25}>
        <Button
          color="neutral"
          disabled={isChanging}
          onClick={() => closeModal()}
          size="lg"
          expand
        >
          {tCommon("cancel")}
        </Button>
        <Button
          color="success"
          onClick={() => changeUsername()}
          disabled={isChanging}
          size="lg"
          expand
        >
          {t("account.change")}
        </Button>
      </Stack>
    </Paper>
  );
});
