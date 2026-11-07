import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import {
  DetailsBase,
  MessageBase,
  MessageContent,
  MessageContentText,
  MessageInfo,
  MessageRow
} from "@components/Message/MessageBase";
import { MinecraftAvatar } from "@components/Minecraft/MinecraftAvatar";
import { RemoteAvatar } from "@components/Minecraft/RemoteAvatar";
import { Tooltip } from "@components/Tooltip";
import { UserAvatar } from "@components/User/UserAvatar";
import { useAppStore } from "@hooks/useStores";
import { Avatar, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import {
  CaretDownIcon,
  CubeIcon,
  DiscordLogoIcon,
  SignInIcon,
  SignOutIcon,
  SkullIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
  TrophyIcon,
  UsersThreeIcon
} from "@phosphor-icons/react";
import type {
  BridgeAdvancementDetails,
  BridgeFeedEntry
} from "@stores/BridgeChat.store";
import { SlotIcon } from "@components/Minecraft/inventory/ItemIcons";
import { calendarStrings } from "@mutualzz/client";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { themeColorVar, typographyColorVar } from "@mutualzz/ui-core";

interface Props {
  entry: BridgeFeedEntry;
  header?: boolean;
}

const SOURCE_LABEL_KEYS = {
  minecraft: "minecraftBridge.liveSourceMinecraft",
  discord: "minecraftBridge.liveSourceDiscord",
  app: "minecraftBridge.liveSourceApp"
} as const;

const SOURCE_COLORS = {
  minecraft: "#62B246",
  discord: "#5865F2",
  app: themeColorVar("primary")
} satisfies Record<BridgeFeedEntry["source"], string>;

const SourceBadge = ({
  source,
  label
}: {
  source: BridgeFeedEntry["source"];
  label: string;
}) => {
  const color = SOURCE_COLORS[source];

  return (
    <Tooltip content={label} placement="top">
      <Stack
        alignItems="center"
        justifyContent="center"
        alignSelf="center"
        css={{
          margin: "0 6px",
          width: 18,
          height: 18,
          borderRadius: 4,
          flexShrink: 0,
          color,
          backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`
        }}
      >
        {source === "minecraft" && <CubeIcon weight="fill" size={12} />}
        {source === "discord" && <DiscordLogoIcon weight="fill" size={12} />}
        {source === "app" && (
          <img alt="" src="/icon.png" width={12} height={12} />
        )}
      </Stack>
    </Tooltip>
  );
};

type BridgeEventKind = Exclude<BridgeFeedEntry["kind"], "chat">;

const EVENT_STYLE = {
  join: { Icon: SignInIcon, color: themeColorVar("success") },
  leave: { Icon: SignOutIcon, color: typographyColorVar("muted") },
  voice_join: { Icon: SpeakerHighIcon, color: themeColorVar("success") },
  voice_leave: { Icon: SpeakerSlashIcon, color: typographyColorVar("muted") },
  death: { Icon: SkullIcon, color: themeColorVar("danger") },
  advancement: { Icon: TrophyIcon, color: themeColorVar("warning") }
} satisfies Record<BridgeEventKind, { Icon: typeof CubeIcon; color: string }>;

export const bridgeAuthorKey = (entry: BridgeFeedEntry) =>
  entry.uuid ??
  entry.userId ??
  entry.linkedUser?.id ??
  `${entry.source}:${entry.name}`;

export const shouldStartBridgeGroup = (
  prev: BridgeFeedEntry | undefined,
  entry: BridgeFeedEntry
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
        <RemoteAvatar
          src={entry.avatarUrl}
          name={entry.name}
          size={pixelSize}
        />
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
  }
);

const BridgeTimestamp = ({
  at,
  position,
  tooltipPlacement = "left"
}: {
  at: string;
  position: "left" | "top";
  tooltipPlacement?: "left" | "right";
}) => {
  const date = dayjs(at);

  if (position === "left") {
    return (
      <Tooltip
        placement={tooltipPlacement}
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

const EventText = ({
  label,
  name,
  accentColor
}: {
  label: string;
  name: string;
  accentColor: string;
}) => {
  const nameIndex = name ? label.indexOf(name) : -1;
  const before = nameIndex >= 0 ? label.slice(0, nameIndex) : "";
  const after = nameIndex >= 0 ? label.slice(nameIndex + name.length) : label;
  const parts = after.split(/(\[[^\]]+\])/);

  return (
    <>
      {before}
      {nameIndex >= 0 && (
        <span css={{ color: typographyColorVar("primary"), fontWeight: 600 }}>
          {name}
        </span>
      )}
      {parts.map((part, index) =>
        part.startsWith("[") && part.endsWith("]") ? (
          <span key={index} css={{ color: accentColor, fontWeight: 600 }}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

const ADVANCEMENT_FRAME_STYLE = {
  task: {
    color: themeColorVar("warning"),
    labelKey: "minecraftBridge.advancementFrameTask"
  },
  goal: {
    color: themeColorVar("warning"),
    labelKey: "minecraftBridge.advancementFrameGoal"
  },
  challenge: {
    color: "#A855F7",
    labelKey: "minecraftBridge.advancementFrameChallenge"
  }
} as const satisfies Record<BridgeAdvancementDetails["frame"], unknown>;

const AdvancementCard = ({
  entry,
  details
}: {
  entry: BridgeFeedEntry;
  details: BridgeAdvancementDetails;
}) => {
  const { t } = useTranslation("settings");
  const { color, labelKey } = ADVANCEMENT_FRAME_STYLE[details.frame];

  return (
    <MessageBase system css={{ flex: "0 0 auto", maxWidth: "100%" }}>
      <MessageInfo css={{ paddingTop: 2 }}>
        <TrophyIcon weight="fill" size={18} css={{ color }} />
      </MessageInfo>
      <Stack direction="column" spacing={1} flex={1} minWidth={0}>
        <Stack direction="row" alignItems="center" spacing={1} minWidth={0}>
          {entry.uuid && (
            <MinecraftAvatar uuid={entry.uuid} name={entry.name} size={20} />
          )}
          <Typography
            level="body-sm"
            textColor="secondary"
            css={{ minWidth: 0, overflowWrap: "anywhere" }}
          >
            <span
              css={{ color: typographyColorVar("primary"), fontWeight: 600 }}
            >
              {entry.name}
            </span>{" "}
            {t(labelKey)}
          </Typography>
          <Typography level="body-xs" textColor="muted" css={{ flexShrink: 0 }}>
            <BridgeTimestamp
              at={entry.at}
              position="left"
              tooltipPlacement="right"
            />
          </Typography>
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          css={{
            maxWidth: 420,
            padding: "8px 12px",
            borderRadius: 6,
            borderLeft: `3px solid ${color}`,
            backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)`
          }}
        >
          {details.icon && (
            <Stack
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
              css={{
                width: 40,
                height: 40,
                borderRadius: 4,
                backgroundColor: `color-mix(in srgb, ${typographyColorVar("primary")} 6%, transparent)`
              }}
            >
              <SlotIcon type={details.icon} />
            </Stack>
          )}
          <Stack direction="column" minWidth={0}>
            <Typography level="body-sm" css={{ color, fontWeight: 700 }}>
              {details.title}
            </Typography>
            {details.description && (
              <Typography
                level="body-xs"
                textColor="secondary"
                css={{ overflowWrap: "anywhere" }}
              >
                {details.description}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Stack>
    </MessageBase>
  );
};

export const BridgeMessage = observer(({ entry, header }: Props) => {
  const { t } = useTranslation("settings");
  const { theme } = useTheme();
  const app = useAppStore();

  const sourceLabel = t(SOURCE_LABEL_KEYS[entry.source]);

  const eventLabel = () => {
    const voiceChannel = entry.content
      ? `#${entry.content}`
      : t("minecraftBridge.liveVoiceFallback");

    switch (entry.kind) {
      case "death":
      case "advancement":
        return entry.content ?? entry.name;
      case "join":
        return t("minecraftBridge.liveJoined", { name: entry.name });
      case "leave":
        return t("minecraftBridge.liveLeft", { name: entry.name });
      case "voice_join":
        return t("minecraftBridge.liveVoiceJoined", {
          name: entry.name,
          channel: voiceChannel
        });
      case "voice_leave":
        return t("minecraftBridge.liveVoiceLeft", {
          name: entry.name,
          channel: voiceChannel
        });
      case "chat":
        return entry.content ?? "";
    }
  };

  if (entry.kind === "advancement" && entry.advancement) {
    return <AdvancementCard entry={entry} details={entry.advancement} />;
  }

  if (entry.kind !== "chat") {
    const { Icon, color } = EVENT_STYLE[entry.kind];

    return (
      <MessageBase
        system
        css={{ flex: "0 0 auto", maxWidth: "100%", alignItems: "center" }}
      >
        <MessageInfo css={{ paddingTop: 0 }}>
          <Icon weight="fill" size={18} css={{ color }} />
        </MessageInfo>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          flex={1}
          minWidth={0}
        >
          {entry.uuid && (
            <MinecraftAvatar uuid={entry.uuid} name={entry.name} size={20} />
          )}
          <Typography
            level="body-sm"
            textColor="secondary"
            css={{ minWidth: 0, overflowWrap: "anywhere" }}
          >
            <EventText
              label={eventLabel()}
              name={entry.name}
              accentColor={color}
            />
          </Typography>
          <Typography level="body-xs" textColor="muted" css={{ flexShrink: 0 }}>
            <BridgeTimestamp
              at={entry.at}
              position="left"
              tooltipPlacement="right"
            />
          </Typography>
        </Stack>
      </MessageBase>
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
        "&:hover time": { opacity: 1 }
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
              <SourceBadge source={entry.source} label={sourceLabel} />
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
                textColor={entry.failed ? theme.colors.danger : "primary"}
                value={entry.content}
              />
            )}
          </MessageContentText>
        </MessageContent>
      </MessageRow>
    </MessageBase>
  );
});

const COLLAPSE_THRESHOLD = 3;
const SUMMARY_NAME_LIMIT = 3;

export type ActivityFamily = "server" | "voice";

const ACTIVITY_STYLE = {
  server: {
    Icon: UsersThreeIcon,
    summaryKey: "minecraftBridge.activitySummary"
  },
  voice: {
    Icon: SpeakerHighIcon,
    summaryKey: "minecraftBridge.activityVoiceSummary"
  }
} as const;

export const BridgeActivityGroup = observer(
  ({
    family,
    entries,
    expanded,
    onToggle
  }: {
    family: ActivityFamily;
    entries: BridgeFeedEntry[];
    expanded: boolean;
    onToggle: () => void;
  }) => {
    const { t } = useTranslation("settings");

    if (entries.length < COLLAPSE_THRESHOLD) {
      return (
        <Stack direction="column">
          {entries.map((entry) => (
            <BridgeMessage key={entry.id} entry={entry} />
          ))}
        </Stack>
      );
    }

    const players = [
      ...new Map(
        entries.map((entry) => [bridgeAuthorKey(entry), entry])
      ).values()
    ];
    const shownPlayers = players.slice(0, SUMMARY_NAME_LIMIT);
    const hiddenCount = players.length - shownPlayers.length;
    const firstAt = dayjs(entries[0].at).format("h:mm A");
    const lastAt = dayjs(entries[entries.length - 1].at).format("h:mm A");
    const { Icon: GroupIcon, summaryKey } = ACTIVITY_STYLE[family];

    return (
      <Stack direction="column">
        <MessageBase
          system
          onClick={onToggle}
          css={{
            flex: "0 0 auto",
            maxWidth: "100%",
            alignItems: "center",
            cursor: "pointer",
            borderRadius: 6,
            "&:hover": {
              backgroundColor: `color-mix(in srgb, ${typographyColorVar("primary")} 4%, transparent)`
            }
          }}
        >
          <MessageInfo css={{ paddingTop: 0 }}>
            <GroupIcon
              weight="fill"
              size={18}
              css={{ color: typographyColorVar("muted") }}
            />
          </MessageInfo>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            flex={1}
            minWidth={0}
          >
            <Stack
              direction="row"
              flexShrink={0}
              css={{ "& > * + *": { marginLeft: -6 } }}
            >
              {shownPlayers.map((player) =>
                player.uuid ? (
                  <MinecraftAvatar
                    key={bridgeAuthorKey(player)}
                    uuid={player.uuid}
                    name={player.name}
                    size={20}
                  />
                ) : null
              )}
            </Stack>
            <Typography
              level="body-sm"
              textColor="secondary"
              css={{ minWidth: 0, overflowWrap: "anywhere" }}
            >
              <span
                css={{ color: typographyColorVar("primary"), fontWeight: 600 }}
              >
                {shownPlayers.map((player) => player.name).join(", ")}
                {hiddenCount > 0 && ` +${hiddenCount}`}
              </span>{" "}
              {t(summaryKey, { count: entries.length })}
            </Typography>
            <Typography
              level="body-xs"
              textColor="muted"
              css={{ flexShrink: 0 }}
            >
              {firstAt} – {lastAt}
            </Typography>
            <CaretDownIcon
              size={12}
              css={{
                color: typographyColorVar("muted"),
                flexShrink: 0,
                transition: "transform 0.15s ease",
                ...(expanded && { transform: "rotate(180deg)" })
              }}
            />
          </Stack>
        </MessageBase>
        {expanded &&
          entries.map((entry) => (
            <BridgeMessage key={entry.id} entry={entry} />
          ))}
      </Stack>
    );
  }
);
