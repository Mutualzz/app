import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import {
  ButtonGroup,
  Checkbox,
  Divider,
  Stack,
  Typography
} from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { Fragment, type JSX } from "react";
import type {
  ThemeCreatorCategory,
  ThemeCreatorPage
} from "@stores/ThemeCreator.store";
import { Button } from "@components/Button";
import {
  PaletteIcon,
  TextAaIcon,
  TextAlignJustifyIcon,
  WarningIcon
} from "@phosphor-icons/react";

interface ThemeCreatorSidebarProps {
  drawerOpen?: boolean;
  setDrawerOpen?: (open: boolean) => void;
}

interface Pages {
  label: ThemeCreatorPage;
  icon: JSX.Element;
}

type ThemeCreatorPages = Record<ThemeCreatorCategory, Pages[]>;

// TODO: Work on making adaptive mode change the available pages and inputs
// TODO: and also work on new adaptive theme generation algorithm
export const ThemeCreatorSidebarLeft = observer(
  ({ drawerOpen, setDrawerOpen }: ThemeCreatorSidebarProps) => {
    const { t } = useTranslation("settings");
    const app = useAppStore();

    const {
      values,
      setValues,
      currentPage,
      setCurrentPage,
      setCurrentCategory
    } = app.themeCreator;

    const creatorPages: ThemeCreatorPages = {
      general: [
        {
          label: "details",
          icon: <TextAlignJustifyIcon weight="fill" />
        }
      ],
      colors: values.adaptive
        ? [
            {
              label: "adaptive",
              icon: <PaletteIcon weight="fill" />
            }
          ]
        : [
            {
              label: "base",
              icon: <PaletteIcon weight="fill" />
            },
            {
              label: "feedback",
              icon: <WarningIcon weight="fill" />
            },
            {
              label: "typography",
              icon: <TextAaIcon />
            }
          ]
    };

    const handlePageSwitch = (
      category: ThemeCreatorCategory,
      page: ThemeCreatorPage
    ) => {
      setCurrentPage(page);
      setCurrentCategory(category);
      if (drawerOpen && setDrawerOpen) setDrawerOpen(false);
    };

    const categories = Object.entries(creatorPages);

    return (
      <Paper
        direction="column"
        width="15em"
        height="100%"
        elevation={app.settings?.preferEmbossed ? 5 : 0}
        borderTop="0 !important"
        borderLeft="0 !important"
        borderBottom="0 !important"
        px={2.5}
        pt={5}
        spacing={5}
      >
        <Stack alignItems="center" direction="column">
          <Checkbox
            label={t("themeCreator.sidebar.adaptColorsAutomatically")}
            checked={values.adaptive}
            size="sm"
            onChange={(e) => {
              setValues({ adaptive: e.target.checked });
              setCurrentPage("details");
              setCurrentCategory("general");
            }}
          />
        </Stack>

        <Stack direction="column" spacing={2.5}>
          {categories.map(([category, pages], index) => (
            <Fragment key={`theme-creator-sidebar-category-${category}`}>
              <Stack direction="column">
                <Typography level="body-sm" textColor="muted" mb={1.25}>
                  {t(`themeCreator.categories.${category}`)}
                </Typography>
                <ButtonGroup
                  orientation="vertical"
                  variant="plain"
                  spacing={5}
                  horizontalAlign="left"
                >
                  {pages.map((page) => (
                    <Button
                      startDecorator={page.icon}
                      onClick={() =>
                        handlePageSwitch(
                          category as ThemeCreatorCategory,
                          page.label
                        )
                      }
                      key={`user-settings-sidebar-${page.label}`}
                      variant={currentPage === page.label ? "soft" : "plain"}
                      padding={5}
                      disabled={currentPage === page.label}
                    >
                      {t(`themeCreator.pages.${page.label}`)}
                    </Button>
                  ))}
                </ButtonGroup>
              </Stack>
              {index < categories.length - 1 && (
                <Divider
                  css={{
                    opacity: 0.25
                  }}
                  lineColor="muted"
                />
              )}
            </Fragment>
          ))}
        </Stack>
      </Paper>
    );
  }
);
