import { ThemeCreatorModal } from "@components/ThemeCreator/ThemeCreatorModal";
import { Tooltip } from "@components/Tooltip";
import { useModal } from "@contexts/Modal.context";
import type { Theme as MzTheme } from "@emotion/react";
import { useAppStore } from "@hooks/useStores";
import type { APISpace, APITheme } from "@mutualzz/types";
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
  Button,
  Divider,
  Stack,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import { CheckIcon, PaletteIcon } from "@phosphor-icons/react";
import { IconButton } from "@renderer/components/IconButton";
import { Theme } from "@stores/objects/Theme";
import type { Space } from "@stores/objects/Space";
import { useMutation, useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { type CSSProperties, useEffect } from "react";
import { useTranslation } from "react-i18next";

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
    const colors = extractColors(colorOrGradient);
    if (colors?.length) return gradientToDataUrl(colors);
  }
  return solidColorToDataUrl(String(colorOrGradient));
}

interface SpaceThemeSettingsProps {
  space: Space;
}

export const SpaceThemeSettings = observer(
  ({ space }: SpaceThemeSettingsProps) => {
    const { t } = useTranslation("space");
    const { t: tSettings } = useTranslation("settings");
    const app = useAppStore();
    const { theme: uiTheme } = useTheme();
    const { openModal } = useModal();

    const { data: spaceThemes = [], refetch } = useQuery({
      queryKey: ["space-themes", space.id],
      queryFn: () =>
        app.rest.get<APITheme[]>(`/spaces/${space.id}/themes`),
      enabled: !!space.id
    });

    useEffect(() => {
      if (spaceThemes.length) app.themes.addAll(spaceThemes);
    }, [spaceThemes, app.themes]);

    const { mutate: setThemeId, isPending } = useMutation({
      mutationFn: async (themeId: string | null) => {
        const formData = new FormData();
        formData.append("themeId", themeId ?? "");
        return app.rest.patchFormData<
          APISpace & { theme?: APITheme | null }
        >(`/spaces/${space.id}`, formData);
      },
      onSuccess: (data) => {
        space.themeId = data.themeId ?? null;
        space.theme = data.theme ?? null;
        if (data.theme) app.themes.add(data.theme);
        void refetch();
      }
    });

    const defaultThemes = [baseDarkTheme, baseLightTheme];
    const defaultColorThemes = app.themes.all
      .filter((theme) => !theme.author && !theme.spaceId)
      .filter((theme) => theme.id !== "baseDark" && theme.id !== "baseLight");
    const normalThemes = defaultColorThemes.filter(
      (theme) => theme.style === "normal"
    );
    const gradientThemes = defaultColorThemes.filter(
      (theme) => theme.style === "gradient"
    );
    const customThemes = app.themes.all.filter(
      (theme) => theme.spaceId === space.id
    );

    const activeId = space.themeId ?? null;

    const renderBlob = (theme: Theme | MzTheme) => {
      const description =
        theme.description || tSettings("appearance.noDescription");
      const selected = theme.id === activeId;
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
          <Box position="relative">
            <ImageBlob
              src={colorOrGradientToDataUrl(theme.colors.background)}
              onClick={() => {
                if (selected || isPending) return;
                setThemeId(theme.id);
              }}
              current={selected}
            />
            {selected && (
              <Stack
                position="absolute"
                top={-1}
                right={-2}
                alignItems="center"
                border={`2px solid ${uiTheme.colors.surface}`}
                justifyContent="center"
                fontSize="0.75rem"
                width="1.5rem"
                height="1.5rem"
                borderRadius="50%"
                css={{
                  background: uiTheme.colors.primary,
                  pointerEvents: "none"
                }}
              >
                <CheckIcon color={uiTheme.typography.colors.primary} />
              </Stack>
            )}
          </Box>
        </Tooltip>
      );
    };

    return (
      <Stack direction="column" spacing={3} width="100%" maxWidth={720}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography level="body-md">{t("theme.description")}</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              size="sm"
              variant="soft"
              disabled={isPending || !activeId}
              onClick={() => setThemeId(null)}
            >
              {t("theme.clear")}
            </Button>
            <Tooltip content={t("theme.createCustom")} placement="top">
              <IconButton
                variant="soft"
                size="sm"
                onClick={() => {
                  app.themeCreator.setSpaceId(space.id);
                  app.themeCreator.resetToBaseTheme();
                  openModal("theme-creator", <ThemeCreatorModal />);
                }}
              >
                <PaletteIcon weight="fill" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Stack direction="column">
          <Divider lineColor="muted" inset="half-start">
            <Typography fontWeight="bold" level="body-sm">
              {tSettings("appearance.defaultThemes")}
            </Typography>
          </Divider>
          <Stack style={gridStyles} display="grid">
            {defaultThemes.map((theme) => renderBlob(theme))}
          </Stack>
        </Stack>

        {normalThemes.length > 0 && (
          <Stack direction="column">
            <Divider lineColor="muted" inset="half-start">
              <Typography fontWeight="bold" level="body-sm">
                {tSettings("appearance.normal")}
              </Typography>
            </Divider>
            <Stack style={gridStyles} display="grid">
              {normalThemes.map((theme) => renderBlob(theme))}
            </Stack>
          </Stack>
        )}

        {gradientThemes.length > 0 && (
          <Stack direction="column">
            <Divider lineColor="muted" inset="half-start">
              <Typography fontWeight="bold" level="body-sm">
                {tSettings("appearance.gradient")}
              </Typography>
            </Divider>
            <Stack style={gridStyles} display="grid">
              {gradientThemes.map((theme) => renderBlob(theme))}
            </Stack>
          </Stack>
        )}

        <Stack direction="column">
          <Divider lineColor="muted" inset="half-start">
            <Typography fontWeight="bold" level="body-sm">
              {t("theme.spaceThemes")}
            </Typography>
          </Divider>
          {customThemes.length === 0 ? (
            <Typography level="body-sm" textColor="muted" px={3} py={2}>
              {t("theme.noCustomThemes")}
            </Typography>
          ) : (
            <Stack style={gridStyles} display="grid">
              {customThemes.map((theme) => renderBlob(theme))}
            </Stack>
          )}
        </Stack>
      </Stack>
    );
  }
);
