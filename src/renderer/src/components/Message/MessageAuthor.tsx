import { Stack, Typography } from "@mutualzz/ui-web";
import type { MessageLike } from "@stores/objects/Message";
import type { Space } from "@stores/objects/Space";
import { observer } from "mobx-react-lite";
import type { ColorLike } from "@mutualzz/ui-core";
import { useTranslation } from "react-i18next";
import { isSystemMessageType, isSystemUser } from "@mutualzz/client";
import { UserProfilePopoutTrigger } from "../Profile/popout/UserProfilePopoutTrigger";

interface Props {
  message: MessageLike;
  space?: Space | null;
}

export const MessageAuthor = observer(({ message, space }: Props) => {
  const { t } = useTranslation("chat");
  const author = message.author;
  if (!author) {
    return <Typography>{t("unknown")}</Typography>;
  }

  if (isSystemUser(author) && !isSystemMessageType(message.type)) {
    return <Typography>{t("unknown")}</Typography>;
  }

  const member = space?.members.get(message.authorId) || null;
  const nameColor = (member?.highestRole?.color ?? "#99958ed") as ColorLike;
  const displayName = member
    ? member.displayName
    : author.displayName;
  const pronouns = author.pronouns;

  return (
    <UserProfilePopoutTrigger placement="right" user={author}>
      <Stack direction="row" alignItems="center" spacing={0.75} minWidth={0}>
        <Typography
          css={{
            cursor: "pointer",
            ":hover": {
              textDecoration: "underline"
            }
          }}
          textColor={nameColor}
        >
          {displayName}
        </Typography>
        {pronouns ? (
          <>
            <Typography level="body-sm" textColor="muted">
              ·
            </Typography>
            <Typography level="body-sm" textColor="muted">
              {pronouns}
            </Typography>
          </>
        ) : null}
      </Stack>
    </UserProfilePopoutTrigger>
  );
});
