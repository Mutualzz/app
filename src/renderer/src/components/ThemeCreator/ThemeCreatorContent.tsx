import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { IconButton } from "@components/IconButton";
import { Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { ThemeCreatorSidebarRight } from "./ThemeCreatorSidebar.right";
import { ThemeCreatorColorsAdaptive } from "./pages/colors/ThemeCreatorColorsAdaptive";
import { ThemeCreatorColorsBase } from "./pages/colors/ThemeCreatorColorsBase";
import { ThemeCreatorColorsFeedback } from "./pages/colors/ThemeCreatorColorsFeedback";
import { ThemeCreatorColorsTypography } from "./pages/colors/ThemeCreatorColorsTypography";
import { ThemeCreatorDetails } from "./pages/general/ThemeCreatorDetails";
import { XIcon } from "@phosphor-icons/react";

export const ThemeCreatorContent = observer(() => {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const { currentCategory, currentPage, values } = app.themeCreator;
  const { closeModal } = useModal();

  return (
    <Stack
      flex={1}
      height="100%"
      width="100%"
      direction="column"
      position="relative"
      overflow="auto"
    >
      <Paper
        borderTopRightRadius={{
          xs: "0.75rem",
          sm: "1.25rem",
          md: "1.5rem"
        }}
        px={{ xs: "0.5rem", sm: 3 }}
        py={{ xs: "0.5rem", sm: 4 }}
        borderLeftWidth="0px !important"
        elevation={app.settings?.preferEmbossed ? 3 : 1}
        justifyContent="space-between"
        borderTop="0 !important"
        borderLeft="0 !important"
      >
        <Stack alignItems="center" justifyContent="center" spacing={40}>
          <Typography
            level={{ xs: "h6", sm: "body-lg" }}
            fontFamily="monospace"
            textAlign="center"
          >
            {currentCategory === "general"
              ? t("themeCreator.headers.pageGeneral", {
                  page: t(`themeCreator.pages.${currentPage}`)
                })
              : t("themeCreator.headers.pageColors", {
                  page: t(`themeCreator.pages.${currentPage}`),
                  category: t(`themeCreator.categories.${currentCategory}`)
                })}
          </Typography>
          <Typography
            level={{ xs: "h6", sm: "body-lg" }}
            fontFamily="monospace"
            textAlign="center"
          >
            {t("themeCreator.headers.themeSummary", {
              type: t(`themeCreator.themeTypes.${values.type}`),
              style: t(`themeCreator.themeStyles.${values.style}`),
              adaptive: values.adaptive
                ? t("themeCreator.headers.adaptiveSuffix")
                : ""
            })}
          </Typography>
        </Stack>
        <IconButton
          css={{
            marginRight: "0.5rem"
          }}
          variant="plain"
          size="sm"
          onClick={() => closeModal()}
        >
          <XIcon />
        </IconButton>
      </Paper>

      <Stack direction="row" flex={1} minHeight={0}>
        <Paper
          flex={1}
          height="100%"
          overflow="auto"
          width="100%"
          elevation={app.settings?.preferEmbossed ? 2 : 1}
          direction="column"
          px={{ xs: "0.5rem", sm: 3 }}
          borderTop="0 !important"
          borderLeft="0 !important"
          borderBottom="0 !important"
          py={{ xs: "0.5rem", sm: 1 }}
          minWidth={0}
          variant="plain"
        >
          {currentPage === "details" && <ThemeCreatorDetails />}
          {!values.adaptive && (
            <>
              {currentPage === "base" && <ThemeCreatorColorsBase />}
              {currentPage === "feedback" && <ThemeCreatorColorsFeedback />}
              {currentPage === "typography" && <ThemeCreatorColorsTypography />}
            </>
          )}
          {values.adaptive && currentPage === "adaptive" && (
            <ThemeCreatorColorsAdaptive />
          )}
        </Paper>

        <Stack flexShrink={0} width={250} height="100%">
          <ThemeCreatorSidebarRight />
        </Stack>
      </Stack>
    </Stack>
  );
});
