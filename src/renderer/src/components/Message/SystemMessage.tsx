import { observer } from "mobx-react-lite";
import {
  MessageBase,
  MessageContent,
  MessageInfo
} from "@components/Message/MessageBase";
import { Message, MessageLike } from "@stores/objects/Message";
import { UserAvatar } from "@components/User/UserAvatar";
import { MessageAuthor } from "@components/Message/MessageAuthor";
import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import { IconSlot, Link, Stack, Typography } from "@mutualzz/ui-web";
import { MessageEmbed } from "@components/Message/MessageEmbed";
import { EyeIcon, PhoneSlashIcon } from "@phosphor-icons/react";
import { isCallNoticeMessage } from "@mutualzz/client";
import { useTranslation } from "react-i18next";

interface Props {
  message: MessageLike;
}

export const SystemMessage = observer(({ message }: Props) => {
  const { t } = useTranslation("chat");
  let highlight = false;
  const isEphemeral =
    message instanceof Message && message.flags.has("Ephemeral");
  if (isEphemeral) highlight = true;

  if (isCallNoticeMessage(message)) {
    return (
      <MessageBase header system>
        <MessageInfo>
          <IconSlot size={20}>
            <PhoneSlashIcon weight="fill" />
          </IconSlot>
        </MessageInfo>
        <MessageContent>
          <Typography level="body-sm" textColor="secondary">
            {message.content}
          </Typography>
        </MessageContent>
      </MessageBase>
    );
  }

  return (
    <MessageBase header system highlight={highlight}>
      <MessageInfo>
        <UserAvatar user={message.author} member={message.member} size="lg" />
      </MessageInfo>
      <MessageContent>
        <MessageAuthor message={message} />
        {message.content && <MarkdownRenderer value={message.content} />}
        {"embeds" in message && message.embeds.length > 0 && (
          <Stack pb={0.25}>
            {message.embeds.map((embed, index) => (
              <MessageEmbed key={index} embed={embed} />
            ))}
          </Stack>
        )}
        {isEphemeral && (
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <IconSlot size={14}>
              <EyeIcon />
            </IconSlot>
            <Typography level="label-xs" textColor="secondary">
              {t("system.ephemeralOnlyYou")}
            </Typography>
            <Link textColor="accent" onClick={() => message.dismiss()}>
              {t("system.dismissMessage")}
            </Link>
          </Stack>
        )}
      </MessageContent>
    </MessageBase>
  );
});
