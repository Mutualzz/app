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
  Stack,
  Typography
} from "@mutualzz/ui-web";
import {
  ArrowLeftIcon,
  ClockCounterClockwiseIcon,
  DevicesIcon,
  GearIcon,
  NotePencilIcon,
  ShieldIcon,
  UserIcon
} from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import { staffSectionTitleKeys, type StaffSection } from "./staffSections";
import { IconButton } from "../IconButton";

interface Props {
  user: APIUser | APIPrivateUser;
  section: StaffSection;
  onSectionChange: (section: StaffSection) => void;
}

const navItems: { key: StaffSection; icon: JSX.Element }[] = [
  { key: "info", icon: <UserIcon weight="fill" /> },
  { key: "flags", icon: <ShieldIcon weight="fill" /> },
  { key: "actions", icon: <GearIcon weight="fill" /> },
  { key: "sessions", icon: <DevicesIcon weight="fill" /> },
  { key: "notes", icon: <NotePencilIcon weight="fill" /> },
  { key: "audit", icon: <ClockCounterClockwiseIcon weight="fill" /> }
];

export const StaffUserSidebar = ({ user, section, onSectionChange }: Props) => {
  const app = useAppStore();
  const navigate = useNavigate();
  const { t } = useTranslation("staff");

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
              {t(staffSectionTitleKeys[item.key])}
            </Button>
          ))}
        </ButtonGroup>
      </Stack>
    </Paper>
  );
};
