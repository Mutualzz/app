import { ContextItem } from "@components/ContextItem";
import { ContextSubmenu } from "@components/ContextSubmenu";
import { CustomReminderModal } from "@components/Modals/CustomReminderModal";
import { useMenu } from "@contexts/ContextMenu.context";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { REMINDER_PRESETS, resolveReminderPreset } from "@mutualzz/client";
import { Typography } from "@mutualzz/ui-web";
import { AlarmIcon, ArrowRightIcon } from "@phosphor-icons/react";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

interface Props {
  messageId: string;
}

const formatPresetTime = (date: Date) => {
  const isToday = dayjs(date).isSame(dayjs(), "day");
  return dayjs(date).format(isToday ? "h:mm A" : "ddd h:mm A");
};

export const ReminderSubmenu = observer(({ messageId }: Props) => {
  const app = useAppStore();
  const { t } = useTranslation("chat");
  const { clearMenu } = useMenu();
  const { openModal } = useModal();
  const elevation = app.settings?.preferEmbossed ? 5 : 1;
  const hasReminder = app.reminders.has(messageId);

  const schedule = (remindAt: Date) => {
    void app.reminders.schedule(messageId, remindAt);
    clearMenu();
  };

  const openCustom = () => {
    const modalId = `custom-reminder-${messageId}`;
    openModal(
      modalId,
      <CustomReminderModal messageId={messageId} modalId={modalId} />
    );
    clearMenu();
  };

  return (
    <ContextSubmenu
      label={t("actions.remindMe")}
      arrow={<ArrowRightIcon weight="fill" />}
      elevation={elevation}
    >
      {REMINDER_PRESETS.map((preset) => {
        const remindAt = resolveReminderPreset(preset);
        return (
          <ContextItem
            key={preset}
            onClick={() => schedule(resolveReminderPreset(preset))}
            endDecorator={
              <Typography level="body-xs" textColor="muted">
                {formatPresetTime(remindAt)}
              </Typography>
            }
          >
            {t(`reminders.presets.${preset}`)}
          </ContextItem>
        );
      })}
      <ContextItem
        onClick={openCustom}
        endDecorator={<AlarmIcon weight="fill" />}
      >
        {t("reminders.custom")}
      </ContextItem>
      {hasReminder && (
        <ContextItem
          color="danger"
          onClick={() => {
            void app.reminders.complete(messageId);
            clearMenu();
          }}
        >
          {t("actions.removeReminder")}
        </ContextItem>
      )}
    </ContextSubmenu>
  );
});
