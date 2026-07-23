import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import {
  DetailsBase,
  MessageBase,
  MessageContent,
  MessageContentText,
  MessageInfo,
  MessageRow,
} from "@components/Message/MessageBase";
import { MinecraftAvatar } from "@components/Minecraft/MinecraftAvatar";
import { RemoteAvatar } from "@components/Minecraft/RemoteAvatar";
import { Tooltip } from "@components/Tooltip";
import { UserAvatar } from "@components/User/UserAvatar";
import { useAppStore } from "@hooks/useStores";
import { Avatar, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { CubeIcon } from "@phosphor-icons/react";
import type { BridgeFeedEntry } from "@stores/BridgeChat.store";
import { calendarStrings } from "@mutualzz/client";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

interface Props {
  entry: BridgeFeedEntry;
  header?: boolean;
}

export const bridgeAuthorKey = (entry: BridgeFeedEntry) =>
  entry.uuid ??
  entry.userId ??
  entry.linkedUser?.id ??
  `${entry.source}:${entry.name}`;

export const shouldStartBridgeGroup = (
  prev: BridgeFeedEntry | undefined,
  entry: BridgeFeedEntry,
) => {
  if (!prev) return true;
  if (entry.kind !== "chat" || prev.kind !== "chat") return true;
  if (bridgeAuthorKey(prev) !== bridgeAuthorKey(entry)) return true;
  if (prev.source !== entry.source) return true;
  const prevAt = new Date(prev.at);
  const at = new Date(entry.at);
  if (prevAt.toDateString() !== at.toDateString()) return true;
  return at.getTime() - prevAt.getTime() > 10 * 60 * 1000;
};

const BridgeAvatar = observer(
  ({ entry, size = "lg" }: { entry: BridgeFeedEntry; size?: "sm" | "lg" }) => {
    const app = useAppStore();
    const pixelSize = size === "lg" ? 48 : 24;

    if (entry.avatarUrl) {
      return (
        <RemoteAvatar src={entry.avatarUrl} name={entry.name} size={pixelSize} />
      );
    }

    const linkedId = entry.linkedUser?.id ?? entry.userId;
    if (linkedId) {
      const user =
        app.users.get(linkedId) ??
        (app.account?.id === linkedId ? app.account : null);
      if (user) return <UserAvatar user={user} size={size} />;
    }

    if (entry.uuid) {
      return (
        <MinecraftAvatar uuid={entry.uuid} name={entry.name} size={size} />
      );
    }

    return (
      <Avatar size={pixelSize} color="neutral" variant="soft" shape="circle">
        <CubeIcon weight="fill" />
      </Avatar>
    );
  },
);

const BridgeTimestamp = ({
  at,
  position,
}: {
  at: string;
  position: "left" | "top";
}) => {
  const date = dayjs(at);

  if (position === "left") {
    return (
      <Tooltip
        placement="left"
        content={date.format("dddd, MMMM D, YYYY h:mm A")}
      >
        <time dateTime={date.toISOString()}>{date.format("h:mm A")}</time>
      </Tooltip>
    );
  }

  return (
    <DetailsBase>
      <Tooltip
        placement="top"
        content={date.format("dddd, MMMM D, YYYY h:mm A")}
      >
        <time className="copyTime" dateTime={date.toISOString()}>
          {date.calendar(undefined, calendarStrings)}
        </time>
      </Tooltip>
    </DetailsBase>
  );
};

export const BridgeMessage = observer(({ entry, header }: Props) => {
  const { t } = useTranslation("settings");
  const { theme } = useTheme();
  const app = useAppStore();

  const sourceLabel =
    entry.source === "minecraft"
      ? t("minecraftBridge.liveSourceMinecraft")
      : entry.source === "discord"
        ? t("minecraftBridge.liveSourceDiscord")
        : t("minecraftBridge.liveSourceApp");

  if (entry.kind !== "chat") {
    const label =
      entry.kind === "join"
        ? t("minecraftBridge.liveJoined", { name: entry.name })
        : entry.kind === "leave"
          ? t("minecraftBridge.liveLeft", { name: entry.name })
          : entry.kind === "voice_join"
            ? t("minecraftBridge.liveVoiceJoined", {
                name: entry.name,
                channel: entry.content
                  ? `#${entry.content}`
                  : t("minecraftBridge.liveVoiceFallback"),
              })
            : t("minecraftBridge.liveVoiceLeft", {
                name: entry.name,
                channel: entry.content
                  ? `#${entry.content}`
                  : t("minecraftBridge.liveVoiceFallback"),
              });

    return (
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        px={1}
        py={0.5}
        width="100%"
        maxWidth="100%"
        minWidth={0}
        css={{
          flex: "0 0 auto",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {entry.uuid ? (
          <MinecraftAvatar uuid={entry.uuid} name={entry.name} size={22} />
        ) : (
          <Avatar size={22} color="neutral" variant="soft" shape="circle">
            <CubeIcon weight="fill" size={12} />
          </Avatar>
        )}
        <Typography
          level="body-sm"
          textColor="muted"
          css={{
            flex: "1 1 auto",
            minWidth: 0,
            overflowWrap: "anywhere",
          }}
        >
          {label}
        </Typography>
      </Stack>
    );
  }

  const hideSwitcher = () => {
    if (!app.memberListVisible) app.setHideSwitcher(true);
  };
  const showSwitcher = () => {
    if (!app.memberListVisible) app.setHideSwitcher(false);
  };

  return (
    <MessageBase
      header={header}
      onMouseEnter={hideSwitcher}
      onMouseLeave={showSwitcher}
      css={{
        flex: "0 0 auto",
        maxWidth: "100%",
        "&:hover time": { opacity: 1 },
      }}
    >
      <MessageRow header={header}>
        <MessageInfo>
          {header ? (
            <BridgeAvatar entry={entry} size="lg" />
          ) : (
            <BridgeTimestamp at={entry.at} position="left" />
          )}
        </MessageInfo>
        <MessageContent>
          {header && (
            <Stack flexShrink={0} direction="row" alignItems="baseline">
              <Typography>{entry.name}</Typography>
              <Typography
                level="body-xs"
                textColor="muted"
                css={{ paddingLeft: 6 }}
              >
                {sourceLabel}
              </Typography>
              <BridgeTimestamp at={entry.at} position="top" />
              {entry.pending && (
                <Typography
                  level="body-xs"
                  textColor="muted"
                  css={{ paddingLeft: 6 }}
                >
                  {t("minecraftBridge.pendingSend")}
                </Typography>
              )}
              {entry.failed && (
                <Typography
                  level="body-xs"
                  textColor="muted"
                  css={{ paddingLeft: 6 }}
                >
                  {t("minecraftBridge.failedSend")}
                </Typography>
              )}
            </Stack>
          )}
          <MessageContentText sending={Boolean(entry.pending)}>
            {entry.content && (
              <MarkdownRenderer
                textColor={
                  entry.failed ? theme.colors.danger : "primary"
                }
                value={entry.content}
              />
            )}
          </MessageContentText>
        </MessageContent>
      </MessageRow>
    </MessageBase>
  );
});
