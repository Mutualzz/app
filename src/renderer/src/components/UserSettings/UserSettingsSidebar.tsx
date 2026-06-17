import { Paper } from "@components/Paper";
import {
  type UserSettingsCategories,
  type UserSettingsPage,
  useUserSettings
} from "@components/UserSettings/UserSettings.context";
import { useAppStore } from "@hooks/useStores";
import {
  Box,
  ButtonGroup,
  Divider,
  Link,
  Stack,
  Typography
} from "@mutualzz/ui-web";
import startCase from "lodash-es/startCase";
import { observer } from "mobx-react-lite";
import { Fragment, type JSX } from "react";
import { UserAvatar } from "../User/UserAvatar";
import { Button } from "@components/Button";
import { isElectron } from "@utils/index";
import {
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
  title?: string;
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
      title: "Voice & Video",
      icon: <MicrophoneIcon weight="fill" />
    }
  ]
};

export const UserSettingsSidebar = observer(
  ({ drawerOpen, setDrawerOpen }: UserSettingsSidebarProps) => {
    const app = useAppStore();

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

    if (!app.account) return null;

    const categories = Object.entries(settingsPages);

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
                    Avatar &amp; profile
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
                  {startCase(category)}
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
                      key={`user-settings-sidebar-${page.label}`}
                      variant={currentPage === page.label ? "soft" : "plain"}
                      padding={5}
                      disabled={currentPage === page.label}
                    >
                      {page.title ?? startCase(page.label)}
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
        <Stack direction="column" pb="1rem">
          <Button
            color="danger"
            variant="plain"
            startDecorator={<SignOutIcon weight="fill" />}
            horizontalAlign="left"
            onClick={() => app.logout()}
          >
            Log out
          </Button>
        </Stack>

        <Box mb={5} fontFamily="monospace">
          <Stack direction="column" mb={2}>
            <Typography level="body-xs" textColor="muted">
              Mutualzz v{app.versions.app}
            </Typography>
            {import.meta.env.DEV && (
              <Typography variant="plain" level="body-xs" color="danger">
                DEVELOPMENT BUILD
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
              Privacy Policy
            </Link>
          </Stack>
        </Box>
      </Paper>
    );
  }
);
