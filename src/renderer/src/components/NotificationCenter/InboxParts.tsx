import { DMGroupAvatar } from "@components/DMChannel/DMGroupAvatar";
import { IconButton } from "@components/IconButton";
import { Paper } from "@components/Paper";
import { SpaceIcon } from "@components/Space/SpaceIcon";
import { UserAvatar } from "@components/User/UserAvatar";
import { useAppStore } from "@hooks/useStores";
import { ChannelType } from "@mutualzz/types";
import { styled } from "@mutualzz/ui-core";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import type { Channel } from "@stores/objects/Channel";
import { useNavigate } from "@tanstack/react-router";
import { openChannelMessage } from "@utils/openChannelMessage";
import { channelLocationLabel } from "@utils/channelLocationLabel";
import { CheckIcon } from "@phosphor-icons/react";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import type { TFunction } from "i18next";
import type { MouseEvent, ReactNode } from "react";
import { useTranslation } from "react-i18next";

export { channelLocationLabel };

export type InboxTab =
  | "forYou"
  | "unreads"
  | "mentions"
  | "bookmarks"
  | "reminders"
  | "scheduled";

export const INBOX_WIDTH_PX = 560;

export const ellipsis = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
} as const;

export const formatInboxTime = (time: Date | string | number) => {
  const moment = dayjs(time);
  if (moment.isSame(dayjs(), "day")) return moment.format("h:mm A");
  if (moment.isAfter(dayjs().subtract(6, "day"))) return moment.format("ddd");
  return moment.format("MMM D");
};

export const useJumpToMessage = () => {
  const app = useAppStore();
  const navigate = useNavigate();
  return (channelId: string, messageId?: string) =>
    openChannelMessage(app, navigate, channelId, messageId);
};

export const CountBadge = ({ count }: { count: number }) => {
  const { theme } = useTheme();
  if (count <= 0) return null;

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      css={{
        minWidth: 16,
        height: 16,
        borderRadius: 9999,
        backgroundColor: theme.colors.danger,
        padding: "0 4px",
        flexShrink: 0
      }}
    >
      <Typography level="label-xs" css={{ color: "#fff", fontSize: 10 }}>
        {count > 99 ? "99+" : count}
      </Typography>
    </Stack>
  );
};

export const MarkAsReadButton = ({
  onClick,
  disabled,
  title
}: {
  onClick: (event: MouseEvent) => void;
  disabled?: boolean;
  title?: string;
}) => {
  const { t } = useTranslation("chat");
  return (
    <IconButton
      size={14}
      padding={6}
      variant="soft"
      color="neutral"
      disabled={disabled}
      onClick={onClick}
      title={title ?? t("contextMenu.markAsRead")}
    >
      <CheckIcon weight="bold" />
    </IconButton>
  );
};

export const InboxTabButton = styled("button")(({ theme }) => ({
  flex: "1 0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  padding: "10px 6px",
  border: "none",
  borderBottom: "2px solid transparent",
  background: "transparent",
  color: "inherit",
  font: "inherit",
  cursor: "pointer",
  transition: "border-color 120ms ease",

  "&[data-active='true']": {
    borderBottomColor: theme.colors.primary
  },

  "&:hover:not([data-active='true'])": {
    borderBottomColor: theme.colors.surface
  }
}));

export const InboxCard = ({
  icon,
  title,
  subtitle,
  actions,
  onOpen,
  flush = false,
  children
}: {
  icon: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  onOpen?: () => void;
  flush?: boolean;
  children?: ReactNode;
}) => {
  const { theme } = useTheme();

  return (
    <Paper
      direction="column"
      borderRadius={10}
      onClick={onOpen}
      css={{
        border: `1px solid ${theme.colors.neutral}40`,
        overflow: "hidden",
        cursor: onOpen ? "pointer" : undefined,
        flexShrink: 0
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} px={2} py={1.5}>
        {icon}
        <Stack direction="column" minWidth={0} flex={1}>
          <Typography level="label-sm" weight="bold" css={ellipsis}>
            {title}
          </Typography>
          {subtitle && (
            <Typography level="body-xs" textColor="muted" css={ellipsis}>
              {subtitle}
            </Typography>
          )}
        </Stack>
        {actions && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            flexShrink={0}
            onClick={(event) => event.stopPropagation()}
          >
            {actions}
          </Stack>
        )}
      </Stack>
      {children &&
        (flush ? (
          children
        ) : (
          <Stack direction="column" px={2} pb={1.75}>
            {children}
          </Stack>
        ))}
    </Paper>
  );
};

export const InboxEmptyState = ({
  icon,
  title,
  description,
  children
}: {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  children?: ReactNode;
}) => {
  const { theme } = useTheme();

  return (
    <Stack
      direction="column"
      alignItems="center"
      spacing={1.5}
      px={4}
      py={6}
      css={{ textAlign: "center" }}
    >
      <Stack
        alignItems="center"
        justifyContent="center"
        position="relative"
        css={{
          width: 88,
          height: 88,
          borderRadius: "50%",
          background: theme.colors.surface,
          fontSize: 40,
          color: theme.colors.primary
        }}
      >
        {icon}
        <span
          css={{
            position: "absolute",
            top: 6,
            right: -2,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: theme.colors.info
          }}
        />
        <span
          css={{
            position: "absolute",
            bottom: 10,
            left: -6,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: theme.colors.warning
          }}
        />
      </Stack>
      <Typography level="h6" fontWeight="bold">
        {title}
      </Typography>
      <Typography level="body-sm" textColor="muted" css={{ maxWidth: 380 }}>
        {description}
      </Typography>
      {children}
    </Stack>
  );
};

export const ChannelAvatar = observer(
  ({ channel }: { channel: Channel | undefined }) => {
    if (!channel) return null;
    if (channel.space) return <SpaceIcon space={channel.space} size={32} />;
    if (channel.type === ChannelType.DM)
      return <UserAvatar user={channel.dmRecipient} size={32} />;
    return <DMGroupAvatar users={channel.dmRecipientsList} />;
  }
);

export const channelCardTitle = (
  channel: Channel | undefined,
  translate: TFunction
) =>
  channel?.space
    ? `#${channel.name}`
    : channelLocationLabel(channel, translate);
