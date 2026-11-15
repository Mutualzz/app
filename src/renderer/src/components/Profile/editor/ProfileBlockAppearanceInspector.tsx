import { Button } from "@components/Button";
import { CompactFontPicker } from "@components/Profile/editor/CompactFontPicker";
import { ProfileInspectorField } from "@components/Profile/editor/ProfileInspectorField";
import { useAppStore } from "@hooks/useStores";
import {
  DISPLAY_NAME_EFFECTS,
  type DisplayNameEffect,
  PROFILE_BLOCK_BORDER_STYLES,
  PROFILE_BLOCK_ENTRANCES,
  PROFILE_BLOCK_SHADOWS,
  PROFILE_BLOCK_TEXT_ALIGNS,
  type ProfileBlockAppearance,
  type ProfileBlockBorderStyle,
  type ProfileBlockEntrance,
  type ProfileBlockShadow,
  type ProfileBlockTextAlign
} from "@mutualzz/types";
import {
  formatColor,
  PROFILE_BLOCK_BLUR_MAX,
  PROFILE_BLOCK_BORDER_WIDTH_MAX,
  PROFILE_BLOCK_OPACITY_MAX,
  PROFILE_BLOCK_OPACITY_MIN,
  PROFILE_BLOCK_PADDING_MAX,
  supportsProfileBlockFont,
  supportsProfileBlockPadding,
  supportsProfileBlockTextAlign,
  type ColorLike
} from "@mutualzz/ui-core";
import { ButtonGroup, Input, Slider, Stack } from "@mutualzz/ui-web";
import { ArrowsCounterClockwiseIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

export type ProfileBlockAppearanceSection =
  | "layout"
  | "text"
  | "fill"
  | "shape"
  | "effects"
  | "reset"
  | "motion";

const ALL_SECTIONS: ProfileBlockAppearanceSection[] = [
  "layout",
  "text",
  "fill",
  "shape",
  "effects",
  "reset",
  "motion"
];

interface Props {
  sections?: ProfileBlockAppearanceSection[];
  blockTypes: string[];
  appearance: ProfileBlockAppearance | null | undefined;
  onChange: (appearance: ProfileBlockAppearance | null) => void;
}

const NO_SHADOW = "none";
const NO_ENTRANCE = "none";
const NO_TEXT_EFFECT = "none";
const TEXT_EFFECTS_WITH_COLOR = new Set<string>([
  "glow",
  "neon",
  "shadow",
  "outline"
]);

const toHexColor = (color: ColorLike) => {
  if (typeof color !== "string" || !color) return null;
  try {
    return String(formatColor(color, { format: "hex" }));
  } catch {
    return null;
  }
};

const normalizeAppearance = (
  appearance: ProfileBlockAppearance
): ProfileBlockAppearance | null => {
  const normalized: ProfileBlockAppearance = {};

  if (appearance.borderWidth) {
    normalized.borderWidth = appearance.borderWidth;
    if (appearance.borderStyle && appearance.borderStyle !== "solid") {
      normalized.borderStyle = appearance.borderStyle;
    }
    if (appearance.borderColor) normalized.borderColor = appearance.borderColor;
  }

  if (appearance.shadow) {
    normalized.shadow = appearance.shadow;
    if (appearance.shadowColor) normalized.shadowColor = appearance.shadowColor;
  }

  if (
    appearance.opacity != null &&
    appearance.opacity < PROFILE_BLOCK_OPACITY_MAX
  ) {
    normalized.opacity = appearance.opacity;
  }

  if (appearance.blur) normalized.blur = appearance.blur;

  if (appearance.padding != null) normalized.padding = appearance.padding;

  if (appearance.textAlign && appearance.textAlign !== "left") {
    normalized.textAlign = appearance.textAlign;
  }

  if (appearance.font) normalized.font = appearance.font;

  if (appearance.entrance) normalized.entrance = appearance.entrance;

  if (appearance.textEffect) {
    normalized.textEffect = appearance.textEffect;
    if (appearance.textEffectColor) {
      normalized.textEffectColor = appearance.textEffectColor;
    }
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
};

export const ProfileBlockAppearanceInspector = observer(
  ({ sections = ALL_SECTIONS, blockTypes, appearance, onChange }: Props) => {
    const { t } = useTranslation("settings");
    const current = appearance ?? {};
    const borderWidth = current.borderWidth ?? 0;
    const opacity = current.opacity ?? PROFILE_BLOCK_OPACITY_MAX;
    const blur = current.blur ?? 0;
    const showPadding = blockTypes.some(supportsProfileBlockPadding);
    const showTextAlign = blockTypes.some(supportsProfileBlockTextAlign);
    const showFont = blockTypes.some(supportsProfileBlockFont);
    const hasStyleValues =
      !!current.borderWidth ||
      !!current.shadow ||
      current.opacity != null ||
      !!current.blur ||
      !!current.font ||
      !!current.textEffect;
    const showTextEffect = blockTypes.some(supportsProfileBlockTextAlign);
    const textEffectUsesColor =
      !!current.textEffect && TEXT_EFFECTS_WITH_COLOR.has(current.textEffect);
    const app = useAppStore();

    const update = (patch: Partial<ProfileBlockAppearance>) =>
      onChange(normalizeAppearance({ ...current, ...patch }));

    const colorInput = (
      name: string,
      value: string,
      onColorChange: (color: string) => void
    ) => (
      <Input
        type="color"
        name={name}
        textColor="primary"
        size="sm"
        value={value as ColorLike}
        onChange={(color: ColorLike) => {
          const hexColor = toHexColor(color);
          if (hexColor) onColorChange(hexColor);
        }}
        fullWidth
      />
    );

    return (
      <Stack direction="column" spacing={2}>
        {sections.includes("layout") && (
          <>
            {showTextAlign && (
              <ProfileInspectorField
                label={t("profile.inspector.blockStyle.textAlign")}
                onReset={
                  current.textAlign
                    ? () => update({ textAlign: undefined })
                    : undefined
                }
              >
                <ButtonGroup
                  toggleable
                  exclusive
                  size="sm"
                  color="neutral"
                  fullWidth
                  expand
                  value={current.textAlign ?? "left"}
                  onChange={(textAlign: ProfileBlockTextAlign) =>
                    update({ textAlign })
                  }
                >
                  {PROFILE_BLOCK_TEXT_ALIGNS.map((textAlign) => (
                    <Button key={textAlign} value={textAlign}>
                      {t(
                        `profile.inspector.blockStyle.textAligns.${textAlign}`
                      )}
                    </Button>
                  ))}
                </ButtonGroup>
              </ProfileInspectorField>
            )}

            {showPadding && (
              <ProfileInspectorField
                label={t("profile.inspector.fields.padding")}
                value={
                  current.padding != null
                    ? `${current.padding}px`
                    : t("profile.inspector.fields.default")
                }
                onReset={
                  current.padding != null
                    ? () => update({ padding: undefined })
                    : undefined
                }
              >
                <Slider
                  min={0}
                  max={PROFILE_BLOCK_PADDING_MAX}
                  step={2}
                  value={current.padding ?? 12}
                  onChange={(_, value) => update({ padding: value as number })}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}px`}
                />
              </ProfileInspectorField>
            )}
          </>
        )}

        {sections.includes("text") && (
          <>
            {showFont && (
              <CompactFontPicker
                label={t("profile.inspector.blockStyle.font")}
                fontOwnerId={app.account?.id}
                value={current.font ?? null}
                allowClear
                onChange={(font) => update({ font })}
              />
            )}
            {showTextEffect && (
              <ProfileInspectorField
                label={t("profile.inspector.blockStyle.textEffect")}
                onReset={
                  current.textEffect
                    ? () =>
                        update({
                          textEffect: undefined,
                          textEffectColor: undefined
                        })
                    : undefined
                }
              >
                <div
                  css={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 6
                  }}
                >
                  {[NO_TEXT_EFFECT, ...DISPLAY_NAME_EFFECTS].map(
                    (textEffect) => {
                      const selected =
                        (current.textEffect ?? NO_TEXT_EFFECT) === textEffect;
                      return (
                        <Button
                          key={textEffect}
                          size="sm"
                          color={selected ? "primary" : "neutral"}
                          aria-pressed={selected}
                          onClick={() =>
                            update({
                              textEffect:
                                textEffect === NO_TEXT_EFFECT
                                  ? undefined
                                  : (textEffect as DisplayNameEffect)
                            })
                          }
                        >
                          {t(
                            `profile.inspector.appearance.effects.${textEffect}`
                          )}
                        </Button>
                      );
                    }
                  )}
                </div>
                {textEffectUsesColor &&
                  colorInput(
                    "blockTextEffectColor",
                    current.textEffectColor ?? "#ffffff",
                    (textEffectColor) => update({ textEffectColor })
                  )}
              </ProfileInspectorField>
            )}
          </>
        )}

        {sections.includes("fill") && (
          <>
            <ProfileInspectorField
              label={t("profile.inspector.fields.opacity")}
              value={`${opacity}%`}
              onReset={
                current.opacity != null
                  ? () => update({ opacity: undefined })
                  : undefined
              }
            >
              <Slider
                min={PROFILE_BLOCK_OPACITY_MIN}
                max={PROFILE_BLOCK_OPACITY_MAX}
                step={5}
                value={opacity}
                onChange={(_, value) => update({ opacity: value as number })}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
              />
            </ProfileInspectorField>

            <ProfileInspectorField
              label={t("profile.inspector.fields.glass")}
              value={`${blur}px`}
              hint={t("profile.inspector.blockStyle.glassHint")}
              onReset={blur > 0 ? () => update({ blur: undefined }) : undefined}
            >
              <Slider
                min={0}
                max={PROFILE_BLOCK_BLUR_MAX}
                step={1}
                value={blur}
                onChange={(_, value) => update({ blur: value as number })}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}px`}
              />
            </ProfileInspectorField>
          </>
        )}

        {sections.includes("shape") && (
          <>
            <ProfileInspectorField
              label={t("profile.inspector.fields.border")}
              value={`${borderWidth}px`}
              onReset={
                borderWidth > 0
                  ? () =>
                      update({
                        borderWidth: undefined,
                        borderStyle: undefined,
                        borderColor: undefined
                      })
                  : undefined
              }
            >
              <Slider
                min={0}
                max={PROFILE_BLOCK_BORDER_WIDTH_MAX}
                step={1}
                value={borderWidth}
                onChange={(_, value) =>
                  update({ borderWidth: value as number })
                }
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}px`}
              />
              {borderWidth > 0 && (
                <>
                  <ButtonGroup
                    toggleable
                    exclusive
                    size="sm"
                    color="neutral"
                    fullWidth
                    expand
                    value={current.borderStyle ?? "solid"}
                    onChange={(borderStyle: ProfileBlockBorderStyle) =>
                      update({ borderStyle })
                    }
                  >
                    {PROFILE_BLOCK_BORDER_STYLES.map((borderStyle) => (
                      <Button key={borderStyle} value={borderStyle}>
                        {t(
                          `profile.inspector.blockStyle.borderStyles.${borderStyle}`
                        )}
                      </Button>
                    ))}
                  </ButtonGroup>
                  {colorInput(
                    "blockBorderColor",
                    current.borderColor ?? "#ffffff",
                    (borderColor) => update({ borderColor })
                  )}
                </>
              )}
            </ProfileInspectorField>
          </>
        )}

        {sections.includes("effects") && (
          <>
            <ProfileInspectorField
              label={t("profile.inspector.blockStyle.shadow")}
              onReset={
                current.shadow
                  ? () => update({ shadow: null, shadowColor: undefined })
                  : undefined
              }
            >
              <ButtonGroup
                toggleable
                exclusive
                size="sm"
                color="neutral"
                fullWidth
                expand
                value={current.shadow ?? NO_SHADOW}
                onChange={(shadow: ProfileBlockShadow | typeof NO_SHADOW) =>
                  update({ shadow: shadow === NO_SHADOW ? null : shadow })
                }
              >
                {[NO_SHADOW, ...PROFILE_BLOCK_SHADOWS].map((shadow) => (
                  <Button key={shadow} value={shadow}>
                    {t(`profile.inspector.blockStyle.shadows.${shadow}`)}
                  </Button>
                ))}
              </ButtonGroup>
              {current.shadow &&
                colorInput(
                  "blockShadowColor",
                  current.shadowColor ??
                    (current.shadow === "glow" ? "#ffffff" : "#000000"),
                  (shadowColor) => update({ shadowColor })
                )}
            </ProfileInspectorField>
          </>
        )}

        {sections.includes("reset") && (
          <>
            {hasStyleValues && (
              <Button
                size="sm"
                color="neutral"
                startDecorator={<ArrowsCounterClockwiseIcon />}
                onClick={() =>
                  update({
                    borderWidth: undefined,
                    borderStyle: undefined,
                    borderColor: undefined,
                    shadow: undefined,
                    shadowColor: undefined,
                    opacity: undefined,
                    blur: undefined,
                    font: undefined,
                    textEffect: undefined,
                    textEffectColor: undefined
                  })
                }
              >
                {t("profile.inspector.blockStyle.reset")}
              </Button>
            )}
          </>
        )}

        {sections.includes("motion") && (
          <ProfileInspectorField
            label={t("profile.inspector.blockStyle.entrance")}
            hint={t("profile.inspector.blockStyle.entranceHint")}
            onReset={
              current.entrance
                ? () => update({ entrance: undefined })
                : undefined
            }
          >
            <div
              css={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 6
              }}
            >
              {[NO_ENTRANCE, ...PROFILE_BLOCK_ENTRANCES].map((entrance) => {
                const selected = (current.entrance ?? NO_ENTRANCE) === entrance;
                return (
                  <Button
                    key={entrance}
                    size="sm"
                    color={selected ? "primary" : "neutral"}
                    aria-pressed={selected}
                    onClick={() =>
                      update({
                        entrance:
                          entrance === NO_ENTRANCE
                            ? undefined
                            : (entrance as ProfileBlockEntrance)
                      })
                    }
                  >
                    {t(`profile.inspector.blockStyle.entrances.${entrance}`)}
                  </Button>
                );
              })}
            </div>
          </ProfileInspectorField>
        )}
      </Stack>
    );
  }
);
