import type { MessageSchedulePreset } from "@mutualzz/client";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

export const useSchedulePresetLabel = () => {
  const { t } = useTranslation("chat");

  return (preset: MessageSchedulePreset, time: Date) => {
    const formattedTime = dayjs(time).format("h:mma");
    if (preset === "nextMonday")
      return t("scheduledMessages.dayAt", {
        day: dayjs(time).format("dddd"),
        time: formattedTime
      });
    return t("scheduledMessages.tomorrowAt", { time: formattedTime });
  };
};
