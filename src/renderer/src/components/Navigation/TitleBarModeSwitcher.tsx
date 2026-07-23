import { Tooltip } from "@components/Tooltip";
import { useBridgeListSync } from "@hooks/useBridgeListSync";
import { useAppStore } from "@hooks/useStores";
import {
  resolveActiveModeKey,
  shouldClearPendingMode,
  shouldPersistPreferredMode,
} from "@mutualzz/client";
import { formatColor } from "@mutualzz/ui-core";
import type { ModeKey } from "@mutualzz/types";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import {
  PlanetIcon,
  ScribbleIcon,
  UsersThreeIcon
} from "@phosphor-icons/react";
import { navigateToMode } from "@utils/index";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { type ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const TitleBarModeSwitcher = observer(() => {
  const { t: tSpace } = useTranslation("space");
  const { t: tChat } = useTranslation("chat");
  const app = useAppStore();
  useBridgeListSync();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const pathname = useRouterState({
    select: (state) => state.location.pathname
  });
  const [pending, setPending] = useState<ModeKey | null>(null);

  useEffect(() => {
    if (shouldClearPendingMode(pathname, pending)) {
      setPending(null);
    }
  }, [pathname, pending]);

  if (!app.account) return null;

  const active = resolveActiveModeKey(pathname, pending, app.mode);

  const modes: {
    key: ModeKey;
    label: string;
    icon: ReactNode;
  }[] = [
    {
      key: "dms",
      label: tSpace("sidebar.directMessages"),
      icon: <UsersThreeIcon weight="fill" size={14} />
    },
    {
      key: "spaces",
      label: tSpace("sidebar.spaces"),
      icon: <PlanetIcon weight="fill" size={14} />
    },
    {
      key: "feed",
      label: tChat("feed.title"),
      icon: <ScribbleIcon weight="fill" size={14} />
    }
  ];

  const selectMode = (key: ModeKey) => {
    if (key === active && !pending) return;
    setPending(key);
    if (shouldPersistPreferredMode(key)) {
      app.settings?.setPreferredMode(key);
    }
    requestAnimationFrame(() => {
      navigateToMode(app, navigate, key);
    });
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      p={0.5}
      borderRadius={999}
      css={{
        WebkitAppRegion: "no-drag",
        userSelect: "auto",
        backgroundColor: formatColor(theme.colors.neutral, {
          alpha: 12,
          format: "hexa"
        }),
        border: `1px solid ${formatColor(theme.colors.neutral, {
          alpha: 18,
          format: "hexa"
        })}`
      }}
    >
      {modes.map((mode) => {
        const isActive = mode.key === active;
        const showBridgeUnread =
          mode.key === "spaces" && app.bridgeChat.hasAnyUnread;
        return (
          <Tooltip key={mode.key} content={mode.label} placement="bottom">
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={0.75}
              role="button"
              tabIndex={0}
              aria-label={mode.label}
              aria-current={isActive ? "page" : undefined}
              position="relative"
              onClick={() => selectMode(mode.key)}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return;
                e.preventDefault();
                selectMode(mode.key);
              }}
              css={{
                height: 28,
                minWidth: 28,
                paddingInline: isActive ? 10 : 6,
                borderRadius: 999,
                cursor: "pointer",
                color: isActive
                  ? theme.colors.primary
                  : theme.typography.colors.secondary,
                backgroundColor: isActive
                  ? formatColor(theme.colors.primary, {
                      alpha: 18,
                      format: "hexa"
                    })
                  : "transparent",
                transition:
                  "padding 0.2s ease, background 0.15s ease, color 0.15s ease",
                "&:hover": {
                  backgroundColor: isActive
                    ? formatColor(theme.colors.primary, {
                        alpha: 24,
                        format: "hexa"
                      })
                    : formatColor(theme.colors.neutral, {
                        alpha: 14,
                        format: "hexa"
                      })
                }
              }}
            >
              {mode.icon}
              {showBridgeUnread && (
                <Stack
                  css={{
                    position: "absolute",
                    top: 2,
                    right: isActive ? undefined : 2,
                    left: isActive ? 18 : undefined,
                    width: 7,
                    height: 7,
                    borderRadius: 999,
                    backgroundColor: theme.colors.primary
                  }}
                />
              )}
              {isActive && (
                <Typography level="label-sm" weight="bold" whiteSpace="nowrap">
                  {mode.label}
                </Typography>
              )}
            </Stack>
          </Tooltip>
        );
      })}
    </Stack>
  );
});
