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
import { MessageToolbar } from "./MessageToolbar";
import { MessageInput } from "./MessageInput";
import { MessageSticker } from "./MessageSticker";
import { MessageReactions } from "./MessageReactions";
import dayjs from "dayjs";
import { Tooltip } from "@components/Tooltip";
import { ExpressionType, MessageType } from "@mutualzz/types";

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
                    <Typography textColor="muted" level="body-xs">
                      {repliedMessage.content}
                    </Typography>
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
              <UserAvatar
                user={message.author}
                member={message.member}
                size="lg"
                popout
              />
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

                  if (isOnlyGifUrl) return null;
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

            {"embeds" in message && message.embeds.length > 0 && (
              <Stack pb={0.25}>
                {message.embeds.map((embed, index) => (
                  <MessageEmbed key={index} embed={embed} />
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
