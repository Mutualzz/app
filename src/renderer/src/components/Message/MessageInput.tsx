import { useAppStore } from "@hooks/useStores";
import { reaction } from "mobx";
import { observer } from "mobx-react-lite";
import {
  forwardRef,
  KeyboardEvent,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";
import { Message } from "@stores/objects/Message";
import type { Channel } from "@stores/objects/Channel";
import {
  MarkdownInput,
  MarkdownInputHandle
} from "@components/Markdown/MarkdownInput/MarkdownInput";
import {
  ChannelType,
  HttpException,
  HttpStatusCode,
  MessageType
} from "@mutualzz/types";
import { useMutation } from "@tanstack/react-query";
import { Editor } from "slate";
import { Snowflake } from "@mutualzz/client";
import { messageFlags } from "@mutualzz/bitfield";
import { createSystemMessage } from "@utils/index";
import { formatRestError } from "@mutualzz/client";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { Link } from "@components/Link";
import { Paper } from "@components/Paper";
import { TypingIndicator } from "@components/TypingIndicator";
import { Expression } from "@renderer/stores/objects/Expression";
import { FileIcon, EyeSlashIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { IconButton } from "../IconButton";
import { useTranslation } from "react-i18next";

const ACCEPTED_MIME_TYPE_LIST = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "application/pdf",
  "text/plain"
];

const ACCEPTED_MIME_TYPES = ACCEPTED_MIME_TYPE_LIST.join(",");
const ACCEPTED_MIME_TYPE_SET = new Set(ACCEPTED_MIME_TYPE_LIST);

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const MAX_FILES = 10;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  channel: Channel | null;
  message?: Message | null;
  onStopEditing?: () => void;
  onRequestEditLatest?: () => void;
}

export interface MessageInputHandle {
  addFiles: (incoming: FileList | File[] | null | undefined) => void;
}

const MAX_STICKERS = 3;

export const MessageInput = observer(
  forwardRef<MessageInputHandle, Props>(function MessageInput(
    { channel, message, onStopEditing, onRequestEditLatest },
    ref
  ) {
    const app = useAppStore();
    const { theme } = useTheme();
    const { t } = useTranslation("chat");
    const { t: tCommon } = useTranslation("common");
    const [content, setContent] = useState(message?.content ?? "");
    const [stickers, setStickers] = useState<Expression[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [fileSpoilers, setFileSpoilers] = useState<boolean[]>([]);

    const inputRef = useRef<MarkdownInputHandle>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

    const isDM =
      channel?.type === ChannelType.DM || channel?.type === ChannelType.GroupDM;
    const isGroupDM = channel?.type === ChannelType.GroupDM;

    const relationship = isDM
      ? app.relationships.getForMe(channel.dmRecipient?.id ?? "")
      : null;

    const meId = app.account?.id;
    const iBlockedThem =
      !!relationship?.isBlocked && relationship.userId === meId;
    const theyBlockedMe =
      !!relationship?.isBlocked && relationship.userId !== meId;

    const areTyping = app.typing.areTyping(channel?.id || "");

    const denySendingMessages = isDM
      ? !!channel?.dmRecipients.find(
          (r) => r.flags.has("System") || iBlockedThem
        )
      : !(
          app.spaces.get(channel?.spaceId ?? "") ?? app.spaces.active
        )?.members.me?.canSendMessages(channel);

    const canAttachFiles = isDM
      ? !denySendingMessages
      : !!((
          app.spaces.get(channel?.spaceId ?? "") ?? app.spaces.active
        )?.members.me?.canAttachFiles(channel) ?? false);

    useEffect(() => {
      app.pushComposer();
      return () => app.popComposer();
    }, []);

    useEffect(() => {
      app.setReplyingTo(null);
      setContent("");
      setStickers([]);
      setFiles([]);
      setFileSpoilers([]);
    }, [channel?.id]);

    useEffect(() => {
      setContent(message?.content ?? "");
    }, [message?.id]);

    useEffect(() => {
      requestAnimationFrame(() => {
        if (denySendingMessages && !message) return;
        inputRef.current?.focus();
      });
    }, [message?.editing, message?.id]);

    useEffect(() => {
      if (!message && app.replyingTo) {
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    }, [app.replyingTo]);

    useEffect(() => {
      if (message) return;
      return reaction(
        () => channel?.messages.all.some((m) => m.editing) ?? false,
        (isEditing, prevIsEditing) => {
          if (prevIsEditing && !isEditing) {
            requestAnimationFrame(() => inputRef.current?.focus());
          }
        }
      );
    }, [channel, message]);

    useEffect(() => {
      return () => clearTimeout(typingCooldownRef.current!);
    }, []);

    const previewUrls = useMemo(
      () =>
        files.map((f) =>
          f.type.startsWith("image/") ? URL.createObjectURL(f) : null
        ),
      [files]
    );
    useEffect(
      () => () => previewUrls.forEach((url) => url && URL.revokeObjectURL(url)),
      [previewUrls]
    );

    const triggerTyping = () => {
      if (!channel || message?.editing) return;
      if (app.settings?.extendedSettings.sendTypingIndicators === false) return;
      if (!typingCooldownRef.current) {
        app.rest.post(`/channels/${channel.id}/typing`).catch(() => {});
      }
      clearTimeout(typingCooldownRef.current!);
      typingCooldownRef.current = setTimeout(() => {
        typingCooldownRef.current = null;
      }, 8_000);
    };

    const stopTyping = () => {
      clearTimeout(typingCooldownRef.current!);
      typingCooldownRef.current = null;
    };

    const { mutate: sendMessage } = useMutation({
      mutationKey: ["send-message", channel?.id],
      mutationFn: async ({
        editor,
        contentOverride
      }: {
        editor?: Editor | null;
        contentOverride?: string;
      }) => {
        if (!app.account) return null;
        if (!channel) return null;

        stopTyping();

        const trimmed = (contentOverride ?? content).trim();
        const original = (message?.content ?? "").trim();
        const isEditing = !!message;

        if (
          !isEditing &&
          !trimmed &&
          stickers.length === 0 &&
          files.length === 0
        )
          return null;

        if (isEditing && trimmed === original) {
          onStopEditing?.();
          return null;
        }

        if (message) {
          const updated = await message.edit(trimmed);
          onStopEditing?.();
          return updated;
        }

        const nonce = Snowflake.generate();
        const stickerIds = stickers.map((s) => s.id);
        const replyingTo = app.replyingTo;
        const repliedToId = replyingTo?.id;
        const mentionReply = app.replyMention;
        const pendingFiles = canAttachFiles ? files.slice() : [];
        const pendingSpoilers = canAttachFiles ? fileSpoilers.slice() : [];
        const contentSnapshot = trimmed;

        const author = app.account.raw;

        const pendingAttachments = pendingFiles.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
          previewUrl: f.type.startsWith("image/")
            ? URL.createObjectURL(f)
            : undefined
        }));

        const msg = app.queue.add({
          id: nonce,
          content: trimmed,
          author,
          authorId: author.id,
          channelId: channel.id,
          spaceId: channel.spaceId ?? null,
          createdAt: new Date().toISOString(),
          type: repliedToId ? MessageType.Reply : MessageType.Default,
          expressionIds: stickerIds,
          expressions: stickers.map((s) => s.toJSON()),
          repliedToId,
          repliedTo: replyingTo ?? undefined,
          pendingAttachments
        });

        app.setReplyingTo(null);
        setContent("");
        setStickers([]);
        setFiles([]);
        setFileSpoilers([]);

        editor?.select({ anchor: editor.start([]), focus: editor.end([]) });
        editor?.removeNodes();
        editor?.delete();
        editor?.insertNode({ type: "line", children: [{ text: "" }] });

        const failQueued = async (err: unknown) => {
          const error = formatRestError(err, t("unknownError"));
          msg.fail(error);
          const sysMessage = await createSystemMessage(
            app,
            channel.id,
            error,
            messageFlags.Ephemeral
          );
          if (sysMessage) channel.messages.add(sysMessage);
        };

        try {
          if (contentSnapshot.length >= 2000)
            throw new HttpException(
              HttpStatusCode.Forbidden,
              t("messageTooLong")
            );

          if (isDM && theyBlockedMe)
            throw new HttpException(
              HttpStatusCode.Forbidden,
              t("cannotMessagePerson")
            );

          if (pendingFiles.length > 0) {
            const formData = new FormData();
            if (contentSnapshot) formData.append("content", contentSnapshot);
            formData.append("nonce", nonce);
            if (stickerIds.length > 0)
              stickerIds.forEach((id) =>
                formData.append("expressionIds[]", id)
              );
            if (repliedToId) {
              formData.append("repliedToId", repliedToId);
              formData.append("mentionReply", String(mentionReply));
            }
            pendingFiles.forEach((f, index) => {
              formData.append("attachments", f);
              formData.append(
                "attachmentSpoilers[]",
                String(pendingSpoilers[index] ?? false)
              );
            });
            return await channel.sendMessage(formData, msg);
          }

          return await channel.sendMessage(
            {
              content: contentSnapshot,
              nonce,
              ...(stickerIds.length > 0 ? { expressionIds: stickerIds } : {}),
              ...(repliedToId ? { repliedToId, mentionReply } : {})
            },
            msg
          );
        } catch (err) {
          await failQueued(err);
          throw err;
        }
      },
      onError: async (err: unknown) => {
        if (!message) return;
        const error = formatRestError(err, t("unknownError"));
        const sysMessage = await createSystemMessage(
          app,
          channel?.id ?? "",
          error,
          messageFlags.Ephemeral
        );
        if (sysMessage) channel?.messages.add(sysMessage);
      },
    });

    const onChange = (value: string) => setContent(value);

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

    const addFiles = (incoming: FileList | File[] | null | undefined) => {
      if (!incoming || message?.editing || denySendingMessages || !canAttachFiles)
        return;

      const picked = Array.from(incoming).filter(
        (file) => !file.type || ACCEPTED_MIME_TYPE_SET.has(file.type)
      );
      if (picked.length === 0) return;

      setFiles((prev) => {
        const combined = [...prev, ...picked].slice(0, MAX_FILES);
        if (combined.some((f) => f.size > MAX_FILE_SIZE)) return prev;
        const added = combined.length - prev.length;
        if (added > 0) {
          setFileSpoilers((spoilers) =>
            [...spoilers, ...Array(added).fill(false)].slice(0, combined.length)
          );
        }
        return combined;
      });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const picked = e.target.files;
      e.target.value = "";
      addFiles(picked);
    };

    const handleRemoveFile = (index: number) => {
      setFiles((prev) => prev.filter((_, i) => i !== index));
      setFileSpoilers((prev) => prev.filter((_, i) => i !== index));
    };

    const toggleFileSpoiler = (index: number) => {
      setFileSpoilers((prev) =>
        prev.map((spoiler, i) => (i === index ? !spoiler : spoiler))
      );
    };

    const canAcceptFileDrops =
      !message?.editing && !denySendingMessages && canAttachFiles;

    useImperativeHandle(ref, () => ({ addFiles }));

    const onStopEdit = (e?: KeyboardEvent) => {
      e?.preventDefault();
      message?.setEditing(false);
      onStopEditing?.();
    };

    const onKeyDown = (e: KeyboardEvent, editor: Editor) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage({ editor });
        return;
      }

      if (e.key === "Escape") {
        if (message) {
          onStopEdit(e);
          return;
        }
        if (app.replyingTo) {
          app.setReplyingTo(null);
          return;
        }
      }

      if (
        e.key === "ArrowUp" &&
        !message &&
        !content.trim() &&
        stickers.length === 0
      ) {
        e.preventDefault();
        onRequestEditLatest?.();
        return;
      }

      triggerTyping();
    };

    const placeholder = (() => {
      if (denySendingMessages) {
        return isDM
          ? t("composer.placeholder.blocked")
          : t("composer.placeholder.noPermission");
      }
      if (isDM) {
        if (isGroupDM) {
          const name = channel?.name;
          return name
            ? t("composer.placeholder.dm", { name })
            : t("composer.placeholder.groupFallback");
        }
        const name = channel?.dmRecipient?.displayName;
        return name
          ? t("composer.placeholder.dm", { name })
          : t("composer.placeholder.dmFallback");
      }
      const channelName = channel?.name;
      return channelName
        ? t("composer.placeholder.channel", { channel: channelName })
        : t("composer.placeholder.channelFallback");
    })();

    const replyingTo = !message && app.replyingTo;
    const hasUploadTray = files.length > 0 && !message?.editing;
    const hasWallpaper = Boolean(theme.backgroundImageUrl);
    const composerElevation = app.settings?.preferEmbossed ? 5 : 1;

    const typingIndicator = !message?.editing && channel && (
      <TypingIndicator channelId={channel.id} />
    );

    const uploadTray = hasUploadTray && (
      <Paper
        surfaceRole={hasWallpaper ? "card" : undefined}
        elevation={hasWallpaper ? 0 : composerElevation}
        px={1.25}
        pt={2.5}
        pb={0}
        borderTopLeftRadius={areTyping ? 0 : 6}
        borderTopRightRadius={areTyping ? 0 : 6}
        borderBottomLeftRadius={0}
        borderBottomRightRadius={0}
        display="block"
      >
        <Stack
          direction="row"
          spacing={0.75}
          pb={1}
          css={{
            overflowX: "auto",
            borderBottom: `1px solid ${theme.colors.surface}`,
            "&::-webkit-scrollbar": { height: 3 },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: 2,
              background: theme.colors.surface
            }
          }}
        >
          {files.map((file, index) => {
            const isImage = file.type.startsWith("image/");
            const isVideo = file.type.startsWith("video/");
            const isSpoiler = fileSpoilers[index] ?? false;
            const previewUrl = previewUrls[index];
            const canMarkSpoiler = isImage || isVideo;

            return (
              <div key={index} css={{ position: "relative", flexShrink: 0 }}>
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
                      css={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter: isSpoiler ? "blur(12px)" : undefined
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
                      css={{ flexShrink: 0 }}
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
                {canMarkSpoiler && (
                  <IconButton
                    variant="solid"
                    size="sm"
                    color={isSpoiler ? "warning" : "neutral"}
                    onClick={() => toggleFileSpoiler(index)}
                    css={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      zIndex: 1,
                      minWidth: 16,
                      width: 16,
                      height: 16
                    }}
                    title={t("composer.markAsSpoiler")}
                  >
                    <EyeSlashIcon size={8} weight="fill" />
                  </IconButton>
                )}
                <IconButton
                  variant="solid"
                  size="sm"
                  color="danger"
                  onClick={() => handleRemoveFile(index)}
                  css={{
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
      </Paper>
    );

    const replyBanner = replyingTo && (
      <Paper
        surfaceRole={hasWallpaper ? "card" : undefined}
        direction="row"
        alignItems="center"
        spacing={1}
        px={1.5}
        py={0.75}
        borderTopLeftRadius={areTyping || hasUploadTray ? 0 : 6}
        borderTopRightRadius={areTyping || hasUploadTray ? 0 : 6}
        borderBottomLeftRadius={0}
        borderBottomRightRadius={0}
        elevation={hasWallpaper ? 0 : composerElevation}
      >
        <Typography level="body-xs" textColor="secondary" flex="1 1 auto">
          {t("reply.banner", {
            name: replyingTo.author?.displayName ?? t("unknown")
          })}
        </Typography>
        {replyingTo.authorId !== app.account?.id && (
          <Typography
            level="body-xs"
            fontWeight="bold"
            textColor={app.replyMention ? "accent" : "secondary"}
            onClick={() => app.setReplyMention(!app.replyMention)}
            css={{
              cursor: "pointer",
              userSelect: "none",
              whiteSpace: "nowrap"
            }}
          >
            {app.replyMention
              ? t("composer.mentionOn")
              : t("composer.mentionOff")}
          </Typography>
        )}
        <IconButton
          variant="plain"
          size="sm"
          onClick={() => app.setReplyingTo(null)}
          title={t("edit.cancelReplyA11y")}
        >
          <XIcon size={14} />
        </IconButton>
      </Paper>
    );

    const inputContent = (
      <Paper
        surfaceRole={hasWallpaper ? "composer" : undefined}
        p={1.75}
        elevation={hasWallpaper ? 0 : composerElevation}
        borderTopLeftRadius={replyingTo || areTyping || hasUploadTray ? 0 : 6}
        borderTopRightRadius={replyingTo || areTyping || hasUploadTray ? 0 : 6}
        borderBottomLeftRadius={6}
        borderBottomRightRadius={6}
        display="block"
        mb={0}
      >
        {stickers.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            mb={1}
            flexWrap="wrap"
            borderBottom={`1px solid ${theme.colors.surface}`}
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
                  css={{ width: 80, height: 80, objectFit: "contain" }}
                />
                <IconButton
                  variant="plain"
                  size="sm"
                  onClick={() => handleRemoveSticker(sticker.id)}
                  css={{ position: "absolute", top: -4, right: -4 }}
                  title={t("composer.removeSticker")}
                >
                  <XIcon size={14} />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        )}
        <MarkdownInput
          autoFocus
          color="success"
          value={content}
          variant="plain"
          ref={inputRef}
          emoticons={app.settings?.extended.convertEmoticons ?? true}
          onChange={onChange}
          placeholder={message?.editing ? message.content : placeholder}
          onKeyDown={onKeyDown}
          onSendMessage={(msg) =>
            sendMessage({
              editor: inputRef.current?.editor ?? null,
              contentOverride: msg
            })
          }
          onPasteFiles={canAcceptFileDrops ? addFiles : undefined}
          onSelectSticker={handleSelectSticker}
          disabled={denySendingMessages}
          emojiPicker={
            !denySendingMessages &&
            (app.settings?.extendedSettings.showEmojiPicker ?? true)
          }
          gifPicker={
            !denySendingMessages &&
            !message?.editing &&
            (app.settings?.extendedSettings.showGifPicker ?? true)
          }
          stickerPicker={
            !denySendingMessages &&
            !message?.editing &&
            (app.settings?.extendedSettings.showStickerPicker ?? true)
          }
          hoverToolbar={app.settings?.extendedSettings.showMarkdownToolbar ?? true}
          startContent={
            !message?.editing && !denySendingMessages && canAttachFiles ? (
              <Stack alignItems="center" justifyContent="center" mr={2.5}>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ACCEPTED_MIME_TYPES}
                  onChange={handleFileChange}
                  css={{ display: "none" }}
                />
                <IconButton
                  variant="plain"
                  onClick={() => fileInputRef.current?.click()}
                  title={t("composer.attachFiles")}
                  shape="rounded"
                >
                  <PlusIcon />
                </IconButton>
              </Stack>
            ) : undefined
          }
        />
      </Paper>
    );

    return message?.editing ? (
      <Stack direction="column" spacing={1.25} css={{ fontSize: "calc(1em * var(--chat-font-scale, 1))" }}>
        {inputContent}
        <Typography level="body-xs" textColor="secondary">
          {t("composer.editHintEscapeTo")}{" "}
          <Link textColor="accent" onClick={() => onStopEdit()}>
            {tCommon("cancel")}
          </Link>{" "}
          • {t("composer.editHintEnterTo")}{" "}
          <Link
            textColor="accent"
            onClick={() => sendMessage({ editor: null })}
          >
            {tCommon("save")}
          </Link>
        </Typography>
      </Stack>
    ) : (
      <Stack
        direction="column"
        spacing={0}
        ml={hasWallpaper ? 0 : 1.25}
        mr={hasWallpaper ? 0 : 1.75}
        mb={hasWallpaper ? 0 : 3.5}
        css={{
          flexShrink: 0,
          fontSize: "calc(1em * var(--chat-font-scale, 1))"
        }}
      >
        {typingIndicator}
        {uploadTray}
        {replyBanner}
        {inputContent}
      </Stack>
    );
  })
);
