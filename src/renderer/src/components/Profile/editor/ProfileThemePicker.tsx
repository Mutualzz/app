import { Tooltip } from "@components/Tooltip";
import { createProfileThemeSnapshot } from "@components/Profile/editor/utils/profileEditor.utils";
import { useAppStore } from "@hooks/useStores";
import type { APIProfileTheme } from "@mutualzz/types";
import { Button } from "@components/Button";
import { Input, Popover, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { ProhibitIcon } from "@phosphor-icons/react";
import type { Theme } from "@stores/objects/Theme";
import { observer } from "mobx-react-lite";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface SwatchProps {
  label: string;
  selected: boolean;
  background: string;
  accent?: string;
  onClick: () => void;
  children?: ReactNode;
}

const ThemeSwatch = ({
  label,
  selected,
  background,
  accent,
  onClick,
  children
}: SwatchProps) => {
  const { theme } = useTheme();

  return (
    <Tooltip content={label}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={selected}
        onClick={onClick}
        css={{
          width: 32,
          height: 32,
          padding: 0,
          borderRadius: "50%",
          border: `1px solid ${theme.colors.neutral}`,
          background,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          outline: selected ? `2px solid ${theme.colors.primary}` : undefined,
          outlineOffset: 2
        }}
      >
        {accent && (
          <span
            css={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: accent
            }}
          />
        )}
        {children}
      </button>
    </Tooltip>
  );
};

interface Props {
  value: APIProfileTheme | null;
  onChange: (theme: APIProfileTheme | null) => void;
}

const POPOVER_WIDTH = 300;

export const ProfileThemePicker = observer(({ value, onChange }: Props) => {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();
  const personalThemes = app.themes.all
    .filter((theme) => !theme.spaceId)
    .filter((theme) => !query || theme.name.toLowerCase().includes(query));
  const builtInThemes = personalThemes.filter((theme) => !theme.authorId);
  const darkThemes = builtInThemes.filter((theme) => theme.type === "dark");
  const lightThemes = builtInThemes.filter((theme) => theme.type !== "dark");
  const userThemes = personalThemes.filter((theme) => theme.authorId);

  const pick = (theme: APIProfileTheme | null) => {
    onChange(theme);
    setOpen(false);
  };

  const section = (label: string, themes: Theme[]) =>
    themes.length > 0 && (
      <Stack direction="column" spacing={0.75}>
        <Typography level="body-xs" css={{ opacity: 0.6 }}>
          {label}
        </Typography>
        <Stack direction="row" spacing={1} css={{ flexWrap: "wrap" }}>
          {themes.map((theme) => (
            <ThemeSwatch
              key={theme.id}
              label={theme.name}
              selected={value?.sourceId === theme.id}
              background={String(theme.colors.background)}
              accent={String(theme.colors.primary)}
              onClick={() => pick(createProfileThemeSnapshot(theme))}
            />
          ))}
        </Stack>
      </Stack>
    );

  const nothingFound =
    darkThemes.length + lightThemes.length + userThemes.length === 0;

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      {value ? (
        <ThemeSwatch
          label={value.name}
          selected
          background={String(value.colors.background)}
          accent={String(value.colors.primary)}
          onClick={() => setOpen(true)}
        />
      ) : (
        <ThemeSwatch
          label={t("profile.inspector.appearance.noTheme")}
          selected={false}
          background="transparent"
          onClick={() => setOpen(true)}
        >
          <ProhibitIcon size={16} />
        </ThemeSwatch>
      )}
      <Typography
        level="body-sm"
        css={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}
      >
        {value?.name ?? t("profile.inspector.appearance.noTheme")}
      </Typography>
      <Popover
        placement="right"
        align="start"
        isOpen={open}
        onOpenChange={setOpen}
        closeOnClickOutside
        surfaceRole="popout"
        elevation={8}
        p={1.5}
        width={POPOVER_WIDTH}
        css={{ width: POPOVER_WIDTH, maxHeight: 420, overflowY: "auto" }}
        trigger={
          <Button size="sm" color="neutral">
            {t("profile.inspector.appearance.changeTheme")}
          </Button>
        }
      >
        <Stack direction="column" spacing={1.5}>
          <Input
            size="sm"
            value={search}
            placeholder={t("profile.inspector.appearance.searchThemes")}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Stack direction="row" spacing={1} alignItems="center">
            <ThemeSwatch
              label={t("profile.inspector.appearance.noTheme")}
              selected={!value}
              background="transparent"
              onClick={() => pick(null)}
            >
              <ProhibitIcon size={16} />
            </ThemeSwatch>
            <Typography level="body-xs" css={{ opacity: 0.6 }}>
              {t("profile.inspector.appearance.noTheme")}
            </Typography>
          </Stack>
          {section(t("profile.inspector.appearance.darkThemes"), darkThemes)}
          {section(t("profile.inspector.appearance.lightThemes"), lightThemes)}
          {section(t("profile.inspector.appearance.yourThemes"), userThemes)}
          {nothingFound && (
            <Typography level="body-xs" css={{ opacity: 0.6 }}>
              {t("profile.inspector.appearance.noThemesFound")}
            </Typography>
          )}
        </Stack>
      </Popover>
    </Stack>
  );
});
