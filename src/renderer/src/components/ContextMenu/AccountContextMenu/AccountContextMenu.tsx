import { observer } from "mobx-react-lite";
import { ContextMenu } from "@components/ContextMenu";
import type { AccountStore } from "@stores/Account.store";
import { generateMenuIDs, useMenu } from "@contexts/ContextMenu.context";
import { useAppStore } from "@hooks/useStores";
import { ContextSubmenu } from "@components/ContextSubmenu";
import { StatusBadge } from "@components/StatusBadge";
import { Divider, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { formatColor } from "@mutualzz/ui-core";
import type { AppStore } from "@stores/App.store";
import type { PresenceStatus } from "@mutualzz/types";
import { ContextItem } from "@components/ContextItem";
import {
  CameraIcon,
  CheckIcon,
  PencilIcon,
  ShieldIcon,
  UserIcon
} from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { STATUS_DURATION_OPTIONS } from "@utils/statusDurations";
import { AccountContextMenuHeader } from "@components/ContextMenu/AccountContextMenu/AccountContextMenuHeader";

interface Props {
  account: AccountStore;
}

const STATUS_OPTIONS: {
  status: PresenceStatus;
  label: string;
  description?: string;
  showInvisible?: boolean;
}[] = [
  { status: "online", label: "Online" },
  {
    status: "idle",
    label: "Idle",
    description: "Away from keyboard"
  },
  {
    status: "dnd",
    label: "Do Not Disturb",
    description: "You won't receive notifications"
  },
  {
    status: "invisible",
    label: "Invisible",
    description: "Appear offline",
    showInvisible: true
  }
];

const TimeContextMenu = observer(
  ({ app, status }: { app: AppStore; status: PresenceStatus }) => {
    const { clearMenu } = useMenu();

    return STATUS_DURATION_OPTIONS.map(({ label, durationMs }) => (
      <ContextItem
        key={`${status}:${label}`}
        onClick={() => {
          clearMenu();

          if (!durationMs) {
            app.gateway.clearScheduledStatus();
            app.gateway.setStatus(status, { persist: true });
            return;
          }

          app.gateway.scheduleStatus({
            status,
            durationMs
          });
        }}
      >
        {label}
      </ContextItem>
    ));
  }
);

const StatusMenuLabel = ({
  label,
  description,
  active
}: {
  label: string;
  description?: string;
  active?: boolean;
}) => {
  const { theme } = useTheme();

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
      minWidth={0}
    >
      <Stack
        direction="column"
        spacing={0.125}
        alignItems="flex-start"
        minWidth={0}
      >
        <Typography level="body-sm" fontWeight={600}>
          {label}
        </Typography>
        {description && (
          <Typography
            level="body-xs"
            textColor="muted"
            css={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "11rem"
            }}
          >
            {description}
          </Typography>
        )}
      </Stack>
      {active && (
        <CheckIcon
          size={16}
          weight="bold"
          color={formatColor(theme.colors.success)}
        />
      )}
    </Stack>
  );
};

export const AccountContextMenu = observer(({ account }: Props) => {
  const app = useAppStore();
  const navigate = useNavigate();
  const { clearMenu } = useMenu();

  const presence = app.presence.get(account.id);
  const elevation = app.settings?.preferEmbossed ? 5 : 1;
  const currentStatus = presence?.status;

  return (
    <ContextMenu
      elevation={elevation}
      transparency={0}
      id={generateMenuIDs.account(account.id)}
      key={account.id}
      width="16rem"
      spacing={0.5}
    >
      <AccountContextMenuHeader account={account} />

      {presence &&
        STATUS_OPTIONS.map((option) => {
          const active = currentStatus === option.status;

          return (
            <ContextSubmenu
              key={option.status}
              decorator={
                <StatusBadge
                  status={option.status}
                  inPicker
                  size={28}
                  elevation={elevation}
                  showInvisible={option.showInvisible}
                />
              }
              label={
                <StatusMenuLabel
                  label={option.label}
                  description={option.description}
                  active={active}
                />
              }
              color={active ? "primary" : undefined}
              css={{
                alignItems: "center",
                borderRadius: 8
              }}
              elevation={elevation}
              transparency={0}
              onClick={() => {
                clearMenu();
                app.gateway.clearScheduledStatus();
                app.gateway.setStatus(option.status, { persist: true });
              }}
            >
              <TimeContextMenu app={app} status={option.status} />
            </ContextSubmenu>
          );
        })}

      <Divider lineColor="muted" css={{ opacity: 0.45, marginBlock: 4 }} />

      <ContextItem
        startDecorator={<UserIcon weight="fill" />}
        onClick={() => {
          clearMenu();
          navigate({
            to: "/users/$username",
            params: { username: account.username }
          });
        }}
        size="md"
      >
        View Profile
      </ContextItem>
      <ContextItem
        startDecorator={<PencilIcon weight="fill" />}
        onClick={() => {
          clearMenu();
          navigate({ to: "/profile" });
        }}
        size="md"
      >
        Customize Profile
      </ContextItem>
      <ContextItem
        startDecorator={<CameraIcon weight="fill" />}
        onClick={() => {
          clearMenu();
          navigate({ to: "/avatar", search: { method: "upload" } });
        }}
        size="md"
      >
        Edit Avatar
      </ContextItem>

      {account.isStaff && (
        <>
          <Divider lineColor="muted" css={{ opacity: 0.45, marginBlock: 4 }} />
          <ContextItem
            startDecorator={<ShieldIcon weight="fill" />}
            onClick={() => {
              clearMenu();
              navigate({ to: "/staff" });
            }}
            size="md"
          >
            Staff Panel
          </ContextItem>
        </>
      )}
    </ContextMenu>
  );
});
