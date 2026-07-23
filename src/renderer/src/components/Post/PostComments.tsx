import { UserAvatar } from "@components/User/UserAvatar";
import { Tooltip } from "@components/Tooltip";
import { Link } from "@components/Link";
import { IconButton } from "@components/IconButton";
import { Paper } from "@components/Paper";
import { MessageEmbed } from "@components/Message/MessageEmbed";
import { MessageSticker } from "@components/Message/MessageSticker";
import {
  MarkdownInput,
  type MarkdownInputHandle
} from "@components/Markdown/MarkdownInput/MarkdownInput";
import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import { ReportContentModal } from "@components/Modals/ReportContentModal";
import { useModal } from "@contexts/Modal.context";
import { useMenu } from "@contexts/ContextMenu.context";
import { Button, Divider, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { ExpressionType } from "@mutualzz/types";
import { useAppStore } from "@hooks/useStores";
import type { Post } from "@stores/objects/Post";
import type { PostComment } from "@stores/objects/PostComment";
import type { Expression } from "@stores/objects/Expression";
import { calendarStrings } from "@mutualzz/client";
import { isElectron } from "@utils/index";
import {
  buildCommentThreads,
  COMMENTS_PAGE_SIZE,
  getCommentPlainText,
  getOldestCommentId,
  isGifPrimaryComment,
  REPLY_PREVIEW_COUNT,
  type CommentSort
} from "@utils/postComments";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { Editor } from "slate";
import { ReactEditor } from "slate-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowBendUpLeftIcon,
  ChatCircleIcon,
  CopyIcon,
  FlagIcon,
  SortAscendingIcon,
  SortDescendingIcon,
  TrashIcon,
  XIcon
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

interface Props {
  post: Post;
  variant?: "inline" | "panel";
  autoFocus?: boolean;
}

const MAX_STICKERS = 3;

const GIF_URL_PATTERN =
  /^https?:\/\/(klipy\.com\/gifs\/|tenor\.com\/|c\.tenor\.com\/|media\.tenor\.com\/|giphy\.com\/|media\.giphy\.com\/|i\.giphy\.com\/|imgur\.com\/|i\.imgur\.com\/|redgifs\.com\/|.*\.gif(\?\S*)?$)\S*$/i;

const commentContentCss = {
  minWidth: 0,
  maxWidth: "100%",
  overflow: "hidden",
  overflowWrap: "anywhere" as const,
  wordBreak: "break-word" as const,
  "& img, & video": {
    maxWidth: "100%",
    height: "auto"
  },
  "& iframe": {
    maxWidth: "100%"
  }
};

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
    <Stack
      direction="column"
      spacing={1}
      minWidth={0}
      maxWidth="100%"
      css={commentContentCss}
    >
      {comment.content && !isOnlyGifUrl && (
        <MarkdownRenderer
          level="body-sm"
          value={comment.content}
          css={{
            minWidth: 0,
            maxWidth: "100%",
            overflowX: "hidden",
            overflowY: "visible",
            overflowWrap: "anywhere",
            wordBreak: "break-word"
          }}
        />
      )}

      {stickerExpressions.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" maxWidth="100%">
          {stickerExpressions.map((sticker) => (
            <MessageSticker key={sticker.id} sticker={sticker} size={64} />
          ))}
        </Stack>
      )}

      {comment.embeds.length > 0 && (
        <Stack spacing={1} minWidth={0} maxWidth="100%">
          {comment.embeds.map((embed, index) => (
            <MessageEmbed key={index} embed={embed} compact />
          ))}
        </Stack>
      )}
    </Stack>
  );
};

const CommentToolbar = ({
  comment,
  canDelete,
  canReport,
  onReply,
  onCopy,
  onDelete,
  onReport
}: {
  comment: PostComment;
  canDelete: boolean;
  canReport: boolean;
  onReply: (comment: PostComment) => void;
  onCopy: () => void;
  onDelete: () => void;
  onReport: () => void;
}) => {
  const app = useAppStore();
  const { theme } = useTheme();
  const { t } = useTranslation("chat");
  const plainText = getCommentPlainText(comment);

  return (
    <Paper
      className="comment-toolbar"
      direction="row"
      spacing={0.25}
      alignItems="center"
      p={0.5}
      borderRadius={8}
      elevation={app.settings?.preferEmbossed ? 4 : 2}
      css={{
        flexShrink: 0,
        opacity: 0,
        pointerEvents: "none",
        transition: "opacity 0.15s ease",
        backgroundColor: theme.colors.surface,
        zIndex: 1
      }}
    >
      <Tooltip content={t("feed.comments.reply")}>
        <IconButton
          variant="plain"
          size="sm"
          onClick={() => onReply(comment)}
          aria-label={t("feed.comments.reply")}
        >
          <ArrowBendUpLeftIcon size={14} />
        </IconButton>
      </Tooltip>

      {plainText && (
        <Tooltip content={t("actions.copyText")}>
          <IconButton variant="plain" size="sm" onClick={onCopy}>
            <CopyIcon size={14} />
          </IconButton>
        </Tooltip>
      )}

      {canDelete && (
        <Tooltip content={t("feed.actions.deleteComment")}>
          <IconButton
            variant="plain"
            size="sm"
            color="danger"
            onClick={onDelete}
          >
            <TrashIcon size={14} />
          </IconButton>
        </Tooltip>
      )}

      {canReport && (
        <Tooltip content={t("feed.actions.reportComment")}>
          <IconButton
            variant="plain"
            size="sm"
            color="danger"
            onClick={onReport}
          >
            <FlagIcon size={14} />
          </IconButton>
        </Tooltip>
      )}
    </Paper>
  );
};

const CommentRow = ({
  post,
  comment,
  canDelete,
  canReport,
  onReply,
  isReply = false,
  isActive = false
}: {
  post: Post;
  comment: PostComment;
  canDelete: boolean;
  canReport: boolean;
  onReply: (comment: PostComment) => void;
  isReply?: boolean;
  isActive?: boolean;
}) => {
  const { openContextMenu } = useMenu();
  const { openModal } = useModal();
  const { theme } = useTheme();
  const { t } = useTranslation("chat");

  const copyText = () => {
    const plainText = getCommentPlainText(comment);
    if (!plainText) return;
    if (isElectron) window.api.clipboard.write(plainText);
    else navigator.clipboard.writeText(plainText);
  };

  const openMenu = (e: MouseEvent) => {
    openContextMenu(e, {
      type: "comment",
      post,
      comment,
      onReply
    });
  };

  const reportComment = () => {
    openModal(
      `report-comment-${comment.id}`,
      <ReportContentModal
        targetType="comment"
        targetId={comment.id}
        contentLabel={t("feed.report.thisComment")}
        modalId={`report-comment-${comment.id}`}
      />
    );
  };

  const isGifPrimary = isGifPrimaryComment(comment);

  return (
    <Stack
      direction="row"
      spacing={2}
      width="100%"
      position="relative"
      py={0.5}
      css={{
        borderRadius: 10,
        outline:
          isActive && !isReply
            ? `2px solid ${theme.colors.primary}66`
            : "2px solid transparent",
        outlineOffset: 2,
        "&:hover .comment-toolbar, &:focus-within .comment-toolbar": {
          opacity: 1,
          pointerEvents: "auto"
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        openMenu(e);
      }}
    >
      <UserAvatar user={comment.author} size="sm" />
      <Stack direction="column" spacing={1.25} width="100%" minWidth={0}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          minWidth={0}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="baseline"
            minWidth={0}
            flex={1}
          >
            <Typography
              level="body-sm"
              fontWeight={600}
              css={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {comment.author?.displayName ?? t("unknownUser")}
            </Typography>
            <Tooltip
              content={dayjs(comment.createdAt).format(
                "dddd, MMMM D, YYYY h:mm A"
              )}
            >
              <Typography level="body-xs" textColor="secondary">
                {dayjs(comment.createdAt).calendar(undefined, calendarStrings)}
              </Typography>
            </Tooltip>
          </Stack>

          <CommentToolbar
            comment={comment}
            canDelete={canDelete}
            canReport={canReport}
            onReply={onReply}
            onCopy={copyText}
            onDelete={() => {
              comment.delete().catch(() => {});
            }}
            onReport={reportComment}
          />
        </Stack>

        <Stack
          direction="column"
          spacing={1}
          p={isGifPrimary ? 0 : 1.5}
          borderRadius={8}
          minWidth={0}
          maxWidth="100%"
          css={{
            backgroundColor:
              isReply || isGifPrimary
                ? "transparent"
                : `${theme.colors.background}88`
          }}
        >
          <CommentBody comment={comment} />
        </Stack>

        <Link
          textColor="secondary"
          onClick={() => onReply(comment)}
          style={{ width: "fit-content" }}
        >
          <Typography level="body-xs" fontWeight={600}>
            {t("feed.comments.reply")}
          </Typography>
        </Link>
      </Stack>
    </Stack>
  );
};

const ReplyThread = ({
  post,
  replies,
  canDeleteComment,
  canReportComment,
  onReply,
  replyingToId
}: {
  post: Post;
  replies: PostComment[];
  canDeleteComment: (comment: PostComment) => boolean;
  canReportComment: (comment: PostComment) => boolean;
  onReply: (comment: PostComment) => void;
  replyingToId?: string | null;
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation("chat");
  const [expanded, setExpanded] = useState(
    replies.length <= REPLY_PREVIEW_COUNT
  );

  if (replies.length === 0) return null;

  const hiddenCount = Math.max(0, replies.length - REPLY_PREVIEW_COUNT);
  const visibleReplies = expanded
    ? replies
    : replies.slice(0, REPLY_PREVIEW_COUNT);

  return (
    <Stack
      direction="column"
      spacing={1.75}
      pl={4.5}
      pt={0.5}
      minWidth={0}
      maxWidth="100%"
      css={{
        borderLeft: `2px solid ${theme.typography.colors.muted}`,
        overflow: "hidden"
      }}
    >
      {visibleReplies.map((reply) => (
        <CommentRow
          key={reply.id}
          post={post}
          comment={reply}
          canDelete={canDeleteComment(reply)}
          canReport={canReportComment(reply)}
          onReply={onReply}
          isReply
          isActive={replyingToId === reply.id}
        />
      ))}

      {!expanded && hiddenCount > 0 && (
        <Link
          onClick={() => setExpanded(true)}
          style={{ width: "fit-content" }}
        >
          <Typography level="body-xs" fontWeight={600} textColor="secondary">
            {t("feed.comments.viewReplies", { count: hiddenCount })}
          </Typography>
        </Link>
      )}

      {expanded && replies.length > REPLY_PREVIEW_COUNT && (
        <Link
          onClick={() => setExpanded(false)}
          style={{ width: "fit-content" }}
        >
          <Typography level="body-xs" fontWeight={600} textColor="secondary">
            {t("feed.comments.hideReplies")}
          </Typography>
        </Link>
      )}
    </Stack>
  );
};

const CommentListHeader = ({
  sort,
  onSortChange,
  showSort
}: {
  sort: CommentSort;
  onSortChange: (sort: CommentSort) => void;
  showSort: boolean;
}) => {
  const { t } = useTranslation("chat");

  if (!showSort) return null;

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      spacing={0.5}
      pb={0.5}
    >
      <IconButton
        variant={sort === "newest" ? "soft" : "plain"}
        size="sm"
        onClick={() => onSortChange("newest")}
        aria-label={t("feed.comments.sortNewest")}
        title={t("feed.comments.sortNewest")}
      >
        <SortDescendingIcon size={16} />
      </IconButton>
      <IconButton
        variant={sort === "oldest" ? "soft" : "plain"}
        size="sm"
        onClick={() => onSortChange("oldest")}
        aria-label={t("feed.comments.sortOldest")}
        title={t("feed.comments.sortOldest")}
      >
        <SortAscendingIcon size={16} />
      </IconButton>
    </Stack>
  );
};

const CommentComposer = ({
  content,
  stickers,
  replyingTo,
  isPending,
  canSubmit,
  inputRef,
  onContentChange,
  onKeyDown,
  onSubmit,
  onClearReply,
  onRemoveSticker,
  onSelectSticker,
  onGifUrl
}: {
  content: string;
  stickers: Expression[];
  replyingTo: PostComment | null;
  isPending: boolean;
  canSubmit: boolean;
  inputRef: React.RefObject<MarkdownInputHandle | null>;
  onContentChange: (value: string) => void;
  onKeyDown: (e: KeyboardEvent, editor: Editor) => void;
  onSubmit: () => void;
  onClearReply: () => void;
  onRemoveSticker: (stickerId: string) => void;
  onSelectSticker: (sticker: Expression) => void;
  onGifUrl: (url?: string) => void;
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation("chat");

  return (
    <Stack
      direction="column"
      spacing={1.5}
      pt={2.5}
      minWidth={0}
      maxWidth="100%"
      css={{
        borderTop: `1px solid ${theme.typography.colors.muted}44`
      }}
    >
      {replyingTo && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          px={1.25}
          py={0.75}
          borderRadius={8}
          css={{
            backgroundColor: `${theme.colors.primary}14`
          }}
        >
          <Typography level="body-xs" textColor="secondary">
            {t("reply.banner", {
              name: replyingTo.author?.displayName ?? t("unknown")
            })}
          </Typography>
          <IconButton variant="plain" size="sm" onClick={onClearReply}>
            <XIcon size={12} />
          </IconButton>
        </Stack>
      )}

      {stickers.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" maxWidth="100%">
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
                onClick={() => onRemoveSticker(sticker.id)}
                style={{ position: "absolute", top: -4, right: -4 }}
                title={t("composer.removeSticker")}
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
        onChange={onContentChange}
        onKeyDown={onKeyDown}
        placeholder={
          replyingTo
            ? t("feed.comments.replyPlaceholder", {
                name:
                  replyingTo.author?.displayName ??
                  t("feed.comments.replyFallback")
              })
            : t("feed.comments.placeholder")
        }
        mentions={false}
        gifPicker
        stickerPicker
        onSendMessage={onGifUrl}
        onSelectSticker={onSelectSticker}
        endContent={
          <Tooltip content={t("feed.comments.sendReply")}>
            <IconButton
              variant="plain"
              onClick={onSubmit}
              disabled={!canSubmit || isPending}
              aria-label={t("feed.comments.sendReply")}
            >
              <ChatCircleIcon weight="fill" />
            </IconButton>
          </Tooltip>
        }
      />
    </Stack>
  );
};

export const PostComments = observer(
  ({ post, variant = "inline", autoFocus = false }: Props) => {
    const app = useAppStore();
    const { theme } = useTheme();
    const { t } = useTranslation("chat");
    const [content, setContent] = useState("");
    const [stickers, setStickers] = useState<Expression[]>([]);
    const [replyingTo, setReplyingTo] = useState<PostComment | null>(null);
    const [sort, setSort] = useState<CommentSort>("newest");
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const inputRef = useRef<MarkdownInputHandle>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const isPanel = variant === "panel";

    const { isLoading } = useQuery({
      queryKey: ["post-comments", post.id],
      queryFn: async () => {
        const batch = await post.getComments({ limit: COMMENTS_PAGE_SIZE });
        setHasMore(batch.length >= COMMENTS_PAGE_SIZE);
        return batch;
      }
    });

    const focusInput = () => {
      const editor = inputRef.current?.editor;
      if (!editor) return;
      ReactEditor.focus(editor);
    };

    const scrollToBottom = () => {
      const list = listRef.current;
      if (!list) return;
      list.scrollTop = list.scrollHeight;
    };

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

        requestAnimationFrame(scrollToBottom);
      }
    });

    useEffect(() => {
      setContent("");
      setStickers([]);
      setReplyingTo(null);
      setSort("newest");
      setHasMore(false);
    }, [post.id]);

    useEffect(() => {
      if (!autoFocus) return;
      requestAnimationFrame(focusInput);
    }, [autoFocus, post.id]);

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

      if (comment.repliedToId) {
        const mentionName = comment.author?.displayName ?? "user";
        editor.insertText(`@${mentionName} `);
      }
    };

    const loadMore = async () => {
      const before = getOldestCommentId(post.comments.all);
      if (!before || loadingMore) return;

      setLoadingMore(true);
      try {
        const batch = await post.loadMoreComments(before, COMMENTS_PAGE_SIZE);
        setHasMore(batch.length >= COMMENTS_PAGE_SIZE);
      } finally {
        setLoadingMore(false);
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

    const threads = buildCommentThreads(post.comments.all, sort);
    const showSort = !isLoading && post.comments.count > 1;

    const commentList = (
      <>
        {!isPanel && <Divider />}

        <CommentListHeader
          sort={sort}
          onSortChange={setSort}
          showSort={showSort}
        />

        {isLoading && (
          <Typography level="body-sm" textColor="secondary">
            {t("feed.comments.loading")}
          </Typography>
        )}

        {!isLoading && post.comments.count === 0 && (
          <Stack
            direction="column"
            spacing={0.5}
            alignItems={isPanel ? "center" : "flex-start"}
            justifyContent="center"
            py={isPanel ? 4 : 0}
            textAlign={isPanel ? "center" : "left"}
          >
            <ChatCircleIcon
              size={isPanel ? 28 : 18}
              color={theme.typography.colors.muted}
            />
            <Typography level="body-sm" textColor="secondary">
              {t("feed.empty.comments")}
            </Typography>
          </Stack>
        )}

        {threads.map(({ comment, replies }) => (
          <Stack key={comment.id} direction="column" spacing={1.75}>
            <CommentRow
              post={post}
              comment={comment}
              canDelete={canDeleteComment(comment)}
              canReport={canReportComment(comment)}
              onReply={handleReply}
              isActive={replyingTo?.id === comment.id}
            />

            <ReplyThread
              post={post}
              replies={replies}
              canDeleteComment={canDeleteComment}
              canReportComment={canReportComment}
              onReply={handleReply}
              replyingToId={replyingTo?.id}
            />
          </Stack>
        ))}

        {hasMore && (
          <Stack alignItems="center">
            <Button
              variant="plain"
              size="sm"
              loading={loadingMore}
              onClick={() => void loadMore()}
            >
              {loadingMore
                ? t("feed.comments.loadingMore")
                : t("feed.comments.loadMore")}
            </Button>
          </Stack>
        )}
      </>
    );

    const composer = (
      <CommentComposer
        content={content}
        stickers={stickers}
        replyingTo={replyingTo}
        isPending={isPending}
        canSubmit={canSubmit}
        inputRef={inputRef}
        onContentChange={setContent}
        onKeyDown={onKeyDown}
        onSubmit={handleSubmit}
        onClearReply={() => setReplyingTo(null)}
        onRemoveSticker={handleRemoveSticker}
        onSelectSticker={handleSelectSticker}
        onGifUrl={handleGifUrl}
      />
    );

    if (isPanel) {
      return (
        <Stack
          direction="column"
          width="100%"
          height="100%"
          css={{ minHeight: 0, minWidth: 0, overflow: "hidden" }}
        >
          <Stack
            ref={listRef}
            direction="column"
            spacing={2.5}
            flex={1}
            overflowY="auto"
            pr={0.5}
            pb={0.5}
            css={{ minHeight: 0 }}
          >
            {commentList}
          </Stack>
          {composer}
        </Stack>
      );
    }

    return (
      <Stack direction="column" spacing={2.5} width="100%">
        {commentList}
        {composer}
      </Stack>
    );
  }
);
