import { getSearchAuthorColor, getSearchDisplayName } from "@components/Channel/messageSearch.utils";
import { MessagePreviewContent } from "@components/Message/MessagePreviewContent";
import { Paper } from "@components/Paper";
import { UserAvatar } from "@components/User/UserAvatar";
import { useAppStore } from "@hooks/useStores";
import type { APIMessage } from "@mutualzz/types";
import { IconSlot, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { formatColor, styled } from "@mutualzz/ui-core";
import type { Space } from "@stores/objects/Space";
import { DeviceMobileIcon, ArrowBendUpLeftIcon } from "@phosphor-icons/react";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

const ResultCard = styled(Paper)({
  cursor: "pointer",
  borderRadius: 8,
  padding: "12px 14px",
  gap: 12,
  flexDirection: "row",
  alignItems: "flex-start",
  boxSizing: "border-box",
  minWidth: 0,
  overflow: "hidden",

  "&:hover .search-jump-hint": {
    opacity: 1,
  },

  "& img, & video, & iframe": {
    maxWidth: "100%",
  },
});

const JumpHint = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  opacity: 0.45,
  color: theme.typography.colors.muted,
  pointerEvents: "none",
  transition: "opacity 120ms ease",
  flexShrink: 0,
}));

function formatMessageTime(date: Date) {
  const parsed = dayjs(date);
  if (parsed.isSame(dayjs(), "day")) {
    return parsed.format("h:mm A");
  }
  if (parsed.isSame(dayjs().subtract(1, "day"), "day")) {
    return `Yesterday ${parsed.format("h:mm A")}`;
  }
  return parsed.format("M/D/YYYY h:mm A");
}

interface RowProps {
  message: APIMessage;
  space?: Space | null;
  onClick: () => void;
}

export const MessageSearchResultRow = observer(
  ({ message, space, onClick }: RowProps) => {
    const app = useAppStore();
    const { theme } = useTheme();
    const { t } = useTranslation("chat");
    const author = message.author;
    const presence = author ? app.presence.get(author.id) : undefined;
    const isMobile = presence?.device === "mobile";

    const primaryTextColor = theme.typography.colors.primary || "#dbdee1";

    return (
      <ResultCard
        variant="elevation"
        elevation={1}
        surfaceRole="card"
        onClick={onClick}
        aria-label={t("pins.jump")}
      >
        <UserAvatar user={author ?? undefined} size="sm" badge={false} />
        <Stack direction="column" spacing={0.4} flex={1} minWidth={0}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Stack direction="row" alignItems="center" spacing={0.5} minWidth={0}>
              <Typography
                level="label-sm"
                weight="bold"
                textColor={
                  author
                    ? getSearchAuthorColor(app, author, space, {
                        showRoleColors:
                          app.settings?.showRoleColorsInMessages ?? false,
                        primaryTextColor,
                      })
                    : "inherit"
                }
                css={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {author
                  ? getSearchDisplayName({ app, space, author })
                  : t("unknownUser")}
              </Typography>
              {isMobile ? (
                <IconSlot size={12} css={{ color: "#faa81a", flexShrink: 0 }}>
                  <DeviceMobileIcon weight="fill" />
                </IconSlot>
              ) : null}
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.75} flexShrink={0}>
              <Typography level="body-xs" textColor="muted">
                {formatMessageTime(new Date(message.createdAt))}
              </Typography>
              <JumpHint className="search-jump-hint" direction="row" alignItems="center" spacing={0.25}>
                <IconSlot size={13}>
                  <ArrowBendUpLeftIcon weight="bold" />
                </IconSlot>
                <Typography level="body-xs" weight={600} css={{ color: "inherit" }}>
                  {t("pins.jump")}
                </Typography>
              </JumpHint>
            </Stack>
          </Stack>

          <MessagePreviewContent message={message} preview />
        </Stack>
      </ResultCard>
    );
  },
);

export const SearchChannelGroupHeader = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  padding: "6px 10px",
  borderRadius: 6,
  backgroundColor: "rgba(255, 255, 255, 0.04)",
  border: `1px solid ${formatColor(theme.colors.neutral, { alpha: 0.08, format: "hexa" })}`,
}));

export const SearchResultsList = styled(Stack)({
  flex: "1 1 auto",
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",
  padding: "8px 14px 16px",
  gap: 10,
});

export const SearchResultsHeaderBar = styled(Stack)({
  flexShrink: 0,
  padding: "14px 12px 10px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
});
