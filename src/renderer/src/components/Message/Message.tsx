import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import { UserAvatar } from "@components/User/UserAvatar";
import { useAppStore } from "@hooks/useStores";
import { Stack, Tooltip, Typography, useTheme } from "@mutualzz/ui-web";
import {
  Message as MessageType,
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
  MessageInfo
} from "./MessageBase";
import { MessageEmbed } from "./MessageEmbed";
import { MessageToolbar } from "./MessageToolbar";
import { MessageInput } from "./MessageInput";
import { TooltipWrapper } from "@components/TooltipWrapper";
import dayjs from "dayjs";

interface Props {
  message: MessageLike;
  header?: boolean;
}

export const Message = observer(({ message, header }: Props) => {
  const app = useAppStore();
  const { theme } = useTheme();
  const channel = app.channels.active;
  const space = message.spaceId ? app.spaces.get(message.spaceId) : null;
  const me = space?.members.me;

  const isSent = message instanceof MessageType;

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

  const isFailed =
    message instanceof QueuedMessage &&
    message.status === QueuedMessageStatus.Failed;

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
      header={header}
      highlight={hasProperMention ? theme.colors.warning : null}
    >
      <MessageInfo>
        {header ? (
          <UserAvatar user={message.author} size="lg" />
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
          {isSent && message.editing ? (
            <MessageInput
              channel={channel}
              message={message}
              onStopEditing={() => message.setEditing(false)}
            />
          ) : (
            message.content &&
            (() => {
              const hasGifEmbed =
                "embeds" in message &&
                message.embeds?.some((e) => e.type === "gifv");
              const isKlipyUrl = /^https:\/\/klipy\.com\/gifs\/\S+$/.test(
                message.content.trim()
              );
              if (hasGifEmbed && isKlipyUrl) return null;
              return (
                <Stack alignItems="center" spacing={1.25}>
                  <MarkdownRenderer
                    textColor={isFailed ? theme.colors.danger : "primary"}
                    value={message.content}
                    spaceId={message.spaceId}
                  />
                  {isSent && message.edited && (
                    <Tooltip
                      placement="right"
                      content={
                        <TooltipWrapper>
                          {dayjs(message.updatedAt).format(
                            "dddd, MMMM D, YYYY h:mm A"
                          )}
                        </TooltipWrapper>
                      }
                      offset={8}
                    >
                      <Typography textColor="muted" ml={0.25} level="body-xs">
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
      </MessageContent>
    </MessageBase>
  );

  return isSent || isFailed ? (
    <MessageToolbar header={header} message={message}>
      {children}
    </MessageToolbar>
  ) : (
    children
  );
});
