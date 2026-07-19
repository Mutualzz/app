import { formatColor, styled } from "@mutualzz/ui-core";
import { Stack } from "@mutualzz/ui-web";
import { Message, type MessageLike } from "@stores/objects/Message";
import { calendarStrings } from "@utils/i18n";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import type { HTMLAttributes, PropsWithChildren } from "react";
import { Tooltip } from "@components/Tooltip";

interface Props extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {
  header?: boolean;
  highlight?: boolean | string | null;
  system?: boolean;
}

export const MessageBase = styled("div")<Props>(
  ({ header, highlight, theme, system }) => ({
    display: "flex",
    overflow: "hidden",
    flexDirection: system ? "row" : "column",
    ...(header && {
      marginTop: 10
    }),
    paddingTop: "0.2rem",
    paddingBottom: "0.2rem",
    ...(highlight && {
      borderLeft: `2px solid ${typeof highlight === "string" ? highlight : theme.colors.info}`,
      background: `linear-gradient(135deg, ${formatColor(
        typeof highlight === "string" ? highlight : theme.colors.info,
        { alpha: 12, format: "hexa" }
      )} 0%, rgba(255, 255, 255, 0) 100%)`
    })
  })
);

export const MessageRow = styled("div")<{ header?: boolean }>(({ header }) => ({
  display: "flex",
  flexDirection: "row",
  ...(!header && {
    alignItems: "center"
  })
}));

export const ReplySection = styled("div")({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 2
});

export const ReplyConnectorArea = styled("div")({
  width: 62,
  flexShrink: 0,
  alignSelf: "stretch",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "flex-end",
  paddingRight: 4
});

export const ReplyConnectorLine = styled("div")(({ theme }) => ({
  width: 26,
  height: 14,
  borderLeft: `2px solid ${theme.typography.colors.muted}`,
  borderTop: `2px solid ${theme.typography.colors.muted}`,
  borderTopLeftRadius: 6,
  opacity: 0.35
}));

export const ReplyContent = styled("div")({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  cursor: "pointer"
});

export const ReplyContentText = styled("div")({
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
});

export const ReplyAuthorName = styled("div")({
  flexShrink: 0,
  display: "flex",
  alignItems: "center"
});

export const MessageInfo = styled("div")(({ theme }) => ({
  width: 62,
  display: "flex",
  flexShrink: 0,
  paddingTop: 2,
  flexDirection: "row",
  justifyContent: "center",

  "time, .edited": {
    opacity: 0,
    fontSize: 12,
    color: theme.typography.colors.muted
  }
}));

export const MessageContent = styled("div")({
  position: "relative",
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  paddingRight: 48,
  wordWrap: "break-word",
  flex: 1
});

export const MessageContentText = styled("div")<{
  sending?: boolean;
}>(({ sending }) => ({
  ...(sending && {
    opacity: 0.5
  })
}));

export const DetailsBase = styled("div")(({ theme }) => ({
  flexShrink: 0,
  fontSize: 12,
  display: "inline-flex",
  color: theme.typography.colors.muted,
  alignSelf: "center",

  ".edited": {
    cursor: "default",
    userSelect: "none"
  }
}));

export const MessageDetails = observer(
  ({
    message,
    position
  }: {
    message: MessageLike;
    position: "left" | "top";
  }) => {
    if (position === "left") {
      if (message instanceof Message && message.edited) {
        return (
          <Stack direction="column">
            <Tooltip
              placement="top"
              content={dayjs(message.createdAt).format(
                "dddd, MMMM D, YYYY h:mm A"
              )}
            >
              <time
                className="copyTime"
                dateTime={message.createdAt.toISOString()}
              >
                {dayjs(message.createdAt).format("h:mm A")}
              </time>
            </Tooltip>
          </Stack>
        );
      }

      return (
        <Tooltip
          placement="left"
          content={dayjs(message.createdAt).format("dddd, MMMM D, YYYY h:mm A")}
        >
          <time dateTime={message.createdAt.toISOString()}>
            {dayjs(message.createdAt).format("h:mm A")}
          </time>
        </Tooltip>
      );
    }

    return (
      <DetailsBase>
        <Tooltip
          placement="top"
          content={dayjs(message.createdAt).format("dddd, MMMM D, YYYY h:mm A")}
        >
          <time className="copyTime" dateTime={message.createdAt.toISOString()}>
            {dayjs(message.createdAt).calendar(undefined, calendarStrings)}
          </time>
        </Tooltip>
      </DetailsBase>
    );
  }
);
