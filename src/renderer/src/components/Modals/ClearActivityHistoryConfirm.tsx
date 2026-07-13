import { observer } from "mobx-react-lite";
import { Paper } from "@components/Paper";
import { Button, Stack, Typography } from "@mutualzz/ui-web";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  onConfirm: () => void | Promise<void>;
}

export const ClearActivityHistoryConfirm = observer(({ onConfirm }: Props) => {
  const app = useAppStore();
  const { closeModal } = useModal();
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");
  const [pending, setPending] = useState(false);

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      p={5}
      borderRadius={12}
      direction="column"
      width="min(420px, 90vw)"
    >
      <Typography level="h5" fontWeight="bold" marginBottom={2}>
        {t("notifications.clearRecentActivity")}
      </Typography>
      <Typography mb={2.5}>
        {t("notifications.clearRecentActivityDescription")}
      </Typography>
      <Stack spacing={1.25} direction="row">
        <Button
          color="neutral"
          expand
          size="lg"
          onClick={() => closeModal()}
          disabled={pending}
        >
          {tCommon("cancel")}
        </Button>
        <Button
          color="danger"
          expand
          size="lg"
          loading={pending}
          onClick={async () => {
            setPending(true);
            try {
              await onConfirm();
              closeModal();
            } catch {
              setPending(false);
            }
          }}
        >
          {t("notifications.clearRecentActivityAction")}
        </Button>
      </Stack>
    </Paper>
  );
});
