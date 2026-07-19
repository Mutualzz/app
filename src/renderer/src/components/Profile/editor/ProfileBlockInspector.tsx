import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { GoogleFontPicker } from "@components/FontPicker/GoogleFontPicker";
import type {
  APIProfileBlock,
  ProfileDrawBlock,
  ProfileHeaderBlock,
  ProfileImageBlock,
  ProfileMusicBlock,
  ProfileStickerBlock,
  ProfileTextBlock
} from "@mutualzz/types";
import { ImageFormat } from "@mutualzz/types";
import type { ProfileDraftState } from "@components/Profile/editor/profileEditor.utils";
import { ProfileMarkdownField } from "@components/Profile/editor/ProfileMarkdownField";
import { ProfileMusicPicker } from "@components/Profile/editor/ProfileMusicPicker";
import { ProfileBlockMusicPicker } from "@components/Profile/editor/ProfileBlockMusicPicker";
import { ProfileStickerBlockView } from "@components/Profile/blocks/ProfileStickerBlockView";
import { ProfileDrawBlockModal } from "@components/Profile/editor/ProfileDrawBlockModal";
import { ProfileImageGifPickerModal } from "@components/Profile/editor/ProfileImageGifPickerModal";
import { ProfileStickerPickerModal } from "@components/Profile/editor/ProfileStickerPickerModal";
import { ProfileBlockTypeInspector } from "@components/Profile/editor/ProfileBlockTypeInspector";
import { ProfileBlockSizeInspector } from "@components/Profile/editor/ProfileBlockSizeInspector";
import { ProfileBlockBackgroundColorInspector } from "@components/Profile/editor/ProfileBlockBackgroundColorInspector";
import { ProfileBlockCornerRadiusInspector } from "@components/Profile/editor/ProfileBlockCornerRadiusInspector";
import { getApiErrorMessage } from "@components/Profile/editor/profileEditor.utils";
import { InputWithLabel } from "@components/InputWithLabel";
import type { UserProfile } from "@stores/objects/UserProfile";
import type { ColorLike } from "@mutualzz/ui-core";
import {
  isProfileImageCdnHash,
  isProfileImageVideoUrl,
  resolveProfileImageBlockUrl
} from "@mutualzz/ui-core";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretDownIcon,
  CaretRightIcon,
  CursorClickIcon,
  GifIcon,
  ImageIcon,
  MusicNotesIcon,
  PaintBrushBroadIcon,
  PencilSimpleIcon,
  StickerIcon,
  TextAaIcon,
  TextAlignLeftIcon,
  TrashIcon,
  UploadIcon
} from "@phosphor-icons/react";

import { useModal } from "@contexts/Modal.context";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@hooks/useStores";
import { toast } from "react-toastify";
import { Divider, Input, Slider, Stack, Typography } from "@mutualzz/ui-web";

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
    const { t } = useTranslation("settings");
    const app = useAppStore();
    const { openModal } = useModal();
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const backgroundInputRef = useRef<HTMLInputElement>(null);
    const musicInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const blockMusicInputRef = useRef<HTMLInputElement>(null);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadingBackground, setUploadingBackground] = useState(false);
    const [uploadingMusic, setUploadingMusic] = useState(false);
    const [uploadingBlockImage, setUploadingBlockImage] = useState(false);
    const [uploadingBlockMusic, setUploadingBlockMusic] = useState(false);

    const [collapsed, setCollapsed] = useState({
      font: true,
      bio: false,
      banner: true,
      background: true,
      music: true,
      selected: !selectedBlock
    });

    useEffect(() => {
      if (selectedBlock) {
        setCollapsed((prev) => ({ ...prev, selected: false }));
      }
    }, [selectedBlock]);

    const bannerPreview = profile.constructBannerUrlFrom(
      draft.banner,
      ImageFormat.WebP,
      1024,
      draft.banner?.startsWith("a_")
    );
    const headerBlock = draft.blocks.find(
      (block): block is ProfileHeaderBlock => block.type === "header"
    );
    const backgroundPreview = profile.constructBackgroundUrlFrom(
      draft.backgroundImage
    );

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
      assetLabelKey: "banner" | "background" | "image" | "music" | "profileMusic"
    ) => {
      const label = t(`profile.inspector.assetLabels.${assetLabelKey}`);
      setUploading(true);
      try {
        const hash = await uploadAsset(file, type);
        if (!hash) {
          throw new Error(`No hash returned for ${label}`);
        }
        onSuccess(hash);
        toast.success(t("profile.inspector.assetUploaded", { label }));
      } catch (error) {
        toast.error(
          getApiErrorMessage(
            error,
            t("profile.inspector.failedUploadAsset", { label })
          )
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
        variant="elevation"
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        css={{ overflow: "auto" }}
      >
        <Stack direction="column" spacing={0.5}>
          <Typography level="title-md" fontWeight={700}>
            {t("profile.inspector.title")}
          </Typography>
          <Typography level="body-xs" css={{ opacity: 0.6 }}>
            {t("profile.inspector.subtitle")}
          </Typography>
        </Stack>

        <InspectorSection
          icon={<TextAaIcon size={16} weight="fill" />}
          title={t("profile.inspector.font")}
          collapsed={collapsed.font}
          onToggleCollapsed={() =>
            setCollapsed((prev) => ({ ...prev, font: !prev.font }))
          }
        >
          <SettingCard>
            <GoogleFontPicker
              label={t("profile.editor.pageFont")}
              description={t("profile.inspector.pageFontDescription")}
              fontOwnerId={app.account?.id}
              value={draft.pageFontFamily}
              onChange={(pageFontFamily) => onDraftChange({ pageFontFamily })}
            />
          </SettingCard>
        </InspectorSection>

        {!collapsed.font && <Divider lineColor="muted" />}

        <InspectorSection
          icon={<TextAlignLeftIcon size={16} weight="fill" />}
          title={t("profile.editor.bio")}
          collapsed={collapsed.bio}
          onToggleCollapsed={() =>
            setCollapsed((prev) => ({ ...prev, bio: !prev.bio }))
          }
        >
          <SettingCard>
            <FieldLabel>{t("profile.editor.pronouns")}</FieldLabel>
            <Input
              value={draft.pronouns}
              maxLength={32}
              onChange={(e) =>
                onDraftChange({ pronouns: e.target.value.slice(0, 32) })
              }
              placeholder={t("profile.editor.pronounsPlaceholder")}
            />
            <FieldLabel>{t("profile.editor.bio")}</FieldLabel>
            <ProfileMarkdownField
              value={draft.bio}
              maxLength={512}
              minHeight={88}
              onChange={(bio) => onDraftChange({ bio })}
              placeholder={t("profile.editor.bioPlaceholder")}
            />
          </SettingCard>
        </InspectorSection>

        {!collapsed.bio && <Divider lineColor="muted" />}

        <InspectorSection
          icon={<ImageIcon size={16} weight="fill" />}
          title={t("profile.editor.banner")}
          collapsed={collapsed.banner}
          onToggleCollapsed={() =>
            setCollapsed((prev) => ({ ...prev, banner: !prev.banner }))
          }
        >
          <SettingCard>
            <FieldLabel>{t("profile.inspector.bannerImage")}</FieldLabel>
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
              placeholder={
                draft.banner
                  ? t("profile.inspector.imageUploaded")
                  : t("profile.inspector.pasteImageUrl")
              }
              type="text"
            />
            <Stack direction="row" spacing={1}>
              <Button
                size="sm"
                color="neutral"
                loading={uploadingBanner}
                onClick={() => bannerInputRef.current?.click()}
              >
                {t("expressions.upload")}
              </Button>
              {draft.banner && (
                <Button
                  size="sm"
                  color="neutral"
                  onClick={() => onDraftChange({ banner: null })}
                >
                  {t("profile.remove")}
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
                  "banner"
                );
                event.target.value = "";
              }}
            />
            <FieldHint>{t("profile.inspector.bannerHint")}</FieldHint>
          </SettingCard>
        </InspectorSection>

        {!collapsed.banner && <Divider lineColor="muted" />}

        <InspectorSection
          icon={<PaintBrushBroadIcon size={16} weight="fill" />}
          title={t("profile.editor.background")}
          collapsed={collapsed.background}
          onToggleCollapsed={() =>
            setCollapsed((prev) => ({
              ...prev,
              background: !prev.background
            }))
          }
        >
          <SettingCard>
            <InputWithLabel
              type="color"
              label={t("profile.inspector.backgroundColor")}
              name="backgroundColor"
              description={t("profile.inspector.backgroundColorDescription")}
              value={(draft.backgroundColor as ColorLike) ?? "#1a1a2e"}
              allowGradient
              onChange={(color: ColorLike) => {
                if (typeof color !== "string" || !color) return;
                onDraftChange({ backgroundColor: color });
              }}
              fullWidth
            />
            {draft.backgroundColor && (
              <Button
                size="sm"
                color="neutral"
                onClick={() => onDraftChange({ backgroundColor: null })}
              >
                {t("profile.inspector.resetBackgroundColor")}
              </Button>
            )}
            <FieldLabel>{t("profile.inspector.backgroundImage")}</FieldLabel>
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
                  ? t("profile.inspector.imageUploaded")
                  : t("profile.inspector.backgroundImageUrl")
              }
            />
            <Stack direction="row" spacing={1}>
              <Button
                size="sm"
                color="neutral"
                loading={uploadingBackground}
                onClick={() => backgroundInputRef.current?.click()}
              >
                {t("profile.inspector.uploadImage")}
              </Button>
              {draft.backgroundImage && (
                <Button
                  size="sm"
                  color="neutral"
                  onClick={() => onDraftChange({ backgroundImage: null })}
                >
                  {t("profile.remove")}
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
                  "background"
                );
                event.target.value = "";
              }}
            />
          </SettingCard>
        </InspectorSection>

        {!collapsed.background && <Divider lineColor="muted" />}

        <InspectorSection
          icon={<MusicNotesIcon size={16} weight="fill" />}
          title={t("profile.inspector.profileMusic")}
          collapsed={collapsed.music}
          onToggleCollapsed={() =>
            setCollapsed((prev) => ({ ...prev, music: !prev.music }))
          }
        >
          <SettingCard>
            {!draft.profileMusicTrackId &&
            draft.profileMusicUrl &&
            HASH_PATTERN.test(draft.profileMusicUrl) ? (
              <>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <Typography level="body-xs" css={{ flex: 1, opacity: 0.8 }}>
                    {t("profile.inspector.mp3Uploaded")}
                  </Typography>
                  <Button
                    size="sm"
                    color="neutral"
                    onClick={() =>
                      onDraftChange({
                        profileMusicUrl: null,
                        profileMusicTitle: null,
                        profileMusicAuthorName: null
                      })
                    }
                  >
                    {t("profile.remove")}
                  </Button>
                </Stack>
                <FieldLabel>{t("profile.inspector.trackInfo")}</FieldLabel>
                <Input
                  value={draft.profileMusicTitle ?? ""}
                  onChange={(event) =>
                    onDraftChange({
                      profileMusicTitle: event.target.value || null
                    })
                  }
                  placeholder={t("profile.inspector.songTitle")}
                />
                <Input
                  value={draft.profileMusicAuthorName ?? ""}
                  onChange={(event) =>
                    onDraftChange({
                      profileMusicAuthorName: event.target.value || null
                    })
                  }
                  placeholder={t("profile.inspector.artists")}
                />
              </>
            ) : (
              <>
                <ProfileMusicPicker
                  draft={draft}
                  onDraftChange={onDraftChange}
                />
                {!draft.profileMusicTrackId && (
                  <>
                    <Input
                      value={
                        draft.profileMusicUrl &&
                        !HASH_PATTERN.test(draft.profileMusicUrl)
                          ? draft.profileMusicUrl
                          : ""
                      }
                      onChange={(event) =>
                        onDraftChange({
                          profileMusicUrl: event.target.value || null,
                          profileMusicTrackId: null,
                          profileMusicTrackSelection: null
                        })
                      }
                      placeholder={t("profile.inspector.youtubeOrAppleMusicLink")}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="sm"
                        color="neutral"
                        loading={uploadingMusic}
                        onClick={() => musicInputRef.current?.click()}
                      >
                        {t("profile.inspector.uploadMp3")}
                      </Button>
                      {draft.profileMusicUrl && (
                        <Button
                          size="sm"
                          color="neutral"
                          onClick={() =>
                            onDraftChange({
                              profileMusicUrl: null,
                              profileMusicTrackId: null,
                              profileMusicTrackSelection: null
                            })
                          }
                        >
                          {t("profile.inspector.clear")}
                        </Button>
                      )}
                    </Stack>
                    <FieldHint>{t("profile.inspector.profileMusicHint")}</FieldHint>
                  </>
                )}
              </>
            )}
            <input
              ref={musicInputRef}
              type="file"
              accept="audio/mpeg,.mp3"
              hidden
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (/\.wav$/i.test(file.name)) {
                  toast.error(t("profile.inspector.wavNotSupported"));
                  event.target.value = "";
                  return;
                }
                await handleAssetUpload(
                  file,
                  "music",
                  (hash) =>
                    onDraftChange({
                      profileMusicUrl: hash,
                      profileMusicTrackId: null,
                      profileMusicTrackSelection: null
                    }),
                  setUploadingMusic,
                  "profileMusic"
                );
                event.target.value = "";
              }}
            />
          </SettingCard>
        </InspectorSection>

        {!collapsed.music && <Divider lineColor="muted" />}

        <InspectorSection
          icon={<CursorClickIcon size={16} weight="fill" />}
          title={t("profile.inspector.selectedBlock")}
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
                {t("profile.inspector.clickBlockToEdit")}
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
                  {t(`profile.blocks.${selectedBlock.type}`)}
                </Typography>
              </Stack>

              {selectedBlock.type === "header" && (
                <>
                  <FieldLabel>{t("profile.inspector.bannerHeight")}</FieldLabel>
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
                  <FieldLabel>{t("profile.inspector.bannerCropPosition")}</FieldLabel>
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
                  <FieldHint>{t("profile.inspector.headerSizeHint")}</FieldHint>
                </>
              )}

              {selectedBlock.type === "text" && (
                <ProfileMarkdownField
                  value={(selectedBlock as ProfileTextBlock).content}
                  maxLength={2000}
                  minHeight={120}
                  onChange={(content) => updateSelectedBlock({ content })}
                  placeholder={t("profile.inspector.writeSomething")}
                />
              )}

              {selectedBlock.type === "image" &&
                (() => {
                  const imageBlock = selectedBlock as ProfileImageBlock;
                  const previewUrl = imageBlock.src
                    ? resolveProfileImageBlockUrl(
                        imageBlock.src,
                        (hash, animated) =>
                          profile.constructBlockImageUrl(
                            hash,
                            undefined,
                            undefined,
                            animated
                          )
                      )
                    : null;
                  const previewIsVideo = previewUrl
                    ? isProfileImageVideoUrl(previewUrl)
                    : false;

                  return (
                    <>
                      {previewUrl &&
                        (previewIsVideo ? (
                          <video
                            src={previewUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            css={{
                              width: "100%",
                              maxHeight: 120,
                              objectFit: "contain",
                              borderRadius: 8,
                              background: "var(--mz-palette-neutral-softBg)"
                            }}
                          />
                        ) : (
                          <img
                            src={previewUrl}
                            alt=""
                            css={{
                              width: "100%",
                              maxHeight: 120,
                              objectFit: "contain",
                              borderRadius: 8,
                              background: "var(--mz-palette-neutral-softBg)"
                            }}
                          />
                        ))}
                      <Input
                        value={
                          imageBlock.src &&
                          !isProfileImageCdnHash(imageBlock.src)
                            ? imageBlock.src
                            : ""
                        }
                        onChange={(event) =>
                          updateSelectedBlock({ src: event.target.value })
                        }
                        placeholder={
                          imageBlock.src
                            ? t("profile.inspector.imageUploaded")
                            : t("profile.inspector.imageUrl")
                        }
                      />
                      <Stack flex={1} direction="row" spacing={1.25}>
                        <Button
                          size="sm"
                          color="neutral"
                          loading={uploadingBlockImage}
                          onClick={() => imageInputRef.current?.click()}
                          startDecorator={<UploadIcon weight="fill" />}
                        >
                          {t("profile.inspector.uploadImage")}
                        </Button>
                        <Button
                          size="sm"
                          color="neutral"
                          startDecorator={<GifIcon weight="fill" />}
                          onClick={() =>
                            openModal(
                              "image-gif-picker",
                              <ProfileImageGifPickerModal
                                onSelect={(src) => updateSelectedBlock({ src })}
                              />
                            )
                          }
                        >
                          {t("profile.inspector.chooseGif")}
                        </Button>
                      </Stack>
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
                            "image"
                          );
                          event.target.value = "";
                        }}
                      />
                    </>
                  );
                })()}

              {selectedBlock.type === "sticker" &&
                (() => {
                  const stickerBlock = selectedBlock as ProfileStickerBlock;

                  return (
                    <>
                      <div
                        css={{
                          width: "100%",
                          height: 120,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 8,
                          background: stickerBlock.expressionId
                            ? "transparent"
                            : "var(--mz-palette-neutral-softBg)",
                          overflow: "hidden"
                        }}
                      >
                        <ProfileStickerBlockView block={stickerBlock} />
                      </div>
                      <Button
                        size="sm"
                        color="neutral"
                        startDecorator={<StickerIcon weight="fill" />}
                        onClick={() =>
                          openModal(
                            "sticker-picker",
                            <ProfileStickerPickerModal
                              onSelect={(sticker) =>
                                updateSelectedBlock({
                                  expressionId: sticker.id
                                })
                              }
                            />
                          )
                        }
                      >
                        {stickerBlock.expressionId
                          ? t("profile.inspector.changeSticker")
                          : t("profile.inspector.chooseSticker")}
                      </Button>
                    </>
                  );
                })()}

              {selectedBlock.type === "music" &&
                (() => {
                  const block = selectedBlock as ProfileMusicBlock;

                  if (block.audioHash) {
                    return (
                      <>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.75}
                        >
                          <Typography
                            level="body-xs"
                            css={{ flex: 1, opacity: 0.8 }}
                          >
                            {t("profile.inspector.mp3Uploaded")}
                          </Typography>
                          <Button
                            size="sm"
                            color="neutral"
                            onClick={() =>
                              updateSelectedBlock({
                                audioHash: null,
                                title: null,
                                artists: null,
                                image: null
                              } as Partial<APIProfileBlock>)
                            }
                          >
                            {t("profile.remove")}
                          </Button>
                        </Stack>
                        <FieldLabel>{t("profile.inspector.trackInfo")}</FieldLabel>
                        <Input
                          value={block.title ?? ""}
                          onChange={(e) =>
                            updateSelectedBlock({
                              title: e.target.value || null
                            } as Partial<APIProfileBlock>)
                          }
                          placeholder={t("profile.inspector.songTitle")}
                        />
                        <Input
                          value={block.artists ?? ""}
                          onChange={(e) =>
                            updateSelectedBlock({
                              artists: e.target.value || null
                            } as Partial<APIProfileBlock>)
                          }
                          placeholder={t("profile.inspector.artists")}
                        />
                        <Input
                          value={block.image ?? ""}
                          onChange={(e) =>
                            updateSelectedBlock({
                              image: e.target.value || null
                            } as Partial<APIProfileBlock>)
                          }
                          placeholder={t("profile.inspector.coverImageUrlOptional")}
                        />
                      </>
                    );
                  }

                  if (block.youtubeUrl) {
                    return (
                      <Stack direction="row" alignItems="center" spacing={0.75}>
                        <Typography
                          level="body-xs"
                          css={{
                            flex: 1,
                            opacity: 0.8,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {t("profile.inspector.youtubeLinked")}
                        </Typography>
                        <Button
                          size="sm"
                          color="neutral"
                          onClick={() =>
                            updateSelectedBlock({
                              youtubeUrl: null
                            } as Partial<APIProfileBlock>)
                          }
                        >
                          {t("profile.remove")}
                        </Button>
                      </Stack>
                    );
                  }

                  return (
                    <>
                      <ProfileBlockMusicPicker
                        block={block}
                        updateBlock={updateSelectedBlock}
                      />
                      {!block.track && (
                        <>
                          <Input
                            placeholder={t("profile.inspector.youtubeLink")}
                            onChange={(event) => {
                              const value = event.target.value.trim();
                              if (value)
                                updateSelectedBlock({
                                  youtubeUrl: value,
                                  audioHash: null
                                } as Partial<APIProfileBlock>);
                            }}
                          />
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="sm"
                              color="neutral"
                              loading={uploadingBlockMusic}
                              onClick={() =>
                                blockMusicInputRef.current?.click()
                              }
                            >
                              {t("profile.inspector.uploadMp3")}
                            </Button>
                          </Stack>
                          <input
                            ref={blockMusicInputRef}
                            type="file"
                            accept="audio/mpeg,.mp3"
                            hidden
                            onChange={async (event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              await handleAssetUpload(
                                file,
                                "music",
                                (hash) =>
                                  updateSelectedBlock({
                                    audioHash: hash,
                                    youtubeUrl: null,
                                    track: null
                                  } as Partial<APIProfileBlock>),
                                setUploadingBlockMusic,
                                "music"
                              );
                              event.target.value = "";
                            }}
                          />
                          <FieldHint>{t("profile.inspector.blockMusicHint")}</FieldHint>
                        </>
                      )}
                    </>
                  );
                })()}

              {selectedBlock.type === "draw" &&
                (() => {
                  const drawBlock = selectedBlock as ProfileDrawBlock;
                  return (
                    <Stack direction="column" spacing={1.25}>
                      {drawBlock.svgData ? (
                        <Stack
                          css={{
                            borderRadius: 8,
                            overflow: "hidden",
                            background: drawBlock.backgroundColor ?? "#1a1a2e",
                            height: 80
                          }}
                        >
                          <img
                            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(drawBlock.svgData)}`}
                            alt=""
                            css={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              display: "block"
                            }}
                          />
                        </Stack>
                      ) : (
                        <Typography
                          level="body-xs"
                          textColor="muted"
                          css={{ textAlign: "center" }}
                        >
                          {t("profile.inspector.noDrawingYet")}
                        </Typography>
                      )}
                      <Button
                        size="sm"
                        color="primary"
                        startDecorator={<PencilSimpleIcon weight="fill" />}
                        css={{ width: "100%" }}
                        onClick={() =>
                          openModal(
                            "draw-editor",
                            <ProfileDrawBlockModal
                              block={drawBlock}
                              updateBlock={updateSelectedBlock}
                            />
                          )
                        }
                      >
                        {drawBlock.svgData
                          ? t("profile.inspector.editDrawing")
                          : t("profile.inspector.openDrawingEditor")}
                      </Button>
                    </Stack>
                  );
                })()}

              <ProfileBlockSizeInspector
                block={selectedBlock}
                updateSelectedBlock={updateSelectedBlock}
              />

              <ProfileBlockBackgroundColorInspector
                block={selectedBlock}
                updateSelectedBlock={updateSelectedBlock}
              />

              <ProfileBlockCornerRadiusInspector
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
                  {t("profile.inspector.forward")}
                </Button>
                <Button
                  size="sm"
                  color="neutral"
                  startDecorator={<ArrowDownIcon />}
                  onClick={() => layerBlock("down")}
                >
                  {t("profile.inspector.back")}
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  startDecorator={<TrashIcon />}
                  onClick={deleteSelected}
                >
                  {t("profile.inspector.delete")}
                </Button>
              </Stack>
            </SettingCard>
          )}
        </InspectorSection>
      </Paper>
    );
  }
);
