import { UserAvatar } from "@components/User/UserAvatar";
import { Tooltip } from "@components/Tooltip";
import { Button, Divider, Stack, Textarea, Typography } from "@mutualzz/ui-web";
import type { Post } from "@stores/objects/Post";
import { calendarStrings } from "@utils/i18n";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

interface Props {
  post: Post;
}

export const PostComments = observer(({ post }: Props) => {
  const [content, setContent] = useState("");

  const { isLoading } = useQuery({
    queryKey: ["post-comments", post.id],
    queryFn: () => post.getComments()
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: (value: string) => post.addComment(value),
    onSuccess: () => setContent("")
  });

  useEffect(() => {
    setContent("");
  }, [post.id]);

  return (
    <Stack direction="column" spacing={2} width="100%">
      <Divider />

      {isLoading && <Typography level="body-sm">Loading comments…</Typography>}

      {!isLoading && post.comments.count === 0 && (
        <Typography level="body-sm" textColor="secondary">
          No comments yet.
        </Typography>
      )}

      {post.comments.all.map((comment) => (
        <Stack key={comment.id} direction="row" spacing={2}>
          <UserAvatar user={comment.author} size="sm" />
          <Stack direction="column" spacing={0.5} width="100%">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography level="body-sm" fontWeight={600}>
                {comment.author?.displayName ?? "Unknown User"}
              </Typography>
              <Tooltip
                content={dayjs(comment.createdAt).format(
                  "dddd, MMMM D, YYYY h:mm A"
                )}
              >
                <Typography level="body-sm" textColor="secondary">
                  {dayjs(comment.createdAt).calendar(
                    undefined,
                    calendarStrings
                  )}
                </Typography>
              </Tooltip>
            </Stack>
            <Typography level="body-sm" style={{ whiteSpace: "pre-wrap" }}>
              {comment.content}
            </Typography>
          </Stack>
        </Stack>
      ))}

      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Textarea
          placeholder="Write a comment…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          minRows={1}
          maxRows={4}
          style={{ flex: 1 }}
        />
        <Button
          size="sm"
          disabled={!content.trim() || isPending}
          onClick={() => submit(content.trim())}
        >
          Reply
        </Button>
      </Stack>
    </Stack>
  );
});
