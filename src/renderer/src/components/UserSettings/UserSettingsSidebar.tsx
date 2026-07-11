import { Paper } from "@components/Paper";
import {
  type UserSettingsCategories,
  type UserSettingsPage,
  useUserSettings
} from "@components/UserSettings/UserSettings.context";
import { useAppStore } from "@hooks/useStores";
import {
  settingsCategoryTitleKeys,
  settingsPageTitleKeys
} from "@mutualzz/i18n";
import {
  Box,
  ButtonGroup,
  Divider,
  Link,
  Stack,
  Typography
} from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { Fragment, type JSX } from "react";
import { useTranslation } from "react-i18next";
import { UserAvatar } from "../User/UserAvatar";
import { Button } from "@components/Button";
import { isElectron } from "@utils/index";
import { useModal } from "@contexts/Modal.context";
import { useNavigate } from "@tanstack/react-router";
import {
  BellIcon,
  LifebuoyIcon,
  MicrophoneIcon,
  PaletteIcon,
  PencilIcon,
  SignOutIcon,
  SmileyIcon,
  UserGearIcon
} from "@phosphor-icons/react";

interface UserSettingsSidebarProps {
  drawerOpen?: boolean;
  setDrawerOpen?: (open: boolean) => void;
}

interface Pages {
  label: UserSettingsPage;
  titleKey?: string;
  icon: JSX.Element;
}

type SettingsPages = Record<UserSettingsCategories, Pages[]>;

const settingsPages: SettingsPages = {
  "user-settings": [
    {
      label: "my-account",
      icon: <UserGearIcon weight="fill" />
    },
    {
      label: "expressions",
      icon: <SmileyIcon weight="fill" />
    }
  ],
  "app-settings": [
    {
      label: "appearance",
      icon: <PaletteIcon weight="fill" />
    },
    {
      label: "voice_and_video",
      titleKey: "pages.voiceAndVideo",
      icon: <MicrophoneIcon weight="fill" />
    },
    {
      label: "notifications",
      icon: <BellIcon weight="fill" />
    }
  ]
};

export const UserSettingsSidebar = observer(
  ({ drawerOpen, setDrawerOpen }: UserSettingsSidebarProps) => {
    const { t } = useTranslation("settings");
    const app = useAppStore();
    const navigate = useNavigate();
    const { closeModal } = useModal();

    const { currentPage, setCurrentPage, setCurrentCategory } =
      useUserSettings();

    const handlePageSwitch = (
      category: UserSettingsCategories,
      page: UserSettingsPage
    ) => {
      setCurrentPage(page);
      setCurrentCategory(category);
      if (drawerOpen && setDrawerOpen) {
        setDrawerOpen(false);
      }
    };

    const openSupport = () => {
      closeModal();
      if (drawerOpen && setDrawerOpen) {
        setDrawerOpen(false);
      }
      navigate({ to: "/support" });
    };

    if (!app.account) return null;

    const categories = Object.entries(settingsPages);

    const pageLabel = (page: Pages) => {
      if (page.titleKey) return t(page.titleKey);
      const key =
        settingsPageTitleKeys[
          page.label as keyof typeof settingsPageTitleKeys
        ];
      return key ? t(key) : page.label;
    };

    return (
      <Paper
        direction="column"
        width={200}
        height="100%"
        elevation={app.settings?.preferEmbossed ? 5 : 0}
        borderTop="0 !important"
        borderLeft="0 !important"
        borderBottom="0 !important"
        justifyContent="space-between"
        px={2.5}
      >
        <Stack direction="column" height="100%" spacing={2.5}>
          <Stack pt="1rem">
            <Button
              fullWidth
              onClick={() => handlePageSwitch("user-settings", "profile")}
              color="neutral"
              padding={5}
              horizontalAlign="left"
              variant={currentPage === "profile" ? "soft" : "plain"}
            >
              <Stack
                width="100%"
                flex={1}
                direction="row"
                alignItems="center"
                spacing={1.875}
              >
                <UserAvatar size={48} user={app.account} />
                <Stack
                  spacing={0.625}
                  justifyContent="flex-start"
                  alignItems="flex-start"
                  direction="column"
                >
                  <Typography level="body-md">
                    {app.account.displayName}
                  </Typography>
                  <Typography
                    textColor="muted"
                    level="body-xs"
                    justifyContent="center"
                    alignItems="center"
                    display="flex"
                    direction="row"
                    spacing={1}
                  >
                    {t("pages.avatarAndProfile")}
                    <PencilIcon css={{ marginBottom: 5 }} />
                  </Typography>
                </Stack>
              </Stack>
            </Button>
          </Stack>

          {categories.map(([category, pages], index) => (
            <Fragment key={`settings-sidebar-category-fragment-${category}`}>
              <Stack direction="column">
                <Typography level="body-sm" textColor="muted" mb={1.25}>
                  {t(
                    settingsCategoryTitleKeys[
                      category as keyof typeof settingsCategoryTitleKeys
                    ]
                  )}
                </Typography>
                <ButtonGroup
                  color="info"
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
                          category as UserSettingsCategories,
                          page.label
                        )
                      }
                      horizontalAlign="left"
                      key={`user-settings-sidebar-${page.label}`}
                      variant={currentPage === page.label ? "soft" : "plain"}
                      padding={5}
                      disabled={currentPage === page.label}
                    >
                      {pageLabel(page)}
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
        <Stack direction="column" pb="1rem" spacing={1.25}>
          <Button
            color="info"
            variant="plain"
            startDecorator={<LifebuoyIcon weight="fill" />}
            horizontalAlign="left"
            onClick={openSupport}
          >
            {t("helpAndSupport")}
          </Button>
          <Button
            color="danger"
            variant="plain"
            startDecorator={<SignOutIcon weight="fill" />}
            horizontalAlign="left"
            onClick={() => app.logout()}
          >
            {t("logOut")}
          </Button>
        </Stack>

        <Box mb={5} fontFamily="monospace">
          <Stack direction="column" mb={2}>
            <Typography level="body-xs" textColor="muted">
              Mutualzz v{app.versions.app}
            </Typography>
            {import.meta.env.DEV && (
              <Typography variant="plain" level="body-xs" color="danger">
                {t("developmentBuild")}
              </Typography>
            )}
          </Stack>
          <Stack fontFamily="monospace">
            <Link
              href={!isElectron ? "https://mutualzz.com/privacy" : undefined}
              target={!isElectron ? "_blank" : undefined}
              level="body-xs"
              onClick={async (e) => {
                if (isElectron) {
                  e.preventDefault();
                  await window.api.shell.openExternal(
                    "https://mutualzz.com/privacy"
                  );
                }
              }}
              variant="plain"
              color="info"
            >
              {t("privacyPolicy")}
            </Link>
          </Stack>
        </Box>
      </Paper>
    );
  }
);
