import { InputWithLabel } from "@components/InputWithLabel";

import {
  type ColorLike,
  createColor,
  extractColors,
  isValidGradient
} from "@mutualzz/ui-core";
import { Button, Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@hooks/useStores";
import { InfoIcon, WarningIcon } from "@phosphor-icons/react";
import { Theme } from "@stores/objects/Theme";
import { useRef } from "react";

export const ThemeCreatorColorsBase = observer(() => {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const {
    values,
    setValues,
    pendingBackgroundPreviewUrl,
    setPendingBackgroundFile,
    markClearBackgroundImage,
    clearBackgroundImage
  } = app.themeCreator;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingUrl =
    !clearBackgroundImage && !pendingBackgroundPreviewUrl
      ? Theme.resolveBackgroundImageUrl(values)
      : null;
  const previewUrl = pendingBackgroundPreviewUrl || existingUrl;

  return (
    <Stack direction="column" p={4} spacing={5}>
      <InputWithLabel
        type="color"
        label={t("themeCreator.colors.background")}
        name="backgroundColor"
        description={t("themeCreator.colors.backgroundDescription")}
        required
        value={values.colors.background}
        allowGradient
        onChange={(color: ColorLike) => {
          let isDark: boolean;
          let isGradient: boolean;
          if (
            isValidGradient(color) &&
            extractColors(color) &&
            extractColors(color)!.length > 0
          ) {
            isDark = createColor(extractColors(color)![0]).isDark();
            isGradient = true;
          } else {
            isDark = createColor(color).isDark();
            isGradient = false;
          }

          setValues({
            ...values,
            type: isDark ? "dark" : "light",
            style: isGradient ? "gradient" : "normal",
            colors: {
              ...values.colors,
              background: color
            }
          });
        }}
        fullWidth
      />
      <Stack direction="column" spacing={2}>
        <Typography fontWeight="bold" level="body-md">
          {t("themeCreator.colors.backgroundImage")}
        </Typography>
        <Typography level="body-sm" textColor="muted">
          {t("themeCreator.colors.backgroundImageDescription")}
        </Typography>
        {previewUrl && (
          <img
            src={previewUrl}
            alt=""
            css={{
              width: "100%",
              maxHeight: 160,
              objectFit: "cover",
              borderRadius: 8
            }}
          />
        )}
        <Stack direction="row" spacing={2}>
          <Button
            size="sm"
            variant="soft"
            onClick={() => fileInputRef.current?.click()}
          >
            {t("themeCreator.colors.chooseBackgroundImage")}
          </Button>
          {(previewUrl || values.backgroundImage) && (
            <Button
              size="sm"
              variant="plain"
              color="danger"
              onClick={() => markClearBackgroundImage()}
            >
              {t("themeCreator.colors.removeBackgroundImage")}
            </Button>
          )}
        </Stack>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            setPendingBackgroundFile(file);
            if (file) setValues({ wallpaper: null });
            e.target.value = "";
          }}
        />
      </Stack>
      <InputWithLabel
        type="color"
        label={t("themeCreator.colors.surface")}
        name="surfaceColor"
        description={
          <>
            {t("themeCreator.colors.surfaceDescription")}
            <Typography
              level="body-sm"
              display="flex"
              variant="plain"
              color="info"
              spacing={1}
              alignItems="center"
            >
              <InfoIcon weight="fill" />
              {t("themeCreator.colors.surfaceInfo")}
            </Typography>
            <Typography
              level="body-sm"
              color="warning"
              display="flex"
              spacing={1}
              variant="plain"
              alignItems="center"
            >
              <WarningIcon weight="fill" />
              {t("themeCreator.colors.surfaceEmbossedHint")}
            </Typography>
          </>
        }
        value={values.colors.surface}
        allowGradient
        onChange={(color: ColorLike) =>
          setValues({
            ...values,
            colors: { ...values.colors, surface: color }
          })
        }
        fullWidth
      />
      <InputWithLabel
        type="color"
        label={t("themeCreator.colors.black")}
        name="blackColor"
        description={t("themeCreator.colors.blackDescription")}
        value={values.colors.common.black}
        onChange={(color: ColorLike) =>
          setValues({
            ...values,
            colors: {
              ...values.colors,
              common: {
                ...values.colors.common,
                black: color
              }
            }
          })
        }
        fullWidth
      />
      <InputWithLabel
        type="color"
        label={t("themeCreator.colors.white")}
        name="whiteColor"
        description={t("themeCreator.colors.whiteDescription")}
        value={values.colors.common.white}
        fullWidth
        onChange={(color: ColorLike) =>
          setValues({
            ...values,
            colors: {
              ...values.colors,
              common: {
                ...values.colors.common,
                white: color
              }
            }
          })
        }
      />
    </Stack>
  );
});
