import { ThemeCreatorModal } from "@components/ThemeCreator/ThemeCreatorModal";
import { useModal } from "@contexts/Modal.context";
import type { Theme as MzTheme } from "@emotion/react";
import { usePrefersDark } from "@hooks/usePrefersDark";
import { useAppStore } from "@hooks/useStores";
import {
  type AppLocale,
  localeNativeNames,
  supportedLocales
} from "@mutualzz/i18n";
import type { ThemeType } from "@mutualzz/types";
import {
  baseDarkTheme,
  baseLightTheme,
  type ColorLike,
  extractColors,
  isValidGradient,
  styled
} from "@mutualzz/ui-core";
import {
  Box,
  type BoxProps,
  Divider,
  Paper,
  Stack,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import {
  CheckIcon,
  PaletteIcon,
  RepeatIcon,
  TrashIcon
} from "@phosphor-icons/react";
import { IconButton } from "@renderer/components/IconButton";
import { getPreferredLocale, setPreferredLocale } from "@renderer/i18n";
import { Theme } from "@stores/objects/Theme";
import { useMutation } from "@tanstack/react-query";
import { getAdaptiveIcon } from "@utils/icons";
import { isElectron } from "@utils/index";
import { observer } from "mobx-react-lite";
import {
  type CSSProperties,
  forwardRef,
  useEffect,
  useRef,
  useState
} from "react";
import { useTranslation } from "react-i18next";
import { VirtuosoGrid } from "react-virtuoso";
import { Tooltip } from "@components/Tooltip";
import { AppAppearanceExtrasSettings } from "@components/UserSettings/pages/app/AppAppearanceExtrasSettings";
import {
  SettingsSection,
  SettingsSelectField,
  SettingsToggleRow
} from "@components/UserSettings/SettingsField";

const ImageBlob = styled("img")<{
  current: boolean;
}>(({ theme, current }) => ({
  width: "4rem",
  height: "4rem",
  cursor: "pointer",
  outline: `3px solid ${theme.colors.primary}`,
  boxShadow: current ? `0 0 0 3px ${theme.colors.primary}` : "none",
  borderRadius: "50%"
}));

interface ThemeWithIcon<T> {
  theme: T;
  icon: string;
}

const GRID_ITEM_SIZE = "4rem";

const gridStyles: CSSProperties = {
  display: "grid",
  gridTemplateColumns: `repeat(auto-fill, minmax(${GRID_ITEM_SIZE}, 1fr))`,
  paddingInline: "0.75rem",
  paddingBlock: "0.75rem",
  boxSizing: "border-box",
  gap: "0.625rem"
};

function gradientToDataUrl(colors: string[]): string {
  const stops = colors
    .map(
      (color, i) =>
        `<stop offset="${(i / (colors.length - 1)) * 100}%" stop-color="${color}"/>`
    )
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0">${stops}</linearGradient></defs><circle cx="32" cy="32" r="32" fill="url(#g)" /></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function solidColorToDataUrl(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="32" fill="${color}" /></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function colorOrGradientToDataUrl(colorOrGradient: ColorLike): string {
  if (isValidGradient(colorOrGradient)) {
    const colors = extractColors(colorOrGradient) || ["#888", "#ccc"];
    return gradientToDataUrl(colors);
  }
  return solidColorToDataUrl(colorOrGradient);
}

const VirtuosoGridList = forwardRef<HTMLDivElement, BoxProps>((props, ref) => (
  <Stack
    {...props}
    ref={ref}
    display="grid"
    style={{
      ...gridStyles,
      ...props.style
    }}
  />
));

const VirtuosoGridItem = (props: BoxProps) => <Box {...props} py={1} />;

export const AppAppearanceSettings = observer(() => {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");
  const app = useAppStore();
  const { openModal } = useModal();
  const { theme: currentTheme, changeTheme, type: currentType } = useTheme();
  const prefersDark = usePrefersDark();
  const [preferredLocale, setPreferredLocaleState] = useState<
    AppLocale | "system"
  >(() => getPreferredLocale() ?? "system");

  const iconsRef = useRef<Map<string, ThemeWithIcon<Theme>>>(new Map());
  const [_iconsVersion, setIconsVersion] = useState(0);
  const [adaptiveIcon, setAdaptiveIcon] =
    useState<ThemeWithIcon<MzTheme> | null>(null);

  const [focusedTheme, setFocusedTheme] = useState(currentTheme.id);

  useEffect(() => {
    let cancelled = false;
    const loadIcons = async () => {
      const iconMap = new Map<string, ThemeWithIcon<Theme>>();
      await Promise.all(
        app.themes.all.map(async (theme) => {
          const icon = await getAdaptiveIcon(Theme.toEmotion(theme));
          iconMap.set(theme.id, { theme, icon });
        })
      );
      if (!cancelled) {
        iconsRef.current = iconMap;
        setIconsVersion((v) => v + 1);
      }
    };
    loadIcons();
    return () => {
      cancelled = true;
    };
  }, [app.themes.themes.size]);

  useEffect(() => {
    let cancelled = false;
    const setupAdaptive = async () => {
      const icon = await getAdaptiveIcon(currentTheme);
      if (!cancelled) setAdaptiveIcon({ theme: currentTheme, icon });
    };
    setupAdaptive();
    return () => {
      cancelled = true;
    };
  }, [currentTheme]);

  const { mutate: deleteTheme, isPending: isDeleting } = useMutation({
    mutationKey: ["delete-theme", focusedTheme],
    mutationFn: async (themeId: string) =>
      app.rest.delete<{ id: string }>(`@me/themes/${themeId}`),
    onSuccess: ({ id: themeId }: { id: string }) => {
      const deletingCurrent = currentTheme.id === themeId;

      app.themes.remove(themeId);

      if (deletingCurrent) {
        const fallback = prefersDark ? baseDarkTheme : baseLightTheme;

        app.settings?.setCurrentTheme(fallback.id);
        app.themes.setCurrentTheme(fallback.id);

        changeTheme(Theme.toEmotion(fallback));
      }

      setFocusedTheme((prev) => (prev === themeId ? "" : prev));
    }
  });

  const defaultThemes = [baseDarkTheme, baseLightTheme];

  const defaultColorThemes = app.themes.all
    .filter((theme) => !theme.author)
    .filter((theme) => theme.id !== "baseDark" && theme.id !== "baseLight");

  const normalThemes = defaultColorThemes.filter(
    (theme) => theme.style === "normal"
  );

  const gradientThemes = defaultColorThemes.filter(
    (theme) => theme.style === "gradient"
  );

  const userThemes = app.themes.all.filter(
    (theme) => theme.author && !theme.spaceId
  );

  const icons = iconsRef.current;

  const defaultIcons = Array.from(icons.values()).filter(
    (ic) => !ic.theme.author
  );
  const userIcons = Array.from(icons.values()).filter((ic) => ic.theme.author);

  const handleThemeChange = (theme: MzTheme | Theme) => {
    if (theme.id === currentTheme.id) return;
    changeTheme(Theme.toEmotion(theme));
    app?.settings?.setCurrentTheme(theme.id);
  };

  const handleIconChange = (iconId: string | null) => {
    if (iconId === app.themes.currentIcon) return;
    app.themes.setCurrentIcon(iconId);
    app.settings?.setCurrentIcon(iconId);
  };

  const handleSyncWithSystem = () => {
    if (!currentType) return;
    changeTheme(null);
    app?.settings?.setCurrentTheme(null);
  };

  const renderThemeColorBlob =
    (
      themes: (Theme | MzTheme)[],
      currentTheme: MzTheme,
      currentType: ThemeType | null,
      onDelete?: (id: string) => void,
      focusedThemeId?: string,
      isDeleting?: boolean,
      setFocusedTheme?: (id: string) => void
    ) =>
    (index: number) => {
      const theme = themes[index];
      const description = theme.description || t("appearance.noDescription");
      return (
        <Tooltip
          key={theme.id}
          title={
            <>
              {theme.name}
              <br />
              {description}
            </>
          }
          typographyProps={{ level: "body-sm" }}
          placement="top"
        >
          <Box
            position="relative"
            onMouseEnter={() => setFocusedTheme?.(theme.id)}
            onMouseLeave={() => setFocusedTheme?.("")}
            onFocus={() => setFocusedTheme?.(theme.id)}
          >
            {onDelete &&
              (focusedThemeId === theme.id || currentTheme.id === theme.id) && (
                <IconButton
                  onClick={() => onDelete(theme.id)}
                  css={{
                    position: "absolute",
                    bottom: -3,
                    right: -3,
                    zIndex: 1
                  }}
                  color="danger"
                  variant="solid"
                  size={12}
                  disabled={isDeleting}
                >
                  <TrashIcon weight="fill" />
                </IconButton>
              )}
            <ImageBlob
              src={colorOrGradientToDataUrl(theme.colors.background)}
              onClick={() => handleThemeChange(theme)}
              current={
                theme.id === currentTheme.id && currentType === theme.type
              }
              onMouseEnter={() => setFocusedTheme?.(theme.id)}
            />
            {theme.id === currentTheme.id && currentType === theme.type && (
              <Stack
                position="absolute"
                top={-1}
                right={-2}
                alignItems="center"
                border={`2px solid ${currentTheme.colors.surface}`}
                justifyContent="center"
                fontSize="0.75rem"
                width="1.5rem"
                height="1.5rem"
                borderRadius="50%"
                css={{
                  background: currentTheme.colors.primary,
                  pointerEvents: "none"
                }}
              >
                <CheckIcon color={currentTheme.typography.colors.primary} />
              </Stack>
            )}
          </Box>
        </Tooltip>
      );
    };

  const renderIconBlob =
    (
      iconsArr: ThemeWithIcon<Theme>[],
      currentIcon: string | null,
      currentTheme: MzTheme
    ) =>
    (index: number) => {
      const icon = iconsArr[index];
      return (
        <Tooltip
          key={`${icon.theme.id}-icon`}
          placement="top"
          typographyProps={{ level: "body-sm" }}
          title={t("appearance.themeIcon", { name: icon.theme.name })}
        >
          <Box
            position="relative"
            display="inline-flex"
            width="4rem"
            height="4rem"
          >
            <ImageBlob
              onClick={() => handleIconChange(icon.theme.id)}
              current={icon.theme.id === currentIcon}
              src={icon.icon}
            />
            {icon.theme.id === currentIcon && (
              <Stack
                position="absolute"
                top={-1}
                right={-2}
                alignItems="center"
                border={`2px solid ${currentTheme.colors.surface}`}
                justifyContent="center"
                fontSize="0.75rem"
                width="1.5rem"
                height="1.5rem"
                borderRadius="50%"
                css={{
                  background: currentTheme.colors.primary,
                  pointerEvents: "none"
                }}
              >
                <CheckIcon color={currentTheme.typography.colors.primary} />
              </Stack>
            )}
          </Box>
        </Tooltip>
      );
    };

  return (
    <Stack direction="column" pt={2.5} pb={5} spacing={7.5}>
      <SettingsSection title={tCommon("language.title")}>
        <SettingsSelectField
          title={tCommon("language.title")}
          description={tCommon("language.description")}
          value={preferredLocale}
          onChange={(value) => {
            const next = value as AppLocale | "system";
            setPreferredLocaleState(next);
            setPreferredLocale(next);
          }}
          options={[
            { value: "system", label: tCommon("language.systemDefault") },
            ...supportedLocales.map((locale) => ({
              value: locale,
              label: localeNativeNames[locale]
            }))
          ]}
        />
      </SettingsSection>
      <Paper
        direction="column"
        py={2.5}
        px={4}
        variant="outlined"
        spacing={2.5}
        borderRadius={10}
      >
        <Stack spacing={1.25} alignItems="center">
          <Typography fontWeight="bold" level="body-lg">
            {t("appearance.themes")}
          </Typography>
          <Tooltip
            content={t("appearance.createCustomTheme")}
            placement="top"
          >
            <IconButton
              variant="soft"
              onClick={() => {
                app.themeCreator.setSpaceId(null);
                openModal("theme-creator", <ThemeCreatorModal />);
              }}
              size="sm"
            >
              <PaletteIcon weight="fill" />
            </IconButton>
          </Tooltip>
        </Stack>
        <SettingsToggleRow
          title={t("appearance.preferEmbossed")}
          checked={!!app.settings?.preferEmbossed}
          onChange={() => app.settings?.togglePreferEmbossed()}
        />
        <Stack direction="column">
          <Divider lineColor="muted" inset="half-start">
            <Typography fontWeight="bold" level="body-sm">
              {t("appearance.defaultThemes")}
            </Typography>
          </Divider>
          <Stack style={gridStyles} display="grid">
            {defaultThemes.map((_, idx) =>
              renderThemeColorBlob(
                defaultThemes,
                currentTheme,
                currentType
              )(idx)
            )}
            <Tooltip
              title={t("appearance.syncWithSystem")}
              typographyProps={{ level: "body-sm" }}
              placement="top"
            >
              <Box position="relative">
                <ImageBlob
                  src={colorOrGradientToDataUrl(
                    prefersDark
                      ? baseDarkTheme.colors.background
                      : baseLightTheme.colors.background
                  )}
                  current={!currentType}
                  onClick={() => handleSyncWithSystem()}
                />
                <Stack
                  position="absolute"
                  top={-1}
                  right={-2}
                  alignItems="center"
                  border={`2px solid ${currentTheme.colors.surface}`}
                  justifyContent="center"
                  fontSize="0.75rem"
                  width="1.5rem"
                  height="1.5rem"
                  borderRadius="50%"
                  css={{
                    background: currentTheme.colors.primary,
                    pointerEvents: "none"
                  }}
                >
                  {currentType ? (
                    <RepeatIcon
                      color={currentTheme.typography.colors.primary}
                    />
                  ) : (
                    <CheckIcon color={currentTheme.typography.colors.primary} />
                  )}
                </Stack>
              </Box>
            </Tooltip>
          </Stack>
        </Stack>
        {userThemes.length > 0 && (
          <Stack direction="column">
            <Divider lineColor="muted" inset="half-start">
              <Typography fontWeight="bold" level="body-sm">
                {t("appearance.yourThemes")}
              </Typography>
            </Divider>
            <VirtuosoGrid
              style={{
                height: userThemes.length > 10 ? "10rem" : "5rem",
                width: "100%"
              }}
              totalCount={userThemes.length}
              overscan={4}
              components={{
                List: VirtuosoGridList,
                Item: VirtuosoGridItem
              }}
              itemContent={renderThemeColorBlob(
                userThemes,
                currentTheme,
                currentType,
                deleteTheme,
                focusedTheme,
                isDeleting,
                setFocusedTheme
              )}
            />
          </Stack>
        )}
        <Stack direction="column">
          <Divider
            lineColor="muted"
            inset="half-start"
            css={{
              marginBottom: "0.625rem"
            }}
          >
            <Typography fontWeight="bold" level="body-sm">
              {t("appearance.colorThemes")}
            </Typography>
          </Divider>
          <Stack direction="column" spacing={2.5}>
            <Typography level="body-xs" fontWeight="bold">
              {t("appearance.normal")}
            </Typography>
            <VirtuosoGrid
              style={{ height: "10rem", width: "100%" }}
              totalCount={normalThemes.length}
              overscan={4}
              components={{
                List: VirtuosoGridList,
                Item: VirtuosoGridItem
              }}
              itemContent={renderThemeColorBlob(
                normalThemes,
                currentTheme,
                currentType
              )}
            />
          </Stack>
          <Stack direction="column" spacing={2.5}>
            <Typography level="body-xs" fontWeight="bold">
              {t("appearance.gradient")}
            </Typography>
            <VirtuosoGrid
              style={{ height: "10rem", width: "100%" }}
              totalCount={gradientThemes.length}
              overscan={4}
              components={{
                List: VirtuosoGridList,
                Item: VirtuosoGridItem
              }}
              itemContent={renderThemeColorBlob(
                gradientThemes,
                currentTheme,
                currentType
              )}
            />
          </Stack>
        </Stack>
      </Paper>
      {icons.size > 0 && (
        <Paper
          variant="outlined"
          borderRadius={10}
          direction="column"
          py={2}
          px={4}
          spacing={2.5}
        >
          <Typography level="body-lg" fontWeight="bolder">
            {t("appearance.icons")}
          </Typography>
          <Stack direction="column" spacing={2.5}>
            <Divider inset="half-start" lineColor="muted">
              <Typography level="body-sm" fontWeight="bold">
                {t("appearance.defaultIcons")}
              </Typography>
            </Divider>
            <VirtuosoGrid
              style={{
                height: "10rem",
                width: "100%"
              }}
              totalCount={defaultIcons.length + 1}
              overscan={4}
              components={{
                List: VirtuosoGridList,
                Item: VirtuosoGridItem
              }}
              itemContent={(index: number) => {
                if (index === 0) {
                  return (
                    <Tooltip
                      paperProps={{
                        borderRadius: 10
                      }}
                      typographyProps={{
                        level: "body-sm"
                      }}
                      title={t("appearance.adaptWithCurrentTheme")}
                      placement="top"
                    >
                      <Box
                        position="relative"
                        display="inline-flex"
                        width="4rem"
                        height="4rem"
                      >
                        <ImageBlob
                          current={!app.themes.currentIcon}
                          onClick={() => {
                            handleIconChange(null);
                          }}
                          src={adaptiveIcon?.icon ?? undefined}
                        />
                        <Stack
                          position="absolute"
                          top={-1}
                          right={-2}
                          alignItems="center"
                          border={`2px solid ${currentTheme.colors.surface}`}
                          justifyContent="center"
                          fontSize="0.75rem"
                          width="1.5rem"
                          height="1.5rem"
                          borderRadius="50%"
                          css={{
                            background: currentTheme.colors.primary,
                            pointerEvents: "none"
                          }}
                        >
                          {app.themes.currentIcon ? (
                            <RepeatIcon
                              color={currentTheme.typography.colors.primary}
                            />
                          ) : (
                            <CheckIcon
                              color={currentTheme.typography.colors.primary}
                            />
                          )}
                        </Stack>
                      </Box>
                    </Tooltip>
                  );
                }
                return renderIconBlob(
                  defaultIcons,
                  app.themes.currentIcon,
                  currentTheme
                )(index - 1);
              }}
            />
          </Stack>
          {userIcons.length > 0 && (
            <Stack direction="column" spacing={2.5}>
              <Divider inset="half-start" lineColor="muted">
                <Typography level="body-sm" fontWeight="bold">
                  {t("appearance.yourIcons")}
                </Typography>
              </Divider>
              <VirtuosoGrid
                style={{
                  height: userIcons.length > 10 ? "10rem" : "5rem",
                  width: "100%"
                }}
                totalCount={userIcons.length}
                overscan={4}
                components={{
                  List: VirtuosoGridList,
                  Item: VirtuosoGridItem
                }}
                itemContent={renderIconBlob(
                  userIcons,
                  app.themes.currentIcon,
                  currentTheme
                )}
              />
            </Stack>
          )}
        </Paper>
      )}
      <SettingsSection title={t("appearance.startupMode")}>
        <SettingsSelectField
          title={t("appearance.startupMode")}
          description={t("appearance.startupModeDescription")}
          value={app.settings?.preferredMode === "feed" ? "feed" : "spaces"}
          onChange={(value) => {
            if (value === "spaces" || value === "feed") {
              app.settings?.setPreferredMode(value);
              app.settings?.flush();
            }
          }}
          options={[
            { value: "spaces", label: t("appearance.startupModeSpaces") },
            { value: "feed", label: t("appearance.startupModeFeed") }
          ]}
        />
      </SettingsSection>
      <SettingsSection title={t("appearance.convertEmoticons")}>
        <SettingsToggleRow
          title={t("appearance.convertEmoticons")}
          description={t("appearance.convertEmoticonsDescription")}
          checked={!!app.settings?.extendedSettings.convertEmoticons}
          onChange={(checked) => {
            if (!app.settings) return;
            app.settings.patchExtendedSettings({ convertEmoticons: checked });
            app.settings.flush();
          }}
        />
      </SettingsSection>
      {isElectron ? (
        <SettingsSection title={t("appearance.spellcheck")}>
          <SettingsToggleRow
            title={t("appearance.spellcheck")}
            description={t("appearance.spellcheckDescription")}
            checked={!!app.settings?.spellcheckEnabled}
            onChange={() => app.settings?.toggleSpellcheckEnabled()}
          />
        </SettingsSection>
      ) : null}
      <AppAppearanceExtrasSettings />
    </Stack>
  );
});
