import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import type { ProfileDraftState } from "@components/Profile/editor/profileEditor.utils";
import type { APIProfileMusicSearchTrack } from "@mutualzz/types";
import { useAppStore } from "@hooks/useStores";
import { Input, Option, Select, Stack, Typography } from "@mutualzz/ui-web";
import {
  MagnifyingGlassIcon,
  MusicNotesIcon,
  XIcon
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

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
}) =>
  image ? (
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
        background: "var(--mz-palette-neutral-softBg)",
        flexShrink: 0
      }}
    >
      <MusicNotesIcon size={size <= 40 ? 16 : 20} />
    </Stack>
  );

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
        introMusicUrl: null,
        introMusicTrackId: null,
        introMusicTrackSource: null,
        introMusicTrackSelection: null
      });
      setQuery("");
      setDebouncedQuery("");
    };

    const selectTrack = (track: APIProfileMusicSearchTrack) => {
      if (!track.previewUrl) return;

      onDraftChange({
        introMusicUrl: null,
        introMusicTrackId: track.id,
        introMusicTrackSource: track.source,
        introMusicTrackSelection: track
      });
      setQuery("");
      setDebouncedQuery("");
    };

    const showResults = debouncedQuery.length >= MIN_SEARCH_LENGTH;

    return (
      <Stack direction="column" spacing={1} width="100%">
        {draft.introMusicTrackId && draft.introMusicTrackSelection ? (
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
                image={draft.introMusicTrackSelection.image}
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
                  {draft.introMusicTrackSelection.name}
                </Typography>
                {draft.introMusicTrackSelection.artists && (
                  <Typography level="body-xs" css={{ opacity: 0.7 }}>
                    {draft.introMusicTrackSelection.artists}
                  </Typography>
                )}
                <Typography level="body-xs" css={{ opacity: 0.5 }}>
                  30-second preview
                </Typography>
              </Stack>
            </Stack>
            <Button size="sm" color="neutral" fullWidth onClick={clearMusic}>
              Remove
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
              placeholder="Source"
            >
              <Option value="all">Apple + Deezer</Option>
              <Option value="itunes">Apple</Option>
              <Option value="deezer">Deezer</Option>
            </Select>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search songs…"
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
                  Type at least {MIN_SEARCH_LENGTH} characters to search
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
                  border: "1px solid var(--mz-palette-neutral-outlinedBorder)"
                }}
              >
                {(isDebouncing || isFetching) && (
                  <Typography
                    level="body-xs"
                    css={{ opacity: 0.65, px: 0.25, py: 0.25 }}
                  >
                    {isDebouncing
                      ? "Waiting for you to finish typing…"
                      : "Searching…"}
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
                          ? { background: "var(--mz-palette-neutral-softBg)" }
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
                            track.previewUrl ? "30s preview" : "No preview"
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
                    No tracks found
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
