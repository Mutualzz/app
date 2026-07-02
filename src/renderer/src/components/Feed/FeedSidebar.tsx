import { AnimatedLogo } from "@components/Animated/AnimatedLogo";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
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
    label: "Explore / Discover",
    icon: <CompassIcon weight="fill" />,
    to: "explore"
  },

  {
    label: "Friends",
    icon: <UsersIcon weight="fill" />,
    to: "friends"
  },
  {
    label: "Favorites",
    icon: <StarIcon weight="fill" />,
    to: "saved"
  },
  {
    label: "My Profile",
    icon: <HouseIcon weight="fill" />,
    to: "my-profile"
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
      width="17.5rem"
      direction="column"
      p={2}
      spacing={3}
      variant="plain"
      alignItems="flex-start"
      boxShadow="none !important"
      height="100%"
    >
      <Stack
        width="100%"
        direction="row"
        alignItems="center"
        spacing={2}
        pl={1}
      >
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
              width: 40,
              cursor: "pointer"
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
        <Typography level="h6" fontWeight={700}>
          Feed
        </Typography>
      </Stack>

      <Stack direction="column" spacing={1} width="100%">
        {links.map((link) => (
          <Stack
            key={`feed-sidebar-link-${link.label}`}
            direction="row"
            alignItems="center"
            spacing={2}
            width="100%"
            p={1.5}
            borderRadius={8}
            css={{
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.06)"
              }
            }}
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
                return;
              }
              if (link.to === "friends") {
                navigate({ to: "/feed/friends" });
                return;
              }
              if (link.to === "saved") {
                navigate({ to: "/feed/saved" });
                return;
              }
              if (link.to === "explore") {
                navigate({ to: "/feed" });
              }
            }}
          >
            <IconButton size="lg">{link.icon}</IconButton>
            <Typography fontWeight={500} whiteSpace="nowrap">
              {link.label}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
});
