import { IconButton } from "@components/IconButton";
import { Paper } from "@components/Paper";
import { Tooltip } from "@components/Tooltip";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import {
  ClockCounterClockwiseIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  StackIcon
} from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export type ProfileEditorLeftPanel = "add" | "layers" | "page" | "history";

interface Props {
  activePanel: ProfileEditorLeftPanel | null;
  onActivePanelChange: (panel: ProfileEditorLeftPanel | null) => void;
}

export const ProfileEditorRail = observer(
  ({ activePanel, onActivePanelChange }: Props) => {
    const { t } = useTranslation("settings");
    const app = useAppStore();
    const embossed = app.settings?.preferEmbossed;

    const items: {
      panel: ProfileEditorLeftPanel;
      label: string;
      shortLabel: string;
      icon: ReactNode;
    }[] = [
      {
        panel: "add",
        label: t("profile.inspector.rail.add"),
        shortLabel: t("profile.inspector.rail.addShort"),
        icon: <PlusIcon />
      },
      {
        panel: "layers",
        label: t("profile.inspector.rail.layers"),
        shortLabel: t("profile.inspector.rail.layersShort"),
        icon: <StackIcon />
      },
      {
        panel: "page",
        label: t("profile.inspector.rail.page"),
        shortLabel: t("profile.inspector.rail.pageShort"),
        icon: <SlidersHorizontalIcon />
      },
      {
        panel: "history",
        label: t("profile.inspector.rail.history"),
        shortLabel: t("profile.inspector.rail.historyShort"),
        icon: <ClockCounterClockwiseIcon />
      }
    ];

    return (
      <Paper
        flexShrink={0}
        height="100%"
        direction="column"
        alignItems="center"
        spacing={1.25}
        px={0.5}
        py={1}
        borderRadius={12}
        variant="elevation"
        elevation={embossed ? 5 : 1}
      >
        {items.map((item) => {
          const active = activePanel === item.panel;

          return (
            <Tooltip key={item.panel} content={item.label} placement="right">
              <Stack
                direction="column"
                alignItems="center"
                spacing={0.25}
                onClick={() => onActivePanelChange(active ? null : item.panel)}
                css={{ cursor: "pointer", userSelect: "none" }}
              >
                <IconButton
                  size="md"
                  variant={active ? "soft" : "plain"}
                  color={active ? "primary" : undefined}
                  aria-pressed={active}
                  aria-label={item.label}
                >
                  {item.icon}
                </IconButton>
                <Typography
                  level="body-xs"
                  fontWeight={active ? 700 : 500}
                  textColor={active ? "primary" : "muted"}
                  css={{ fontSize: 11 }}
                >
                  {item.shortLabel}
                </Typography>
              </Stack>
            </Tooltip>
          );
        })}
      </Paper>
    );
  }
);
