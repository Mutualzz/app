import { Button } from "@components/Button";
import type { ProfileMusicBlock } from "@mutualzz/types";
import { Box, Stack, Typography } from "@mutualzz/ui-web";
import { ArrowSquareOutIcon, MusicNotesIcon, PauseIcon, PlayIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

interface Props {
  block: ProfileMusicBlock;
}

export const ProfileMusicBlockView = ({ block }: Props) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const title =
    block.track?.name ?? block.title ?? block.trackUrl ?? "Music";
  const artists = block.track?.artists ?? block.artists ?? null;
  const image = block.track?.image ?? block.image ?? null;
  const previewUrl = block.track?.previewUrl ?? block.previewUrl ?? null;
  const openUrl = block.track?.trackUrl ?? block.trackUrl ?? null;
  const source = block.track?.source ?? null;

  useEffect(
    () => () => {
      audioRef.current?.pause();
    },
    [],
  );

  useEffect(() => {
    setDuration(null);
    setCurrentTime(0);
  }, [previewUrl]);

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const total = Math.floor(seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const pause = () => {
    audioRef.current?.pause();
    setPlaying(false);
  };

  const play = async () => {
    const audio = audioRef.current;
    if (!audio || !previewUrl) return;
    if (audio.src !== previewUrl) audio.src = previewUrl;
    audio.load();
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const toggle = () => {
    if (playing) pause();
    else void play();
  };

  return (
    <Box
      width="100%"
      height="100%"
        borderRadius={12}
      css={{
        overflow: "hidden",
          position: "relative",
          background: "rgba(0,0,0,0.72)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 12px 34px rgba(0,0,0,0.42)",
      }}
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

      {previewUrl && (
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
          onTimeUpdate={() => {
            const audio = audioRef.current;
            if (!audio) return;
            setCurrentTime(audio.currentTime || 0);
          }}
          css={{
            position: "absolute",
            width: 1,
            height: 1,
            opacity: 0,
            pointerEvents: "none",
          }}
        />
      )}

      <Stack direction="column" spacing={1} p={1.5} height="100%" css={{ position: "relative" }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            width={52}
            height={52}
            borderRadius={12}
            flexShrink={0}
            css={{
              overflow: "hidden",
              background: image
                ? `url("${image}") center / cover no-repeat`
                : "rgba(255,255,255,0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 22px rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.14)"
            }}
          >
            {!image && <MusicNotesIcon size={22} color="rgba(255,255,255,0.85)" />}
          </Box>

          <Stack direction="column" spacing={0.25} minWidth={0} flex={1}>
            <Typography
              level="body-sm"
              fontWeight={700}
              css={{
                color: "#fff",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical"
              }}
            >
              {title}
            </Typography>
            {artists && (
              <Typography
                level="body-xs"
                css={{
                  color: "rgba(255,255,255,0.72)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {artists}
              </Typography>
            )}
            <Stack direction="row" spacing={0.75} alignItems="center">
              {previewUrl && (
                <Typography level="body-xs" css={{ color: "rgba(255,255,255,0.62)" }}>
                  30s preview
                </Typography>
              )}
              {source && (
                <Typography
                  level="body-xs"
                  css={{
                    color: "rgba(255,255,255,0.62)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.06)",
                    px: 0.75,
                    py: 0.2,
                    borderRadius: 999
                  }}
                >
                  {source === "itunes" ? "Apple" : "Deezer"}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Stack>

        {previewUrl && (
          <Stack direction="column" spacing={0.5}>
            <Box
              css={{
                height: 6,
                borderRadius: 999,
                background: "rgba(255,255,255,0.12)",
                overflow: "hidden"
              }}
            >
              <Box
                css={{
                  height: "100%",
                  width: `${Math.min(
                    100,
                    Math.max(0, (currentTime / Math.max(duration ?? 30, 1)) * 100)
                  )}%`,
                  background:
                    "linear-gradient(90deg, rgba(99,102,241,0.95) 0%, rgba(236,72,153,0.9) 100%)"
                }}
              />
            </Box>
            <Stack direction="row" justifyContent="space-between">
              <Typography level="body-xs" css={{ color: "rgba(255,255,255,0.65)" }}>
                {formatTime(currentTime)}
              </Typography>
              <Typography level="body-xs" css={{ color: "rgba(255,255,255,0.65)" }}>
                {formatTime(duration ?? 30)}
              </Typography>
            </Stack>
          </Stack>
        )}

        <Stack direction="row" spacing={0.75} mt="auto" flexWrap="wrap">
          {previewUrl && (
            <Button
              size="sm"
              color="primary"
              onClick={toggle}
              startDecorator={playing ? <PauseIcon /> : <PlayIcon />}
            >
              {playing ? "Pause" : "Play"}
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
    </Box>
  );
};

