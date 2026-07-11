import { observer } from "mobx-react-lite";
import { Space } from "@stores/objects/Space";
import { Channel } from "@stores/objects/Channel";
import {
  ChannelSettingsPage,
  useChannelSettings
} from "@components/ChannelSettings/ChannelSettings.context";
import { useAppStore } from "@hooks/useStores";
import { useEffect, useRef } from "react";
import { IconButton, Stack, Typography } from "@mutualzz/ui-web";
import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { channelPageTitleKeys } from "@mutualzz/i18n";
import { XIcon } from "@phosphor-icons/react";
import { ChannelOverviewSettings } from "@components/ChannelSettings/pages/ChannelOverviewSettings";
import { ChannelPermissionsSettings } from "@components/ChannelSettings/pages/ChannelPermissionsSettings";
import { ChannelInvitesSettings } from "@components/ChannelSettings/pages/ChannelInvitesSettings";
import { ChannelType } from "@mutualzz/types";
import { useTranslation } from "react-i18next";

interface Props {
  space: Space;
  channel: Channel;
  redirectTo?: ChannelSettingsPage;
}

export const ChannelSettingsContent = observer(
  ({ space, channel, redirectTo }: Props) => {
    const app = useAppStore();
    const { t } = useTranslation("space");
    const { closeAllModals } = useModal();
    const { currentPage, setCurrentPage } = useChannelSettings();

    const didInitRedirect = useRef(false);

    useEffect(() => {
      if (didInitRedirect.current) return;
      if (!redirectTo) return;

      didInitRedirect.current = true;

      setCurrentPage(redirectTo);
    }, [redirectTo, setCurrentPage]);

    return (
      <Stack
        flex={1}
        height="100%"
        overflow="auto"
        width="100%"
        direction="column"
      >
        <Paper
          borderTopRightRadius="1.5rem"
          borderLeft="0 !important"
          borderTop="0 !important"
          px={3}
          py={4}
          elevation={app.settings?.preferEmbossed ? 3 : 1}
          justifyContent="space-between"
        >
          <Typography level="h5" fontFamily="monospace">
            {t(
              channelPageTitleKeys[
                currentPage as keyof typeof channelPageTitleKeys
              ]
            )}
          </Typography>
          <IconButton
            color="neutral"
            css={{ marginRight: "0.5rem" }}
            variant="plain"
            size="sm"
            onClick={() => closeAllModals()}
          >
            <XIcon />
          </IconButton>
        </Paper>

        <Paper
          flex={1}
          height="100%"
          overflow="auto"
          width="100%"
          spacing={1.25}
          elevation={app.settings?.preferEmbossed ? 2 : 1}
          direction="column"
          px={currentPage === "permissions" ? 0 : 3}
          py={currentPage === "permissions" ? 0 : 1}
          borderTop="0 !important"
          borderLeft="0 !important"
          borderBottom="0 !important"
        >
          {currentPage === "overview" && (
            <ChannelOverviewSettings space={space} channel={channel} />
          )}
          {currentPage === "permissions" && (
            <ChannelPermissionsSettings space={space} channel={channel} />
          )}
          {currentPage === "invites" &&
            channel.type !== ChannelType.Category && (
              <ChannelInvitesSettings space={space} channel={channel} />
            )}
        </Paper>
      </Stack>
    );
  }
);
