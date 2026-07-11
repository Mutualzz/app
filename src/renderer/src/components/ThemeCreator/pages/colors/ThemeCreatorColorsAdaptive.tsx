import { InputWithLabel } from "@components/InputWithLabel";
import { GoogleFontPicker } from "@components/FontPicker/GoogleFontPicker";
import {
  type ColorLike,
  createColor,
  extractColors,
  extractPrimaryFontFamily,
  isValidGradient
} from "@mutualzz/ui-core";
import { Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@hooks/useStores";
import { InfoIcon } from "@phosphor-icons/react";

export const ThemeCreatorColorsAdaptive = observer(() => {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const { values, setValues } = app.themeCreator;

  return (
    <Stack direction="column" p={4} spacing={5}>
      <GoogleFontPicker
        label={t("themeCreator.colors.appFont")}
        description={t("themeCreator.colors.appFontDescription")}
        allowClear={false}
        fontOwnerId={app.account?.id}
        value={
          extractPrimaryFontFamily(values.typography.fontFamily) ??
          values.typography.fontFamily
        }
        onChange={(family) =>
          setValues({
            ...values,
            typography: {
              ...values.typography,
              fontFamily: family ?? values.typography.fontFamily
            }
          })
        }
      />
      <InputWithLabel
        type="color"
        label={t("themeCreator.colors.baseColor")}
        name="baseColor"
        description={t("themeCreator.colors.baseColorDescription")}
        required
        value={values.colors.background}
        allowGradient
        // apiError={errors.backgroundColor}
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
      <InputWithLabel
        type="color"
        label={t("themeCreator.colors.primary")}
        name="primaryColor"
        description={
          <>
            {t("themeCreator.colors.primaryDescription")}{" "}
            <Typography
              level="body-sm"
              display="inline-flex"
              variant="plain"
              color="info"
              spacing={1}
              alignItems="center"
            >
              <InfoIcon weight="fill" />
              {t("themeCreator.colors.primaryIconsHint")}
            </Typography>
          </>
        }
        required
        value={values.colors.primary}
        onChange={(color: ColorLike) =>
          setValues({
            ...values,
            colors: {
              ...values.colors,
              primary: color
            }
          })
        }
        fullWidth
      />
      <InputWithLabel
        type="color"
        label={t("themeCreator.colors.baseText")}
        name="typographyBaseColor"
        description={
          <Stack direction="column" justifyContent="center">
            {t("themeCreator.colors.primaryTextDescription")}{" "}
            <Typography
              level="body-sm"
              display="inline-flex"
              variant="plain"
              color="info"
              spacing={1}
            >
              <InfoIcon weight="fill" />
              {t("themeCreator.colors.primaryTextHint")}
            </Typography>
          </Stack>
        }
        required
        value={values.typography.colors.primary}
        onChange={(color: ColorLike) =>
          setValues({
            ...values,
            typography: {
              ...values.typography,
              colors: {
                ...values.typography.colors,
                primary: color
              }
            }
          })
        }
        fullWidth
      />
    </Stack>
  );
});
