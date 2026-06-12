import { type MouseEvent, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { ArrowLeftIcon, MagnifyingGlassIcon, StarIcon, XIcon } from "@phosphor-icons/react";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { useAppStore } from "@hooks/useStores";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import { IconButton } from "../IconButton";

interface GifResult {
  id: string;
  slug: string;
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
  tags: { name: string; preview: string }[];
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
  display: "block",
  width: "100%",
  height: "100%",
  objectFit: "cover",
  aspectRatio: "1 / 1"
});

const GifImg = styled("img")({
  display: "block",
  width: "100%",
  height: "100%",
  objectFit: "cover",
  aspectRatio: "1 / 1"
});

const GifItemWrapper = styled("div")({
  position: "relative",
  "&:hover .gif-fav-btn": { opacity: 1 }
});

const FavoriteBtn = styled("button")<{ favorited?: boolean }>(
  ({ theme, favorited }) => ({
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.55)",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    opacity: favorited ? 1 : 0,
    transition: "opacity 0.1s ease",
    color: favorited ? theme.colors.warning : "#fff",
    padding: 0,
    "&:hover": {
      background: "rgba(0,0,0,0.7)"
    }
  })
);

const TagGrid = styled("div")({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 4,
  padding: "4px 0 8px"
});

const TagButton = styled("button")(({ theme }) => ({
  position: "relative",
  height: 100,
  borderRadius: 8,
  overflow: "hidden",
  border: "none",
  cursor: "pointer",
  background: theme.colors.surface,
  padding: 0,
  "&:hover img, &:hover video": { opacity: 0.7 }
}));

const TagMedia = styled("img")({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  opacity: 0.85,
  transition: "opacity 0.15s ease"
});

const TagLabel = styled("span")(({ theme }) => ({
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  fontWeight: 700,
  color: theme.typography.colors.primary,
  textShadow: "0 1px 3px rgba(0,0,0,0.7)",
  textTransform: "capitalize",
  zIndex: 1
}));

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
  padding: "10px 2px 4px",
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em"
});

const TagItem = ({
  tag,
  onClick
}: {
  tag: { name: string; preview: string };
  onClick: () => void;
}) => {
  return (
    <TagButton onClick={onClick}>
      <TagMedia src={tag.preview} alt={tag.name} draggable={false} />
      <TagLabel>{tag.name}</TagLabel>
    </TagButton>
  );
};

const GifItem = ({
  gif,
  onClick,
  onToggleFavorite,
  isFavorited
}: {
  gif: GifResult;
  onClick: () => void;
  onToggleFavorite: (e: MouseEvent<HTMLButtonElement>) => void;
  isFavorited: boolean;
}) => {
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
          <GifImg src={gif.preview ?? gif.url} alt={gif.title} />
        )}
      </GifButton>
      <FavoriteBtn
        className="gif-fav-btn"
        favorited={isFavorited}
        onClick={onToggleFavorite}
        title={isFavorited ? "Remove from favorites" : "Add to favorites"}
      >
        <StarIcon size={14} weight={isFavorited ? "fill" : "regular"} />
      </FavoriteBtn>
    </GifItemWrapper>
  );
};

export const GifPicker = observer(({ onSelectGif }: GifPickerProps) => {
  const { theme } = useTheme();
  const app = useAppStore();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const favoriteGifs = app.settings?.favoriteGifs || [];

  const [viewingFavorites, setViewingFavorites] = useState(false);

  const handleToggleFavorite = (
    e: MouseEvent<HTMLButtonElement>,
    gif: GifResult
  ) => {
    e.stopPropagation();
    const entry = gif.preview ? `${gif.url}|${gif.preview}` : gif.url;
    app.settings?.toggleFavoriteGif(entry);
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 400);
    if (search) setViewingFavorites(false);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const { data: tagsData } = useQuery({
    queryKey: ["gifs", "tags"],
    queryFn: () => app.rest.get<TagsResponse>("/gifs/tags"),
    staleTime: Infinity
  });

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
          >
            <ArrowLeftIcon size={16} />
          </IconButton>
        )}

        <SearchWrapper direction="row">
          <MagnifyingGlassIcon
            size={14}
            color={theme.typography.colors.muted}
          />
          <SearchInput
            ref={searchRef}
            placeholder="Search Klipy…"
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
              color="neutral"
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
                      preview: favoriteGifs[0].split("|")[1] ?? ""
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
                  padding="6px 2px 8px"
                  flexShrink={0}
                >
                  <SectionLabel textColor="muted" css={{ padding: "0" }}>
                    Favorites
                  </SectionLabel>
                </Stack>
                <GifGrid>
                  {favoriteGifs.map((entry: string) => {
                    const [klipyUrl, previewUrl] = entry.split("|");
                    const slug = klipyUrl.split("/").pop() ?? "";
                    const fav: GifResult = {
                      id: slug,
                      slug,
                      title: "",
                      url: klipyUrl,
                      preview: previewUrl ?? "",
                      width: 0,
                      height: 0
                    };
                    return (
                      <GifItem
                        key={klipyUrl}
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
                      isFavorited={favoriteGifs.some((f) =>
                        f.startsWith(`https://klipy.com/gifs/${gif.slug}`)
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
