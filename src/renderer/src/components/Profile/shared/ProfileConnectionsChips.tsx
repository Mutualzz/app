import { Tooltip } from "@components/Tooltip";
import {
  GithubLogoIcon,
  SpotifyLogoIcon,
  SteamLogoIcon,
  TwitchLogoIcon
} from "@phosphor-icons/react";
import { Stack, Typography } from "@mutualzz/ui-web";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export type ProfileConnectionChip = {
  provider: string;
  displayName: string | null;
  externalUrl: string | null;
};

const CONNECTION_NAME_KEYS = {
  github: "connections.github.name",
  twitch: "connections.twitch.name",
  steam: "connections.steam.name",
  spotify: "connections.spotify.name"
} as const;

const PROVIDER_ICONS: Record<string, ReactNode> = {
  github: <GithubLogoIcon size={14} weight="fill" />,
  twitch: <TwitchLogoIcon size={14} weight="fill" />,
  steam: <SteamLogoIcon size={14} weight="fill" />,
  spotify: <SpotifyLogoIcon size={14} weight="fill" />
};

interface Props {
  connections: ProfileConnectionChip[];
}

export const ProfileConnectionsChips = ({ connections }: Props) => {
  const { t } = useTranslation("settings");
  const items = connections.filter((c) => c.externalUrl);
  if (items.length === 0) return null;

  return (
    <Stack direction="row" spacing={0.75} flexWrap="wrap" css={{ gap: 6 }}>
      {items.map((connection) => {
        const nameKey =
          CONNECTION_NAME_KEYS[
            connection.provider as keyof typeof CONNECTION_NAME_KEYS
          ];
        const label = nameKey ? t(nameKey) : connection.provider;
        const tooltip = connection.displayName
          ? `${label} · ${connection.displayName}`
          : label;

        return (
          <Tooltip key={connection.provider} content={tooltip}>
            <a
              href={connection.externalUrl!}
              target="_blank"
              rel="noreferrer"
              css={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 8px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(0,0,0,0.18)",
                color: "inherit",
                textDecoration: "none",
                fontSize: "0.75rem",
                opacity: 0.9,
                ":hover": { opacity: 1 }
              }}
            >
              {PROVIDER_ICONS[connection.provider] ?? null}
              <Typography level="body-xs" css={{ lineHeight: 1 }}>
                {connection.displayName || label}
              </Typography>
            </a>
          </Tooltip>
        );
      })}
    </Stack>
  );
};
