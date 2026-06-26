import { Button } from "@components/Button";
import {
  profileMusicVolumeToGain,
  readProfileMusicVolumePercent,
  writeProfileMusicVolumePercent
} from "@components/Profile/shared/profileMusicPlayback.utils";
import type { ProfileMusicBlock } from "@mutualzz/types";
import { dynamicElevation } from "@mutualzz/ui-core";
import { Box, Slider, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import {
  ArrowSquareOutIcon,
  MusicNotesIcon,
  PauseIcon,
  PlayIcon
} from "@phosphor-icons/react";
import { Paper } from "@renderer/components/Paper";
import { useAppStore } from "@renderer/hooks/useStores";
import type { UserProfile } from "@stores/objects/UserProfile";
import { useEffect, useRef, useState } from "react";

function extractYoutubeVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0] || null;
  } catch { /* not a URL */ }
  return null;
}

interface Props {
  block: ProfileMusicBlock;
  profile: UserProfile;
}

export const ProfileMusicBlockView = ({ block, profile }: Props) => {
  const app = useAppStore();
  const { theme } = useTheme();
  const audioRef = useRef<HTMLAudioElement>(null);
  const seekingRef = useRef(false);
  const pendingSeekRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(readProfileMusicVolumePercent);
  const [youtubeActive, setYoutubeActive] = useState(false);

  // When audioHash is set, custom metadata takes priority over track search result
  const audioHash = block.audioHash ?? null;
  const title = audioHash
    ? (block.title ?? "Music")
    : (block.track?.name ?? block.title ?? block.trackUrl ?? "Music");
  const artists = audioHash
    ? (block.artists ?? null)
    : (block.track?.artists ?? block.artists ?? null);
  const image = audioHash
    ? (block.image ?? null)
    : (block.track?.image ?? block.image ?? null);
  const openUrl = block.track?.trackUrl ?? block.trackUrl ?? null;
  const source = audioHash ? null : (block.track?.source ?? null);

  // Playback priority: uploaded audio > YouTube > 30s preview
  const audioSrc = audioHash
    ? profile.constructProfileMusicAudioUrl(audioHash)
    : (block.track?.previewUrl ?? block.previewUrl ?? null);
  const youtubeVideoId = block.youtubeUrl ? extractYoutubeVideoId(block.youtubeUrl) : null;

  const playbackMode: "audio" | "youtube" | null =
    audioSrc ? "audio" : youtubeVideoId ? "youtube" : null;

  const isFullSong = !!audioHash;
  const isPlaying = playbackMode === "youtube" ? youtubeActive : playing;

  const sourceBadge = isFullSong
    ? "Full song"
    : youtubeVideoId
      ? "YouTube"
      : audioSrc
        ? "30s preview"
        : null;

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  useEffect(() => {
    seekingRef.current = false;
    setDuration(null);
    setCurrentTime(0);
    setPlaying(false);
    setYoutubeActive(false);
  }, [audioSrc, youtubeVideoId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = profileMusicVolumeToGain(volume);
  }, [volume, audioSrc]);

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const total = Math.floor(seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const toggle = () => {
    if (playbackMode === "youtube") {
      setYoutubeActive((prev) => !prev);
      return;
    }
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
    } else {
      const audio = audioRef.current;
      if (!audio || !audioSrc) return;
      if (audio.src !== audioSrc) {
        audio.src = audioSrc;
        audio.load();
      }
      audio.volume = profileMusicVolumeToGain(volume);
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  return (
    <Paper
      width="100%"
      height="100%"
      flexDirection="column"
      borderRadius={12}
      elevation={image ? 0 : app.settings?.preferEmbossed ? 5 : 1}
      css={{ overflow: "hidden", position: "relative" }}
    >
      {image && (
        <Box
          css={{
            position: "absolute",
            inset: -20,
            background: `url("${image}") center / cover no-repeat`,
            filter: "blur(18px) saturate(1.1)",
            opacity: 0.25,
            transform: "scale(1.1)",
            pointerEvents: "none"
          }}
        />
      )}
      <Box
        css={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 100%)",
          pointerEvents: "none"
        }}
      />

      {playbackMode === "audio" && audioSrc && (
        <audio
          ref={audioRef}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onLoadedMetadata={() => {
            const audio = audioRef.current;
            if (!audio) return;
            setDuration(Number.isFinite(audio.duration) ? audio.duration : null);
          }}
          onSeeked={() => { seekingRef.current = false; }}
          onTimeUpdate={() => {
            if (seekingRef.current) return;
            const audio = audioRef.current;
            if (!audio) return;
            setCurrentTime(audio.currentTime || 0);
          }}
          css={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
        />
      )}

      {/* YouTube hidden iframe — mounted only while playing, unmounted to pause */}
      {playbackMode === "youtube" && youtubeActive && youtubeVideoId && (
        <iframe
          title="YouTube music player"
          src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1`}
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

      <Stack
        direction="column"
        spacing={2.5}
        justifyContent="space-between"
        p={1.25}
        css={{ position: "relative", height: "100%", overflow: "auto" }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Stack
            width={52}
            height={52}
            borderRadius={12}
            flexShrink={0}
            css={{
              overflow: "hidden",
              background: image
                ? `url("${image}") center / cover no-repeat`
                : dynamicElevation(
                    theme.colors.surface,
                    app.settings?.preferEmbossed ? 5 : 1
                  ),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 22px rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.14)"
            }}
          >
            {!image && <MusicNotesIcon size={22} color="rgba(255,255,255,0.85)" />}
          </Stack>

          <Stack direction="column" spacing={0.25} minWidth={0} flex={1}>
            <Typography
              level="body-sm"
              fontWeight={700}
              textColor="primary"
              css={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                fontSize: "var(--pcf-sm)"
              }}
            >
              {title}
            </Typography>
            {artists && (
              <Typography
                level="body-xs"
                textColor="accent"
                css={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: "var(--pcf-xs)"
                }}
              >
                {artists}
              </Typography>
            )}
            <Stack direction="row" alignItems="center" spacing={0.75}>
              {sourceBadge && (
                <Typography
                  level="body-xs"
                  textColor="muted"
                  css={{ fontSize: "var(--pcf-xs)" }}
                >
                  {sourceBadge}
                </Typography>
              )}
              {source && (
                <Typography
                  level="body-xs"
                  textColor="secondary"
                  px={0.75}
                  py={0.2}
                  borderRadius={999}
                  css={{
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.06)",
                    fontSize: "var(--pcf-xs)"
                  }}
                >
                  {source === "itunes" ? "Apple" : "Deezer"}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Stack>

        {/* Scrubber — audio modes only (no scrubber for YouTube) */}
        {playbackMode === "audio" && (
          <Stack direction="column" spacing={0.5}>
            <Slider
              min={0}
              max={Math.max(0, duration ?? (isFullSong ? 0 : 30))}
              step={0.25}
              value={Math.min(currentTime, duration ?? currentTime)}
              onChange={(_, value) => { seekingRef.current = true; pendingSeekRef.current = value as number; setCurrentTime(value as number); }}
              onChangeCommitted={() => {
                const t = pendingSeekRef.current;
                pendingSeekRef.current = null;
                if (t !== null && audioRef.current) audioRef.current.currentTime = t;
              }}
              css={{ width: "100%" }}
            />
            <Stack direction="row" justifyContent="space-between">
              <Typography
                level="body-xs"
                css={{ color: "rgba(255,255,255,0.65)", fontSize: "var(--pcf-xs)" }}
              >
                {formatTime(currentTime)}
              </Typography>
              <Typography
                level="body-xs"
                css={{ color: "rgba(255,255,255,0.65)", fontSize: "var(--pcf-xs)" }}
              >
                {duration != null
                  ? formatTime(duration)
                  : isFullSong
                    ? "—:——"
                    : "0:30"}
              </Typography>
            </Stack>
            <Stack
              direction="column"
              spacing={0.35}
              p={1}
              css={{
                borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)"
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  level="body-xs"
                  css={{ color: "rgba(255,255,255,0.65)", fontSize: "var(--pcf-xs)" }}
                >
                  Volume
                </Typography>
                <Typography
                  level="body-xs"
                  css={{ color: "rgba(255,255,255,0.65)", fontSize: "var(--pcf-xs)" }}
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
          </Stack>
        )}

        <Stack direction="row" spacing={0.75} flexWrap="wrap">
          {playbackMode && (
            <Button
              size="sm"
              color="primary"
              onClick={toggle}
              startDecorator={isPlaying ? <PauseIcon /> : <PlayIcon />}
            >
              {isPlaying ? "Pause" : "Play"}
            </Button>
          )}
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
    </Paper>
  );
};
