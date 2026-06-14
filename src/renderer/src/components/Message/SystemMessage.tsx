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
import { Link, Stack, Typography } from "@mutualzz/ui-web";
import { MessageEmbed } from "@components/Message/MessageEmbed";
import { EyeIcon } from "@phosphor-icons/react";

interface Props {
  message: MessageLike;
}

export const SystemMessage = observer(({ message }: Props) => {
  let highlight = false;
  const isEphemeral =
    message instanceof Message && message.flags.has("Ephemeral");
  if (isEphemeral) highlight = true;

  return (
    <MessageBase header highlight={highlight}>
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
          <Typography
            direction="row"
            display="flex"
            spacing={0.75}
            alignItems="center"
            level="body-xs"
            textColor="secondary"
          >
            <EyeIcon />
            Only you can see this •
            <Link textColor="accent" onClick={() => message.dismiss()}>
              Dismiss message
            </Link>
          </Typography>
        )}
      </MessageContent>
    </MessageBase>
  );
});
