import { formatColor, styled } from "@mutualzz/ui-core";
import { Button, ButtonGroup } from "@mutualzz/ui-web";
import {
  capitalize,
  previewThemeModes,
  subtleTextColor,
  type PreviewThemeMode
} from "./PlaygroundDocs";
import { playgroundEntries, playgroundGroups } from "./playgroundRegistry";

const SidebarNav = styled("nav")(({ theme }) => ({
  width: 232,
  flexShrink: 0,
  overflowY: "auto",
  padding: "28px 12px",
  display: "flex",
  flexDirection: "column",
  gap: 22,
  borderRight: `1px solid ${subtleTextColor(theme, 0.08)}`
}));

const GroupLabel = styled("div")(({ theme }) => ({
  padding: "0 12px 6px",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: theme.typography.colors.muted
}));

const NavItem = styled("button")<{ active: boolean }>(({ theme, active }) => ({
  appearance: "none",
  border: "none",
  width: "100%",
  height: 32,
  padding: "0 12px",
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  textAlign: "left",
  fontFamily: "inherit",
  fontSize: 13,
  fontWeight: active ? 600 : 500,
  cursor: "pointer",
  color: active
    ? theme.typography.colors.primary
    : theme.typography.colors.muted,
  backgroundColor: active
    ? formatColor(theme.colors.primary, { alpha: 0.14, format: "hexa" })
    : "transparent",
  boxShadow: active ? `inset 2px 0 0 ${theme.colors.primary}` : "none",
  transition: "background-color 0.12s ease, color 0.12s ease",
  "&:hover": {
    color: theme.typography.colors.primary,
    backgroundColor: active
      ? formatColor(theme.colors.primary, { alpha: 0.18, format: "hexa" })
      : subtleTextColor(theme, 0.05)
  },
  "&:focus-visible": {
    outline: `2px solid ${theme.colors.primary}`,
    outlineOffset: -2
  }
}));

export function PlaygroundSidebar({
  activeId,
  onSelect,
  previewTheme,
  onPreviewThemeChange
}: {
  activeId: string;
  onSelect: (id: string) => void;
  previewTheme: PreviewThemeMode;
  onPreviewThemeChange: (mode: PreviewThemeMode) => void;
}) {
  return (
    <SidebarNav aria-label="Components">
      <div>
        <GroupLabel id="playground-preview-theme">Preview theme</GroupLabel>
        <ButtonGroup
          aria-labelledby="playground-preview-theme"
          variant="soft"
          color="neutral"
          size="sm"
          toggleable
          exclusive
          fullWidth
          value={previewTheme}
          onChange={(value) => {
            if (previewThemeModes.includes(value)) onPreviewThemeChange(value);
          }}
        >
          {previewThemeModes.map((mode) => (
            <Button key={mode} value={mode}>
              {capitalize(mode)}
            </Button>
          ))}
        </ButtonGroup>
      </div>
      {playgroundGroups.map((group) => (
        <div key={group}>
          <GroupLabel>{group}</GroupLabel>
          {playgroundEntries
            .filter((entry) => entry.group === group)
            .map((entry) => {
              const active = entry.id === activeId;
              return (
                <NavItem
                  key={entry.id}
                  type="button"
                  active={active}
                  aria-current={active ? "page" : undefined}
                  onClick={() => onSelect(entry.id)}
                >
                  {entry.name}
                </NavItem>
              );
            })}
        </div>
      ))}
    </SidebarNav>
  );
}
