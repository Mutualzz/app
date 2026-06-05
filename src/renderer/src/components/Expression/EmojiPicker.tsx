import {
  FC,
  type KeyboardEvent,
  MouseEvent,
  ReactNode,
  RefObject,
  useCallback,
  useRef,
  useState
} from "react";
import {
  Divider,
  IconButton,
  Stack,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import { Paper } from "@components/Paper";
import { SpaceIcon } from "@components/Space/SpaceIcon";
import { GifPicker } from "./GifPicker";
import type { Expression } from "@stores/objects/Expression";
import { useAppStore } from "@hooks/useStores";
import { observer } from "mobx-react-lite";
import styled from "@emotion/styled";
import {
  ALL_EMOJIS,
  PICKER_CATEGORIES,
  PickerEmoji,
  searchEmojis
} from "@renderer/utils/emojis/emojiPickerData";
import {
  getSpriteStyle,
  SKIN_TONE_MODIFIERS,
  SkinTone
} from "@renderer/utils/emojis/emojiSprite";
import { useRecentEmojis } from "@renderer/hooks/useRecentEmojis";
import { ExpressionType } from "@mutualzz/types";
import { useMenu } from "@contexts/ContextMenu.context";
import {
  AirplaneIcon,
  ClockIcon,
  FlagIcon,
  ForkKnifeIcon,
  GameControllerIcon,
  HashIcon,
  LightbulbIcon,
  MagnifyingGlassIcon,
  RabbitIcon,
  SmileyIcon,
  StarIcon,
  UserIcon,
  UsersIcon,
  XIcon
} from "@phosphor-icons/react";
import { observable } from "mobx";

const PICKER_WIDTH = 500;
const PICKER_HEIGHT = 500;
const SIDEBAR_WIDTH = 44;
const EMOJI_SIZE = 28;

const CLAP_COORDS: Record<string, { sheetX: number; sheetY: number }> = {
  default: { sheetX: 13, sheetY: 11 },
  "1F3FB": { sheetX: 13, sheetY: 12 },
  "1F3FC": { sheetX: 13, sheetY: 13 },
  "1F3FD": { sheetX: 13, sheetY: 14 },
  "1F3FE": { sheetX: 13, sheetY: 15 },
  "1F3FF": { sheetX: 13, sheetY: 16 }
};

const STANDARD_CATEGORY_ICONS: Record<string, FC<any>> = {
  "Smileys & Emotion": SmileyIcon,
  "People & Body": UsersIcon,
  "Animals & Nature": RabbitIcon,
  "Food & Drink": ForkKnifeIcon,
  "Travel & Places": AirplaneIcon,
  Activities: GameControllerIcon,
  Objects: LightbulbIcon,
  Symbols: HashIcon,
  Flags: FlagIcon
};

type TopTab = "emoji" | "gifs" | "stickers";

const PickerContainer = styled("div")({
  width: PICKER_WIDTH,
  height: PICKER_HEIGHT,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  borderRadius: 12
});

const TopTabBar = styled(Stack)(({ theme }) => ({
  borderBottom: `1px solid ${theme.colors.surface}`,
  flexShrink: 0
}));

const TopTabButton = styled("button")<{ active?: boolean }>(
  ({ theme, active }) => ({
    flex: 1,
    padding: "10px 0",
    background: "none",
    border: "none",
    borderBottom: `2px solid ${active ? theme.colors.primary : "transparent"}`,
    color: active ? theme.colors.primary : theme.typography.colors.muted,
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    cursor: "pointer",
    transition: "all 0.15s ease",
    "&:hover": { color: theme.typography.colors.secondary }
  })
);

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

const BodyRow = styled(Stack)({
  flex: 1,
  minHeight: 0,
  overflow: "hidden"
});

const Sidebar = styled(Stack)(({ theme }) => ({
  width: SIDEBAR_WIDTH,
  flexShrink: 0,
  overflowY: "auto",
  overflowX: "hidden",
  borderRight: `1px solid ${theme.colors.surface}`,
  padding: "4px 0",
  gap: 2,
  scrollbarWidth: "none",
  "&::-webkit-scrollbar": { display: "none" },
  alignItems: "center"
}));

const SidebarBtn = styled("button")<{ active?: boolean }>(
  ({ theme, active }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    padding: 0,
    background: active ? `${theme.colors.primary}25` : "transparent",
    border: `2px solid ${active ? theme.colors.primary : "transparent"}`,
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.1s ease",
    flexShrink: 0,
    color: active ? theme.colors.primary : theme.typography.colors.muted,
    "&:hover": {
      background: theme.colors.surface,
      color: theme.typography.colors.secondary
    }
  })
);

const Tooltip = styled("span")(({ theme }) => ({
  position: "fixed",
  background: theme.colors.background,
  color: theme.typography.colors.primary,
  fontSize: 11,
  padding: "3px 7px",
  borderRadius: 5,
  whiteSpace: "nowrap",
  pointerEvents: "none",
  zIndex: 10000,
  boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
  border: `1px solid ${theme.colors.surface}`,
  transform: "translateY(-50%)"
}));

const ScrollArea = styled("div")({
  flex: 1,
  overflowY: "auto",
  overflowX: "hidden",
  padding: "0 8px 8px",
  scrollbarWidth: "thin",
  "&::-webkit-scrollbar": { width: 4 }
});

const EmojiGrid = styled("div")({
  display: "flex",
  flexWrap: "wrap",
  gap: 2
});

const EmojiBtn = styled("button")(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: EMOJI_SIZE + 6,
  height: EMOJI_SIZE + 6,
  padding: 3,
  background: "transparent",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  transition: "background 0.1s ease",
  flexShrink: 0,
  "&:hover": { background: theme.colors.surface }
}));

const SectionLabel = styled(Typography)({
  display: "block",
  padding: "10px 2px 4px",
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em"
});

const CustomEmojiImg = styled("img")({
  width: EMOJI_SIZE,
  height: EMOJI_SIZE,
  objectFit: "contain",
  borderRadius: 4
});

const SkinTonePopover = styled(Stack)(({ theme }) => ({
  position: "absolute",
  right: 28,
  top: "50%",
  transform: "translateY(-50%)",
  background: theme.colors.background,
  borderRadius: 20,
  padding: "4px 8px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
  zIndex: 10,
  gap: 4,
  alignItems: "center",
  border: `1px solid ${theme.colors.surface}`
}));

const SkinToneBtn = styled("button")<{ active?: boolean }>(
  ({ theme, active }) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    padding: 0,
    background: active ? theme.colors.surface : "transparent",
    border: `2px solid ${active ? theme.colors.primary : "transparent"}`,
    borderRadius: 6,
    cursor: "pointer",
    transition: "all 0.1s ease",
    flexShrink: 0,
    "&:hover": { background: theme.colors.surface }
  })
);

const PlaceholderPane = styled(Stack)(({ theme }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  color: theme.typography.colors.muted,
  fontSize: 13,
  gap: 8,
  flexDirection: "column"
}));

function SpriteEmoji({
  sheetX,
  sheetY,
  title
}: {
  sheetX: number;
  sheetY: number;
  title: string;
}) {
  return (
    <span
      style={getSpriteStyle(sheetX, sheetY, EMOJI_SIZE)}
      title={title}
      aria-label={title}
    />
  );
}

function SidebarButton({
  active,
  label,
  onClick,
  children
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  return (
    <>
      <SidebarBtn
        active={active}
        onClick={onClick}
        onMouseEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setTooltip({ x: rect.right + 6, y: rect.top + rect.height / 2 });
        }}
        onMouseLeave={() => setTooltip(null)}
      >
        {children}
      </SidebarBtn>
      {tooltip && (
        <Tooltip style={{ left: tooltip.x, top: tooltip.y }}>{label}</Tooltip>
      )}
    </>
  );
}

export interface EmojiPickerProps {
  onSelectEmoji: (emoji: PickerEmoji, skinTone: SkinTone) => void;
  onSelectCustomEmoji: (emoji: Expression) => void;
  onSelectGif: (gif: {
    id: string;
    title: string;
    url: string;
    preview: string;
    width: number;
    height: number;
  }) => void;
  pickerRef: RefObject<HTMLDivElement>;
  activeTab: TopTab;
  onTabChange: (tab: TopTab) => void;
}

export const EmojiPicker = observer(
  ({
    onSelectEmoji,
    onSelectCustomEmoji,
    onSelectGif,
    pickerRef,
    activeTab,
    onTabChange
  }: EmojiPickerProps) => {
    const { theme } = useTheme();
    const app = useAppStore();
    const { recents, addRecentStandard, addRecentCustom } = useRecentEmojis();
    const { openContextMenu } = useMenu();

    const [search, setSearch] = useState("");
    const [activeCategoryId, setActiveCategoryId] = useState<string>("recent");
    const [skinTone, setSkinTone] = useState<SkinTone>(null);
    const [showSkinTones, setShowSkinTones] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const myEmojis = app.expressions.emojis
      .filter((e) => !e.spaceId)
      .filter((e) => e.type === ExpressionType.Emoji);

    const spaceEmojiGroups = app.spaces.all
      .map((space) => ({
        space,
        emojis: Array.from(space.expressions.values()).filter(
          (e) => e.type === ExpressionType.Emoji
        )
      }))
      .filter((g) => g.emojis.length > 0);

    const hasCustom = myEmojis.length > 0 || spaceEmojiGroups.length > 0;
    const allCustom = [
      ...myEmojis,
      ...spaceEmojiGroups.flatMap((g) => g.emojis)
    ];

    const customSearchResults = search
      ? allCustom.filter((e) =>
          e.name.toLowerCase().includes(search.toLowerCase().trim())
        )
      : [];
    const standardSearchResults = search ? searchEmojis(search) : [];
    const totalSearchResults =
      customSearchResults.length + standardSearchResults.length;

    const recentItems = recents
      .map((r) => {
        if (r.type === "standard") {
          const emoji = ALL_EMOJIS.find((e) => e.unified === r.unified);
          if (!emoji) return null;
          const tone = r.skinTone ?? null;
          const variant = tone ? emoji.skinVariations?.[tone] : null;
          return {
            kind: "standard",
            emoji,
            sheetX: variant ? variant.sheetX : emoji.sheetX,
            sheetY: variant ? variant.sheetY : emoji.sheetY,
            skinTone: tone
          };
        }
        if (!r.id || !r.name || !r.url) return null;
        return {
          kind: "custom",
          id: r.id,
          name: r.name,
          url: r.url,
          animated: r.animated ?? false
        };
      })
      .filter(Boolean) as Array<
      | {
          kind: "standard";
          emoji: PickerEmoji;
          sheetX: number;
          sheetY: number;
          skinTone: string | null;
        }
      | {
          kind: "custom";
          id: string;
          name: string;
          url: string;
          animated: boolean;
        }
    >;

    const handleSelectEmoji = useCallback(
      (emoji: PickerEmoji, tone?: SkinTone) => {
        const resolvedTone =
          tone === undefined ? (emoji.hasSkinTones ? skinTone : null) : tone;
        addRecentStandard(emoji.unified, resolvedTone);
        onSelectEmoji(emoji, resolvedTone);
      },
      [skinTone, addRecentStandard, onSelectEmoji]
    );

    const handleSelectCustomEmoji = useCallback(
      (emoji: Expression) => {
        addRecentCustom(emoji.id, emoji.name, emoji.url, emoji.animated);
        onSelectCustomEmoji(emoji);
      },
      [addRecentCustom, onSelectCustomEmoji]
    );

    const openStandardCtx = (
      e: MouseEvent,
      emoji: PickerEmoji,
      tone: SkinTone
    ) => {
      e.preventDefault();
      openContextMenu(e, {
        type: "emoji",
        kind: "standard",
        emoji,
        skinTone: tone
      });
    };

    const openCustomCtx = (e: MouseEvent, emoji: Expression) => {
      e.preventDefault();
      openContextMenu(e, {
        type: "emoji",
        kind: "custom",
        id: emoji.id,
        name: emoji.name,
        url: emoji.url,
        animated: emoji.animated
      });
    };

    const openCustomCtxFromRecent = (
      e: MouseEvent,
      item: { id: string; name: string; url: string; animated: boolean }
    ) => {
      e.preventDefault();
      openContextMenu(e, {
        type: "emoji",
        kind: "custom",
        id: item.id,
        name: item.name,
        url: item.url,
        animated: item.animated
      });
    };

    const scrollToCategory = (catId: string) => {
      setSearch("");
      setActiveCategoryId(catId);
      setTimeout(() => {
        const el = scrollRef.current?.querySelector(
          `[data-category="${catId}"]`
        );
        if (el) el.scrollIntoView({ block: "start", behavior: "smooth" });
      }, 10);
    };

    const handleSearchKey = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        setSearch("");
        searchRef.current?.blur();
      }
    };

    const favoriteEmojiKeys =
      app.settings?.favoriteEmojis ?? observable.array<string>();

    const favoriteEmojiItems = favoriteEmojiKeys
      .map((key) => {
        if (key.startsWith("custom:")) {
          const id = key.slice(7);
          const emoji = allCustom.find((e) => e.id === id);
          if (!emoji) return null;
          return {
            kind: "custom",
            id: emoji.id,
            name: emoji.name,
            url: emoji.url,
            animated: emoji.animated
          };
        }
        const [unified, skinToneKey] = key.split(":");
        const tone = (skinToneKey || null) as SkinTone;
        const emoji = ALL_EMOJIS.find((e) => e.unified === unified);
        if (!emoji) return null;
        const variant = tone ? emoji.skinVariations?.[tone] : null;
        return {
          kind: "standard",
          key,
          emoji,
          sheetX: variant ? variant.sheetX : emoji.sheetX,
          sheetY: variant ? variant.sheetY : emoji.sheetY,
          tone
        };
      })
      .filter(Boolean) as Array<
      | {
          kind: "standard";
          key: string;
          emoji: PickerEmoji;
          sheetX: number;
          sheetY: number;
          tone: SkinTone;
        }
      | {
          kind: "custom";
          id: string;
          name: string;
          url: string;
          animated: boolean;
        }
    >;

    const clapCoords = CLAP_COORDS[skinTone ?? "default"];

    const sidebarItems = [
      ...(favoriteEmojiItems.length > 0
        ? [
            {
              id: "favorites",
              label: "Favorites",
              renderIcon: () => <StarIcon size={16} />
            }
          ]
        : []),
      ...(recentItems.length > 0
        ? [
            {
              id: "recent",
              label: "Recently used",
              renderIcon: () => <ClockIcon size={16} />
            }
          ]
        : []),
      ...(myEmojis.length > 0
        ? [
            {
              id: "my-emojis",
              label: "Your emojis",
              renderIcon: () => <UserIcon size={16} />
            }
          ]
        : []),
      ...spaceEmojiGroups.map(({ space }) => ({
        id: `space-${space.id}`,
        label: space.name,
        renderIcon: () => (
          <SpaceIcon space={space} size={22} css={{ borderRadius: 6 }} />
        )
      })),
      ...(hasCustom ? [null] : []),
      ...PICKER_CATEGORIES.map((c) => {
        const Icon = STANDARD_CATEGORY_ICONS[c.id] ?? HashIcon;
        return {
          id: c.id,
          label: c.name,
          renderIcon: () => <Icon size={22} />
        };
      })
    ];

    return (
      <Paper
        ref={pickerRef as any}
        elevation={app.settings?.preferEmbossed ? 4 : 1}
        borderRadius={12}
        css={{ overflow: "hidden" }}
      >
        <PickerContainer>
          <TopTabBar direction="row">
            {(["emoji", "gifs", "stickers"] as TopTab[]).map((tab) => (
              <TopTabButton
                key={tab}
                active={activeTab === tab}
                onClick={() => onTabChange(tab)}
              >
                {tab === "emoji"
                  ? "Emoji"
                  : tab === "gifs"
                    ? "GIFs"
                    : "Stickers"}
              </TopTabButton>
            ))}
          </TopTabBar>

          {activeTab === "gifs" ? (
            <GifPicker onSelectGif={onSelectGif} />
          ) : activeTab === "stickers" ? (
            <PlaceholderPane>
              <Typography level="body-sm" textColor="muted">
                Stickers coming soon
              </Typography>
            </PlaceholderPane>
          ) : (
            <>
              <Stack
                direction="row"
                alignItems="center"
                gap={2}
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
                    placeholder="Search emojis…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSearchKey}
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

                <Stack
                  alignItems="center"
                  justifyContent="center"
                  position="relative"
                  flexShrink={0}
                >
                  <SkinToneBtn
                    active={false}
                    onClick={() => setShowSkinTones((v) => !v)}
                    title="Skin tone"
                  >
                    <SpriteEmoji
                      sheetX={clapCoords.sheetX}
                      sheetY={clapCoords.sheetY}
                      title="Skin tone"
                    />
                  </SkinToneBtn>
                  {showSkinTones && (
                    <SkinTonePopover direction="row">
                      <SkinToneBtn
                        active={skinTone === null}
                        onClick={() => {
                          setSkinTone(null);
                          setShowSkinTones(false);
                        }}
                      >
                        <SpriteEmoji
                          sheetX={CLAP_COORDS.default.sheetX}
                          sheetY={CLAP_COORDS.default.sheetY}
                          title="Default"
                        />
                      </SkinToneBtn>
                      {SKIN_TONE_MODIFIERS.map((tone) => (
                        <SkinToneBtn
                          key={tone}
                          active={skinTone === tone}
                          onClick={() => {
                            setSkinTone(tone);
                            setShowSkinTones(false);
                          }}
                        >
                          <SpriteEmoji
                            sheetX={CLAP_COORDS[tone].sheetX}
                            sheetY={CLAP_COORDS[tone].sheetY}
                            title={tone}
                          />
                        </SkinToneBtn>
                      ))}
                    </SkinTonePopover>
                  )}
                </Stack>
              </Stack>

              <BodyRow direction="row">
                {!search && (
                  <Sidebar direction="column">
                    {sidebarItems.map((item, i) =>
                      item === null ? (
                        <Divider
                          key={`divider-${i}`}
                          lineColor="neutral"
                          css={{
                            margin: "4px 6px",
                            opacity: 0.3,
                            width: "calc(100% - 12px)"
                          }}
                        />
                      ) : (
                        <SidebarButton
                          key={item.id}
                          active={activeCategoryId === item.id}
                          label={item.label}
                          onClick={() => scrollToCategory(item.id)}
                        >
                          {item.renderIcon()}
                        </SidebarButton>
                      )
                    )}
                  </Sidebar>
                )}

                <ScrollArea ref={scrollRef}>
                  {search ? (
                    <>
                      <SectionLabel textColor="muted">
                        {totalSearchResults
                          ? `${totalSearchResults} result${totalSearchResults === 1 ? "" : "s"}`
                          : "No results"}
                      </SectionLabel>

                      {customSearchResults.length > 0 && (
                        <>
                          <SectionLabel textColor="muted">Custom</SectionLabel>
                          <EmojiGrid>
                            {customSearchResults.map((emoji) => (
                              <EmojiBtn
                                key={emoji.id}
                                onClick={() => handleSelectCustomEmoji(emoji)}
                                onContextMenu={(e) => openCustomCtx(e, emoji)}
                                title={`:${emoji.name}:`}
                              >
                                <CustomEmojiImg
                                  src={emoji.url}
                                  alt={emoji.name}
                                  draggable={false}
                                />
                              </EmojiBtn>
                            ))}
                          </EmojiGrid>
                        </>
                      )}

                      {standardSearchResults.length > 0 && (
                        <>
                          {customSearchResults.length > 0 && (
                            <SectionLabel textColor="muted">
                              Standard
                            </SectionLabel>
                          )}
                          <EmojiGrid>
                            {standardSearchResults.map((emoji) => {
                              const tone = emoji.hasSkinTones ? skinTone : null;
                              const variant = tone
                                ? emoji.skinVariations?.[tone]
                                : null;
                              return (
                                <EmojiBtn
                                  key={emoji.unified}
                                  onClick={() => handleSelectEmoji(emoji, tone)}
                                  onContextMenu={(e) =>
                                    openStandardCtx(e, emoji, tone)
                                  }
                                  title={`:${emoji.shortName}:`}
                                >
                                  <SpriteEmoji
                                    sheetX={
                                      variant ? variant.sheetX : emoji.sheetX
                                    }
                                    sheetY={
                                      variant ? variant.sheetY : emoji.sheetY
                                    }
                                    title={`:${emoji.shortName}:`}
                                  />
                                </EmojiBtn>
                              );
                            })}
                          </EmojiGrid>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {favoriteEmojiItems.length > 0 && (
                        <div data-category="favorites">
                          <SectionLabel textColor="muted">
                            Favorites
                          </SectionLabel>
                          <EmojiGrid>
                            {favoriteEmojiItems.map((item) =>
                              item.kind === "standard" ? (
                                <EmojiBtn
                                  key={`fav-std-${item.key}`}
                                  onClick={() =>
                                    handleSelectEmoji(item.emoji, item.tone)
                                  }
                                  onContextMenu={(e) =>
                                    openStandardCtx(e, item.emoji, item.tone)
                                  }
                                  title={`:${item.emoji.shortName}:`}
                                >
                                  <SpriteEmoji
                                    sheetX={item.sheetX}
                                    sheetY={item.sheetY}
                                    title={`:${item.emoji.shortName}:`}
                                  />
                                </EmojiBtn>
                              ) : (
                                <EmojiBtn
                                  key={`fav-custom-${item.id}`}
                                  onClick={() => {
                                    const live = allCustom.find(
                                      (e) => e.id === item.id
                                    );
                                    if (live) handleSelectCustomEmoji(live);
                                  }}
                                  onContextMenu={(e) =>
                                    openCustomCtxFromRecent(e, item)
                                  }
                                  title={`:${item.name}:`}
                                >
                                  <CustomEmojiImg
                                    src={item.url}
                                    alt={item.name}
                                    draggable={false}
                                  />
                                </EmojiBtn>
                              )
                            )}
                          </EmojiGrid>
                        </div>
                      )}
                      {recentItems.length > 0 && (
                        <div data-category="recent">
                          <SectionLabel textColor="muted">
                            Recently used
                          </SectionLabel>
                          <EmojiGrid>
                            {recentItems.map((item, i) =>
                              item.kind === "standard" ? (
                                <EmojiBtn
                                  key={`recent-std-${item.emoji.unified}-${i}`}
                                  onClick={() =>
                                    handleSelectEmoji(
                                      item.emoji,
                                      item.skinTone as SkinTone
                                    )
                                  }
                                  onContextMenu={(e) =>
                                    openStandardCtx(
                                      e,
                                      item.emoji,
                                      item.skinTone as SkinTone
                                    )
                                  }
                                  title={`:${item.emoji.shortName}:`}
                                >
                                  <SpriteEmoji
                                    sheetX={item.sheetX}
                                    sheetY={item.sheetY}
                                    title={`:${item.emoji.shortName}:`}
                                  />
                                </EmojiBtn>
                              ) : (
                                <EmojiBtn
                                  key={`recent-custom-${item.id}`}
                                  onClick={() => {
                                    const live = allCustom.find(
                                      (e) => e.id === item.id
                                    );
                                    if (live) handleSelectCustomEmoji(live);
                                  }}
                                  onContextMenu={(e) =>
                                    openCustomCtxFromRecent(e, item)
                                  }
                                  title={`:${item.name}:`}
                                >
                                  <CustomEmojiImg
                                    src={item.url}
                                    alt={item.name}
                                    draggable={false}
                                  />
                                </EmojiBtn>
                              )
                            )}
                          </EmojiGrid>
                        </div>
                      )}

                      {myEmojis.length > 0 && (
                        <div data-category="my-emojis">
                          <SectionLabel textColor="muted">
                            Your emojis
                          </SectionLabel>
                          <EmojiGrid>
                            {myEmojis.map((emoji) => (
                              <EmojiBtn
                                key={emoji.id}
                                onClick={() => handleSelectCustomEmoji(emoji)}
                                onContextMenu={(e) => openCustomCtx(e, emoji)}
                                title={`:${emoji.name}:`}
                              >
                                <CustomEmojiImg
                                  src={emoji.url}
                                  alt={emoji.name}
                                  draggable={false}
                                />
                              </EmojiBtn>
                            ))}
                          </EmojiGrid>
                        </div>
                      )}

                      {spaceEmojiGroups.map(({ space, emojis }) => (
                        <div key={space.id} data-category={`space-${space.id}`}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            gap={6}
                            padding="10px 2px 4px"
                          >
                            <SectionLabel
                              textColor="muted"
                              css={{ padding: 0 }}
                            >
                              {space.name}
                            </SectionLabel>
                          </Stack>
                          <EmojiGrid>
                            {emojis.map((emoji) => (
                              <EmojiBtn
                                key={emoji.id}
                                onClick={() => handleSelectCustomEmoji(emoji)}
                                onContextMenu={(e) => openCustomCtx(e, emoji)}
                                title={`:${emoji.name}:`}
                              >
                                <CustomEmojiImg
                                  src={emoji.url}
                                  alt={emoji.name}
                                  draggable={false}
                                />
                              </EmojiBtn>
                            ))}
                          </EmojiGrid>
                        </div>
                      ))}

                      {hasCustom && (
                        <Divider
                          lineColor="neutral"
                          css={{ margin: "8px 0", opacity: 0.3 }}
                        />
                      )}

                      {PICKER_CATEGORIES.map((category) => (
                        <div key={category.id} data-category={category.id}>
                          <SectionLabel textColor="muted">
                            {category.name}
                          </SectionLabel>
                          <EmojiGrid>
                            {category.emojis.map((emoji) => {
                              const tone = emoji.hasSkinTones ? skinTone : null;
                              const variant = tone
                                ? emoji.skinVariations?.[tone]
                                : null;
                              return (
                                <EmojiBtn
                                  key={emoji.unified}
                                  onClick={() => handleSelectEmoji(emoji, tone)}
                                  onContextMenu={(e) =>
                                    openStandardCtx(e, emoji, tone)
                                  }
                                  title={`:${emoji.shortName}:`}
                                >
                                  <SpriteEmoji
                                    sheetX={
                                      variant ? variant.sheetX : emoji.sheetX
                                    }
                                    sheetY={
                                      variant ? variant.sheetY : emoji.sheetY
                                    }
                                    title={`:${emoji.shortName}:`}
                                  />
                                </EmojiBtn>
                              );
                            })}
                          </EmojiGrid>
                        </div>
                      ))}
                    </>
                  )}
                </ScrollArea>
              </BodyRow>
            </>
          )}
        </PickerContainer>
      </Paper>
    );
  }
);

EmojiPicker.displayName = "EmojiPicker";
