import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import {
  type SpaceSettingsPage,
  useSpaceSettings
} from "@components/SpaceSettings/SpaceSettings.context";
import { useAppStore } from "@hooks/useStores";
import { spacePageTitleKeys } from "@mutualzz/i18n";
import { IconButton, Stack, Typography } from "@mutualzz/ui-web";
import type { Space } from "@stores/objects/Space";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import { SpaceInvitesSettings } from "@components/SpaceSettings/pages/people/SpaceInvitesSettings";
import { SpaceRolesSettings } from "@components/SpaceSettings/pages/people/roles/SpaceRolesSettings";
import { SpaceExpressionsSettings } from "@components/SpaceSettings/pages/people/expressions/SpaceExpressionsSettings";
import { SpaceBansSettings } from "@components/SpaceSettings/pages/moderation/bans/SpaceBansSettings";
import { SpaceProfileSettings } from "@components/SpaceSettings/pages/general/SpaceProfileSettings";
import { SpaceMinecraftBridgeSettings } from "@components/SpaceSettings/pages/general/SpaceMinecraftBridgeSettings";
import { XIcon } from "@phosphor-icons/react";

interface SpaceSettingsContentProps {
  space: Space;
  redirectTo?: SpaceSettingsPage;
}

export const SpaceSettingsContent = observer(
  ({ space, redirectTo }: SpaceSettingsContentProps) => {
    const { t } = useTranslation("space");
    const app = useAppStore();
    const { closeAllModals } = useModal();
    const { currentPage, setCurrentPage } = useSpaceSettings();

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
          borderTopRightRadius={{
            xs: "0.75rem",
            sm: "1.25rem",
            md: "1.5rem"
          }}
          px={{ xs: "0.5rem", sm: 3 }}
          py={{ xs: "0.5rem", sm: 4 }}
          elevation={app.settings?.preferEmbossed ? 3 : 1}
          justifyContent="space-between"
          borderTop="0 !important"
          borderLeft="0 !important"
        >
          <Typography level={{ xs: "h6", sm: "h5" }} fontFamily="monospace">
            {t(
              spacePageTitleKeys[
                currentPage as keyof typeof spacePageTitleKeys
              ]
            )}
          </Typography>
          <IconButton
            color="neutral"
            css={{
              marginRight: "0.5rem"
            }}
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
          px={{ xs: "0.5rem", sm: currentPage === "roles" ? 0 : 3 }}
          borderTop="0 !important"
          borderLeft="0 !important"
          borderBottom="0 !important"
          py={{ xs: "0.5rem", sm: currentPage === "roles" ? 0 : 1 }}
        >
          {currentPage === "profile" && <SpaceProfileSettings space={space} />}
          {currentPage === "minecraft-bridge" && (
            <SpaceMinecraftBridgeSettings spaceId={space.id} />
          )}
          {currentPage === "invites" && <SpaceInvitesSettings space={space} />}
          {currentPage === "roles" && <SpaceRolesSettings space={space} />}
          {currentPage === "expressions" && (
            <SpaceExpressionsSettings space={space} />
          )}
          {currentPage === "bans" && <SpaceBansSettings space={space} />}
        </Paper>
      </Stack>
    );
  }
);
