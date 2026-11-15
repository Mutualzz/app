import { Button } from "@components/Button";
import { GoogleFontPicker } from "@components/FontPicker/GoogleFontPicker";
import { InputWithLabel } from "@components/InputWithLabel";
import { Paper } from "@components/Paper";
import {
  getDisplayNameCss,
  ProfileDisplayName
} from "@components/Profile/shared/ProfileDisplayName";
import { useAppStore } from "@hooks/useStores";
import {
  type APIDisplayNameStyle,
  DISPLAY_NAME_EFFECTS,
  type DisplayNameEffect
} from "@mutualzz/types";
import type { ColorLike } from "@mutualzz/ui-core";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

const EFFECTS_WITH_COLOR: DisplayNameEffect[] = [
  "glow",
  "neon",
  "shadow",
  "outline"
];

interface EffectButtonProps {
  label: string;
  selected: boolean;
  previewStyle: APIDisplayNameStyle;
  onClick: () => void;
}

const EffectButton = ({
  label,
  selected,
  previewStyle,
  onClick
}: EffectButtonProps) => {
  const { theme } = useTheme();

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      css={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        padding: "8px 4px",
        borderRadius: 8,
        cursor: "pointer",
        background: "transparent",
        color: "inherit",
        border: `1px solid ${
          selected ? theme.colors.primary : theme.colors.neutral
        }`,
        outline: selected ? `1px solid ${theme.colors.primary}` : undefined
      }}
    >
      <span
        css={{
          display: "inline-block",
          fontSize: 18,
          fontWeight: 700,
          ...getDisplayNameCss(previewStyle, theme)
        }}
      >
        Aa
      </span>
      <Typography level="body-xs">{label}</Typography>
    </button>
  );
};

interface Props {
  value: APIDisplayNameStyle | null;
  onChange: (style: APIDisplayNameStyle | null) => void;
}

export const ProfileNameStylePanel = observer(({ value, onChange }: Props) => {
  const { t } = useTranslation("settings");
  const app = useAppStore();

  const update = (patch: Partial<APIDisplayNameStyle>) => {
    const next = { ...value, ...patch };
    onChange(Object.values(next).some(Boolean) ? next : null);
  };

  const effect = value?.effect ?? null;
  const showEffectColor = !!effect && EFFECTS_WITH_COLOR.includes(effect);

  return (
    <Stack direction="column" spacing={2}>
      <Paper
        variant="soft"
        borderRadius={8}
        p={1.5}
        alignItems="center"
        justifyContent="center"
      >
        <Typography level="title-md">
          <ProfileDisplayName nameStyle={value} ownerUserId={app.account?.id}>
            {app.account?.displayName}
          </ProfileDisplayName>
        </Typography>
      </Paper>

      <GoogleFontPicker
        label={t("profile.inspector.appearance.nameFont")}
        description={t("profile.inspector.appearance.nameFontDescription")}
        fontOwnerId={app.account?.id}
        value={value?.font ?? null}
        allowClear
        onChange={(font) => update({ font })}
      />

      <Stack direction="column" spacing={1}>
        <InputWithLabel
          type="color"
          label={t("profile.inspector.appearance.nameColor")}
          name="displayNameStyleColor"
          description={t("profile.inspector.appearance.nameColorDescription")}
          value={(value?.color as ColorLike) ?? "#ffffff"}
          allowGradient
          onChange={(color: ColorLike) => {
            if (typeof color !== "string" || !color) return;
            update({ color });
          }}
          fullWidth
        />
        {value?.color && (
          <Button
            size="sm"
            color="neutral"
            onClick={() => update({ color: null })}
          >
            {t("profile.inspector.appearance.resetNameColor")}
          </Button>
        )}
      </Stack>

      <Stack direction="column" spacing={1}>
        <Typography level="body-xs" fontWeight={600}>
          {t("profile.inspector.appearance.nameEffect")}
        </Typography>
        <div
          css={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
            gap: 6
          }}
        >
          <EffectButton
            label={t("profile.inspector.appearance.effects.none")}
            selected={!effect}
            previewStyle={{ ...value, effect: null }}
            onClick={() => update({ effect: null })}
          />
          {DISPLAY_NAME_EFFECTS.map((effectOption) => (
            <EffectButton
              key={effectOption}
              label={t(`profile.inspector.appearance.effects.${effectOption}`)}
              selected={effect === effectOption}
              previewStyle={{ ...value, effect: effectOption }}
              onClick={() => update({ effect: effectOption })}
            />
          ))}
        </div>
      </Stack>

      {showEffectColor && (
        <Stack direction="column" spacing={1}>
          <InputWithLabel
            type="color"
            label={t("profile.inspector.appearance.effectColor")}
            name="displayNameEffectColor"
            description={t(
              "profile.inspector.appearance.effectColorDescription"
            )}
            value={(value?.effectColor as ColorLike) ?? "#ffffff"}
            onChange={(effectColor: ColorLike) => {
              if (typeof effectColor !== "string" || !effectColor) return;
              update({ effectColor });
            }}
            fullWidth
          />
          {value?.effectColor && (
            <Button
              size="sm"
              color="neutral"
              onClick={() => update({ effectColor: null })}
            >
              {t("profile.inspector.appearance.resetEffectColor")}
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
});
