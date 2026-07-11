import { InputWithLabel } from "@components/InputWithLabel";
import type { ColorLike } from "@mutualzz/ui-core";
import { Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@hooks/useStores";
import { InfoIcon } from "@phosphor-icons/react";

export const ThemeCreatorColorsFeedback = observer(() => {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const { values, setValues } = app.themeCreator;

  return (
    <Stack direction="column" p={4} spacing={5}>
      <InputWithLabel
        type="color"
        label={t("themeCreator.colors.primary")}
        name="primaryColor"
        description={
          <>
            {t("themeCreator.colors.primaryDescription")}
            <Typography
              level="body-sm"
              display="flex"
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
        name="neutralColor"
        label={t("themeCreator.colors.neutral")}
        description={t("themeCreator.colors.neutralDescription")}
        required
        value={values.colors.neutral}
        onChange={(color: ColorLike) =>
          setValues({
            ...values,
            colors: {
              ...values.colors,
              neutral: color
            }
          })
        }
        fullWidth
      />
      <InputWithLabel
        type="color"
        name="successColor"
        label={t("themeCreator.colors.success")}
        description={t("themeCreator.colors.successDescription")}
        required
        value={values.colors.success}
        onChange={(color: ColorLike) =>
          setValues({
            ...values,
            colors: {
              ...values.colors,
              success: color
            }
          })
        }
        fullWidth
      />
      <InputWithLabel
        type="color"
        name="dangerColor"
        label={t("themeCreator.colors.danger")}
        description={t("themeCreator.colors.dangerDescription")}
        value={values.colors.danger}
        onChange={(color: ColorLike) =>
          setValues({
            ...values,
            colors: {
              ...values.colors,
              danger: color
            }
          })
        }
        fullWidth
      />
      <InputWithLabel
        type="color"
        name="warningColor"
        label={t("themeCreator.colors.warning")}
        description={t("themeCreator.colors.warningDescription")}
        value={values.colors.warning}
        onChange={(color: ColorLike) =>
          setValues({
            ...values,
            colors: {
              ...values.colors,
              warning: color
            }
          })
        }
        fullWidth
      />
      <InputWithLabel
        type="color"
        name="infoColor"
        label={t("themeCreator.colors.info")}
        description={t("themeCreator.colors.infoDescription")}
        value={values.colors.info}
        onChange={(color: ColorLike) =>
          setValues({
            ...values,
            colors: {
              ...values.colors,
              info: color
            }
          })
        }
        fullWidth
      />
    </Stack>
  );
});
