import { observer } from "mobx-react-lite";
import { Channel } from "@stores/objects/Channel";
import { JSX } from "react";
import { ChannelSettingsPage, useChannelSettings } from "@components/ChannelSettings/ChannelSettings.context";
import { GearSixIcon, PaintBrushIcon, PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { Button } from "@components/Button";
import startCase from "lodash-es/startCase";
import { ChannelType } from "@mutualzz/types";
import { PermissionFlag } from "@mutualzz/bitfield";
import { Space } from "@stores/objects/Space";

interface Props {
  space: Space;
  channel: Channel;
}

export interface Page {
  label: ChannelSettingsPage;
  icon: JSX.Element;
  permissions: PermissionFlag[];
}

type SettingsPages = Page[];

const settingsPages: SettingsPages = [
  {
    label: "overview",
    icon: <PaintBrushIcon weight="fill" />,
    permissions: ["ManageChannels"]
  },
  {
    label: "permissions",
    icon: <GearSixIcon weight="fill" />,
    permissions: ["ManageRoles"]
  },
  {
    label: "invites",
    icon: <PaperPlaneTiltIcon weight="fill" />,
    permissions: ["CreateInvites"]
  }
];

export const ChannelSettingsSidebar = observer(({ space, channel }: Props) => {
  const app = useAppStore();
  const { currentPage, setCurrentPage } = useChannelSettings();

  const shouldShowPage = (page: Page) => {
    return space.members.me?.hasAnyPermission(page.permissions, channel);
  };

  return (
    <Paper
      direction="column"
      width={175}
      height="100%"
      elevation={app.settings?.preferEmbossed ? 5 : 0}
      py={5}
      px={2.5}
      borderTop="0 !important"
      borderLeft="0 !important"
      borderBottom="0 !important"
      justifyContent="space-between"
    >
      <Stack direction="column" spacing={2.5}>
        <Typography level="body-sm">
          {channel.name}
          {channel.parent && (
            <Typography level="body-xs" textColor="accent">
              {" "}
              {channel.parent.name}
            </Typography>
          )}
        </Typography>
        <Stack direction="column" spacing={1.25}>
          {settingsPages.map((page) =>
            page.label === "invites" &&
            channel.type === ChannelType.Category ? (
              <></>
            ) : (
              shouldShowPage(page) && (
                <Button
                  startDecorator={page.icon}
                  onClick={() => setCurrentPage(page.label)}
                  key={`channel-settings-sidebar-${page.label}`}
                  horizontalAlign="left"
                  variant={currentPage === page.label ? "soft" : "plain"}
                  padding={5}
                  disabled={currentPage === page.label}
                >
                  {startCase(page.label)}
                </Button>
              )
            )
          )}
        </Stack>
      </Stack>
    </Paper>
  );
});
