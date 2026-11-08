import { Paper } from "@components/Paper";
import { useSchedulePresetLabel } from "@components/Message/useSchedulePresetLabel";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import {
  isValidCustomReminder,
  MESSAGE_SCHEDULE_PRESETS,
  resolveMessageSchedulePreset,
  toDatetimeLocalValue
} from "@mutualzz/client";
import { styled } from "@mutualzz/ui-core";
import { Button, Divider, Input, Stack, Typography } from "@mutualzz/ui-web";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const HOUR_MS = 60 * 60 * 1000;

const PresetRow = styled("button")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  width: "100%",
  padding: "10px 12px",
  border: "none",
  borderRadius: 8,
  background: "transparent",
  color: "inherit",
  font: "inherit",
  textAlign: "left",
  cursor: "pointer",
  transition: "background 120ms ease",

  "&:hover:not(:disabled)": {
    background: theme.colors.surface
  },

  "&:disabled": {
    opacity: 0.5,
    cursor: "default"
  }
}));

interface Props {
  modalId: string;
  title: string;
  confirmLabel: string;
  initial?: Date;
  showPresets?: boolean;
  onConfirm: (time: Date) => Promise<boolean>;
}

export const PickTimeModal = observer(
  ({
    modalId,
    title,
    confirmLabel,
    initial,
    showPresets = true,
    onConfirm
  }: Props) => {
    const app = useAppStore();
    const { closeModal } = useModal();
    const { t } = useTranslation("chat");
    const { t: tCommon } = useTranslation("common");
    const presetLabel = useSchedulePresetLabel();

    const [value, setValue] = useState(() =>
      toDatetimeLocalValue(initial ?? new Date(Date.now() + HOUR_MS))
    );
    const [saving, setSaving] = useState(false);

    const selected = new Date(value);
    const isValid = isValidCustomReminder(selected);

    const confirm = async (time: Date) => {
      setSaving(true);
      const succeeded = await onConfirm(time);
      setSaving(false);
      if (succeeded) closeModal(modalId);
    };

    return (
      <Paper
        surfaceRole="modal"
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        p={4}
        borderRadius={12}
        direction="column"
        spacing={2}
        css={{ width: "min(400px, calc(100vw - 32px))" }}
      >
        <Typography level="h6" fontWeight="bold">
          {title}
        </Typography>

        {showPresets && (
          <>
            <Stack direction="column" spacing={0.25}>
              {MESSAGE_SCHEDULE_PRESETS.map((preset) => {
                const time = resolveMessageSchedulePreset(preset);
                return (
                  <PresetRow
                    key={preset}
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      void confirm(resolveMessageSchedulePreset(preset))
                    }
                  >
                    <Typography level="body-sm">
                      {presetLabel(preset, time)}
                    </Typography>
                    <Typography level="body-xs" textColor="muted">
                      {dayjs(time).format("ddd, MMM D")}
                    </Typography>
                  </PresetRow>
                );
              })}
            </Stack>
            <Divider css={{ opacity: 0.5 }} />
          </>
        )}

        <Stack direction="column" spacing={0.75}>
          <Typography level="label-sm" textColor="muted">
            {t("scheduledMessages.pickDateTime")}
          </Typography>
          <Input
            type="datetime-local"
            fullWidth
            value={value}
            min={toDatetimeLocalValue(new Date())}
            onChange={(event) => setValue(event.target.value)}
            css={{ colorScheme: "dark light" }}
          />
          {!isValid && value && (
            <Typography level="body-xs" textColor="muted">
              {t("reminders.customInvalid")}
            </Typography>
          )}
        </Stack>

        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button
            variant="plain"
            color="neutral"
            disabled={saving}
            onClick={() => closeModal(modalId)}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            variant="solid"
            color="primary"
            disabled={!isValid || saving}
            onClick={() => void confirm(selected)}
          >
            {confirmLabel}
          </Button>
        </Stack>
      </Paper>
    );
  }
);
