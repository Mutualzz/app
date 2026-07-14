import { ProfileConnectionsChips } from "@components/Profile/shared/ProfileConnectionsChips";
import {
  ProfileBlockBackgroundFill,
  profileBlockSurfaceCss
} from "@components/Profile/shared/ProfileBlockBackgroundFill";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import type { ProfileConnectionsBlock, Snowflake } from "@mutualzz/types";
import { resolveProfileBlockCornerRadius } from "@mutualzz/ui-core";
import { Stack, Typography } from "@mutualzz/ui-web";
import { LinkSimpleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  block: ProfileConnectionsBlock;
  userId: Snowflake;
}

export const ProfileConnectionsBlockView = observer(
  ({ block, userId }: Props) => {
    const { t } = useTranslation("settings");
    const app = useAppStore();
    const cornerRadius = resolveProfileBlockCornerRadius(block, "desktop");

    const { data: spotifyConnection } = useQuery({
      queryKey: ["user-spotify", userId],
      queryFn: async () => {
        try {
          return await app.rest.get<{
            displayName: string | null;
            externalUrl: string | null;
          }>(`/users/${userId}/spotify`);
        } catch {
          return null;
        }
      },
      staleTime: 60_000
    });

    const { data: userConnections } = useQuery({
      queryKey: ["user-connections-public", userId],
      queryFn: async () => {
        try {
          return await app.rest.get<{
            connections: Array<{
              provider: string;
              displayName: string | null;
              externalUrl: string | null;
            }>;
          }>(`/users/${userId}/connections`);
        } catch {
          return { connections: [] };
        }
      },
      staleTime: 60_000
    });

    const connections = useMemo(
      () => [
        ...(spotifyConnection?.externalUrl
          ? [
              {
                provider: "spotify",
                displayName: spotifyConnection.displayName,
                externalUrl: spotifyConnection.externalUrl
              }
            ]
          : []),
        ...(userConnections?.connections ?? [])
      ],
      [spotifyConnection, userConnections]
    );

    return (
      <Paper
        direction="column"
        spacing={1.25}
        width="100%"
        height="100%"
        p={1.75}
        borderRadius={cornerRadius}
        overflow="auto"
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        css={profileBlockSurfaceCss}
      >
        <ProfileBlockBackgroundFill backgroundColor={block.backgroundColor} />
        <Stack direction="row" spacing={1} alignItems="center">
          <LinkSimpleIcon size={18} weight="fill" />
          <Typography
            level="body-sm"
            fontWeight={700}
            css={{ fontSize: "var(--pcf-sm)" }}
          >
            {t("profile.blocks.connections")}
          </Typography>
        </Stack>

        {connections.length === 0 ? (
          <Typography
            level="body-sm"
            css={{ opacity: 0.6, fontSize: "var(--pcf-sm)" }}
          >
            {t("profile.blocks.noConnectionsToShow")}
          </Typography>
        ) : (
          <ProfileConnectionsChips connections={connections} />
        )}
      </Paper>
    );
  }
);
