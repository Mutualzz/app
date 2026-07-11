import { InputWithLabel } from "@components/InputWithLabel";
import { Stack } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@hooks/useStores";

export const ThemeCreatorDetails = observer(() => {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const { values, errors, setValues } = app.themeCreator;

  return (
    <Stack direction="column" p={4} spacing={5}>
      <InputWithLabel
        label={t("themeCreator.details.themeName")}
        name="name"
        description={t("themeCreator.details.themeNameDescription")}
        required
        value={values.name}
        apiError={errors.name}
        onChange={(e: any) => setValues({ ...values, name: e.target.value })}
      />
      <InputWithLabel
        label={t("themeCreator.details.themeDescription")}
        name="description"
        description={t("themeCreator.details.themeDescriptionHint")}
        value={values.description ?? ""}
        apiError={errors.description}
        onChange={(e: any) =>
          setValues({ ...values, description: e.target.value })
        }
      />
    </Stack>
  );
});
