import { observer } from "mobx-react-lite";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { Button, Stack, Typography } from "@mutualzz/ui-web";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useModal } from "@contexts/Modal.context";
import { HttpException } from "@mutualzz/types";
import { InputWithLabel } from "@components/InputWithLabel";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

type ChangePasswordErrors = {
  currentPassword: string | undefined;
  newPassword: string | undefined;
  confirmNewPassword: string | undefined;
};

export const ChangePassword = observer(() => {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");
  const app = useAppStore();
  const { closeModal } = useModal();

  const [values, setValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });

  const [errors, setErrors] = useState<ChangePasswordErrors>({
    currentPassword: undefined,
    newPassword: undefined,
    confirmNewPassword: undefined
  });

  const { mutate: changePassword, isPending: changingPassword } = useMutation({
    mutationKey: ["change-password", app.account?.id],
    mutationFn: () =>
      app.rest.post("/@me/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword
      }),
    onSuccess: () => {
      toast.success(t("account.changePasswordSuccess"));
      closeModal();
    },
    onError: (err: HttpException) => {
      if (err.errors?.length > 0) {
        err.errors.forEach((error) => {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [error.path]: error.message
          }));
        });
      }
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
      width="30vw"
    >
      <Typography level="h5" fontWeight="bold">
        {t("account.changePassword")}
      </Typography>
      <Stack direction="column" spacing={5}>
        <InputWithLabel
          name="currentPassword"
          label={t("account.currentPassword")}
          type="password"
          onChange={(e) =>
            setValues((prevValues) => ({
              ...prevValues,
              currentPassword: e.target.value
            }))
          }
          value={values.currentPassword}
          required
          apiError={errors.currentPassword}
        />
        <InputWithLabel
          name="newPassword"
          label={t("account.newPassword")}
          type="password"
          onChange={(e) =>
            setValues((prevValues) => ({
              ...prevValues,
              newPassword: e.target.value
            }))
          }
          value={values.newPassword}
          required
          apiError={errors.newPassword}
        />
        <InputWithLabel
          name="confirmNewPassword"
          label={t("account.confirmNewPassword")}
          type="password"
          onChange={(e) =>
            setValues((prevValues) => ({
              ...prevValues,
              confirmNewPassword: e.target.value
            }))
          }
          value={values.confirmNewPassword}
          required
          apiError={errors.confirmNewPassword}
        />
      </Stack>

      <Stack direction="row" spacing={1.25} justifyContent="flex-end">
        <Button
          color="neutral"
          disabled={changingPassword}
          onClick={() => closeModal()}
          expand
          size="lg"
        >
          {tCommon("cancel")}
        </Button>
        <Button
          color="success"
          onClick={() => changePassword()}
          disabled={changingPassword}
          expand
          size="lg"
        >
          {t("account.change")}
        </Button>
      </Stack>
    </Paper>
  );
});
