import { useAppStore } from "@hooks/useStores";
import { Paper } from "@components/Paper";
import { Button, Typography } from "@mutualzz/ui-web";
import { useModal } from "@contexts/Modal.context";
import { useTranslation } from "react-i18next";

export const SuccessForgotSent = () => {
  const { t } = useTranslation("auth");
  const app = useAppStore();
  const { closeModal } = useModal();

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      p={5}
      borderRadius={12}
      direction="column"
      justifyContent="space-between"
    >
      <Typography level="h5" fontWeight="bold">
        {t("forgotPassword.title")}
      </Typography>
      <Typography>{t("forgotPassword.message")}</Typography>
      <Button color="neutral" onClick={() => closeModal()}>
        {t("actions.close")}
      </Button>
    </Paper>
  );
};
