import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { IconButton } from "@components/IconButton";
import type { APIAttachment } from "@mutualzz/types";
import type { Color, ColorLike } from "@mutualzz/ui-core";
import {
  Box,
  Popover,
  Slider,
  Stack,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import {
  DownloadSimpleIcon,
  FileIcon,
  HeadphonesIcon,
  PauseIcon,
  PlayIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { Link } from "../Link";
import { useAppStore } from "@renderer/hooks/useStores";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(seconds: number) {
  if (!isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const getTypeColor = (
  contentType: string,
  theme: ReturnType<typeof useTheme>["theme"]
) => {
  if (contentType.startsWith("audio/")) return theme.colors.warning;
  if (contentType.includes("pdf")) return theme.colors.danger;
  return theme.colors.info;
};

interface VolumeButtonProps {
  volume: number;
  color: Color | ColorLike;
  onChange: (_: unknown, val: number | number[]) => void;
}

const VolumeButton = ({ volume, color, onChange }: VolumeButtonProps) => {
  return (
    <Popover
      placement="top"
      closeOnClickOutside
      p={1}
      trigger={
        <IconButton variant="plain" size="sm" title="Volume">
          {volume === 0 ? (
            <SpeakerSlashIcon size={14} weight="fill" />
          ) : (
            <SpeakerHighIcon size={14} weight="fill" />
          )}
        </IconButton>
      }
    >
      <Stack direction="column" alignItems="center" spacing={0.5}>
        <div css={{ height: 80 }}>
          <Slider
            orientation="vertical"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={onChange}
            color={color}
            size="sm"
          />
        </div>
        <Typography level="body-xs" textColor="muted">
          {Math.round(volume * 100)}%
        </Typography>
      </Stack>
    </Popover>
  );
};

const ImageViewer = ({ attachment }: { attachment: APIAttachment }) => (
  <Stack direction="column" alignItems="center" spacing={1.5}>
    <img
      src={attachment.url}
      alt={attachment.filename}
      css={{
        maxWidth: "90vw",
        maxHeight: "80vh",
        objectFit: "contain",
        borderRadius: 8,
        boxShadow: "0 8px 48px rgba(0,0,0,0.7)",
        display: "block"
      }}
    />
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography level="body-sm" textColor="muted">
        {attachment.filename}
      </Typography>
      <Typography level="body-sm" textColor="muted">
        ·
      </Typography>
      <Typography level="body-sm" textColor="muted">
        {formatBytes(attachment.size)}
      </Typography>
      <Link
        href={attachment.url}
        download={attachment.filename}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        <IconButton variant="plain" size="sm" title="Download">
          <DownloadSimpleIcon size={15} />
        </IconButton>
      </Link>
    </Stack>
  </Stack>
);

const AudioPlayer = ({ attachment }: { attachment: APIAttachment }) => {
  const { theme } = useTheme();
  const app = useAppStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const seekingRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.1);
  const [seekPreview, setSeekPreview] = useState<number | null>(null);
  const color = getTypeColor(attachment.contentType, theme);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.1;
    const onTime = () => {
      if (!seekingRef.current) setCurrentTime(audio.currentTime);
    };
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => {
      setPlaying(false);
      setCurrentTime(0);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  };

  const onSeekChange = (_: unknown, val: number | number[]) => {
    seekingRef.current = true;
    setSeekPreview(val as number);
  };

  const onSeekCommit = (_: unknown, val: number | number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = val as number;
    audio.currentTime = time;
    setCurrentTime(time);
    setSeekPreview(null);
    seekingRef.current = false;
  };

  const changeVolume = (_: unknown, val: number | number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const v = val as number;
    audio.volume = v;
    setVolume(v);
  };

  return (
    <Paper
      direction="column"
      spacing={2.5}
      p={1.25}
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      borderRadius={8}
      css={{ width: 350 }}
    >
      <audio
        ref={audioRef}
        src={attachment.url}
        preload="metadata"
        css={{ display: "none" }}
      />

      {/* Top row: icon + filename + download */}
      <Stack direction="row" alignItems="center" spacing={1.25}>
        <Stack
          justifyContent="center"
          alignItems="center"
          flexShrink={0}
          width={36}
          height={36}
          borderRadius={8}
          css={{ background: `${color}50`, color }}
        >
          <HeadphonesIcon size={18} weight="fill" />
        </Stack>
        <Stack flex={1} minWidth={0}>
          <Typography
            level="body-sm"
            fontWeight="semiBold"
            overflow="hidden"
            title={attachment.filename}
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            {attachment.filename}
          </Typography>
        </Stack>
        <Stack
          direction="column"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <Link
            href={attachment.url}
            download={attachment.filename}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconButton variant="plain" size="sm" title="Download">
              <DownloadSimpleIcon size={13} />
            </IconButton>
          </Link>
          <Typography level="body-xs" textColor="muted">
            {formatBytes(attachment.size)}
          </Typography>
        </Stack>
      </Stack>

      {/* Controls row */}
      <Stack direction="row" alignItems="center" spacing={1.75}>
        <IconButton
          variant="plain"
          size="sm"
          onClick={togglePlay}
          title={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <PauseIcon size={16} weight="fill" />
          ) : (
            <PlayIcon size={16} weight="fill" />
          )}
        </IconButton>
        <Stack flex={1}>
          <Slider
            min={0}
            max={duration || 1}
            step={0.01}
            value={seekPreview ?? currentTime}
            onChange={onSeekChange}
            onChangeCommitted={onSeekCommit}
            color={color}
            size="sm"
          />
        </Stack>
        <Typography
          level="body-xs"
          textColor="muted"
          flexShrink={0}
          whiteSpace="nowrap"
        >
          {formatTime(seekPreview ?? currentTime)} / {formatTime(duration)}
        </Typography>
        <VolumeButton volume={volume} color={color} onChange={changeVolume} />
      </Stack>
    </Paper>
  );
};

const VideoPlayer = ({ attachment }: { attachment: APIAttachment }) => {
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const seekingRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.1);
  const [seekPreview, setSeekPreview] = useState<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = 0.1;
    const onTime = () => {
      if (!seekingRef.current) setCurrentTime(video.currentTime);
    };
    const onMeta = () => setDuration(video.duration);
    const onEnd = () => {
      setPlaying(false);
      setCurrentTime(0);
    };
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("ended", onEnd);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("ended", onEnd);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
      setPlaying(false);
    } else {
      video.play();
      setPlaying(true);
    }
  };

  const onSeekChange = (_: unknown, val: number | number[]) => {
    seekingRef.current = true;
    setSeekPreview(val as number);
  };

  const onSeekCommit = (_: unknown, val: number | number[]) => {
    const video = videoRef.current;
    if (!video) return;
    const time = val as number;
    video.currentTime = time;
    setCurrentTime(time);
    setSeekPreview(null);
    seekingRef.current = false;
  };

  const changeVolume = (_: unknown, val: number | number[]) => {
    const video = videoRef.current;
    if (!video) return;
    const v = val as number;
    video.volume = v;
    setVolume(v);
  };

  return (
    <Box
      css={{
        display: "inline-block",
        maxWidth: 400,
        borderRadius: 8,
        overflow: "hidden",
        background: "#000",
        lineHeight: 0
      }}
    >
      <video
        ref={videoRef}
        src={attachment.url}
        css={{
          width: "100%",
          maxHeight: 260,
          display: "block",
          cursor: "pointer"
        }}
        onClick={togglePlay}
      />
      <Stack
        direction="column"
        spacing={1.75}
        css={{
          background: "rgba(0,0,0,0.75)",
          padding: "4px 8px 6px",
          lineHeight: "normal"
        }}
      >
        {/* Seek bar — full width */}
        <Slider
          min={0}
          max={duration || 1}
          step={0.01}
          value={seekPreview ?? currentTime}
          onChange={onSeekChange}
          onChangeCommitted={onSeekCommit}
          color={theme.colors.primary}
          size="sm"
        />
        {/* Buttons row */}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <IconButton
            variant="plain"
            size="sm"
            onClick={togglePlay}
            title={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <PauseIcon size={14} weight="fill" />
            ) : (
              <PlayIcon size={14} weight="fill" />
            )}
          </IconButton>
          <Typography
            level="body-xs"
            css={{ flex: 1, color: "#aaa", fontSize: 11 }}
          >
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>
          <VolumeButton
            volume={volume}
            color={theme.colors.primary}
            onChange={changeVolume}
          />
          <Link
            href={attachment.url}
            download={attachment.filename}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconButton variant="plain" size="sm" title="Download">
              <DownloadSimpleIcon size={13} />
            </IconButton>
          </Link>
        </Stack>
      </Stack>
    </Box>
  );
};

interface Props {
  attachment: APIAttachment;
}

export const MessageAttachment = ({ attachment }: Props) => {
  const { theme } = useTheme();
  const app = useAppStore();
  const { openModal } = useModal();
  const isImage = attachment.contentType.startsWith("image/");
  const isVideo = attachment.contentType.startsWith("video/");
  const isAudio = attachment.contentType.startsWith("audio/");

  if (isImage)
    return (
      <Box
        inline
        onClick={() =>
          openModal("image-viewer", <ImageViewer attachment={attachment} />, {
            showCloseButton: true
          })
        }
        css={{ cursor: "zoom-in", lineHeight: 0 }}
      >
        <img
          src={attachment.url}
          alt={attachment.filename}
          css={{
            maxWidth: 400,
            maxHeight: 300,
            borderRadius: 6,
            display: "block",
            objectFit: "contain"
          }}
        />
      </Box>
    );

  if (isVideo) return <VideoPlayer attachment={attachment} />;
  if (isAudio) return <AudioPlayer attachment={attachment} />;

  const color = getTypeColor(attachment.contentType, theme);
  return (
    <Link
      href={attachment.url}
      download={attachment.filename}
      target="_blank"
      rel="noopener noreferrer"
      css={{ textDecoration: "none" }}
    >
      <Paper
        direction="row"
        alignItems="center"
        spacing={1.75}
        p={1.25}
        borderRadius={8}
        css={{ cursor: "pointer" }}
        maxWidth={360}
        elevation={app.settings?.preferEmbossed ? 5 : 1}
      >
        <Stack
          flexShrink={0}
          alignItems="center"
          justifyContent="center"
          width={36}
          height={36}
          borderRadius={8}
          css={{
            background: `${color}50`,
            color
          }}
        >
          <FileIcon size={18} weight="fill" />
        </Stack>
        <Stack spacing={0} flex={1} minWidth={0}>
          <Typography
            level="body-sm"
            fontWeight="semiBold"
            overflow="hidden"
            css={{
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {attachment.filename}
          </Typography>
        </Stack>
        <Stack direction="column">
          <IconButton variant="plain" size="sm" title="Download">
            <DownloadSimpleIcon size={16} />
          </IconButton>
          <Typography level="body-xs" textColor="muted">
            {formatBytes(attachment.size)}
          </Typography>
        </Stack>
      </Paper>
    </Link>
  );
};
