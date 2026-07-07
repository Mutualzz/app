import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import {
  buildProfileAvatarUrl,
  getUserDisplayName
} from "@utils/profileRoute.utils";
import type { APIPrivateUser, APIUser } from "@mutualzz/types";
import {
  Avatar,
  ButtonGroup,
  Divider,
  IconButton,
  Stack,
  Typography
} from "@mutualzz/ui-web";
import {
  ArrowLeftIcon,
  ClockCounterClockwiseIcon,
  DevicesIcon,
  GearIcon,
  ShieldIcon,
  UserIcon
} from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import type { JSX } from "react";
import type { StaffSection } from "./staffSections";

interface Props {
  user: APIUser | APIPrivateUser;
  section: StaffSection;
  onSectionChange: (section: StaffSection) => void;
}

const navItems: { key: StaffSection; label: string; icon: JSX.Element }[] = [
  { key: "info", label: "Info", icon: <UserIcon weight="fill" /> },
  { key: "flags", label: "Flags", icon: <ShieldIcon weight="fill" /> },
  { key: "actions", label: "Actions", icon: <GearIcon weight="fill" /> },
  {
    key: "sessions",
    label: "Sessions",
    icon: <DevicesIcon weight="fill" />
  },
  {
    key: "audit",
    label: "Audit Log",
    icon: <ClockCounterClockwiseIcon weight="fill" />
  }
];

export const StaffUserSidebar = ({ user, section, onSectionChange }: Props) => {
  const app = useAppStore();
  const navigate = useNavigate();

  return (
    <Paper
      direction="column"
      width={220}
      height="100%"
      elevation={app.settings?.preferEmbossed ? 5 : 0}
      borderTop="0 !important"
      borderLeft="0 !important"
      borderBottom="0 !important"
      px={2}
      py={2}
    >
      <Stack direction="column" height="100%" spacing={2}>
        <IconButton
          color="neutral"
          variant="plain"
          size="sm"
          css={{ alignSelf: "flex-start" }}
          onClick={() => navigate({ to: "/staff" })}
        >
          <ArrowLeftIcon />
        </IconButton>

        <Stack direction="column" alignItems="center" spacing={1} px={1}>
          <Avatar src={buildProfileAvatarUrl(user)} size={64} />
          <Stack direction="column" alignItems="center" spacing={0.1}>
            <Typography fontWeight={600} textAlign="center">
              {getUserDisplayName(user)}
            </Typography>
            <Typography level="body-xs" textColor="muted" textAlign="center">
              @{user.username}
            </Typography>
          </Stack>
        </Stack>

        <Divider css={{ opacity: 0.25 }} lineColor="muted" />

        <ButtonGroup
          color="info"
          orientation="vertical"
          variant="plain"
          spacing={5}
          horizontalAlign="left"
        >
          {navItems.map((item) => (
            <Button
              key={item.key}
              startDecorator={item.icon}
              onClick={() => onSectionChange(item.key)}
              variant={section === item.key ? "soft" : "plain"}
              padding={5}
              disabled={section === item.key}
            >
              {item.label}
            </Button>
          ))}
        </ButtonGroup>
      </Stack>
    </Paper>
  );
};
