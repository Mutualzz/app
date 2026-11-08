import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { isValidCustomReminder, toDatetimeLocalValue } from "@mutualzz/client";
import { Button, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const HOUR_MS = 60 * 60 * 1000;

interface Props {
  messageId: string;
  modalId: string;
}

export const CustomReminderModal = observer(({ messageId, modalId }: Props) => {
  const app = useAppStore();
  const { theme } = useTheme();
  const { closeModal } = useModal();
  const { t } = useTranslation("chat");
  const { t: tCommon } = useTranslation("common");

  const existing = app.reminders.get(messageId);
  const [value, setValue] = useState(() =>
    toDatetimeLocalValue(
      existing && !existing.firedAt
        ? new Date(existing.remindAt)
        : new Date(Date.now() + HOUR_MS)
    )
  );
  const [saving, setSaving] = useState(false);

  const selected = new Date(value);
  const isValid = isValidCustomReminder(selected);

  const save = async () => {
    if (!isValid) return;
    setSaving(true);
    const ack = await app.reminders.schedule(messageId, selected);
    setSaving(false);
    if (ack.ok) closeModal(modalId);
  };

  return (
    <Paper
      surfaceRole="modal"
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      p={5}
      borderRadius={12}
      direction="column"
      spacing={2}
      css={{ width: "min(360px, calc(100vw - 32px))" }}
    >
      <Typography level="h6" fontWeight="bold">
        {t("reminders.customTitle")}
      </Typography>

      <input
        type="datetime-local"
        value={value}
        min={toDatetimeLocalValue(new Date())}
        onChange={(event) => setValue(event.target.value)}
        style={{
          padding: "8px 10px",
          borderRadius: 6,
          border: `1px solid ${theme.colors.surface}`,
          background: "transparent",
          color: "inherit",
          colorScheme: "dark light"
        }}
      />

      {!isValid && value && (
        <Typography level="body-sm" textColor="muted">
          {t("reminders.customInvalid")}
        </Typography>
      )}

      <Stack direction="row" spacing={1.25}>
        <Button
          color="neutral"
          expand
          disabled={saving}
          onClick={() => closeModal(modalId)}
        >
          {tCommon("cancel")}
        </Button>
        <Button
          color="primary"
          expand
          disabled={!isValid || saving}
          onClick={() => void save()}
        >
          {t("reminders.set")}
        </Button>
      </Stack>
    </Paper>
  );
});
