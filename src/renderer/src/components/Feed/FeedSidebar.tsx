import { AnimatedLogo } from "@components/Animated/AnimatedLogo";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { ButtonGroup, Stack } from "@mutualzz/ui-web";
import { useNavigate } from "@tanstack/react-router";
import capitalize from "lodash-es/capitalize";
import { observer } from "mobx-react-lite";
import { IconButton } from "@components/IconButton";
import {
  CompassIcon,
  HouseIcon,
  PaletteIcon,
  StarIcon,
  UsersIcon
} from "@phosphor-icons/react";
import { Tooltip } from "@components/Tooltip";

const links = [
  {
    label: "My Profile",
    icon: <HouseIcon weight="fill" />,
    to: "my-profile"
  },
  {
    label: "Friends",
    icon: <UsersIcon weight="fill" />
  },
  {
    label: "Favorites",
    icon: <StarIcon weight="fill" />
  },
  {
    label: "Explore / Discover",
    icon: <CompassIcon weight="fill" />
  },
  {
    label: "Customize Profile",
    icon: <PaletteIcon weight="fill" />,
    to: "customize-profile"
  }
];

export const FeedSidebar = observer(() => {
  const app = useAppStore();
  const navigate = useNavigate();

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 1 : 0}
      width="5rem"
      direction="column"
      pt={1}
      spacing={2.5}
      variant="plain"
      alignItems="center"
      boxShadow="none !important"
      height="100%"
    >
      <Stack width="100%" alignItems="center" justifyContent="center">
        <Tooltip
          content={`Switch to ${capitalize(
            app.mode
              ? "Direct Messages"
              : (app.settings?.preferredMode ?? "Spaces")
          )}`}
          placement="right"
        >
          <AnimatedLogo
            css={{
              width: 48,
              cursor: "pointer",
              marginBottom: 5
            }}
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => {
              navigate({
                to: app.mode
                  ? "/@me"
                  : `/${app.settings?.preferredMode ?? "spaces"}`,
                replace: true
              });
            }}
          />
        </Tooltip>
      </Stack>

      <ButtonGroup
        orientation="vertical"
        variant="plain"
        spacing={15}
        size="lg"
      >
        {links.map((link) => (
          <Tooltip content={link.label} placement="right" key={link.label}>
            <IconButton
              key={`feed-sidebar-link-${link.label}`}
              onClick={() => {
                if (!app.account) return;
                if (link.to === "my-profile") {
                  navigate({
                    to: "/users/$username",
                    params: { username: app.account.username }
                  });
                  return;
                }
                if (link.to === "customize-profile") {
                  navigate({ to: "/profile" });
                }
              }}
            >
              {link.icon}
            </IconButton>
          </Tooltip>
        ))}
      </ButtonGroup>
    </Paper>
  );
});
