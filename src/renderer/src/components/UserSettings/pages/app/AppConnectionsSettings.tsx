import { Paper } from "@components/Paper";
import { Button } from "@components/Button";
import { IconButton } from "@components/IconButton";
import { DisconnectConnectionConfirm } from "@components/Modals/DisconnectConnectionConfirm";
import { SettingsToggleRow } from "@components/UserSettings/SettingsField";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import {
  Divider,
  Slider,
  Stack,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import {
  ArrowSquareOutIcon,
  GithubLogoIcon,
  PauseIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SpotifyLogoIcon,
  SteamLogoIcon,
  TwitchLogoIcon
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { isElectron, openExternalLink } from "@utils/index";
import {
  CONNECTIONS_HEALTH_QUERY_KEY,
  connectionErrorMessage,
  FALLBACK_CONNECTION_PROVIDERS,
  SPOTIFY_CONNECTION_QUERY_KEY,
  SPOTIFY_CURRENTLY_PLAYING_QUERY_KEY,
  USER_CONNECTIONS_QUERY_KEY,
  type ConnectionProvider,
  type ProviderConnectionDto,
  type SpotifyConnectionDto,
} from "@mutualzz/client";
import {
  invalidateSpotifyConnectionCache,
  setSpotifyConnectionCache,
  type SpotifyCurrentlyPlayingDto
} from "@renderer/presence/spotifyPresence";

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
  const [seekMs, setSeekMs] = useState(0);
  const [pageVisible, setPageVisible] = useState(
    typeof document === "undefined"
      ? true
      : document.visibilityState === "visible"
  );
  const [spotifyExpired, setSpotifyExpired] = useState(false);
  const [spotifyNeedsPremium, setSpotifyNeedsPremium] = useState(false);

  useEffect(() => {
    const onVisibility = () => {
      setPageVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const connectionQuery = useQuery({
    queryKey: SPOTIFY_CONNECTION_QUERY_KEY,
    queryFn: async () => {
      const connection =
        await app.rest.get<SpotifyConnectionDto>("/@me/spotify");
      setSpotifyConnectionCache(connection);
      if (connection.connected && "expired" in connection) {
        setSpotifyExpired(Boolean(connection.expired));
      } else if (!connection.connected) {
        setSpotifyExpired(false);
      }
      return connection;
    },
    staleTime: 60_000,
    refetchInterval: false
  });

  const providersQuery = useQuery({
    queryKey: USER_CONNECTIONS_QUERY_KEY,
    queryFn: () =>
      app.rest.get<{ providers: ProviderConnectionDto[] }>("/@me/connections"),
    staleTime: 30_000
  });

  const healthQuery = useQuery({
    queryKey: CONNECTIONS_HEALTH_QUERY_KEY,
    queryFn: () =>
      app.rest.get<{
        github: boolean;
        twitch: boolean;
        steam: boolean;
        spotify: boolean;
      }>("/@me/connections/health"),
    staleTime: 120_000
  });

  const connected = connectionQuery.data?.connected === true;

  const playingQuery = useQuery({
    queryKey: SPOTIFY_CURRENTLY_PLAYING_QUERY_KEY,
    enabled: connected && !spotifyExpired,
    queryFn: async () => {
      try {
        return await app.rest.get<SpotifyCurrentlyPlayingDto | null>(
          "/@me/spotify/currently-playing"
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message.toLowerCase() : String(err);
        if (message.includes("auth expired") || message.includes("expired")) {
          setSpotifyExpired(true);
          invalidateSpotifyConnectionCache();
          await queryClient.invalidateQueries({
            queryKey: SPOTIFY_CONNECTION_QUERY_KEY
          });
        }
        throw err;
      }
    },
    refetchInterval: connected && pageVisible && !spotifyExpired ? 5_000 : false,
    retry: false
  });

  useEffect(() => {
    setSeekMs(playingQuery.data?.progressMs ?? 0);
  }, [playingQuery.data?.progressMs, playingQuery.data?.details]);

  const connectMutation = useMutation({
    mutationFn: async () => {
      const returnTo = isElectron
        ? "mutualzz://spotify/connected"
        : `${window.location.origin}/@me?spotify=connected`;
      const { url } = await app.rest.post<
        { url: string },
        { returnTo: string }
      >("/@me/spotify/oauth", { returnTo });
      if (isElectron && window.api?.shell?.openExternal) {
        await window.api.shell.openExternal(url);
      } else {
        window.location.href = url;
      }
    },
    onSuccess: async () => {
      setSpotifyExpired(false);
      setSpotifyNeedsPremium(false);
      invalidateSpotifyConnectionCache();
      await queryClient.invalidateQueries({ queryKey: SPOTIFY_CONNECTION_QUERY_KEY });
      app.gateway.refreshPresenceActivities();
    },
    onError: (err: { message?: string }) => {
      toast.error(
        connectionErrorMessage(err, t("connections.spotify.connectError"), t)
      );
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: () => app.rest.delete("/@me/spotify"),
    onSuccess: async () => {
      setSpotifyExpired(false);
      setSpotifyNeedsPremium(false);
      invalidateSpotifyConnectionCache();
      await queryClient.invalidateQueries({ queryKey: SPOTIFY_CONNECTION_QUERY_KEY });
      await queryClient.invalidateQueries({
        queryKey: SPOTIFY_CURRENTLY_PLAYING_QUERY_KEY
      });
      app.gateway.refreshPresenceActivities();
    }
  });

  const shareMutation = useMutation({
    mutationFn: (shareSpotify: boolean) =>
      app.rest.patch<SpotifyConnectionDto, { shareSpotify: boolean }>(
        "/@me/spotify",
        { shareSpotify }
      ),
    onSuccess: async (data) => {
      setSpotifyConnectionCache(data);
      await queryClient.invalidateQueries({ queryKey: SPOTIFY_CONNECTION_QUERY_KEY });
      app.gateway.refreshPresenceActivities();
    }
  });

  const controlMutation = useMutation({
    mutationFn: async (action: "play" | "pause" | "next" | "previous") => {
      await app.rest.post(`/@me/spotify/playback/${action}`);
    },
    onSuccess: async () => {
      setSpotifyNeedsPremium(false);
      await queryClient.invalidateQueries({
        queryKey: SPOTIFY_CURRENTLY_PLAYING_QUERY_KEY
      });
      app.gateway.refreshPresenceActivities();
    },
    onError: (err: { message?: string }) => {
      const message = err?.message?.toLowerCase() ?? "";
      if (message.includes("premium")) {
        setSpotifyNeedsPremium(true);
        return;
      }
      if (message.includes("auth expired") || message.includes("expired")) {
        setSpotifyExpired(true);
        return;
      }
      toast.error(err?.message ?? t("connections.spotify.controlError"));
    }
  });

  const seekMutation = useMutation({
    mutationFn: async (positionMs: number) => {
      await app.rest.post("/@me/spotify/playback/seek", { positionMs });
    },
    onSuccess: async () => {
      setSpotifyNeedsPremium(false);
      await queryClient.invalidateQueries({
        queryKey: SPOTIFY_CURRENTLY_PLAYING_QUERY_KEY
      });
    },
    onError: (err: { message?: string }) => {
      const message = err?.message?.toLowerCase() ?? "";
      if (message.includes("premium")) {
        setSpotifyNeedsPremium(true);
        return;
      }
      toast.error(err?.message ?? t("connections.spotify.controlError"));
    }
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
      await queryClient.invalidateQueries({ queryKey: USER_CONNECTIONS_QUERY_KEY });
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
      await queryClient.invalidateQueries({ queryKey: USER_CONNECTIONS_QUERY_KEY });
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

  const playing = playingQuery.data;
  const shareSpotify =
    connectionQuery.data?.connected === true
      ? connectionQuery.data.shareSpotify
      : true;

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

  const showSpotifySkeleton = connectionQuery.isPending;
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
          spacing={2.5}
          direction="column"
          css={showSpotifySkeleton ? { opacity: 0.55 } : undefined}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2} alignItems="center" minWidth={0}>
              <SpotifyLogoIcon size={28} weight="fill" />
              <Stack direction="column" spacing={0.5} minWidth={0}>
                <Typography level="body-md" fontWeight="bold">
                  {t("connections.spotify.name")}
                </Typography>
                <Typography level="body-sm" textColor="muted">
                  {showSpotifySkeleton
                    ? "…"
                    : connected
                      ? connectionQuery.data?.connected
                        ? connectionQuery.data?.displayName ||
                          t("connections.spotify.connected")
                        : t("connections.spotify.connected")
                      : t("connections.spotify.disconnected")}
                </Typography>
              </Stack>
            </Stack>

            {connected ? (
              <Stack direction="row" spacing={1} alignItems="center">
                {connectionQuery.data?.connected &&
                  connectionQuery.data.externalUrl && (
                    <Button
                      variant="plain"
                      size="sm"
                      startDecorator={<ArrowSquareOutIcon />}
                      onClick={() =>
                        void openExternalLink(
                          connectionQuery.data.connected
                            ? connectionQuery.data.externalUrl!
                            : ""
                        )
                      }
                    >
                      {t("connections.openProfile")}
                    </Button>
                  )}
                <Button
                  variant="outlined"
                  color="danger"
                  loading={disconnectMutation.isPending}
                  onClick={() =>
                    confirmDisconnect(t("connections.spotify.name"), async () => {
                      await disconnectMutation.mutateAsync();
                    })
                  }
                >
                  {t("connections.spotify.disconnect")}
                </Button>
              </Stack>
            ) : showSpotifySkeleton ? null : connectionQuery.data
                ?.available ? (
              <Button
                variant="solid"
                loading={connectMutation.isPending}
                onClick={() => connectMutation.mutate()}
              >
                {t("connections.spotify.connect")}
              </Button>
            ) : (
              <Typography level="body-sm" textColor="muted">
                {t("connections.spotify.unavailable")}
              </Typography>
            )}
          </Stack>

          {connected && spotifyExpired && (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Typography level="body-sm" textColor={theme.colors.danger}>
                {t("connections.spotify.expired")}
              </Typography>
              <Button
                variant="solid"
                size="sm"
                loading={connectMutation.isPending}
                onClick={() => connectMutation.mutate()}
              >
                {t("connections.spotify.reconnect")}
              </Button>
            </Stack>
          )}

          {connected && !spotifyExpired && (
            <>
              <SettingsToggleRow
                title={t("connections.spotify.showActivity")}
                description={t("connections.spotify.showActivityDescription")}
                checked={shareSpotify}
                disabled={shareMutation.isPending}
                onChange={(checked) => shareMutation.mutate(checked)}
              />

              {spotifyNeedsPremium && (
                <Typography level="body-sm" textColor={theme.colors.warning}>
                  {t("connections.spotify.premiumRequired")}
                </Typography>
              )}

              {playing ? (
                <Stack spacing={2} direction="column">
                  <Stack direction="row" spacing={2} alignItems="center">
                    {playing.assets?.largeImageUrl ? (
                      <img
                        src={playing.assets.largeImageUrl}
                        alt=""
                        width={56}
                        height={56}
                        css={{
                          borderRadius: 8,
                          objectFit: "cover",
                          flexShrink: 0
                        }}
                      />
                    ) : null}
                    <Stack direction="column" spacing={0.25} minWidth={0}>
                      <Typography level="body-md" fontWeight="bold">
                        {playing.details}
                      </Typography>
                      <Typography level="body-sm" textColor="muted">
                        {playing.state}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Slider
                    min={0}
                    max={Math.max(playing.durationMs, 1)}
                    value={seekMs}
                    onChange={(_, value) =>
                      setSeekMs(Array.isArray(value) ? value[0] : value)
                    }
                    onChangeCommitted={(_, value) => {
                      const next = Array.isArray(value) ? value[0] : value;
                      seekMutation.mutate(next);
                    }}
                  />

                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton
                      variant="plain"
                      onClick={() => controlMutation.mutate("previous")}
                      disabled={controlMutation.isPending}
                    >
                      <SkipBackIcon weight="fill" />
                    </IconButton>
                    <IconButton
                      variant="plain"
                      onClick={() =>
                        controlMutation.mutate(
                          playing.isPlaying ? "pause" : "play"
                        )
                      }
                      disabled={controlMutation.isPending}
                    >
                      {playing.isPlaying ? (
                        <PauseIcon weight="fill" />
                      ) : (
                        <PlayIcon weight="fill" />
                      )}
                    </IconButton>
                    <IconButton
                      variant="plain"
                      onClick={() => controlMutation.mutate("next")}
                      disabled={controlMutation.isPending}
                    >
                      <SkipForwardIcon weight="fill" />
                    </IconButton>
                  </Stack>

                  {!spotifyNeedsPremium && (
                    <Typography level="body-sm" textColor="muted">
                      {t("connections.spotify.premiumHint")}
                    </Typography>
                  )}
                </Stack>
              ) : (
                <Typography level="body-sm" textColor="muted">
                  {t("connections.spotify.nothingPlaying")}
                </Typography>
              )}
            </>
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
