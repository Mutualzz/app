import { UserAvatar } from "@components/User/UserAvatar";
import { Tooltip } from "@components/Tooltip";
import { Link } from "@components/Link";
import { IconButton } from "@components/IconButton";
import { MessageEmbed } from "@components/Message/MessageEmbed";
import { MessageSticker } from "@components/Message/MessageSticker";
import {
  MarkdownInput,
  type MarkdownInputHandle
} from "@components/Markdown/MarkdownInput/MarkdownInput";
import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import { ReportContentModal } from "@components/Modals/ReportContentModal";
import { useModal } from "@contexts/Modal.context";
import { Divider, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { ExpressionType } from "@mutualzz/types";
import { useAppStore } from "@hooks/useStores";
import type { Post } from "@stores/objects/Post";
import type { PostComment } from "@stores/objects/PostComment";
import type { Expression } from "@stores/objects/Expression";
import { calendarStrings } from "@utils/i18n";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Editor } from "slate";
import { ReactEditor } from "slate-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChatCircleIcon, FlagIcon, TrashIcon, XIcon } from "@phosphor-icons/react";

interface Props {
  post: Post;
}

const MAX_STICKERS = 3;

const GIF_URL_PATTERN =
  /^https?:\/\/(klipy\.com\/gifs\/|tenor\.com\/|c\.tenor\.com\/|media\.tenor\.com\/|giphy\.com\/|media\.giphy\.com\/|i\.giphy\.com\/|imgur\.com\/|i\.imgur\.com\/|redgifs\.com\/|.*\.gif(\?\S*)?$)\S*$/i;

const CommentBody = ({ comment }: { comment: PostComment }) => {
  const stickerExpressions = comment.expressions.filter(
    (e) => e.type === ExpressionType.Sticker
  );

  const hasGifEmbed = comment.embeds.some((e) => e.type === "gifv");
  const isOnlyGifUrl =
    hasGifEmbed &&
    !!comment.content &&
    GIF_URL_PATTERN.test(comment.content.trim()) &&
    !comment.content.trim().includes(" ");

  return (
    <>
      {comment.content && !isOnlyGifUrl && (
        <MarkdownRenderer level="body-sm" value={comment.content} />
      )}

      {stickerExpressions.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {stickerExpressions.map((sticker) => (
            <MessageSticker key={sticker.id} sticker={sticker} size={64} />
          ))}
        </Stack>
      )}

      {comment.embeds.length > 0 && (
        <Stack spacing={1}>
          {comment.embeds.map((embed, index) => (
            <MessageEmbed key={index} embed={embed} />
          ))}
        </Stack>
      )}
    </>
  );
};

const CommentRow = ({
  comment,
  canDelete,
  canReport,
  onReply
}: {
  comment: PostComment;
  canDelete: boolean;
  canReport: boolean;
  onReply: (comment: PostComment) => void;
}) => {
  const { openModal } = useModal();

  return (
    <Stack direction="row" spacing={2}>
      <UserAvatar user={comment.author} size="sm" />
      <Stack direction="column" spacing={0.5} width="100%">
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          justifyContent="space-between"
        >
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
                {dayjs(comment.createdAt).calendar(undefined, calendarStrings)}
              </Typography>
            </Tooltip>
          </Stack>

          <Stack direction="row" spacing={0.5}>
            {canDelete && (
              <Tooltip content="Delete comment">
                <IconButton
                  size="sm"
                  color="danger"
                  onClick={() => {
                    comment.delete().catch(() => {});
                  }}
                >
                  <TrashIcon />
                </IconButton>
              </Tooltip>
            )}

            {canReport && (
              <Tooltip content="Report comment">
                <IconButton
                  size="sm"
                  color="danger"
                  onClick={() =>
                    openModal(
                      `report-comment-${comment.id}`,
                      <ReportContentModal
                        targetType="comment"
                        targetId={comment.id}
                        contentLabel="this comment"
                        modalId={`report-comment-${comment.id}`}
                      />
                    )
                  }
                >
                  <FlagIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        <CommentBody comment={comment} />

        <Link
          textColor="secondary"
          onClick={() => onReply(comment)}
          style={{ width: "fit-content" }}
        >
          <Typography level="body-xs" fontWeight={600}>
            Reply
          </Typography>
        </Link>
      </Stack>
    </Stack>
  );
};

export const PostComments = observer(({ post }: Props) => {
  const app = useAppStore();
  const { theme } = useTheme();
  const [content, setContent] = useState("");
  const [stickers, setStickers] = useState<Expression[]>([]);
  const [replyingTo, setReplyingTo] = useState<PostComment | null>(null);
  const inputRef = useRef<MarkdownInputHandle>(null);

  const { isLoading } = useQuery({
    queryKey: ["post-comments", post.id],
    queryFn: () => post.getComments()
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: (opts: { content: string; expressionIds: string[] }) =>
      post.addComment(opts.content, opts.expressionIds, replyingTo?.id),
    onSuccess: () => {
      setContent("");
      setStickers([]);
      setReplyingTo(null);

      const editor = inputRef.current?.editor;
      if (editor) {
        editor.select({ anchor: editor.start([]), focus: editor.end([]) });
        editor.removeNodes();
        editor.delete();
        editor.insertNode({ type: "line", children: [{ text: "" }] });
      }
    }
  });

  useEffect(() => {
    setContent("");
    setStickers([]);
    setReplyingTo(null);
  }, [post.id]);

  const handleSelectSticker = (sticker: Expression) => {
    setStickers((prev) => {
      if (prev.some((s) => s.id === sticker.id)) return prev;
      if (prev.length >= MAX_STICKERS) return prev;
      return [...prev, sticker];
    });
  };

  const handleRemoveSticker = (stickerId: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== stickerId));
  };

  const handleGifUrl = (url?: string) => {
    if (!url) return;
    const editor = inputRef.current?.editor;
    if (!editor) return;

    ReactEditor.focus(editor);
    editor.select(editor.end([]));
    const needsSpace = content.length > 0 && !/\s$/.test(content);
    editor.insertText(`${needsSpace ? " " : ""}${url}`);
  };

  const handleReply = (comment: PostComment) => {
    setReplyingTo(comment);

    const editor = inputRef.current?.editor;
    if (!editor) return;

    ReactEditor.focus(editor);
    editor.select({ anchor: editor.start([]), focus: editor.end([]) });
    editor.removeNodes();
    editor.delete();
    editor.insertNode({ type: "line", children: [{ text: "" }] });
    editor.select(editor.start([]));

    // Replies are flattened to a single level, so once we're replying to a
    // reply (not the thread root), prefix with @user to keep it clear who
    // we're actually responding to.
    if (comment.repliedToId) {
      const mentionName = comment.author?.displayName ?? "user";
      editor.insertText(`@${mentionName} `);
    }
  };

  const canSubmit = !!content.trim() || stickers.length > 0;

  const handleSubmit = () => {
    if (!canSubmit || isPending) return;
    submit({
      content: content.trim(),
      expressionIds: stickers.map((s) => s.id)
    });
  };

  const onKeyDown = (e: KeyboardEvent, _editor: Editor) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canDeleteComment = (comment: PostComment) =>
    comment.authorId === app.account?.id || post.authorId === app.account?.id;

  const canReportComment = (comment: PostComment) =>
    comment.authorId !== app.account?.id;

  const topLevelComments = post.comments.all.filter((c) => !c.repliedToId);
  const repliesByParentId = new Map<string, PostComment[]>();
  for (const comment of post.comments.all) {
    if (!comment.repliedToId) continue;
    const list = repliesByParentId.get(comment.repliedToId) ?? [];
    list.push(comment);
    repliesByParentId.set(comment.repliedToId, list);
  }

  return (
    <Stack direction="column" spacing={2.5} width="100%">
      <Divider />

      {isLoading && <Typography level="body-sm">Loading comments…</Typography>}

      {!isLoading && post.comments.count === 0 && (
        <Typography level="body-sm" textColor="secondary">
          No comments yet.
        </Typography>
      )}

      {topLevelComments.map((comment) => (
        <Stack key={comment.id} direction="column" spacing={1.5}>
          <CommentRow
            comment={comment}
            canDelete={canDeleteComment(comment)}
            canReport={canReportComment(comment)}
            onReply={handleReply}
          />

          {(repliesByParentId.get(comment.id) ?? []).length > 0 && (
            <Stack
              direction="column"
              spacing={1.5}
              pl={5}
              borderLeft={`2px solid ${theme.colors.surface}`}
            >
              {(repliesByParentId.get(comment.id) ?? []).map((reply) => (
                <CommentRow
                  key={reply.id}
                  comment={reply}
                  canDelete={canDeleteComment(reply)}
                  canReport={canReportComment(reply)}
                  onReply={handleReply}
                />
              ))}
            </Stack>
          )}
        </Stack>
      ))}

      <Stack direction="column" spacing={1.25}>
        {replyingTo && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography level="body-xs" textColor="secondary">
              Replying to{" "}
              <Typography level="body-xs" fontWeight="bold" textColor="primary">
                {replyingTo.author?.displayName ?? "Unknown"}
              </Typography>
            </Typography>
            <IconButton
              variant="plain"
              size="sm"
              onClick={() => setReplyingTo(null)}
            >
              <XIcon size={12} />
            </IconButton>
          </Stack>
        )}

        {stickers.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {stickers.map((sticker) => (
              <Stack
                key={sticker.id}
                position="relative"
                alignItems="center"
                justifyContent="center"
              >
                <img
                  src={sticker.url}
                  alt={sticker.name}
                  style={{ width: 64, height: 64, objectFit: "contain" }}
                />
                <IconButton
                  variant="plain"
                  size="sm"
                  onClick={() => handleRemoveSticker(sticker.id)}
                  style={{ position: "absolute", top: -4, right: -4 }}
                  title="Remove sticker"
                >
                  <XIcon size={14} />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        )}

        <MarkdownInput
          ref={inputRef}
          variant="outlined"
          value={content}
          onChange={setContent}
          onKeyDown={onKeyDown}
          placeholder={
            replyingTo
              ? `Reply to ${replyingTo.author?.displayName ?? "comment"}…`
              : "Write a comment…"
          }
          mentions={false}
          gifPicker
          stickerPicker
          onSendMessage={handleGifUrl}
          onSelectSticker={handleSelectSticker}
          endContent={
            <Tooltip content="Reply">
              <IconButton
                variant="plain"
                onClick={handleSubmit}
                disabled={!canSubmit || isPending}
                aria-label="Send reply"
              >
                <ChatCircleIcon weight="fill" />
              </IconButton>
            </Tooltip>
          }
        />
      </Stack>
    </Stack>
  );
});
