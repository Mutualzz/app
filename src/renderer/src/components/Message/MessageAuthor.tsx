import { Typography } from "@mutualzz/ui-web";
import type { MessageLike } from "@stores/objects/Message";
import type { Space } from "@stores/objects/Space";
import { observer } from "mobx-react-lite";
import { ColorLike } from "@mutualzz/ui-core";
import { UserProfilePopoutTrigger } from "../Profile/popout/UserProfilePopoutTrigger";

interface Props {
  message: MessageLike;
  space?: Space | null;
}

export const MessageAuthor = observer(({ message, space }: Props) => {
  const member = space?.members.get(message.authorId) || null;
  const nameColor = (member?.highestRole?.color ?? "#99958ed") as ColorLike;

  return (
    <UserProfilePopoutTrigger placement="right" user={message.author!}>
      <Typography
        css={{
          cursor: "pointer",
          ":hover": {
            textDecoration: "underline"
          }
        }}
        textColor={nameColor}
      >
        {member ? member.displayName : message.author?.displayName}
      </Typography>
    </UserProfilePopoutTrigger>
  );
});
