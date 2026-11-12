import { PinnedMessageCard } from "@components/Channel/PinnedMessageCard";
import { InboxListSkeleton } from "@components/Skeletons";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { MAX_REMINDERS } from "@mutualzz/validators";
import { AlarmIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { Trans, useTranslation } from "react-i18next";
import {
  ChannelAvatar,
  channelCardTitle,
  InboxCard,
  InboxEmptyState,
  MarkAsReadButton,
  useJumpToMessage
} from "./InboxParts";

export const RemindersTab = observer(() => {
  const app = useAppStore();
  const { t } = useTranslation("common");
  const jumpTo = useJumpToMessage();

  const { data = [], isLoading } = useQuery({
    queryKey: ["reminders"],
    queryFn: () => app.gateway.listReminders(),
    staleTime: 30_000,
    enabled: app.reminders.size > 0
  });

  const messagesById = new Map(
    data.map((reminder) => [reminder.messageId, reminder.message])
  );
  const reminders = app.reminders.all.filter((reminder) =>
    messagesById.has(reminder.messageId)
  );

  if (app.reminders.size === 0)
    return (
      <InboxEmptyState
        icon={<AlarmIcon weight="duotone" />}
        title={t("notifications.emptyRemindersTitle")}
        description={
          <Trans
            t={t}
            i18nKey="notifications.emptyRemindersDescription"
            components={{ bold: <b /> }}
          />
        }
      />
    );

  if (isLoading)
    return <InboxListSkeleton label={t("notifications.loading")} />;

  return (
    <Stack direction="column" spacing={1.25}>
      <Typography level="label-xs" textColor="muted">
        {t("notifications.reminderCount", {
          count: app.reminders.size,
          max: MAX_REMINDERS
        })}
      </Typography>
      {reminders.map((reminder) => {
        const channel = app.channels.get(reminder.channelId);
        const isDue = reminder.firedAt !== null;

        return (
          <InboxCard
            key={reminder.messageId}
            icon={<ChannelAvatar channel={channel} />}
            title={channelCardTitle(channel, t)}
            subtitle={
              isDue
                ? t("notifications.reminderDueNow")
                : t("notifications.reminderAt", {
                    time: dayjs(reminder.remindAt).format("ddd, MMM D · h:mm A")
                  })
            }
            flush
            actions={
              <MarkAsReadButton
                title={t("notifications.markReminderDone")}
                onClick={() => void app.reminders.complete(reminder.messageId)}
              />
            }
          >
            <PinnedMessageCard
              message={messagesById.get(reminder.messageId)!}
              space={channel?.space}
              onJump={() => jumpTo(reminder.channelId, reminder.messageId)}
            />
          </InboxCard>
        );
      })}
    </Stack>
  );
});
