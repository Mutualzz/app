import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { styled, useOnClickOutside } from "@mutualzz/ui-core";
import { Typography, useTheme } from "@mutualzz/ui-web";
import { CheckIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { type RefObject, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { MentionFilters } from "./mentionFilters";

const MenuRow = styled("button")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  width: "100%",
  padding: "10px 12px",
  border: "none",
  borderRadius: 6,
  background: "transparent",
  color: "inherit",
  font: "inherit",
  textAlign: "left",
  cursor: "pointer",

  "&:hover": {
    background: theme.colors.surface
  }
}));

const CheckSquare = ({ checked }: { checked: boolean }) => {
  const { theme } = useTheme();
  return (
    <span
      css={{
        width: 18,
        height: 18,
        borderRadius: 4,
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: `2px solid ${checked ? theme.colors.primary : theme.colors.neutral}`,
        background: checked ? theme.colors.primary : "transparent",
        color: "#fff"
      }}
    >
      {checked && <CheckIcon size={12} weight="bold" />}
    </span>
  );
};

interface Props {
  filters: MentionFilters;
  anchorRef: RefObject<HTMLElement | null>;
  onChange: (changes: Partial<MentionFilters>) => void;
  onClose: () => void;
}

export const MentionFilterMenu = observer(
  ({ filters, anchorRef, onChange, onClose }: Props) => {
    const app = useAppStore();
    const { t } = useTranslation("common");
    const menuRef = useRef<HTMLDivElement>(null);
    const activeSpace = app.spaces.active;

    useOnClickOutside([menuRef, anchorRef] as RefObject<HTMLElement>[], () =>
      onClose()
    );

    const rows: {
      key: string;
      label: string;
      checked: boolean;
      toggle: () => void;
    }[] = [
      {
        key: "everyone",
        label: t("notifications.filterEveryone"),
        checked: filters.includeEveryone,
        toggle: () => onChange({ includeEveryone: !filters.includeEveryone })
      },
      {
        key: "roles",
        label: t("notifications.filterRoles"),
        checked: filters.includeRoles,
        toggle: () => onChange({ includeRoles: !filters.includeRoles })
      },
      ...(activeSpace
        ? [
            {
              key: "space",
              label: t("notifications.filterThisSpace", {
                space: activeSpace.name
              }),
              checked: !filters.allSpaces,
              toggle: () => onChange({ allSpaces: !filters.allSpaces })
            }
          ]
        : [])
    ];

    return (
      <div
        ref={menuRef}
        onClick={(event) => event.stopPropagation()}
        css={{
          position: "absolute",
          top: "calc(100% + 6px)",
          right: 0,
          zIndex: 20,
          width: 280
        }}
      >
        <Paper
          surfaceRole="popout"
          elevation={8}
          direction="column"
          borderRadius={8}
          css={{ padding: 6 }}
        >
          {rows.map((row) => (
            <MenuRow key={row.key} type="button" onClick={row.toggle}>
              <Typography level="body-sm" weight="medium">
                {row.label}
              </Typography>
              <CheckSquare checked={row.checked} />
            </MenuRow>
          ))}
        </Paper>
      </div>
    );
  }
);
