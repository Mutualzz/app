import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { GoogleFontPicker } from "@components/FontPicker/GoogleFontPicker";
import type {
  APIProfileBlock,
  ProfileHeaderBlock,
  ProfileImageBlock,
  ProfileMusicBlock,
  ProfileTextBlock
} from "@mutualzz/types";
import type { ProfileDraftState } from "@components/Profile/editor/profileEditor.utils";
import { ProfileMarkdownField } from "@components/Profile/editor/ProfileMarkdownField";
import { ProfileMusicPicker } from "@components/Profile/editor/ProfileMusicPicker";
import { ProfileBlockTypeInspector } from "@components/Profile/editor/ProfileBlockTypeInspector";
import { ProfileBlockSizeInspector } from "@components/Profile/editor/ProfileBlockSizeInspector";
import { getApiErrorMessage } from "@components/Profile/editor/profileEditor.utils";
import type { UserProfile } from "@stores/objects/UserProfile";
import {
  Divider,
  Input,
  Option,
  Select,
  Slider,
  Stack,
  Typography
} from "@mutualzz/ui-web";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretDownIcon,
  CaretRightIcon,
  CursorClickIcon,
  ImageIcon,
  MusicNotesIcon,
  PaintBrushBroadIcon,
  TextAaIcon,
  TextAlignLeftIcon,
  TrashIcon
} from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@hooks/useStores";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";

interface Props {
  profile: UserProfile;
  draft: ProfileDraftState;
  selectedBlock: APIProfileBlock | null;
  onDraftChange: (patch: Partial<ProfileDraftState>) => void;
  onBlocksChange: (blocks: APIProfileBlock[]) => void;
  onSelectBlock: (blockId: string | null) => void;
}

const HASH_PATTERN = /^[a-f0-9_]+$/i;

const InspectorSection = ({
  icon,
  title,
  collapsed,
  onToggleCollapsed,
  children
}: {
  icon: ReactNode;
  title: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  children: ReactNode;
}) => (
  <Stack direction="column" spacing={1.25}>
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      onClick={onToggleCollapsed}
      css={{
        cursor: "pointer",
        userSelect: "none"
      }}
    >
      <Stack
        width={30}
        height={30}
        alignItems="center"
        justifyContent="center"
        css={{
          borderRadius: 9,
          background: "var(--mz-palette-primary-softBg)",
          color: "var(--mz-palette-primary-plainColor)"
        }}
      >
        {icon}
      </Stack>
      <Typography level="title-sm" fontWeight={600}>
        {title}
      </Typography>
      <Stack
        ml="auto"
        width={28}
        height={28}
        alignItems="center"
        justifyContent="center"
        css={{
          borderRadius: 8,
          color: "var(--mz-palette-text-tertiary)",
          "&:hover": { background: "var(--mz-palette-neutral-softBg)" }
        }}
      >
        {collapsed ? <CaretRightIcon size={16} /> : <CaretDownIcon size={16} />}
      </Stack>
    </Stack>
    {!collapsed && (
      <Stack direction="column" spacing={1.25}>
        {children}
      </Stack>
    )}
  </Stack>
);

const SettingCard = ({ children }: { children: ReactNode }) => (
  <Paper
    variant="soft"
    borderRadius={10}
    p={1.5}
    direction="column"
    spacing={2.5}
  >
    {children}
  </Paper>
);

const FieldLabel = ({ children }: { children: ReactNode }) => (
  <Typography level="body-xs" fontWeight={600} css={{ opacity: 0.85 }}>
    {children}
  </Typography>
);

const FieldHint = ({ children }: { children: ReactNode }) => (
  <Typography level="body-xs" css={{ opacity: 0.55, lineHeight: 1.4 }}>
    {children}
  </Typography>
);

export const ProfileBlockInspector = observer(
  ({
    profile,
    draft,
    selectedBlock,
    onDraftChange,
    onBlocksChange,
    onSelectBlock
  }: Props) => {
    const app = useAppStore();
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const backgroundInputRef = useRef<HTMLInputElement>(null);
    const musicInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadingBackground, setUploadingBackground] = useState(false);
    const [uploadingMusic, setUploadingMusic] = useState(false);
    const [uploadingBlockImage, setUploadingBlockImage] = useState(false);

    const [musicQuery, setMusicQuery] = useState("");
    const [musicDebouncedQuery, setMusicDebouncedQuery] = useState("");
    const [musicSource, setMusicSource] = useState<"all" | "itunes" | "deezer">(
      "all"
    );

    const [collapsed, setCollapsed] = useState({
      font: true,
      bio: false,
      banner: true,
      background: true,
      intro: true,
      selected: !selectedBlock
    });

    useEffect(() => {
      if (selectedBlock) {
        setCollapsed((prev) => ({ ...prev, selected: false }));
      }
    }, [selectedBlock]);

    useEffect(() => {
      const trimmed = musicQuery.trim();
      if (trimmed.length < 3) {
        setMusicDebouncedQuery("");
        return;
      }
      const timer = window.setTimeout(
        () => setMusicDebouncedQuery(trimmed),
        650
      );
      return () => window.clearTimeout(timer);
    }, [musicQuery]);

    const bannerPreview = profile.constructBannerUrlFrom(draft.banner);
    const headerBlock = draft.blocks.find(
      (block): block is ProfileHeaderBlock => block.type === "header"
    );
    const backgroundPreview = profile.constructBackgroundUrlFrom(
      draft.backgroundImage
    );

    const { data: musicSearch, isFetching: searchingMusic } = useQuery({
      queryKey: [
        "profile-music-block-search",
        musicSource,
        musicDebouncedQuery
      ],
      enabled: musicDebouncedQuery.length >= 3,
      staleTime: 60_000,
      queryFn: () =>
        app.rest.get<{
          tracks: import("@mutualzz/types").APIProfileMusicSearchTrack[];
        }>("/@me/profile/music/search", {
          q: musicDebouncedQuery,
          limit: 8,
          source: musicSource
        })
    });

    const uploadAsset = async (
      file: File,
      type: "banner" | "background" | "image" | "music"
    ): Promise<string | null> => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await app.rest.postFormData<{ hash: string }>(
        "/@me/profile/assets",
        formData,
        { type }
      );
      return result?.hash ?? null;
    };

    const handleAssetUpload = async (
      file: File,
      type: "banner" | "background" | "image" | "music",
      onSuccess: (hash: string) => void,
      setUploading: (value: boolean) => void,
      label: string
    ) => {
      setUploading(true);
      try {
        const hash = await uploadAsset(file, type);
        if (!hash) {
          throw new Error(`No hash returned for ${label}`);
        }
        onSuccess(hash);
        toast.success(`${label} uploaded`);
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, `Failed to upload ${label.toLowerCase()}`)
        );
      } finally {
        setUploading(false);
      }
    };

    const updateSelectedBlock = (patch: Partial<APIProfileBlock>) => {
      if (!selectedBlock) return;
      onBlocksChange(
        draft.blocks.map((block) =>
          block.id === selectedBlock.id
            ? ({ ...block, ...patch } as APIProfileBlock)
            : block
        )
      );
    };

    const layerBlock = (direction: "up" | "down") => {
      if (!selectedBlock) return;
      const sorted = [...draft.blocks].sort((a, b) => a.zIndex - b.zIndex);
      const index = sorted.findIndex((block) => block.id === selectedBlock.id);
      const swapIndex = direction === "up" ? index + 1 : index - 1;
      if (swapIndex < 0 || swapIndex >= sorted.length) return;

      const current = sorted[index];
      const swap = sorted[swapIndex];
      onBlocksChange(
        draft.blocks.map((block) => {
          if (block.id === current.id) return { ...block, zIndex: swap.zIndex };
          if (block.id === swap.id) return { ...block, zIndex: current.zIndex };
          return block;
        })
      );
    };

    const deleteSelected = () => {
      if (!selectedBlock) return;
      onBlocksChange(
        draft.blocks.filter((block) => block.id !== selectedBlock.id)
      );
      onSelectBlock(null);
    };

    return (
      <Paper
        width={340}
        minWidth={340}
        flexShrink={0}
        height="100%"
        direction="column"
        spacing={2.5}
        p={2}
        borderRadius={14}
        variant="plain"
        elevation={app.settings?.preferEmbossed ? 4 : 0}
        boxShadow="none !important"
        css={{ overflow: "auto" }}
      >
        <Stack direction="column" spacing={0.5}>
          <Typography level="title-md" fontWeight={700}>
            Customize
          </Typography>
          <Typography level="body-xs" css={{ opacity: 0.6 }}>
            Page settings and selected block
          </Typography>
        </Stack>

        <InspectorSection
          icon={<TextAaIcon size={16} weight="fill" />}
          title="Font"
          collapsed={collapsed.font}
          onToggleCollapsed={() =>
            setCollapsed((prev) => ({ ...prev, font: !prev.font }))
          }
        >
          <SettingCard>
            <GoogleFontPicker
              label="Page font"
              description="Visitors see this font on your profile page and profile popout."
              fontOwnerId={app.account?.id}
              value={draft.pageFontFamily}
              onChange={(pageFontFamily) => onDraftChange({ pageFontFamily })}
            />
          </SettingCard>
        </InspectorSection>

        {!collapsed.font && <Divider lineColor="muted" />}

        <InspectorSection
          icon={<TextAlignLeftIcon size={16} weight="fill" />}
          title="Bio"
          collapsed={collapsed.bio}
          onToggleCollapsed={() =>
            setCollapsed((prev) => ({ ...prev, bio: !prev.bio }))
          }
        >
          <SettingCard>
            <FieldLabel>Bio</FieldLabel>
            <ProfileMarkdownField
              value={draft.bio}
              maxLength={512}
              minHeight={88}
              onChange={(bio) => onDraftChange({ bio })}
              placeholder="Tell people about yourself"
            />
          </SettingCard>
        </InspectorSection>

        {!collapsed.bio && <Divider lineColor="muted" />}

        <InspectorSection
          icon={<ImageIcon size={16} weight="fill" />}
          title="Banner"
          collapsed={collapsed.banner}
          onToggleCollapsed={() =>
            setCollapsed((prev) => ({ ...prev, banner: !prev.banner }))
          }
        >
          <SettingCard>
            <FieldLabel>Banner image</FieldLabel>
            {bannerPreview && (
              <img
                src={bannerPreview}
                alt=""
                css={{
                  width: "100%",
                  height: 112,
                  objectFit: "cover",
                  objectPosition: `center ${headerBlock?.bannerFocusY ?? 50}%`,
                  borderRadius: 8
                }}
              />
            )}
            <Input
              value={
                draft.banner && !HASH_PATTERN.test(draft.banner)
                  ? draft.banner
                  : ""
              }
              onChange={(event) =>
                onDraftChange({ banner: event.target.value || null })
              }
              placeholder={draft.banner ? "Image uploaded" : "Paste image URL"}
            />
            <Stack direction="row" spacing={1}>
              <Button
                size="sm"
                color="neutral"
                loading={uploadingBanner}
                onClick={() => bannerInputRef.current?.click()}
              >
                Upload
              </Button>
              {draft.banner && (
                <Button
                  size="sm"
                  color="neutral"
                  onClick={() => onDraftChange({ banner: null })}
                >
                  Remove
                </Button>
              )}
            </Stack>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                await handleAssetUpload(
                  file,
                  "banner",
                  (hash) => onDraftChange({ banner: hash }),
                  setUploadingBanner,
                  "Banner"
                );
                event.target.value = "";
              }}
            />
            <FieldHint>
              Shown in your profile header block. Crop and height can be tuned
              when the header block is selected.
            </FieldHint>
          </SettingCard>
        </InspectorSection>

        {!collapsed.banner && <Divider lineColor="muted" />}

        <InspectorSection
          icon={<PaintBrushBroadIcon size={16} weight="fill" />}
          title="Background"
          collapsed={collapsed.background}
          onToggleCollapsed={() =>
            setCollapsed((prev) => ({
              ...prev,
              background: !prev.background
            }))
          }
        >
          <SettingCard>
            <FieldLabel>Background color</FieldLabel>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Input
                type="color"
                value={draft.backgroundColor ?? "#1a1a2e"}
                onChange={(color) => {
                  if (typeof color !== "string" || !color) return;
                  onDraftChange({
                    backgroundColor: color.startsWith("#") ? color : `#${color}`
                  });
                }}
                css={{ flex: 1 }}
              />
              {draft.backgroundColor && (
                <Button
                  size="sm"
                  color="neutral"
                  onClick={() => onDraftChange({ backgroundColor: null })}
                >
                  Reset
                </Button>
              )}
            </Stack>
            <FieldLabel>Background image</FieldLabel>
            {backgroundPreview && (
              <img
                src={backgroundPreview}
                alt=""
                css={{
                  width: "100%",
                  height: 72,
                  objectFit: "cover",
                  borderRadius: 8
                }}
              />
            )}
            <Input
              value={
                draft.backgroundImage &&
                !HASH_PATTERN.test(draft.backgroundImage)
                  ? draft.backgroundImage
                  : ""
              }
              onChange={(event) =>
                onDraftChange({ backgroundImage: event.target.value || null })
              }
              placeholder={
                draft.backgroundImage
                  ? "Image uploaded"
                  : "Background image URL"
              }
            />
            <Stack direction="row" spacing={1}>
              <Button
                size="sm"
                color="neutral"
                loading={uploadingBackground}
                onClick={() => backgroundInputRef.current?.click()}
              >
                Upload image
              </Button>
              {draft.backgroundImage && (
                <Button
                  size="sm"
                  color="neutral"
                  onClick={() => onDraftChange({ backgroundImage: null })}
                >
                  Remove
                </Button>
              )}
            </Stack>
            <input
              ref={backgroundInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                await handleAssetUpload(
                  file,
                  "background",
                  (hash) => onDraftChange({ backgroundImage: hash }),
                  setUploadingBackground,
                  "Background"
                );
                event.target.value = "";
              }}
            />
          </SettingCard>
        </InspectorSection>

        {!collapsed.background && <Divider lineColor="muted" />}

        <InspectorSection
          icon={<MusicNotesIcon size={16} weight="fill" />}
          title="Intro music"
          collapsed={collapsed.intro}
          onToggleCollapsed={() =>
            setCollapsed((prev) => ({ ...prev, intro: !prev.intro }))
          }
        >
          <SettingCard>
            <ProfileMusicPicker draft={draft} onDraftChange={onDraftChange} />
            <Input
              value={
                draft.introMusicUrl &&
                !HASH_PATTERN.test(draft.introMusicUrl) &&
                !draft.introMusicTrackId
                  ? draft.introMusicUrl
                  : ""
              }
              onChange={(event) =>
                onDraftChange({
                  introMusicUrl: event.target.value || null,
                  introMusicTrackId: null,
                  introMusicTrackSelection: null
                })
              }
              placeholder="YouTube or Apple Music link"
            />
            <Stack direction="row" spacing={1}>
              <Button
                size="sm"
                color="neutral"
                loading={uploadingMusic}
                onClick={() => musicInputRef.current?.click()}
              >
                Upload MP3
              </Button>
              {(draft.introMusicUrl || draft.introMusicTrackId) && (
                <Button
                  size="sm"
                  color="neutral"
                  onClick={() =>
                    onDraftChange({
                      introMusicUrl: null,
                      introMusicTrackId: null,
                      introMusicTrackSelection: null
                    })
                  }
                >
                  Clear
                </Button>
              )}
            </Stack>
            <input
              ref={musicInputRef}
              type="file"
              accept="audio/mpeg,.mp3"
              hidden
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (/\.wav$/i.test(file.name)) {
                  toast.error(
                    "WAV files are not supported. Please upload an MP3."
                  );
                  event.target.value = "";
                  return;
                }
                await handleAssetUpload(
                  file,
                  "music",
                  (hash) =>
                    onDraftChange({
                      introMusicUrl: hash,
                      introMusicTrackId: null,
                      introMusicTrackSelection: null
                    }),
                  setUploadingMusic,
                  "Intro music"
                );
                event.target.value = "";
              }}
            />
            <FieldHint>
              Search for a 30s preview, upload an MP3, or paste a streaming
              link.
            </FieldHint>
          </SettingCard>
        </InspectorSection>

        {!collapsed.intro && <Divider lineColor="muted" />}

        <InspectorSection
          icon={<CursorClickIcon size={16} weight="fill" />}
          title="Selected block"
          collapsed={collapsed.selected}
          onToggleCollapsed={() =>
            setCollapsed((prev) => ({ ...prev, selected: !prev.selected }))
          }
        >
          {!selectedBlock ? (
            <Paper
              variant="soft"
              borderRadius={10}
              p={2}
              direction="column"
              alignItems="center"
              spacing={1.25}
              css={{ textAlign: "center" }}
            >
              <CursorClickIcon size={28} css={{ opacity: 0.35 }} />
              <Typography level="body-sm" css={{ opacity: 0.7 }}>
                Click a block on the canvas to edit it
              </Typography>
            </Paper>
          ) : (
            <SettingCard>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  level="body-xs"
                  fontWeight={700}
                  css={{
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    opacity: 0.65
                  }}
                >
                  {selectedBlock.type}
                </Typography>
              </Stack>

              {selectedBlock.type === "header" && (
                <>
                  <FieldLabel>Banner height</FieldLabel>
                  <Slider
                    min={35}
                    max={75}
                    value={
                      (selectedBlock as ProfileHeaderBlock).bannerHeight ?? 58
                    }
                    onChange={(_, value) =>
                      updateSelectedBlock({
                        bannerHeight: value as number
                      })
                    }
                    valueLabelDisplay="auto"
                  />
                  <FieldLabel>Banner crop position</FieldLabel>
                  <Slider
                    min={0}
                    max={100}
                    value={
                      (selectedBlock as ProfileHeaderBlock).bannerFocusY ?? 50
                    }
                    onChange={(_, value) =>
                      updateSelectedBlock({
                        bannerFocusY: value as number
                      })
                    }
                    valueLabelDisplay="auto"
                  />
                  <FieldHint>
                    Drag the block edges on the canvas to change overall header
                    size. Use the sliders to tune banner height and vertical
                    crop.
                  </FieldHint>
                </>
              )}

              {selectedBlock.type === "text" && (
                <ProfileMarkdownField
                  value={(selectedBlock as ProfileTextBlock).content}
                  maxLength={2000}
                  minHeight={120}
                  onChange={(content) => updateSelectedBlock({ content })}
                  placeholder="Write something…"
                />
              )}

              {selectedBlock.type === "image" && (
                <>
                  {(selectedBlock as ProfileImageBlock).src && (
                    <img
                      src={profile.constructBlockImageUrl(
                        (selectedBlock as ProfileImageBlock).src
                      )}
                      alt=""
                      css={{
                        width: "100%",
                        maxHeight: 120,
                        objectFit: "contain",
                        borderRadius: 8,
                        background: "var(--mz-palette-neutral-softBg)"
                      }}
                    />
                  )}
                  <Input
                    value={
                      (selectedBlock as ProfileImageBlock).src &&
                      !HASH_PATTERN.test(
                        (selectedBlock as ProfileImageBlock).src
                      )
                        ? (selectedBlock as ProfileImageBlock).src
                        : ""
                    }
                    onChange={(event) =>
                      updateSelectedBlock({ src: event.target.value })
                    }
                    placeholder={
                      (selectedBlock as ProfileImageBlock).src
                        ? "Image uploaded"
                        : "Image URL"
                    }
                  />
                  <Button
                    size="sm"
                    color="neutral"
                    loading={uploadingBlockImage}
                    onClick={() => imageInputRef.current?.click()}
                  >
                    Upload image
                  </Button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      await handleAssetUpload(
                        file,
                        "image",
                        (hash) => updateSelectedBlock({ src: hash }),
                        setUploadingBlockImage,
                        "Image"
                      );
                      event.target.value = "";
                    }}
                  />
                </>
              )}

              {selectedBlock.type === "music" && (
                <>
                  <FieldLabel>Music</FieldLabel>
                  <Select
                    value={musicSource}
                    onValueChange={(value) =>
                      setMusicSource(
                        (value ?? "all") as "all" | "itunes" | "deezer"
                      )
                    }
                    size="sm"
                  >
                    <Option value="all">Apple + Deezer</Option>
                    <Option value="itunes">Apple</Option>
                    <Option value="deezer">Deezer</Option>
                  </Select>
                  <Input
                    type="text"
                    value={musicQuery}
                    onChange={(e) => setMusicQuery(e.target.value)}
                    placeholder="Search songs…"
                  />
                  {(musicDebouncedQuery.length > 0 || searchingMusic) && (
                    <Paper
                      variant="plain"
                      borderRadius={10}
                      p={0.75}
                      direction="column"
                      spacing={0.5}
                      css={{
                        maxHeight: 220,
                        overflow: "auto",
                        border:
                          "1px solid var(--mz-palette-neutral-outlinedBorder)"
                      }}
                    >
                      {searchingMusic && (
                        <Typography level="body-xs" css={{ opacity: 0.65 }}>
                          Searching…
                        </Typography>
                      )}
                      {musicSearch?.tracks?.map((track) => (
                        <Paper
                          key={`${track.source}:${track.id}`}
                          variant="plain"
                          borderRadius={8}
                          p={0.75}
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          css={{
                            cursor: track.previewUrl
                              ? "pointer"
                              : "not-allowed",
                            opacity: track.previewUrl ? 1 : 0.45,
                            "&:hover": track.previewUrl
                              ? {
                                  background: "var(--mz-palette-neutral-softBg)"
                                }
                              : undefined
                          }}
                          onClick={() => {
                            if (!track.previewUrl) return;
                            const next: Partial<ProfileMusicBlock> = {
                              track,
                              title: null,
                              artists: null,
                              image: null,
                              previewUrl: null,
                              trackUrl: null
                            };
                            updateSelectedBlock(
                              next as Partial<APIProfileBlock>
                            );
                            setMusicQuery("");
                            setMusicDebouncedQuery("");
                          }}
                        >
                          {track.image ? (
                            <img
                              src={track.image}
                              alt=""
                              width={36}
                              height={36}
                              css={{ borderRadius: 8, objectFit: "cover" }}
                            />
                          ) : (
                            <Stack
                              width={36}
                              height={36}
                              alignItems="center"
                              justifyContent="center"
                              css={{
                                borderRadius: 8,
                                background: "var(--mz-palette-neutral-softBg)"
                              }}
                            >
                              <MusicNotesIcon size={16} />
                            </Stack>
                          )}
                          <Stack
                            direction="column"
                            spacing={0.25}
                            minWidth={0}
                            flex={1}
                          >
                            <Typography
                              level="body-sm"
                              fontWeight={600}
                              css={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {track.name}
                            </Typography>
                            <Typography
                              level="body-xs"
                              css={{
                                opacity: 0.7,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {track.artists}
                            </Typography>
                          </Stack>
                          <Typography level="body-xs" css={{ opacity: 0.55 }}>
                            {track.previewUrl ? "30s" : "—"}
                          </Typography>
                        </Paper>
                      ))}
                      {!searchingMusic && musicDebouncedQuery.length >= 3 && (
                        <Typography level="body-xs" css={{ opacity: 0.55 }}>
                          {musicSearch?.tracks?.length ? "" : "No tracks found"}
                        </Typography>
                      )}
                    </Paper>
                  )}

                  <Divider lineColor="muted" />

                  <FieldLabel>Link (song/album)</FieldLabel>
                  <Input
                    value={(selectedBlock as ProfileMusicBlock).trackUrl ?? ""}
                    onChange={(event) =>
                      updateSelectedBlock({
                        track: null,
                        trackUrl: event.target.value || null,
                        previewUrl: null
                      } as Partial<APIProfileBlock>)
                    }
                    placeholder="Paste a link (optional)"
                  />
                  <FieldHint>
                    Search adds a playable 30s preview (when available). Links
                    are displayed as a card with an Open button.
                  </FieldHint>
                </>
              )}

              <ProfileBlockSizeInspector
                block={selectedBlock}
                updateSelectedBlock={updateSelectedBlock}
              />

              <Divider lineColor="muted" />

              <ProfileBlockTypeInspector
                block={selectedBlock}
                updateSelectedBlock={updateSelectedBlock}
              />

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  size="sm"
                  color="neutral"
                  startDecorator={<ArrowUpIcon />}
                  onClick={() => layerBlock("up")}
                >
                  Forward
                </Button>
                <Button
                  size="sm"
                  color="neutral"
                  startDecorator={<ArrowDownIcon />}
                  onClick={() => layerBlock("down")}
                >
                  Back
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  startDecorator={<TrashIcon />}
                  onClick={deleteSelected}
                >
                  Delete
                </Button>
              </Stack>
            </SettingCard>
          )}
        </InspectorSection>
      </Paper>
    );
  }
);
