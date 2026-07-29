import { Button } from "@components/Button";
import { MessagePreviewContent } from "@components/Message/MessagePreviewContent";
import { UserAvatar } from "@components/User/UserAvatar";
import { useAppStore } from "@hooks/useStores";
import type { APIMessage, APIUser } from "@mutualzz/types";
import { getMessageAuthorColor } from "@mutualzz/client";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import type { ColorLike } from "@mutualzz/ui-core";
import { styled } from "@mutualzz/ui-core";
import type { AppStore } from "@stores/App.store";
import type { Space } from "@stores/objects/Space";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

interface Props {
  message: APIMessage;
  space?: Space | null;
  onJump: () => void;
}

const PinCard = styled(Stack)(({ theme }) => ({
  position: "relative",
  boxSizing: "border-box",
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
  overflow: "hidden",
  padding: "12px 16px",
  gap: 8,
  borderTop: `1px solid ${theme.colors.neutral}55`,

  "&:first-of-type": {
    borderTop: "none",
  },

  "&:hover .pin-jump-btn": {
    opacity: 1,
  },

  "& img, & video, & iframe": {
    maxWidth: "100%",
  },
}));

const MessageBody = styled(Stack)({
  minWidth: 0,
  maxWidth: "100%",
  overflow: "hidden",
  wordBreak: "break-word",
});

const JumpButton = styled(Button)({
  position: "absolute",
  top: 10,
  right: 12,
  opacity: 0,
  transition: "opacity 120ms ease",
  zIndex: 1,
});

function authorColor(
  app: AppStore,
  user: APIUser,
  space: Space | null | undefined,
  primaryTextColor: string,
): ColorLike {
  const member = space?.members.get(user.id);
  return getMessageAuthorColor({
    showRoleColors: app.settings?.showRoleColorsInMessages ?? false,
    primaryTextColor,
    roleColor: member?.highestRole?.color,
    accentColor: app.users.get(user.id)?.accentColor ?? user.accentColor,
  }) as ColorLike;
}

function authorName(user: APIUser, space: Space | null | undefined) {
  const member = space?.members.get(user.id);
  return member?.displayName ?? user.globalName ?? user.username;
}

export const PinnedMessageCard = observer(({ message, space, onJump }: Props) => {
  const { t } = useTranslation("chat");
  const app = useAppStore();
  const { theme } = useTheme();
  const author = message.author;
  const primaryTextColor = theme.typography.colors.primary || "#dbdee1";

  const displayName = author ? authorName(author, space) : t("unknownUser");
  const showUsername =
    author &&
    displayName.toLowerCase() !== author.username.toLowerCase();

  return (
    <PinCard direction="column">
      <JumpButton
        className="pin-jump-btn"
        size="sm"
        variant="solid"
        color="neutral"
        onClick={(event) => {
          event.stopPropagation();
          onJump();
        }}
      >
        {t("pins.jump")}
      </JumpButton>

      <Stack direction="row" spacing={1.25} alignItems="flex-start" pr={6} minWidth={0}>
        <UserAvatar user={author ?? undefined} size="md" badge={false} />

        <MessageBody direction="column" spacing={0.75} flex={1}>
          <Stack
            direction="row"
            alignItems="baseline"
            justifyContent="space-between"
            spacing={1}
          >
            <Stack
              direction="row"
              alignItems="baseline"
              spacing={0.5}
              minWidth={0}
              flex={1}
            >
              <Typography
                level="label-sm"
                weight="bold"
                textColor={
                  author
                    ? authorColor(app, author, space, primaryTextColor)
                    : "inherit"
                }
                css={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {displayName}
              </Typography>
              {showUsername && author && (
                <Typography
                  level="body-xs"
                  textColor="muted"
                  css={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flexShrink: 1,
                  }}
                >
                  ({author.username})
                </Typography>
              )}
            </Stack>

            <Typography level="body-xs" textColor="muted" flexShrink={0}>
              {dayjs(message.createdAt).format("M/D/YYYY h:mm A")}
            </Typography>
          </Stack>

          <MessagePreviewContent message={message} />
        </MessageBody>
      </Stack>
    </PinCard>
  );
});
