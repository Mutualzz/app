import { Button } from "@components/Button";
import {
  canPlayIntroMusic,
  getHiddenEmbedPlaybackUrl,
  getIntroMusicPlaybackUrl,
  getIntroMusicLabel,
  hasPreviewIntroMusic
} from "@components/Profile/shared/profileIntroMusic.utils";
import {
  profileMusicVolumeToGain,
  readProfileMusicVolumePercent,
  writeProfileMusicVolumePercent
} from "@components/Profile/shared/profileMusicPlayback.utils";
import type { APIProfileIntroMusic } from "@mutualzz/types";
import type { UserProfile } from "@stores/objects/UserProfile";
import { Box, Slider, Stack, Typography } from "@mutualzz/ui-web";
import {
  ArrowSquareOutIcon,
  MusicNotesIcon,
  PauseIcon,
  PlayIcon
} from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Paper } from "@renderer/components/Paper";
import { useAppStore } from "@renderer/hooks/useStores";

interface Props {
  introMusic: APIProfileIntroMusic;
  profile: UserProfile;
  floating?: boolean;
  autoPlay?: boolean;
}

export const ProfileIntroMusic = observer(
  ({ introMusic, profile, floating = false, autoPlay = false }: Props) => {
    const app = useAppStore();
    const audioRef = useRef<HTMLAudioElement>(null);
    const seekingRef = useRef(false);
    const pendingSeekRef = useRef<number | null>(null);
    const [playing, setPlaying] = useState(false);
    const [embedSrc, setEmbedSrc] = useState<string | null>(null);
    const [duration, setDuration] = useState<number | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(readProfileMusicVolumePercent);

    const label = getIntroMusicLabel(introMusic);
    const playbackUrl = getIntroMusicPlaybackUrl(profile, introMusic);
    const usesAudioPlayback = hasPreviewIntroMusic(introMusic);
    const playable = canPlayIntroMusic(profile, introMusic);
    const openUrl = introMusic.url.startsWith("http") ? introMusic.url : null;
    const isUploaded = !!introMusic.audioHash;
    const showScrubber = isUploaded && !!playbackUrl;

    useEffect(
      () => () => {
        audioRef.current?.pause();
        setEmbedSrc(null);
      },
      []
    );

    useEffect(() => {
      seekingRef.current = false;
      setDuration(null);
      setCurrentTime(0);
    }, [playbackUrl]);

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.volume = profileMusicVolumeToGain(volume);
    }, [volume, playbackUrl]);

    const commitSeek = (nextTime: number) => {
      setCurrentTime(nextTime);
      if (audioRef.current) audioRef.current.currentTime = nextTime;
    };

    const formatTime = (seconds: number) => {
      if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
      const total = Math.floor(seconds);
      const m = Math.floor(total / 60);
      const s = total % 60;
      return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const pausePlayback = () => {
      audioRef.current?.pause();
      setEmbedSrc(null);
      setPlaying(false);
    };

    const startPlayback = async (silent = false) => {
      if (usesAudioPlayback && playbackUrl) {
        const audio = audioRef.current;
        if (!audio) return;

        if (audio.src !== playbackUrl) {
          audio.src = playbackUrl;
          audio.load();
        }

        audio.volume = profileMusicVolumeToGain(volume);

        try {
          await audio.play();
          setPlaying(true);
        } catch {
          setPlaying(false);
          if (!silent) toast.error("Could not play this track");
        }
        return;
      }

      const nextEmbedSrc = getHiddenEmbedPlaybackUrl(introMusic);
      if (!nextEmbedSrc) return;

      setEmbedSrc(nextEmbedSrc);
      setPlaying(true);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { if (autoPlay && playable) void startPlayback(true); }, []);


    const togglePlayback = () => {
      if (playing) {
        pausePlayback();
        return;
      }

      startPlayback();
    };

    const bar = (
      <Paper
        width="100%"
        height="100%"
        flexDirection="column"
        borderRadius={12}
        elevation={app.settings?.preferEmbossed ? 5 : 1}
      >
        {playbackUrl && (
          <audio
            ref={audioRef}
            src={playbackUrl}
            preload="metadata"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onLoadedMetadata={() => {
              const audio = audioRef.current;
              if (!audio) return;
              const d = Number.isFinite(audio.duration) ? audio.duration : null;
              setDuration(d);
            }}
            onSeeked={() => { seekingRef.current = false; }}
            onTimeUpdate={() => {
              if (seekingRef.current) return;
              const audio = audioRef.current;
              if (!audio) return;
              setCurrentTime(audio.currentTime || 0);
            }}
            onError={() => {
              setPlaying(false);
              toast.error("Could not load this track");
            }}
            css={{
              position: "absolute",
              width: 1,
              height: 1,
              opacity: 0,
              pointerEvents: "none",
              overflow: "hidden"
            }}
          />
        )}

        {embedSrc && (
          <iframe
            title="Profile intro music"
            src={embedSrc}
            allow="autoplay; encrypted-media"
            css={{
              position: "fixed",
              left: -9999,
              top: -9999,
              width: 320,
              height: 180,
              opacity: 0,
              pointerEvents: "none",
              border: 0
            }}
          />
        )}

        <Stack direction="column" spacing={1} p={1.25}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Stack
              width={40}
              height={40}
              borderRadius={8}
              flexShrink={0}
              justifyContent="center"
              alignItems="center"
              overflow="hidden"
              css={{
                background: introMusic.image
                  ? `url("${introMusic.image}") center / cover no-repeat`
                  : "rgba(255, 255, 255, 0.12)"
              }}
            >
              {!introMusic.image && (
                <MusicNotesIcon size={20} color="rgba(255,255,255,0.85)" />
              )}
            </Stack>

            <Stack direction="column" flex={1} minWidth={0} spacing={0.25}>
              <Typography
                level="label-sm"
                fontWeight={600}
                textColor="primary"
                css={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {label}
              </Typography>
              {introMusic.authorName && (
                <Typography
                  level="body-xs"
                  textColor="accent"
                  css={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {introMusic.authorName}
                </Typography>
              )}
            </Stack>

            <Stack direction="row" spacing={0.75} flexShrink={0}>
              <Button
                size="sm"
                color="primary"
                disabled={!playable}
                onClick={togglePlayback}
                startDecorator={playing ? <PauseIcon /> : <PlayIcon />}
              >
                {playing ? "Pause" : "Play"}
              </Button>

              {openUrl && (
                <Button
                  size="sm"
                  color="neutral"
                  variant="plain"
                  onClick={() => window.open(openUrl, "_blank", "noreferrer")}
                  startDecorator={<ArrowSquareOutIcon />}
                >
                  Open
                </Button>
              )}
            </Stack>
          </Stack>

          {showScrubber && (
            <Stack direction="column" spacing={0.5}>
              <Slider
                min={0}
                max={Math.max(0, duration ?? 0)}
                step={0.25}
                value={Math.min(currentTime, duration ?? currentTime)}
                onChange={(_, value) => { seekingRef.current = true; pendingSeekRef.current = value as number; setCurrentTime(value as number); }}
                onChangeCommitted={() => { const t = pendingSeekRef.current; pendingSeekRef.current = null; if (t !== null) commitSeek(t); }}
                css={{ width: "100%" }}
              />
              <Stack direction="row" justifyContent="space-between">
                <Typography
                  level="body-xs"
                  css={{ color: "rgba(255,255,255,0.72)" }}
                >
                  {formatTime(currentTime)}
                </Typography>
                <Typography
                  level="body-xs"
                  css={{ color: "rgba(255,255,255,0.72)" }}
                >
                  {formatTime(duration ?? 0)}
                </Typography>
              </Stack>
            </Stack>
          )}

          {usesAudioPlayback && playbackUrl && (
            <Stack
              direction="column"
              spacing={0.5}
              p={1}
              css={{
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)"
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  level="body-xs"
                  css={{ color: "rgba(255,255,255,0.72)" }}
                >
                  Volume
                </Typography>
                <Typography
                  level="body-xs"
                  css={{ color: "rgba(255,255,255,0.72)" }}
                >
                  {volume}%
                </Typography>
              </Stack>
              <Slider
                min={0}
                max={100}
                value={volume}
                onChange={(_, value) => {
                  const next = writeProfileMusicVolumePercent(value as number);
                  setVolume(next);
                }}
                css={{ width: "100%" }}
              />
            </Stack>
          )}
        </Stack>
      </Paper>
    );

    if (!floating) {
      return (
        <Box position="relative" width="100%">
          {bar}
        </Box>
      );
    }

    return (
      <Box
        position="absolute"
        bottom={12}
        left={12}
        right={12}
        zIndex={10000}
        css={{ pointerEvents: "none" }}
      >
        <Box
          css={{
            pointerEvents: "auto",
            maxWidth: 420,
            margin: "0 auto"
          }}
        >
          {bar}
        </Box>
      </Box>
    );
  }
);
