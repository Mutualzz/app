import { MouseEvent, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { useAppStore } from "@hooks/useStores";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import { observable } from "mobx";
import { IconButton } from "../IconButton";
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  StarIcon,
  XIcon
} from "@phosphor-icons/react";

interface GifResult {
  id: string;
  title: string;
  url: string;
  preview: string;
  width: number;
  height: number;
}

interface GifsResponse {
  results: GifResult[];
  next: string | null;
}

interface TagsResponse {
  tags: Array<{ name: string; preview: string }>;
}

export interface GifPickerProps {
  onSelectGif: (gif: GifResult) => void;
}

const GifGrid = styled("div")({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 4
});

const GifButton = styled("button")(({ theme }) => ({
  display: "block",
  width: "100%",
  padding: 0,
  background: theme.colors.surface,
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  overflow: "hidden",
  transition: "opacity 0.1s ease",
  "&:hover": { opacity: 0.85 }
}));

const GifVideo = styled("video")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
  borderRadius: 6
});

const GifImg = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
  borderRadius: 6
});

const TagButton = styled("button")(({ theme }) => ({
  position: "relative",
  width: "100%",
  aspectRatio: "16/9",
  padding: 0,
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  overflow: "hidden",
  background: theme.colors.surface,
  transition: "opacity 0.1s ease",
  "&:hover": { opacity: 0.85 }
}));

const TagLabel = styled("span")({
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0,0,0,0.35)",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  textTransform: "capitalize",
  textShadow: "0 1px 3px rgba(0,0,0,0.6)"
});

function TagItem({
  tag,
  onClick
}: {
  tag: { name: string; preview: string };
  onClick: () => void;
}) {
  const isVideo = String(tag.preview ?? "").includes("mp4");

  return (
    <TagButton onClick={onClick}>
      {isVideo ? (
        <GifVideo
          src={tag.preview}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />
      ) : (
        <GifImg src={tag.preview} alt={tag.name} />
      )}
      <TagLabel>{tag.name}</TagLabel>
    </TagButton>
  );
}

const TagGrid = styled("div")({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 6
});

const ScrollArea = styled("div")({
  flex: 1,
  overflowY: "auto",
  overflowX: "hidden",
  padding: "0 8px 8px",
  scrollbarWidth: "thin",
  "&::-webkit-scrollbar": { width: 4 }
});

const SearchInput = styled("input")(({ theme }) => ({
  width: "100%",
  background: "transparent",
  border: "none",
  outline: "none",
  fontSize: 13,
  color: theme.typography.colors.primary,
  "::placeholder": { color: theme.typography.colors.muted }
}));

const SearchWrapper = styled(Stack)(({ theme }) => ({
  borderRadius: 8,
  padding: "6px 10px",
  gap: 6,
  alignItems: "center",
  background: theme.colors.surface,
  flex: 1
}));

const SectionLabel = styled(Typography)({
  display: "block",
  padding: "10px 2px 6px",
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em"
});

const GifItemWrapper = styled("div")({
  position: "relative",
  "&:hover .gif-fav-btn": {
    opacity: 1
  }
});

const FavoriteBtn = styled("button")<{ favorited?: boolean }>(
  ({ theme, favorited }) => ({
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.5)",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    opacity: favorited ? 1 : 0,
    transition: "opacity 0.1s ease",
    color: favorited ? theme.colors.warning : "#fff",
    "&:hover": {
      background: "rgba(0,0,0,0.7)"
    }
  })
);

function GifItem({
  gif,
  onClick,
  onToggleFavorite,
  isFavorited
}: {
  gif: GifResult;
  onClick: () => void;
  onToggleFavorite: (e: MouseEvent) => void;
  isFavorited: boolean;
}) {
  const isVideo = String(gif.url ?? "").includes("mp4");

  return (
    <GifItemWrapper>
      <GifButton onClick={onClick} title={gif.title}>
        {isVideo ? (
          <GifVideo
            src={gif.url}
            poster={gif.preview || undefined}
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <GifImg src={gif.url ?? gif.preview} alt={gif.title} />
        )}
      </GifButton>
      <FavoriteBtn
        className="gif-fav-btn"
        favorited={isFavorited}
        onClick={onToggleFavorite}
        title={isFavorited ? "Remove from favorites" : "Add to favorites"}
      >
        <StarIcon size={12} weight={isFavorited ? "fill" : undefined} />
      </FavoriteBtn>
    </GifItemWrapper>
  );
}

export const GifPicker = observer(function GifPicker({
  onSelectGif
}: GifPickerProps) {
  const { theme } = useTheme();
  const app = useAppStore();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const favoriteGifs =
    app.settings?.favoriteGifs || observable.array<string>([]);

  const [viewingFavorites, setViewingFavorites] = useState(false);

  const handleToggleFavorite = (e: MouseEvent, gif: GifResult) => {
    e.stopPropagation();
    app.settings?.toggleFavoriteGif(`https://giphy.com/gifs/${gif.id}`);
    app.settings?.sync();
  };

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 400);
    if (search) setViewingFavorites(false);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // Tags — fetched once, cached indefinitely for the session
  const { data: tagsData } = useQuery({
    queryKey: ["gifs", "tags"],
    queryFn: () => app.rest.get<TagsResponse>("/gifs/tags"),
    staleTime: Infinity
  });

  // Search only — no trending
  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["gifs", "search", debouncedSearch],
    queryFn: ({ pageParam }) =>
      app.rest.get<GifsResponse>("/gifs/search", {
        q: debouncedSearch.trim(),
        ...(pageParam ? { next: pageParam } : {})
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next ?? undefined,
    staleTime: 1000 * 60 * 5,
    enabled: !!debouncedSearch.trim()
  });

  const gifs = data?.pages.flatMap((p) => p.results) ?? [];

  const showTags = !debouncedSearch.trim() && !!tagsData?.tags.length;

  return (
    <Stack direction="column" flex={1} minHeight={0} overflow="hidden">
      <Stack
        direction="row"
        alignItems="center"
        padding="8px 8px 6px"
        flexShrink={0}
      >
        {(search || viewingFavorites) && (
          <IconButton
            onClick={() => {
              setSearch("");
              setViewingFavorites(false);
            }}
            variant="plain"
            size="sm"
          >
            <ArrowLeftIcon />
          </IconButton>
        )}

        <SearchWrapper direction="row">
          <MagnifyingGlassIcon
            size={14}
            color={theme.typography.colors.muted}
          />
          <SearchInput
            ref={searchRef}
            placeholder="Search GIFs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSearch("");
                searchRef.current?.blur();
              }
            }}
          />
          {search && (
            <IconButton
              variant="plain"
              size={12}
              padding="2px"
              onClick={() => setSearch("")}
            >
              <XIcon size={12} />
            </IconButton>
          )}
        </SearchWrapper>
      </Stack>

      <ScrollArea id="gif-picker-scroll">
        {isLoading ? (
          <Stack alignItems="center" justifyContent="center" padding="40px 0">
            <Typography level="body-sm" textColor="muted">
              Loading…
            </Typography>
          </Stack>
        ) : (
          <>
            {showTags && tagsData && !viewingFavorites && (
              <TagGrid>
                {favoriteGifs.length > 0 && (
                  <TagItem
                    tag={{
                      name: "Favorites",
                      preview: `https://media.giphy.com/media/${favoriteGifs[0].split("/").pop()}/giphy.mp4`
                    }}
                    onClick={() => setViewingFavorites(true)}
                  />
                )}
                {tagsData.tags.map((tag) => (
                  <TagItem
                    key={tag.name}
                    tag={tag}
                    onClick={() => setSearch(tag.name)}
                  />
                ))}
              </TagGrid>
            )}

            {viewingFavorites && (
              <>
                <Stack
                  direction="row"
                  alignItems="center"
                  gap={6}
                  padding="6px 2px 4px"
                  flexShrink={0}
                >
                  <SectionLabel textColor="muted" css={{ padding: "4px 0" }}>
                    Favorites
                  </SectionLabel>
                </Stack>
                <GifGrid>
                  {favoriteGifs.map((url) => {
                    const id = url.split("/").pop() ?? "";
                    const fav: GifResult = {
                      id,
                      title: "",
                      url: `https://media.giphy.com/media/${id}/giphy.mp4`,
                      preview: `https://media.giphy.com/media/${id}/giphy-preview.gif`,
                      width: 0,
                      height: 0
                    };
                    return (
                      <GifItem
                        key={id}
                        gif={fav}
                        onClick={() => onSelectGif(fav)}
                        onToggleFavorite={(e) => handleToggleFavorite(e, fav)}
                        isFavorited
                      />
                    );
                  })}
                </GifGrid>
              </>
            )}

            {!viewingFavorites && debouncedSearch.trim() && gifs.length > 0 ? (
              <InfiniteScroll
                dataLength={gifs.length}
                next={fetchNextPage}
                hasMore={hasNextPage}
                loader={
                  <Stack
                    alignItems="center"
                    justifyContent="center"
                    padding="16px 0"
                  >
                    <Typography level="body-sm" textColor="muted">
                      Loading more…
                    </Typography>
                  </Stack>
                }
                scrollableTarget="gif-picker-scroll"
              >
                <GifGrid>
                  {gifs.map((gif) => (
                    <GifItem
                      key={gif.id}
                      gif={gif}
                      onClick={() => onSelectGif(gif)}
                      onToggleFavorite={(e) => handleToggleFavorite(e, gif)}
                      isFavorited={favoriteGifs.includes(
                        `https://giphy.com/gifs/${gif.id}`
                      )}
                    />
                  ))}
                </GifGrid>
              </InfiniteScroll>
            ) : (
              !isLoading &&
              debouncedSearch &&
              !viewingFavorites && (
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  padding="40px 0"
                >
                  <Typography level="body-sm" textColor="muted">
                    No GIFs found for "{debouncedSearch}"
                  </Typography>
                </Stack>
              )
            )}
          </>
        )}
      </ScrollArea>
    </Stack>
  );
});
