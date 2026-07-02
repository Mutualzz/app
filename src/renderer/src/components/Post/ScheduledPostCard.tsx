import { Paper } from "@components/Paper";
import { IconButton } from "@components/IconButton";
import { UserAvatar } from "@components/User/UserAvatar";
import { MessageAttachment } from "@components/Message/MessageAttachment";
import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import { Button, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import type { Post } from "@stores/objects/Post";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { TrashIcon, XIcon } from "@phosphor-icons/react";

interface Props {
  post: Post;
}

function toDatetimeLocalValue(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export const ScheduledPostCard = observer(({ post }: Props) => {
  const { theme } = useTheme();
  const [rescheduling, setRescheduling] = useState(false);
  const [nextDate, setNextDate] = useState(() =>
    post.scheduledFor ? toDatetimeLocalValue(post.scheduledFor) : ""
  );

  const { mutate: publishNow, isPending: isPublishing } = useMutation({
    mutationFn: () => post.publishNow()
  });

  const { mutate: reschedule, isPending: isRescheduling } = useMutation({
    mutationFn: (date: Date) => post.reschedule(date),
    onSuccess: () => setRescheduling(false)
  });

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: () => post.delete()
  });

  return (
    <Paper direction="column" p={3} spacing={2} width="100%">
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={2} alignItems="center">
          <UserAvatar user={post.author} size="md" />
          <Stack direction="column" spacing={0}>
            <Typography fontWeight={600}>
              {post.author?.displayName ?? "Unknown User"}
            </Typography>
            <Typography level="body-sm" textColor="secondary">
              Scheduled for{" "}
              {post.scheduledFor
                ? dayjs(post.scheduledFor).format("dddd, MMMM D, YYYY h:mm A")
                : "unknown"}
            </Typography>
          </Stack>
        </Stack>

        <IconButton
          size="sm"
          color="danger"
          onClick={() => deletePost()}
          disabled={isDeleting}
        >
          <TrashIcon />
        </IconButton>
      </Stack>

      {post.content && <MarkdownRenderer value={post.content} />}

      {post.attachments.length > 0 && (
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          {post.attachments.map((attachment) => (
            <MessageAttachment key={attachment.id} attachment={attachment} />
          ))}
        </Stack>
      )}

      {post.hashtags.length > 0 && (
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          {post.hashtags.map((hashtag) => (
            <Typography
              key={hashtag.id}
              level="body-sm"
              textColor={theme.colors.info}
            >
              #{hashtag.tag}
            </Typography>
          ))}
        </Stack>
      )}

      {rescheduling && (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <input
            type="datetime-local"
            value={nextDate}
            min={toDatetimeLocalValue(new Date())}
            onChange={(e) => setNextDate(e.target.value)}
            style={{
              flex: 1,
              padding: "6px 10px",
              borderRadius: 6,
              border: `1px solid ${theme.colors.surface}`,
              background: "transparent",
              color: "inherit"
            }}
          />
          <IconButton size="sm" onClick={() => setRescheduling(false)}>
            <XIcon size={12} />
          </IconButton>
        </Stack>
      )}

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        {rescheduling ? (
          <Button
            size="sm"
            disabled={
              !nextDate ||
              new Date(nextDate).getTime() <= Date.now() ||
              isRescheduling
            }
            onClick={() => reschedule(new Date(nextDate))}
          >
            Save time
          </Button>
        ) : (
          <Button
            size="sm"
            variant="soft"
            onClick={() => setRescheduling(true)}
          >
            Reschedule
          </Button>
        )}
        <Button
          size="sm"
          disabled={isPublishing}
          onClick={() => publishNow()}
        >
          Publish now
        </Button>
      </Stack>
    </Paper>
  );
});
