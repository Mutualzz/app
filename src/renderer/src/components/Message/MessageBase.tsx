import { formatColor, styled } from "@mutualzz/ui-core";
import { Stack } from "@mutualzz/ui-web";
import { Message, type MessageLike } from "@stores/objects/Message";
import { calendarStrings } from "@mutualzz/client";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import type { HTMLAttributes, PropsWithChildren } from "react";
import { Tooltip } from "@components/Tooltip";
import { useAppStore } from "@hooks/useStores";

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
      marginTop: "var(--message-density-header-margin-top, 0.625rem)"
    }),
    paddingTop: "var(--message-density-padding-y, 0.2rem)",
    paddingBottom: "var(--message-density-padding-y, 0.2rem)",
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
    alignItems: "center",
  }),
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

export const MessageInfo = styled("div")<{ $showTime?: boolean }>(
  ({ theme, $showTime }) => ({
    width: 62,
    display: "flex",
    flexShrink: 0,
    paddingTop: 2,
    flexDirection: "row",
    justifyContent: "center",

    "time, .edited": {
      opacity: $showTime ? 1 : 0,
      fontSize: 12,
      color: theme.typography.colors.muted,
    },
  }),
);

export const MessageContent = styled("div")({
  position: "relative",
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  paddingRight: 48,
  wordWrap: "break-word",
  flex: 1,
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
    const app = useAppStore();
    const timestampFormat =
      app.settings?.extendedSettings.timestampFormat ?? "relative";
    const fullTimestamp = dayjs(message.createdAt).format(
      "dddd, MMMM D, YYYY h:mm A"
    );
    const absoluteTime = dayjs(message.createdAt).format("h:mm A");
    const relativeTime = dayjs(message.createdAt).calendar(
      undefined,
      calendarStrings
    );
    const headerTime =
      timestampFormat === "absolute" ? absoluteTime : relativeTime;
    const compactTime = absoluteTime;

    if (position === "left") {
      if (message instanceof Message && message.edited) {
        return (
          <Stack direction="column">
            <Tooltip placement="top" content={fullTimestamp}>
              <time
                className="copyTime"
                dateTime={message.createdAt.toISOString()}
              >
                {compactTime}
              </time>
            </Tooltip>
          </Stack>
        );
      }

      return (
        <Tooltip placement="left" content={fullTimestamp}>
          <time dateTime={message.createdAt.toISOString()}>{compactTime}</time>
        </Tooltip>
      );
    }

    return (
      <DetailsBase>
        <Tooltip placement="top" content={fullTimestamp}>
          <time className="copyTime" dateTime={message.createdAt.toISOString()}>
            {headerTime}
          </time>
        </Tooltip>
      </DetailsBase>
    );
  }
);
