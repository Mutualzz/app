import { Paper } from "@components/Paper";
import { IconButton } from "@components/IconButton";
import { UserAvatar } from "@components/User/UserAvatar";
import { useAppStore } from "@hooks/useStores";
import { Button, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import {
  MarkdownInput,
  type MarkdownInputHandle
} from "@components/Markdown/MarkdownInput/MarkdownInput";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import { Editor } from "slate";
import { ReactEditor } from "slate-react";
import type { Expression } from "@stores/objects/Expression";
import {
  CalendarIcon,
  CalendarPlusIcon,
  FileIcon,
  ImageIcon,
  XIcon
} from "@phosphor-icons/react";
import { Tooltip } from "../Tooltip";
import { useTranslation } from "react-i18next";

interface Props {
  onPosted?: () => void;
}

const MAX_STICKERS = 3;

const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm"
].join(",");

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const MAX_FILES = 10;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function toDatetimeLocalValue(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export const PostComposer = observer(({ onPosted }: Props) => {
  const app = useAppStore();
  const { theme } = useTheme();
  const { t } = useTranslation("chat");
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [stickers, setStickers] = useState<Expression[]>([]);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<MarkdownInputHandle>(null);

  const previewUrls = useMemo(
    () =>
      files.map((file) =>
        file.type.startsWith("image/") ? URL.createObjectURL(file) : null
      ),
    [files]
  );

  useEffect(
    () => () => previewUrls.forEach((url) => url && URL.revokeObjectURL(url)),
    [previewUrls]
  );

  const { mutate: submit, isPending } = useMutation({
    mutationFn: (opts: {
      content: string;
      files: File[];
      scheduledFor?: Date;
      expressionIds?: string[];
      editor?: Editor | null;
    }) =>
      app.posts.createPost(
        opts.content,
        opts.files,
        opts.scheduledFor,
        opts.expressionIds
      ),
    onSuccess: (_data, variables) => {
      setContent("");
      setFiles([]);
      setStickers([]);
      setScheduledFor("");
      setShowScheduler(false);

      const editor = variables.editor;
      editor?.select({ anchor: editor.start([]), focus: editor.end([]) });
      editor?.removeNodes();
      editor?.delete();
      editor?.insertNode({ type: "line", children: [{ text: "" }] });

      onPosted?.();
    }
  });

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;

    const next = Array.from(incoming).filter(
      (file) => file.size <= MAX_FILE_SIZE
    );

    setFiles((prev) => [...prev, ...next].slice(0, MAX_FILES));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

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

  return (
    <Paper
      direction="column"
      p={2.5}
      spacing={2}
      width="50%"
      alignSelf="center"
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      borderRadius={8}
    >
      {stickers.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          borderBottom={`1px solid ${theme.colors.surface}`}
          pb={1.5}
        >
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
                style={{ width: 80, height: 80, objectFit: "contain" }}
              />
              <IconButton
                variant="plain"
                size="sm"
                onClick={() => handleRemoveSticker(sticker.id)}
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
        variant="plain"
        value={content}
        onChange={setContent}
        placeholder={t("feed.composer.placeholder")}
        mentions={false}
        gifPicker
        stickerPicker
        onSendMessage={handleGifUrl}
        onSelectSticker={handleSelectSticker}
        startContent={<UserAvatar user={app.account} />}
      />

      {files.length > 0 && (
        <Stack
          direction="row"
          spacing={2.5}
          css={{
            overflowX: "auto",
            paddingBottom: 4
          }}
        >
          {files.map((file, index) => {
            const isImage = file.type.startsWith("image/");
            const previewUrl = previewUrls[index];

            return (
              <div
                key={`${file.name}-${index}`}
                style={{ position: "relative", flexShrink: 0 }}
              >
                {isImage && previewUrl ? (
                  <Paper
                    borderRadius={8}
                    width={64}
                    height={64}
                    overflow="hidden"
                  >
                    <img
                      src={previewUrl}
                      alt={file.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  </Paper>
                ) : (
                  <Paper
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    p={0.75}
                    borderRadius={8}
                    elevation={app.settings?.preferEmbossed ? 5 : 1}
                    maxWidth={160}
                    minWidth={120}
                    height="100%"
                  >
                    <FileIcon
                      size={16}
                      color={theme.colors.info}
                      style={{ flexShrink: 0 }}
                    />
                    <Stack spacing={0} direction="column" flex={1} minWidth={0}>
                      <Typography
                        level="body-xs"
                        fontWeight="semiBold"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                      >
                        {file.name}
                      </Typography>
                      <Typography level="body-xs" textColor="muted">
                        {formatBytes(file.size)}
                      </Typography>
                    </Stack>
                  </Paper>
                )}
                <IconButton
                  variant="solid"
                  size="sm"
                  color="danger"
                  onClick={() => removeFile(index)}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: -2,
                    zIndex: 1,
                    minWidth: 16,
                    width: 16,
                    height: 16
                  }}
                  title={t("composer.removeAttachment")}
                >
                  <XIcon size={8} />
                </IconButton>
              </div>
            );
          })}
        </Stack>
      )}

      {showScheduler && (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <input
            type="datetime-local"
            value={scheduledFor}
            min={toDatetimeLocalValue(new Date())}
            onChange={(e) => setScheduledFor(e.target.value)}
            style={{
              flex: 1,
              padding: "6px 10px",
              borderRadius: 6,
              border: `1px solid ${theme.colors.surface}`,
              background: "transparent",
              color: "inherit"
            }}
          />
          {scheduledFor && (
            <IconButton
              size="sm"
              onClick={() => setScheduledFor("")}
              title={t("feed.composer.clearScheduledTime")}
            >
              <XIcon size={12} />
            </IconButton>
          )}
        </Stack>
      )}

      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={2.5}
        alignItems="center"
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_MIME_TYPES}
            style={{ display: "none" }}
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <Tooltip content={t("feed.composer.addMedia")} placement="bottom">
            <IconButton
              disabled={files.length >= MAX_FILES}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon />
            </IconButton>
          </Tooltip>

          <Tooltip content={t("feed.composer.schedulePost")} placement="bottom">
            <IconButton
              onClick={() => setShowScheduler((prev) => !prev)}
              title={t("feed.composer.schedulePost")}
            >
              <CalendarPlusIcon weight={showScheduler ? "fill" : "regular"} />
            </IconButton>
          </Tooltip>

          <Tooltip content={t("feed.composer.viewScheduled")} placement="bottom">
            <IconButton onClick={() => navigate({ to: "/feed/scheduled" })}>
              <CalendarIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <Button
          disabled={
            (!content.trim() && files.length === 0 && stickers.length === 0) ||
            isPending ||
            (!!scheduledFor && new Date(scheduledFor).getTime() <= Date.now())
          }
          color="success"
          onClick={() =>
            submit({
              content: content.trim(),
              files,
              scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
              expressionIds: stickers.map((s) => s.id),
              editor: inputRef.current?.editor ?? null
            })
          }
        >
          {scheduledFor ? t("feed.composer.schedule") : t("feed.composer.post")}
        </Button>
      </Stack>
    </Paper>
  );
});
