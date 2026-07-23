import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import type { ProfileDraftState } from "@components/Profile/editor/profileEditor.utils";
import type { APIProfileMusicSearchTrack } from "@mutualzz/types";
import { useAppStore } from "@hooks/useStores";
import { formatColor } from "@mutualzz/ui-core";
import { Input, Option, Select, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import {
  MagnifyingGlassIcon,
  MusicNotesIcon,
  XIcon
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const SEARCH_DEBOUNCE_MS = 650;
const MIN_SEARCH_LENGTH = 3;

interface Props {
  draft: ProfileDraftState;
  onDraftChange: (patch: Partial<ProfileDraftState>) => void;
}

const TrackArtwork = ({
  image,
  size = 48
}: {
  image?: string | null;
  size?: number;
}) => {
  const { theme } = useTheme();
  const neutralSoftBg = formatColor(theme.colors.neutral, {
    alpha: 10,
    format: "hexa"
  });

  return image ? (
    <img
      src={image}
      alt=""
      width={size}
      height={size}
      css={{
        borderRadius: 8,
        objectFit: "cover",
        flexShrink: 0,
        display: "block"
      }}
    />
  ) : (
    <Stack
      width={size}
      height={size}
      alignItems="center"
      justifyContent="center"
      css={{
        borderRadius: 8,
        background: neutralSoftBg,
        flexShrink: 0
      }}
    >
      <MusicNotesIcon size={size <= 40 ? 16 : 20} />
    </Stack>
  );
};

const TrackMeta = ({
  name,
  artists,
  previewLabel
}: {
  name: string;
  artists?: string | null;
  previewLabel?: string | null;
}) => (
  <Stack direction="column" spacing={0.25} minWidth={0} flex={1}>
    <Typography
      level="body-sm"
      fontWeight={600}
      css={{
        lineHeight: 1.25,
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical"
      }}
    >
      {name}
    </Typography>
    {artists && (
      <Typography
        level="body-xs"
        css={{
          opacity: 0.7,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}
      >
        {artists}
      </Typography>
    )}
    {previewLabel && (
      <Typography level="body-xs" css={{ opacity: 0.5 }}>
        {previewLabel}
      </Typography>
    )}
  </Stack>
);

export const ProfileMusicPicker = observer(
  ({ draft, onDraftChange }: Props) => {
    const { t } = useTranslation("common");
    const { t: tSettings } = useTranslation("settings");
    const { theme } = useTheme();
    const outlinedBorder = formatColor(theme.colors.neutral, {
      alpha: 30,
      format: "hexa"
    });
    const neutralSoftBg = formatColor(theme.colors.neutral, {
      alpha: 10,
      format: "hexa"
    });
    const app = useAppStore();
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [source, setSource] = useState<"itunes" | "deezer" | "all">("all");

    useEffect(() => {
      const trimmed = query.trim();
      if (trimmed.length < MIN_SEARCH_LENGTH) {
        setDebouncedQuery("");
        return;
      }

      const timer = window.setTimeout(
        () => setDebouncedQuery(trimmed),
        SEARCH_DEBOUNCE_MS
      );
      return () => window.clearTimeout(timer);
    }, [query]);

    const trimmedQuery = query.trim();
    const isDebouncing =
      trimmedQuery.length >= MIN_SEARCH_LENGTH &&
      trimmedQuery !== debouncedQuery;

    const { data, isFetching } = useQuery({
      queryKey: ["profile-music-search", source, debouncedQuery],
      enabled: debouncedQuery.length >= MIN_SEARCH_LENGTH,
      staleTime: 60_000,
      queryFn: () =>
        app.rest.get<{ tracks: APIProfileMusicSearchTrack[] }>(
          "/@me/profile/music/search",
          { q: debouncedQuery, limit: 8, source }
        )
    });

    const clearMusic = () => {
      onDraftChange({
        profileMusicUrl: null,
        profileMusicTrackId: null,
        profileMusicTrackSource: null,
        profileMusicTrackSelection: null
      });
      setQuery("");
      setDebouncedQuery("");
    };

    const selectTrack = (track: APIProfileMusicSearchTrack) => {
      if (!track.previewUrl) return;

      onDraftChange({
        profileMusicUrl: null,
        profileMusicTrackId: track.id,
        profileMusicTrackSource: track.source,
        profileMusicTrackSelection: track
      });
      setQuery("");
      setDebouncedQuery("");
    };

    const showResults = debouncedQuery.length >= MIN_SEARCH_LENGTH;

    return (
      <Stack direction="column" spacing={1} width="100%">
        {draft.profileMusicTrackId && draft.profileMusicTrackSelection ? (
          <Paper
            variant="soft"
            borderRadius={10}
            p={1.25}
            direction="column"
            spacing={1.25}
            width="100%"
          >
            <Stack direction="column" spacing={1} alignItems="center" width="100%">
              <TrackArtwork
                image={draft.profileMusicTrackSelection.image}
                size={72}
              />
              <Stack
                direction="column"
                spacing={0.25}
                alignItems="center"
                width="100%"
                css={{ textAlign: "center" }}
              >
                <Typography level="body-sm" fontWeight={600}>
                  {draft.profileMusicTrackSelection.name}
                </Typography>
                {draft.profileMusicTrackSelection.artists && (
                  <Typography level="body-xs" css={{ opacity: 0.7 }}>
                    {draft.profileMusicTrackSelection.artists}
                  </Typography>
                )}
                <Typography level="body-xs" css={{ opacity: 0.5 }}>
                  {tSettings("profile.music.preview30s")}
                </Typography>
              </Stack>
            </Stack>
            <Button size="sm" color="neutral" fullWidth onClick={clearMusic}>
              {t("remove")}
            </Button>
          </Paper>
        ) : (
          <>
            <Select
              value={source}
              onValueChange={(value) =>
                setSource((value ?? "all") as "itunes" | "deezer" | "all")
              }
              size="sm"
              placeholder={tSettings("profile.music.source")}
            >
              <Option value="all">{tSettings("profile.blocks.musicSourceAll")}</Option>
              <Option value="itunes">{tSettings("profile.blocks.musicSourceApple")}</Option>
              <Option value="deezer">{tSettings("profile.blocks.musicSourceDeezer")}</Option>
            </Select>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={tSettings("profile.music.searchSongs")}
              startDecorator={<MagnifyingGlassIcon />}
              endDecorator={
                query ? (
                  <XIcon
                    css={{ cursor: "pointer" }}
                    onClick={() => {
                      setQuery("");
                      setDebouncedQuery("");
                    }}
                  />
                ) : undefined
              }
            />
            {trimmedQuery.length > 0 &&
              trimmedQuery.length < MIN_SEARCH_LENGTH && (
                <Typography level="body-xs" css={{ opacity: 0.55 }}>
                  {tSettings("profile.music.typeAtLeast", {
                    min: MIN_SEARCH_LENGTH
                  })}
                </Typography>
              )}
            {showResults && (
              <Paper
                variant="plain"
                borderRadius={10}
                p={0.75}
                direction="column"
                spacing={0.5}
                width="100%"
                css={{
                  maxHeight: 280,
                  overflow: "auto",
                  border: `1px solid ${outlinedBorder}`
                }}
              >
                {(isDebouncing || isFetching) && (
                  <Typography
                    level="body-xs"
                    css={{ opacity: 0.65, px: 0.25, py: 0.25 }}
                  >
                    {isDebouncing
                      ? tSettings("profile.music.waitingToType")
                      : tSettings("profile.music.searching")}
                  </Typography>
                )}
                {!isDebouncing &&
                  !isFetching &&
                  data?.tracks?.map((track) => (
                    <Paper
                      key={track.id}
                      variant="plain"
                      borderRadius={8}
                      p={0.75}
                      direction="column"
                      spacing={0.75}
                      width="100%"
                      css={{
                        cursor: track.previewUrl ? "pointer" : "not-allowed",
                        opacity: track.previewUrl ? 1 : 0.45,
                        transition: "background 0.15s ease",
                        "&:hover": track.previewUrl
                          ? { background: neutralSoftBg }
                          : undefined
                      }}
                      onClick={() => selectTrack(track)}
                    >
                      <Stack
                        direction="row"
                        spacing={0.75}
                        alignItems="flex-start"
                        width="100%"
                      >
                        <TrackArtwork image={track.image} size={40} />
                        <TrackMeta
                          name={track.name}
                          artists={track.artists}
                          previewLabel={
                            track.previewUrl
                              ? tSettings("profile.music.preview30s")
                              : tSettings("profile.music.noPreview")
                          }
                        />
                      </Stack>
                    </Paper>
                  ))}
                {!isDebouncing && !isFetching && data?.tracks?.length === 0 && (
                  <Typography
                    level="body-xs"
                    css={{ opacity: 0.65, px: 0.25, py: 0.25 }}
                  >
                    {tSettings("profile.music.noTracksFound")}
                  </Typography>
                )}
              </Paper>
            )}
          </>
        )}
      </Stack>
    );
  }
);
