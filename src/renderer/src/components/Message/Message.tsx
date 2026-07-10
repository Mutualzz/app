import { formatColor } from "@mutualzz/ui-core";
import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import { UserAvatar } from "@components/User/UserAvatar";
import { useAppStore } from "@hooks/useStores";
import { useMenu } from "@contexts/ContextMenu.context";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import {
  Message as MessageObject,
  Message as MessageInstance,
  type MessageLike
} from "@stores/objects/Message";
import {
  QueuedMessage,
  QueuedMessageStatus
} from "@stores/objects/QueuedMessage";
import { observer } from "mobx-react-lite";
import { MessageAuthor } from "./MessageAuthor";
import {
  MessageBase,
  MessageContent,
  MessageContentText,
  MessageDetails,
  MessageInfo,
  MessageRow,
  ReplyAuthorName,
  ReplyConnectorArea,
  ReplyConnectorLine,
  ReplyContent,
  ReplyContentText,
  ReplySection
} from "./MessageBase";
import { MessageEmbed } from "./MessageEmbed";
import { CodedLinkPreview } from "@components/Space/CodedLinkPreview";
import { MessageToolbar } from "./MessageToolbar";
import { MessageInput } from "./MessageInput";
import { MessageSticker } from "./MessageSticker";
import { MessageReactions } from "./MessageReactions";
import dayjs from "dayjs";
import { Tooltip } from "@components/Tooltip";
import { ExpressionType, MessageType } from "@mutualzz/types";
import { MessageAttachment } from "./MessageAttachment";
import { FileIcon } from "@phosphor-icons/react";
import type { PendingAttachmentPreview } from "@stores/objects/QueuedMessage";
import { UserProfilePopoutTrigger } from "../Profile/popout/UserProfilePopoutTrigger";
import { shouldHideInviteUrlContent } from "@utils/inviteLinks";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const PendingAttachments = observer(
  ({
    attachments,
    progress
  }: {
    attachments: PendingAttachmentPreview[];
    progress: number;
  }) => {
    const { theme } = useTheme();
    return (
      <Stack direction="row" flexWrap="wrap" spacing={1} pb={0.25}>
        {attachments.map((attachment, i) => {
          const isImage = attachment.type.startsWith("image/");
          return (
            <div key={i} css={{ position: "relative" }}>
              {isImage && attachment.previewUrl ? (
                <div
                  css={{
                    position: "relative",
                    lineHeight: 0,
                    borderRadius: 6,
                    overflow: "hidden",
                    maxWidth: 300,
                    maxHeight: 200,
                    background: theme.colors.surface
                  }}
                >
                  <img
                    src={attachment.previewUrl}
                    alt={attachment.name}
                    css={{
                      maxWidth: 300,
                      maxHeight: 200,
                      objectFit: "contain",
                      display: "block",
                      opacity: 0.5
                    }}
                  />
                  <div
                    css={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: `${theme.colors.surface}88`
                    }}
                  >
                    <div
                      css={{
                        height: "100%",
                        width: `${progress}%`,
                        background: theme.colors.primary,
                        transition: "width 0.15s ease",
                        borderRadius: 2
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div
                  css={{
                    borderRadius: 8,
                    border: `1px solid ${theme.colors.surface}`,
                    padding: "7px 10px",
                    minWidth: 180,
                    maxWidth: 300,
                    background: "transparent",
                    overflow: "hidden",
                    position: "relative"
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <div
                      css={{
                        width: 30,
                        height: 30,
                        borderRadius: 6,
                        background: `${theme.colors.info}22`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: theme.colors.info
                      }}
                    >
                      <FileIcon size={15} weight="fill" />
                    </div>
                    <Stack spacing={0} css={{ minWidth: 0 }}>
                      <Typography
                        level="body-sm"
                        fontWeight="semiBold"
                        css={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {attachment.name}
                      </Typography>
                      <Typography level="body-xs" textColor="muted">
                        {formatBytes(attachment.size)}
                      </Typography>
                    </Stack>
                  </Stack>
                  <div
                    css={{
                      marginTop: 6,
                      height: 3,
                      borderRadius: 2,
                      background: `${theme.colors.surface}`,
                      overflow: "hidden"
                    }}
                  >
                    <div
                      css={{
                        height: "100%",
                        width: `${progress}%`,
                        background: theme.colors.primary,
                        transition: "width 0.15s ease",
                        borderRadius: 2
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Stack>
    );
  }
);

interface Props {
  message: MessageLike;
  repliedMessage?: MessageObject;
  header?: boolean;
}

export const Message = observer(
  ({ message, repliedMessage, header }: Props) => {
    const app = useAppStore();
    const { theme } = useTheme();
    const { openContextMenu } = useMenu();
    const channel = app.channels.active;
    const space = message.spaceId ? app.spaces.get(message.spaceId) : null;
    const me = space?.members.me;

    const isSent = message instanceof MessageObject;

    const hideSwitcher = () => {
      if (!app.memberListVisible) {
        app.setHideSwitcher(true);
      }
    };

    const showSwitcher = () => {
      if (!app.memberListVisible) {
        app.setHideSwitcher(false);
      }
    };

    const handleJumpToReplied = () => {
      if (!repliedMessage) return;
      const messageId = repliedMessage.id;

      const tryScroll = () => {
        const el = document.getElementById(`message-${messageId}`);
        if (!el) return false;
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        el.animate(
          [
            {
              backgroundColor: formatColor(theme.colors.info, {
                alpha: 50,
                format: "hexa"
              })
            },
            { backgroundColor: "transparent" }
          ],
          { duration: 2000, easing: "ease-out" }
        );
        return true;
      };

      if (tryScroll()) return;

      channel
        ?.getMessages(false, 50, undefined, undefined, messageId)
        .then(() => {
          requestAnimationFrame(() => tryScroll());
        });
    };

    const isFailed =
      message instanceof QueuedMessage &&
      message.status === QueuedMessageStatus.Failed;

    const stickerExpressions =
      "expressions" in message
        ? message.expressions.filter((e) => e.type === ExpressionType.Sticker)
        : [];

    const hasProperMention =
      message instanceof MessageInstance &&
      message.mentions.some(
        (mention) =>
          // Check if the user has been mentioned
          (mention.type === "user" && mention.id === app.account?.id) ||
          // Check if here or everyone was mentioned
          mention.type === "here" ||
          mention.type === "everyone" ||
          // Check if a role has been mentioned that the user belongs to
          (mention.type === "role" && me?.roles.has(mention.id))
      );

    const children = (
      <MessageBase
        onMouseEnter={hideSwitcher}
        onMouseLeave={showSwitcher}
        onDoubleClick={() => {
          if (isSent && !message.editing) {
            if (message.authorId !== app.account?.id)
              app.setReplyingTo(message);

            if (message.authorId === app.account?.id) message.setEditing(true);
          }
        }}
        onContextMenu={(event) => {
          if (!isSent || message.editing) return;

          openContextMenu(event, {
            type: "message",
            message
          });
        }}
        header={header}
        highlight={hasProperMention ? theme.colors.warning : null}
      >
        {header && message.type === MessageType.Reply && (
          <ReplySection
            onClick={repliedMessage ? handleJumpToReplied : undefined}
            style={{ cursor: repliedMessage ? "pointer" : "default" }}
          >
            <ReplyConnectorArea>
              <ReplyConnectorLine />
            </ReplyConnectorArea>
            <ReplyContent>
              {repliedMessage ? (
                <>
                  <UserAvatar
                    user={repliedMessage.author}
                    member={repliedMessage.member}
                    size="sm"
                  />
                  <ReplyAuthorName>
                    <Typography textColor="muted" level="body-xs">
                      {repliedMessage.author?.displayName ?? "Unknown"}
                    </Typography>
                  </ReplyAuthorName>
                  <ReplyContentText>
                    <MarkdownRenderer
                      textColor="muted"
                      level="body-xs"
                      value={repliedMessage.content ?? ""}
                    />
                  </ReplyContentText>
                </>
              ) : (
                <Typography
                  textColor="muted"
                  level="body-xs"
                  fontStyle="italic"
                >
                  Could not find the replied message
                </Typography>
              )}
            </ReplyContent>
          </ReplySection>
        )}

        <MessageRow header={header}>
          <MessageInfo>
            {header ? (
              <UserProfilePopoutTrigger
                placement="right"
                user={message.author!}
              >
                <UserAvatar
                  user={message.author}
                  member={message.member}
                  size="lg"
                  css={{
                    cursor: "pointer"
                  }}
                />
              </UserProfilePopoutTrigger>
            ) : (
              <MessageDetails message={message} position="left" />
            )}
          </MessageInfo>
          <MessageContent>
            {header && (
              <Stack flexShrink={0}>
                <MessageAuthor message={message} space={space} />
                <MessageDetails message={message} position="top" />
              </Stack>
            )}

            <MessageContentText
              sending={
                "status" in message &&
                message.status === QueuedMessageStatus.Sending
              }
            >
              {stickerExpressions.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
                  {stickerExpressions.map((sticker) => (
                    <MessageSticker key={sticker.id} sticker={sticker} />
                  ))}
                </Stack>
              )}
              {isSent && message.editing ? (
                <MessageInput
                  channel={channel}
                  message={message}
                  onStopEditing={() => message.setEditing(false)}
                />
              ) : (
                message.content &&
                (() => {
                  const GIF_URL_PATTERN =
                    /^https?:\/\/(klipy\.com\/gifs\/|tenor\.com\/|c\.tenor\.com\/|media\.tenor\.com\/|giphy\.com\/|media\.giphy\.com\/|i\.giphy\.com\/|imgur\.com\/|i\.imgur\.com\/|redgifs\.com\/|.*\.gif(\?\S*)?$)\S*$/i;

                  const hasGifEmbed =
                    "embeds" in message &&
                    message.embeds?.some((e) => e.type === "gifv");

                  const isOnlyGifUrl =
                    hasGifEmbed &&
                    GIF_URL_PATTERN.test(message.content.trim()) &&
                    !message.content.trim().includes(" ");

                  const hideInviteUrl =
                    "codedLinks" in message &&
                    shouldHideInviteUrlContent(
                      message.content,
                      message.codedLinks?.length ?? 0,
                    );

                  if (isOnlyGifUrl || hideInviteUrl) return null;
                  return (
                    <Stack alignItems="center" spacing={1.25}>
                      <MarkdownRenderer
                        textColor={isFailed ? theme.colors.danger : "primary"}
                        value={message.content}
                      />
                      {isSent && message.edited && (
                        <Tooltip
                          placement="right"
                          content={dayjs(message.updatedAt).format(
                            "dddd, MMMM D, YYYY h:mm A"
                          )}
                          offset={8}
                        >
                          <Typography
                            textColor="muted"
                            ml={0.25}
                            level="body-xs"
                          >
                            (edited)
                          </Typography>
                        </Tooltip>
                      )}
                    </Stack>
                  );
                })()
              )}
            </MessageContentText>

            {isSent && message.attachments.length > 0 && (
              <Stack direction="row" flexWrap="wrap" spacing={1} pb={0.25}>
                {message.attachments.map((attachment) => (
                  <MessageAttachment
                    key={attachment.id}
                    attachment={attachment}
                  />
                ))}
              </Stack>
            )}

            {message instanceof QueuedMessage &&
              message.pendingAttachments.length > 0 && (
                <PendingAttachments
                  attachments={message.pendingAttachments}
                  progress={message.progress}
                />
              )}

            {"embeds" in message && message.embeds.length > 0 && (
              <Stack pb={0.25}>
                {message.embeds.map((embed, index) => (
                  <MessageEmbed key={index} embed={embed} />
                ))}
              </Stack>
            )}

            {"codedLinks" in message && message.codedLinks.length > 0 && (
              <Stack pb={0.25} spacing={1}>
                {message.codedLinks.map((link) => (
                  <CodedLinkPreview key={link.code} link={link} />
                ))}
              </Stack>
            )}

            {isSent && <MessageReactions message={message} />}
          </MessageContent>
        </MessageRow>
      </MessageBase>
    );

    return isSent || isFailed ? (
      <MessageToolbar header={header} message={message}>
        {children}
      </MessageToolbar>
    ) : (
      children
    );
  }
);
