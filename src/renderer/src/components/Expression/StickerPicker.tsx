import { type MouseEvent, useMemo, useRef, useState } from "react";
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import { observable } from "mobx";
import { useAppStore } from "@hooks/useStores";
import { ExpressionType } from "@mutualzz/types";
import type { Expression } from "@stores/objects/Expression";
import { SpaceIcon } from "@components/Space/SpaceIcon";
import { canUseSticker } from "@utils/index";
import { IconButton } from "@components/IconButton";
import { useMenu } from "@contexts/ContextMenu.context";

const STICKER_SIZE = 72;

const ScrollArea = styled("div")({
  flex: 1,
  overflowY: "auto",
  overflowX: "hidden",
  padding: "0 8px 8px",
  scrollbarWidth: "thin",
  "&::-webkit-scrollbar": { width: 4 }
});

const StickerGrid = styled("div")({
  display: "flex",
  flexWrap: "wrap",
  gap: 6
});

const StickerBtn = styled("button")(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: STICKER_SIZE + 8,
  height: STICKER_SIZE + 8,
  padding: 4,
  background: "transparent",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  transition: "background 0.1s ease",
  flexShrink: 0,
  "&:hover": { background: theme.colors.surface }
}));

const StickerImg = styled("img")({
  width: STICKER_SIZE,
  height: STICKER_SIZE,
  objectFit: "contain",
  borderRadius: 4
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

const EmptyPane = styled(Stack)(({ theme }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  color: theme.typography.colors.muted,
  fontSize: 13,
  padding: 24
}));

export interface StickerPickerProps {
  onSelectSticker: (sticker: Expression) => void;
}

export const StickerPicker = observer(
  ({ onSelectSticker }: StickerPickerProps) => {
    const app = useAppStore();
    const { theme } = useTheme();
    const { openContextMenu } = useMenu();
    const [search, setSearch] = useState("");
    const searchRef = useRef<HTMLInputElement>(null);

    const channel = app.channels.active;
    const me = channel?.spaceId
      ? app.spaces.get(channel.spaceId)?.members.me
      : null;
    const meId = app.account?.id ?? "";

    const myStickers = useMemo(
      () =>
        app.expressions.stickers
          .filter((s) => !s.spaceId && s.authorId === meId)
          .filter((s) => canUseSticker(meId, s, me, channel)),
      [app.expressions.stickers, meId, me, channel]
    );

    const spaceStickerGroups = useMemo(
      () =>
        app.spaces.all
          .map((space) => ({
            space,
            stickers: Array.from(space.expressions.values()).filter(
              (e) =>
                e.type === ExpressionType.Sticker &&
                canUseSticker(meId, e, me, channel)
            )
          }))
          .filter((g) => g.stickers.length > 0),
      [app.spaces.all, meId, me, channel]
    );

    const allStickers = useMemo(
      () => [...myStickers, ...spaceStickerGroups.flatMap((g) => g.stickers)],
      [myStickers, spaceStickerGroups]
    );

    const searchResults = search
      ? allStickers.filter((s) =>
          s.name.toLowerCase().includes(search.toLowerCase().trim())
        )
      : [];

    const hasStickers = allStickers.length > 0;

    const favoriteStickerIds =
      app.settings?.favoriteStickers ?? observable.array<string>([]);

    const favoriteStickers = favoriteStickerIds
      .map((id) => allStickers.find((s) => s.id === id))
      .filter((s): s is Expression => !!s);

    const openStickerCtx = (e: MouseEvent, sticker: Expression) => {
      e.preventDefault();
      openContextMenu(e, {
        type: "sticker",
        id: sticker.id,
        name: sticker.name,
        url: sticker.url,
        animated: sticker.animated
      });
    };

    const renderSticker = (sticker: Expression) => (
      <StickerBtn
        key={sticker.id}
        onClick={() => onSelectSticker(sticker)}
        onContextMenu={(e) => openStickerCtx(e, sticker)}
        title={sticker.name}
      >
        <StickerImg src={sticker.url} alt={sticker.name} draggable={false} />
      </StickerBtn>
    );

    return (
      <Stack direction="column" flex={1} minHeight={0} overflow="hidden">
        <Stack
          direction="row"
          alignItems="center"
          padding="8px 8px 6px"
          flexShrink={0}
        >
          <SearchWrapper direction="row">
            <MagnifyingGlassIcon
              size={14}
              color={theme.typography.colors.muted}
            />
            <SearchInput
              ref={searchRef}
              placeholder="Search stickers…"
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

        <ScrollArea>
          {!hasStickers && !search ? (
            <EmptyPane>
              <Typography level="body-sm" textColor="muted">
                No stickers yet. Upload some in User or Space settings.
              </Typography>
            </EmptyPane>
          ) : search ? (
            <>
              <SectionLabel textColor="muted">
                {searchResults.length
                  ? `${searchResults.length} result${searchResults.length === 1 ? "" : "s"}`
                  : "No results"}
              </SectionLabel>
              <StickerGrid>
                {searchResults.map((sticker) => renderSticker(sticker))}
              </StickerGrid>
            </>
          ) : (
            <>
              {favoriteStickers.length > 0 && (
                <>
                  <SectionLabel textColor="muted">Favorites</SectionLabel>
                  <StickerGrid>
                    {favoriteStickers.map((sticker) => renderSticker(sticker))}
                  </StickerGrid>
                </>
              )}

              {myStickers.length > 0 && (
                <>
                  <SectionLabel textColor="muted">Your stickers</SectionLabel>
                  <StickerGrid>
                    {myStickers.map((sticker) => renderSticker(sticker))}
                  </StickerGrid>
                </>
              )}

              {spaceStickerGroups.map(({ space, stickers }) => (
                <div key={space.id}>
                  <SectionLabel
                    textColor="muted"
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <SpaceIcon space={space} size={16} />
                    {space.name}
                  </SectionLabel>
                  <StickerGrid>
                    {stickers.map((sticker) => renderSticker(sticker))}
                  </StickerGrid>
                </div>
              ))}
            </>
          )}
        </ScrollArea>
      </Stack>
    );
  }
);
