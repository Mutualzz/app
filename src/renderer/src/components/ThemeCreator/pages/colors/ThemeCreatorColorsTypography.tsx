import { InputWithLabel } from "@components/InputWithLabel";
import { GoogleFontPicker } from "@components/FontPicker/GoogleFontPicker";
import type { ColorLike } from "@mutualzz/ui-core";
import { extractPrimaryFontFamily } from "@mutualzz/ui-core";
import { Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@hooks/useStores";
import { InfoIcon } from "@phosphor-icons/react";

export const ThemeCreatorColorsTypography = observer(() => {
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
        label={t("themeCreator.colors.primaryText")}
        name="typographyPrimaryColor"
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
      <InputWithLabel
        type="color"
        label={t("themeCreator.colors.secondaryText")}
        name="typographySecondaryColor"
        description={t("themeCreator.colors.secondaryTextDescription")}
        required
        value={values.typography.colors.secondary}
        onChange={(color: ColorLike) =>
          setValues({
            ...values,
            typography: {
              ...values.typography,
              colors: {
                ...values.typography.colors,
                secondary: color
              }
            }
          })
        }
        fullWidth
      />
      <InputWithLabel
        type="color"
        label={t("themeCreator.colors.accentText")}
        name="typographyAccentColor"
        description={t("themeCreator.colors.accentTextDescription")}
        required
        value={values.typography.colors.accent}
        onChange={(color: ColorLike) =>
          setValues({
            ...values,
            typography: {
              ...values.typography,
              colors: {
                ...values.typography.colors,
                accent: color
              }
            }
          })
        }
        fullWidth
      />
      <InputWithLabel
        type="color"
        label={t("themeCreator.colors.mutedText")}
        name="typographyMutedColor"
        description={t("themeCreator.colors.mutedTextDescription")}
        required
        value={values.typography.colors.muted}
        onChange={(color: ColorLike) =>
          setValues({
            ...values,
            typography: {
              ...values.typography,
              colors: {
                ...values.typography.colors,
                muted: color
              }
            }
          })
        }
        fullWidth
      />
    </Stack>
  );
});
