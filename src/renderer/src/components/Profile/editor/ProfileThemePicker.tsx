import { Tooltip } from "@components/Tooltip";
import { createProfileThemeSnapshot } from "@components/Profile/editor/utils/profileEditor.utils";
import { useAppStore } from "@hooks/useStores";
import type { APIProfileTheme } from "@mutualzz/types";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { ProhibitIcon } from "@phosphor-icons/react";
import type { Theme } from "@stores/objects/Theme";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
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

export const ProfileThemePicker = observer(({ value, onChange }: Props) => {
  const { t } = useTranslation("settings");
  const app = useAppStore();

  const personalThemes = app.themes.all.filter((theme) => !theme.spaceId);
  const builtInThemes = personalThemes.filter((theme) => !theme.authorId);
  const userThemes = personalThemes.filter((theme) => theme.authorId);

  const renderSwatches = (themes: Theme[]) => (
    <Stack direction="row" spacing={1} css={{ flexWrap: "wrap" }}>
      {themes.map((theme) => (
        <ThemeSwatch
          key={theme.id}
          label={theme.name}
          selected={value?.sourceId === theme.id}
          background={String(theme.colors.background)}
          accent={String(theme.colors.primary)}
          onClick={() => onChange(createProfileThemeSnapshot(theme))}
        />
      ))}
    </Stack>
  );

  return (
    <Stack direction="column" spacing={1.5}>
      <Stack direction="row" spacing={1}>
        <ThemeSwatch
          label={t("profile.inspector.appearance.noTheme")}
          selected={!value}
          background="transparent"
          onClick={() => onChange(null)}
        >
          <ProhibitIcon size={16} />
        </ThemeSwatch>
      </Stack>

      <Typography level="body-xs" css={{ opacity: 0.6 }}>
        {t("profile.inspector.appearance.builtIn")}
      </Typography>
      {renderSwatches(builtInThemes)}

      {userThemes.length > 0 && (
        <>
          <Typography level="body-xs" css={{ opacity: 0.6 }}>
            {t("profile.inspector.appearance.yourThemes")}
          </Typography>
          {renderSwatches(userThemes)}
        </>
      )}

      {value && (
        <Typography level="body-xs" css={{ opacity: 0.6 }}>
          {t("profile.inspector.appearance.applied", { name: value.name })}
        </Typography>
      )}
    </Stack>
  );
});
