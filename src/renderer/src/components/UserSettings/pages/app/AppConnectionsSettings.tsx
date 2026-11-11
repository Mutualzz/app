import { Paper } from "@components/Paper";
import { Button } from "@components/Button";
import { DisconnectConnectionConfirm } from "@components/Modals/DisconnectConnectionConfirm";
import { SettingsToggleRow } from "@components/UserSettings/SettingsField";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Divider, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import {
  ArrowSquareOutIcon,
  DiscordLogoIcon,
  GithubLogoIcon,
  SteamLogoIcon,
  TwitchLogoIcon
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { isElectron, openExternalLink } from "@utils/index";
import {
  CONNECTIONS_HEALTH_QUERY_KEY,
  connectionErrorMessage,
  FALLBACK_CONNECTION_PROVIDERS,
  USER_CONNECTIONS_QUERY_KEY,
  type ConnectionProvider,
  type ConnectionsHealthDto,
  type ProviderConnectionDto
} from "@mutualzz/client";

const PROVIDER_ICONS: Record<ConnectionProvider, ReactNode> = {
  github: <GithubLogoIcon size={28} weight="fill" />,
  twitch: <TwitchLogoIcon size={28} weight="fill" />,
  steam: <SteamLogoIcon size={28} weight="fill" />
};

const FALLBACK_PROVIDERS = FALLBACK_CONNECTION_PROVIDERS;

export const AppConnectionsSettings = observer(() => {
  const { t } = useTranslation("settings");
  const { theme } = useTheme();
  const app = useAppStore();
  const queryClient = useQueryClient();
  const { openModal } = useModal();

  const providersQuery = useQuery({
    queryKey: USER_CONNECTIONS_QUERY_KEY,
    queryFn: () =>
      app.rest.get<{ providers: ProviderConnectionDto[] }>("/@me/connections"),
    staleTime: 30_000
  });

  const healthQuery = useQuery({
    queryKey: CONNECTIONS_HEALTH_QUERY_KEY,
    queryFn: () =>
      app.rest.get<ConnectionsHealthDto>("/@me/connections/health"),
    staleTime: 120_000
  });

  const connectProviderMutation = useMutation({
    mutationFn: async (provider: ConnectionProvider) => {
      const returnTo = isElectron
        ? "mutualzz://connections/connected"
        : `${window.location.origin}/@me?connections=connected`;
      sessionStorage.setItem("mutualzz.connections.provider", provider);
      const { url } = await app.rest.post<
        { url: string },
        { returnTo: string }
      >(`/@me/connections/${provider}/oauth`, { returnTo });
      if (isElectron && window.api?.shell?.openExternal) {
        await window.api.shell.openExternal(url);
      } else {
        window.location.href = url;
      }
    },
    onError: (err: { message?: string }) => {
      toast.error(
        connectionErrorMessage(err, t("connections.connectError"), t)
      );
    }
  });

  const disconnectProviderMutation = useMutation({
    mutationFn: (provider: ConnectionProvider) =>
      app.rest.delete(`/@me/connections/${provider}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: USER_CONNECTIONS_QUERY_KEY
      });
    }
  });

  const shareProviderMutation = useMutation({
    mutationFn: (opts: {
      provider: ConnectionProvider;
      shareOnProfile: boolean;
    }) =>
      app.rest.patch<ProviderConnectionDto, { shareOnProfile: boolean }>(
        `/@me/connections/${opts.provider}`,
        {
          shareOnProfile: opts.shareOnProfile
        }
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: USER_CONNECTIONS_QUERY_KEY
      });
    }
  });

  const confirmDisconnect = (
    name: string,
    onConfirm: () => void | Promise<void>
  ) => {
    openModal(
      "disconnect-connection",
      <DisconnectConnectionConfirm
        name={name}
        onConfirm={async () => {
          await onConfirm();
        }}
      />
    );
  };

  const isDiscordLinked = Boolean(app.account?.discordId);

  const linkDiscord = async () => {
    sessionStorage.setItem("settings-return", "connections");
    const { url } = await app.rest.get<{ url: string }>(
      `/@me/discord/link?client=${isElectron ? "desktop" : "web"}`
    );
    await openExternalLink(url);
  };

  const unlinkDiscord = async () => {
    await app.rest.delete("/@me/discord");
    if (app.account) app.account.discordId = null;
  };

  const providers =
    providersQuery.data?.providers ??
    FALLBACK_PROVIDERS.map((provider) => ({
      provider,
      available: healthQuery.data?.[provider] ?? false,
      connected: false,
      displayName: null,
      externalUrl: null,
      shareOnProfile: true,
      expired: false
    }));

  const showProvidersSkeleton =
    providersQuery.isPending && !providersQuery.data;

  return (
    <Stack spacing={7.5} pt={2.5} pb={5} direction="column">
      <Stack spacing={2.5} direction="column">
        <Typography fontSize={20}>{t("connections.title")}</Typography>
        <Divider textColor="muted" css={{ opacity: 0.5 }} />

        <Paper
          variant="outlined"
          borderRadius={10}
          py={2.5}
          px={4}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2} alignItems="center" minWidth={0}>
            <DiscordLogoIcon size={28} weight="fill" />
            <Stack direction="column" spacing={0.5} minWidth={0}>
              <Typography level="body-md" fontWeight="bold">
                Discord
              </Typography>
              <Typography level="body-sm" textColor="muted">
                {isDiscordLinked
                  ? t("connections.discord.linked")
                  : t("connections.discord.unlinked")}
              </Typography>
            </Stack>
          </Stack>
          {isDiscordLinked ? (
            <Button
              variant="outlined"
              color="danger"
              onClick={() => confirmDisconnect("Discord", unlinkDiscord)}
            >
              {t("discord.unlinkDiscord")}
            </Button>
          ) : (
            <Button variant="solid" onClick={() => void linkDiscord()}>
              {t("discord.linkDiscord")}
            </Button>
          )}
        </Paper>

        {showProvidersSkeleton
          ? FALLBACK_PROVIDERS.map((provider) => (
              <Paper
                key={`skeleton-${provider}`}
                variant="outlined"
                borderRadius={10}
                py={2.5}
                px={4}
                spacing={2}
                direction="column"
                css={{ opacity: 0.45, minHeight: 72 }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  {PROVIDER_ICONS[provider]}
                  <Typography level="body-md" fontWeight="bold">
                    {t(`connections.${provider}.name`)}
                  </Typography>
                </Stack>
              </Paper>
            ))
          : providers.map((provider) => (
              <Paper
                key={provider.provider}
                variant="outlined"
                borderRadius={10}
                py={2.5}
                px={4}
                spacing={2}
                direction="column"
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    minWidth={0}
                  >
                    {PROVIDER_ICONS[provider.provider]}
                    <Stack direction="column" spacing={0.5} minWidth={0}>
                      <Typography level="body-md" fontWeight="bold">
                        {t(`connections.${provider.provider}.name`)}
                      </Typography>
                      <Typography level="body-sm" textColor="muted">
                        {provider.connected
                          ? provider.displayName ||
                            t(`connections.${provider.provider}.connected`)
                          : provider.available
                            ? t(`connections.${provider.provider}.disconnected`)
                            : t("connections.notConfigured")}
                      </Typography>
                    </Stack>
                  </Stack>

                  {provider.connected ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      {provider.externalUrl && (
                        <Button
                          variant="plain"
                          size="sm"
                          startDecorator={<ArrowSquareOutIcon />}
                          onClick={() =>
                            void openExternalLink(provider.externalUrl!)
                          }
                        >
                          {t("connections.openProfile")}
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        color="danger"
                        loading={
                          disconnectProviderMutation.isPending &&
                          disconnectProviderMutation.variables ===
                            provider.provider
                        }
                        onClick={() =>
                          confirmDisconnect(
                            t(`connections.${provider.provider}.name`),
                            async () => {
                              await disconnectProviderMutation.mutateAsync(
                                provider.provider
                              );
                            }
                          )
                        }
                      >
                        {t(`connections.${provider.provider}.disconnect`)}
                      </Button>
                    </Stack>
                  ) : provider.available ? (
                    <Button
                      variant="solid"
                      loading={
                        connectProviderMutation.isPending &&
                        connectProviderMutation.variables === provider.provider
                      }
                      onClick={() =>
                        connectProviderMutation.mutate(provider.provider)
                      }
                    >
                      {t(`connections.${provider.provider}.connect`)}
                    </Button>
                  ) : (
                    <Typography level="body-sm" textColor="muted">
                      {t("connections.unavailable")}
                    </Typography>
                  )}
                </Stack>

                {provider.connected && provider.expired && (
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Typography level="body-sm" textColor={theme.colors.danger}>
                      {t("connections.expired")}
                    </Typography>
                    <Button
                      variant="solid"
                      size="sm"
                      loading={
                        connectProviderMutation.isPending &&
                        connectProviderMutation.variables === provider.provider
                      }
                      onClick={() =>
                        connectProviderMutation.mutate(provider.provider)
                      }
                    >
                      {t("connections.reconnect")}
                    </Button>
                  </Stack>
                )}

                {provider.connected && (
                  <SettingsToggleRow
                    title={t("connections.showOnProfile")}
                    description={t("connections.showOnProfileDescription")}
                    checked={provider.shareOnProfile}
                    disabled={shareProviderMutation.isPending}
                    onChange={(checked) =>
                      shareProviderMutation.mutate({
                        provider: provider.provider,
                        shareOnProfile: checked
                      })
                    }
                  />
                )}
              </Paper>
            ))}
      </Stack>
    </Stack>
  );
});
