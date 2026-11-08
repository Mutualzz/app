import { Button } from "@components/Button";
import { EditScheduledMessageModal } from "@components/Modals/EditScheduledMessageModal";
import { PickTimeModal } from "@components/Modals/PickTimeModal";
import { ScheduledPostCard } from "@components/Post/ScheduledPostCard";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import type { APIScheduledMessage } from "@mutualzz/types";
import { Stack, Typography } from "@mutualzz/ui-web";
import { PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { Trans, useTranslation } from "react-i18next";
import {
  ChannelAvatar,
  channelCardTitle,
  InboxCard,
  InboxEmptyState
} from "./InboxParts";

const PREVIEW_MAX_CHARS = 280;

const ScheduledMessageCard = observer(
  ({ scheduled }: { scheduled: APIScheduledMessage }) => {
    const app = useAppStore();
    const { openModal } = useModal();
    const { t } = useTranslation("chat");
    const { t: tCommon } = useTranslation("common");
    const channel = app.channels.get(scheduled.channelId);

    const preview =
      scheduled.content && scheduled.content.length > PREVIEW_MAX_CHARS
        ? `${scheduled.content.slice(0, PREVIEW_MAX_CHARS)}…`
        : scheduled.content;

    const isFailed = scheduled.status === "failed";
    const isSending = scheduled.status === "sending";

    const subtitle = isSending
      ? t("scheduledMessages.sending")
      : t("scheduledMessages.sendsAt", {
          time: dayjs(scheduled.scheduledFor).format("ddd, MMM D · h:mm A")
        });

    const openReschedule = () => {
      const modalId = `reschedule-${scheduled.id}`;
      openModal(
        modalId,
        <PickTimeModal
          modalId={modalId}
          title={t("scheduledMessages.rescheduleTitle")}
          confirmLabel={t("scheduledMessages.reschedule")}
          initial={new Date(scheduled.scheduledFor)}
          onConfirm={async (time) => {
            const ack = await app.scheduledMessages.edit(scheduled.id, {
              scheduledFor: time
            });
            return ack.ok;
          }}
        />
      );
    };

    const openEdit = () => {
      const modalId = `edit-scheduled-${scheduled.id}`;
      openModal(
        modalId,
        <EditScheduledMessageModal
          modalId={modalId}
          scheduledMessageId={scheduled.id}
        />
      );
    };

    return (
      <InboxCard
        icon={<ChannelAvatar channel={channel} />}
        title={channelCardTitle(channel, tCommon)}
        subtitle={
          channel?.space ? `${channel.space.name} · ${subtitle}` : subtitle
        }
      >
        <Stack direction="column" spacing={1}>
          {preview && (
            <Typography level="body-sm" css={{ wordBreak: "break-word" }}>
              {preview}
            </Typography>
          )}
          {scheduled.attachments.length > 0 && (
            <Typography level="body-xs" textColor="muted">
              {t("scheduledMessages.attachmentCount", {
                count: scheduled.attachments.length
              })}
            </Typography>
          )}
          {isFailed && (
            <Typography level="body-xs" weight="bold">
              {t("scheduledMessages.failed", {
                reason: scheduled.failureReason ?? ""
              })}
            </Typography>
          )}
          {!isSending && (
            <Stack direction="row" spacing={1} flexWrap="wrap" pt={0.5}>
              <Button
                size="sm"
                variant="soft"
                onClick={(event) => {
                  event.stopPropagation();
                  void app.scheduledMessages.sendNow(scheduled.id);
                }}
              >
                {isFailed
                  ? t("scheduledMessages.retry")
                  : t("scheduledMessages.sendNow")}
              </Button>
              <Button
                size="sm"
                variant="plain"
                onClick={(event) => {
                  event.stopPropagation();
                  openReschedule();
                }}
              >
                {t("scheduledMessages.reschedule")}
              </Button>
              <Button
                size="sm"
                variant="plain"
                onClick={(event) => {
                  event.stopPropagation();
                  openEdit();
                }}
              >
                {t("scheduledMessages.editText")}
              </Button>
              <Button
                size="sm"
                variant="plain"
                color="danger"
                onClick={(event) => {
                  event.stopPropagation();
                  void app.scheduledMessages.cancel(scheduled.id);
                }}
              >
                {t("scheduledMessages.cancel")}
              </Button>
            </Stack>
          )}
        </Stack>
      </InboxCard>
    );
  }
);

const SectionLabel = ({ children }: { children: string }) => (
  <Typography
    level="label-xs"
    textColor="muted"
    weight="bold"
    css={{ textTransform: "uppercase", letterSpacing: 0.4 }}
  >
    {children}
  </Typography>
);

export const ScheduledTab = observer(() => {
  const app = useAppStore();
  const { t } = useTranslation("chat");
  const { t: tCommon } = useTranslation("common");

  const { isLoading: postsLoading } = useQuery({
    queryKey: ["posts", "scheduled"],
    queryFn: () => app.posts.getScheduledFeed(),
    staleTime: 30_000
  });

  const scheduledMessages = app.scheduledMessages.all;
  const scheduledPosts = app.posts.all
    .filter((post) => post.isScheduled)
    .slice()
    .sort(
      (first, second) =>
        (first.scheduledFor?.getTime() ?? 0) -
        (second.scheduledFor?.getTime() ?? 0)
    );

  const isEmpty =
    scheduledMessages.length === 0 &&
    scheduledPosts.length === 0 &&
    !postsLoading;

  if (isEmpty)
    return (
      <InboxEmptyState
        icon={<PaperPlaneTiltIcon weight="duotone" />}
        title={tCommon("notifications.emptyScheduledTitle")}
        description={
          <Trans
            t={tCommon}
            i18nKey="notifications.emptyScheduledDescription"
            components={{ bold: <b /> }}
          />
        }
      />
    );

  return (
    <Stack direction="column" spacing={2}>
      {scheduledMessages.length > 0 && (
        <Stack direction="column" spacing={1.25}>
          <SectionLabel>{t("scheduledMessages.messages")}</SectionLabel>
          {scheduledMessages.map((scheduled) => (
            <ScheduledMessageCard key={scheduled.id} scheduled={scheduled} />
          ))}
        </Stack>
      )}
      {scheduledPosts.length > 0 && (
        <Stack direction="column" spacing={1.25}>
          <SectionLabel>{t("scheduledMessages.posts")}</SectionLabel>
          {scheduledPosts.map((post) => (
            <ScheduledPostCard key={post.id} post={post} />
          ))}
        </Stack>
      )}
    </Stack>
  );
});
