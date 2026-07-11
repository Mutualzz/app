import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

interface Props {
  onConfirm: () => void;
}

export const ProfileLeaveConfirm = observer(({ onConfirm }: Props) => {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const { closeModal } = useModal();

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      padding={5}
      borderRadius={12}
      direction="column"
      maxWidth={420}
    >
      <Typography level="h5" fontWeight="bold" marginBottom={2}>
        {t("profile.editor.leaveTitle")}
      </Typography>
      <Typography mb={2.5} css={{ opacity: 0.85 }}>
        {t("profile.editor.leaveDescription")}
      </Typography>
      <Stack spacing={1.25}>
        <Button color="neutral" size="lg" onClick={() => closeModal()}>
          {t("profile.editor.keepEditing")}
        </Button>
        <Button
          color="danger"
          size="lg"
          onClick={() => {
            closeModal();
            onConfirm();
          }}
        >
          {t("profile.editor.leaveConfirm")}
        </Button>
      </Stack>
    </Paper>
  );
});
