import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import {
  PROFILE_BACKGROUND_IMAGE_FITS,
  PROFILE_VISIBILITY_OPTIONS,
  type ProfileVisibility
} from "@mutualzz/types";
import type {
  APIProfileBlock,
  ProfileBackgroundImageFit,
  ProfileBlockAppearance,
  ProfileHeaderBlock
} from "@mutualzz/types";
import { ImageFormat } from "@mutualzz/types";
import type { ProfileDraftState } from "@components/Profile/editor/utils/profileEditor.utils";
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
import { ProfileBlockRotationInspector } from "@components/Profile/editor/ProfileBlockRotationInspector";
import { ProfileGalleryInspector } from "@components/Profile/editor/ProfileGalleryInspector";
import { CompactFontPicker } from "@components/Profile/editor/CompactFontPicker";
import { ProfileEmbedInspector } from "@components/Profile/editor/ProfileEmbedInspector";
import { ProfileBlockAppearanceInspector } from "@components/Profile/editor/ProfileBlockAppearanceInspector";
import {
  ProfileInspectorField,
  ProfileInspectorFieldLabel,
  ProfileInspectorGroup
} from "@components/Profile/editor/ProfileInspectorField";
import {
  isProfileBlockOnlyMe,
  supportsProfileBlockFont
} from "@mutualzz/ui-core";
import { getApiErrorMessage } from "@components/Profile/editor/utils/profileEditor.utils";
import { ProfileMultiSelectPanel } from "@components/Profile/editor/ProfileMultiSelectPanel";
import type {
  BlockAlignment,
  BlockDistribution
} from "@components/Profile/editor/utils/profileBlockArrange.utils";
import { InputWithLabel } from "@components/InputWithLabel";
import type { UserProfile } from "@stores/objects/UserProfile";
import type { ColorLike } from "@mutualzz/ui-core";
import {
  isProfileImageCdnHash,
  isProfileImageVideoUrl,
  formatColor,
  resolveProfileImageBlockUrl
} from "@mutualzz/ui-core";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CursorClickIcon,
  GifIcon,
  PencilSimpleIcon,
  StickerIcon,
  TrashIcon,
  UploadIcon
} from "@phosphor-icons/react";

import { useModal } from "@contexts/Modal.context";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@hooks/useStores";
import { toast } from "react-toastify";
import {
  ButtonGroup,
  Divider,
  Input,
  Slider,
  Stack,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import { ProfileThemePicker } from "./ProfileThemePicker";
import { ProfileNameStylePanel } from "./ProfileNameStylePanel";

interface Props {
  mode: "page" | "block";
  canGroup: boolean;
  canUngroup: boolean;
  onGroup: () => void;
  onUngroup: () => void;
  profile: UserProfile;
  draft: ProfileDraftState;
  selectedBlock: APIProfileBlock | null;
  selectedBlockCount: number;
  selectedBlockIds: string[];
  onAlignSelection: (alignment: BlockAlignment) => void;
  onDistributeSelection: (distribution: BlockDistribution) => void;
  onDraftChange: (patch: Partial<ProfileDraftState>) => void;
  onBlocksChange: (blocks: APIProfileBlock[]) => void;
  onSelectBlock: (blockId: string | null) => void;
}

const HASH_PATTERN = /^[a-f0-9_]+$/i;

const PAGE_PANEL_TABS = ["profile", "background", "style", "music"] as const;

type PagePanelTab = (typeof PAGE_PANEL_TABS)[number];

const BLOCK_PANEL_TABS = ["content", "layout", "style", "motion"] as const;

type BlockPanelTab = (typeof BLOCK_PANEL_TABS)[number];

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
  <ProfileInspectorFieldLabel>{children}</ProfileInspectorFieldLabel>
);

const FieldHint = ({ children }: { children: ReactNode }) => (
  <Typography level="body-xs" css={{ opacity: 0.55, lineHeight: 1.4 }}>
    {children}
  </Typography>
);

export const ProfileBlockInspector = observer(
  ({
    mode,
    canGroup,
    canUngroup,
    onGroup,
    onUngroup,
    profile,
    draft,
    selectedBlock,
    selectedBlockCount,
    selectedBlockIds,
    onAlignSelection,
    onDistributeSelection,
    onDraftChange,
    onBlocksChange,
    onSelectBlock
  }: Props) => {
    const { t } = useTranslation("settings");
    const { theme } = useTheme();
    const neutralSoftBg = formatColor(theme.colors.neutral, {
      alpha: 10,
      format: "hexa"
    });
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

    const [pageTab, setPageTab] = useState<PagePanelTab>("profile");

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
      assetLabelKey:
        | "banner"
        | "background"
        | "image"
        | "music"
        | "profileMusic"
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

    const [blockTab, setBlockTab] = useState<BlockPanelTab>("content");

    const firstSelectedBlock =
      draft.blocks.find((block) => selectedBlockIds.includes(block.id)) ?? null;

    const updateSelectedAppearance = (
      appearance: ProfileBlockAppearance | null
    ) =>
      onBlocksChange(
        draft.blocks.map((block) =>
          selectedBlockIds.includes(block.id)
            ? ({ ...block, appearance } as APIProfileBlock)
            : block
        )
      );

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
      <Stack direction="column" spacing={2.5}>
        {mode === "page" && (
          <>
            <ButtonGroup
              toggleable
              exclusive
              size="sm"
              color="neutral"
              fullWidth
              expand
              value={pageTab}
              onChange={(tab: PagePanelTab) => setPageTab(tab)}
            >
              {PAGE_PANEL_TABS.map((tab) => (
                <Button key={tab} value={tab}>
                  {t(`profile.inspector.pageTabs.${tab}`)}
                </Button>
              ))}
            </ButtonGroup>
            {pageTab === "style" && (
              <>
                <SettingCard>
                  <CompactFontPicker
                    label={t("profile.editor.pageFont")}
                    description={t("profile.inspector.pageFontDescription")}
                    fontOwnerId={app.account?.id}
                    value={draft.pageFontFamily}
                    allowClear
                    onChange={(pageFontFamily) =>
                      onDraftChange({ pageFontFamily })
                    }
                  />
                </SettingCard>
              </>
            )}

            {pageTab === "profile" && (
              <>
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
              </>
            )}

            {pageTab === "profile" && (
              <>
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
              </>
            )}

            {pageTab === "background" && (
              <>
                <SettingCard>
                  <InputWithLabel
                    type="color"
                    label={t("profile.inspector.backgroundColor")}
                    name="backgroundColor"
                    description={t(
                      "profile.inspector.backgroundColorDescription"
                    )}
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
                  <FieldLabel>
                    {t("profile.inspector.backgroundImage")}
                  </FieldLabel>
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
                      onDraftChange({
                        backgroundImage: event.target.value || null
                      })
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
                  {draft.backgroundImage && (
                    <Stack direction="column" spacing={0.75} pt={0.5}>
                      <Typography
                        level="body-xs"
                        fontWeight={700}
                        css={{ opacity: 0.65 }}
                      >
                        {t("profile.inspector.backgroundImageFit.title")}
                      </Typography>
                      <ButtonGroup
                        toggleable
                        exclusive
                        size="sm"
                        color="neutral"
                        value={draft.backgroundImageFit ?? "fill"}
                        onChange={(fit: ProfileBackgroundImageFit) =>
                          onDraftChange({
                            backgroundImageFit: fit === "fill" ? null : fit
                          })
                        }
                      >
                        {PROFILE_BACKGROUND_IMAGE_FITS.map((fit) => (
                          <Button key={fit} value={fit}>
                            {t(`profile.inspector.backgroundImageFit.${fit}`)}
                          </Button>
                        ))}
                      </ButtonGroup>
                      <Typography
                        level="body-xs"
                        css={{ opacity: 0.55, lineHeight: 1.4 }}
                      >
                        {t(
                          `profile.inspector.backgroundImageFit.${draft.backgroundImageFit ?? "fill"}Hint`
                        )}
                      </Typography>
                    </Stack>
                  )}
                </SettingCard>
              </>
            )}

            {pageTab === "style" && (
              <>
                <SettingCard>
                  <FieldLabel>
                    {t("profile.inspector.appearance.theme")}
                  </FieldLabel>
                  <FieldHint>
                    {t("profile.inspector.appearance.themeHint")}
                  </FieldHint>
                  <ProfileThemePicker
                    value={draft.theme}
                    onChange={(theme) => onDraftChange({ theme })}
                  />
                </SettingCard>
                <SettingCard>
                  <FieldLabel>
                    {t("profile.inspector.appearance.nameStyle")}
                  </FieldLabel>
                  <ProfileNameStylePanel
                    value={draft.displayNameStyle}
                    onChange={(displayNameStyle) =>
                      onDraftChange({ displayNameStyle })
                    }
                  />
                </SettingCard>
              </>
            )}

            {pageTab === "music" && (
              <>
                <SettingCard>
                  {!draft.profileMusicTrackId &&
                  draft.profileMusicUrl &&
                  HASH_PATTERN.test(draft.profileMusicUrl) ? (
                    <>
                      <Stack direction="row" alignItems="center" spacing={0.75}>
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
                      <FieldLabel>
                        {t("profile.inspector.trackInfo")}
                      </FieldLabel>
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
                            placeholder={t(
                              "profile.inspector.youtubeOrAppleMusicLink"
                            )}
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
                          <FieldHint>
                            {t("profile.inspector.profileMusicHint")}
                          </FieldHint>
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
              </>
            )}
          </>
        )}

        {mode === "block" &&
          (selectedBlockCount > 1 ? (
            <ProfileMultiSelectPanel
              selectedCount={selectedBlockCount}
              onAlign={onAlignSelection}
              onDistribute={onDistributeSelection}
              canGroup={canGroup}
              canUngroup={canUngroup}
              onGroup={onGroup}
              onUngroup={onUngroup}
              styleSection={
                <ProfileBlockAppearanceInspector
                  blockTypes={draft.blocks
                    .filter((block) => selectedBlockIds.includes(block.id))
                    .map((block) => block.type)}
                  appearance={firstSelectedBlock?.appearance}
                  onChange={updateSelectedAppearance}
                />
              }
            />
          ) : !selectedBlock ? (
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
              <ButtonGroup
                toggleable
                exclusive
                size="sm"
                color="neutral"
                value={blockTab}
                onChange={(tab: BlockPanelTab) => setBlockTab(tab)}
                fullWidth
                expand
              >
                {BLOCK_PANEL_TABS.map((tab) => (
                  <Button key={tab} value={tab}>
                    {t(`profile.inspector.blockTabs.${tab}`)}
                  </Button>
                ))}
              </ButtonGroup>

              {blockTab === "content" && (
                <>
                  {selectedBlock.type === "header" && (
                    <>
                      <ProfileInspectorField
                        label={t("profile.inspector.bannerHeight")}
                        value={`${selectedBlock.bannerHeight ?? 58}%`}
                        hint={t("profile.inspector.headerSizeHint")}
                        onReset={
                          selectedBlock.bannerHeight != null
                            ? () =>
                                updateSelectedBlock({
                                  bannerHeight: undefined
                                })
                            : undefined
                        }
                      >
                        <Slider
                          min={35}
                          max={75}
                          value={selectedBlock.bannerHeight ?? 58}
                          onChange={(_, value) =>
                            updateSelectedBlock({
                              bannerHeight: value as number
                            })
                          }
                          valueLabelDisplay="auto"
                          valueLabelFormat={(value) => `${value}%`}
                        />
                      </ProfileInspectorField>
                      <ProfileInspectorField
                        label={t("profile.inspector.bannerCropPosition")}
                        value={`${selectedBlock.bannerFocusY ?? 50}%`}
                        onReset={
                          selectedBlock.bannerFocusY != null
                            ? () =>
                                updateSelectedBlock({
                                  bannerFocusY: undefined
                                })
                            : undefined
                        }
                      >
                        <Slider
                          min={0}
                          max={100}
                          value={selectedBlock.bannerFocusY ?? 50}
                          onChange={(_, value) =>
                            updateSelectedBlock({
                              bannerFocusY: value as number
                            })
                          }
                          valueLabelDisplay="auto"
                          valueLabelFormat={(value) => `${value}%`}
                        />
                      </ProfileInspectorField>
                    </>
                  )}

                  {selectedBlock.type === "text" && (
                    <ProfileMarkdownField
                      value={selectedBlock.content}
                      maxLength={2000}
                      minHeight={120}
                      onChange={(content) => updateSelectedBlock({ content })}
                      placeholder={t("profile.inspector.writeSomething")}
                    />
                  )}

                  {selectedBlock.type === "image" &&
                    (() => {
                      const imageBlock = selectedBlock;
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
                                  background: neutralSoftBg
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
                                  background: neutralSoftBg
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
                                    onSelect={(src) =>
                                      updateSelectedBlock({ src })
                                    }
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
                      const stickerBlock = selectedBlock;

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
                                : neutralSoftBg,
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
                      const block = selectedBlock;

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
                                  })
                                }
                              >
                                {t("profile.remove")}
                              </Button>
                            </Stack>
                            <FieldLabel>
                              {t("profile.inspector.trackInfo")}
                            </FieldLabel>
                            <Input
                              value={block.title ?? ""}
                              onChange={(e) =>
                                updateSelectedBlock({
                                  title: e.target.value || null
                                })
                              }
                              placeholder={t("profile.inspector.songTitle")}
                            />
                            <Input
                              value={block.artists ?? ""}
                              onChange={(e) =>
                                updateSelectedBlock({
                                  artists: e.target.value || null
                                })
                              }
                              placeholder={t("profile.inspector.artists")}
                            />
                            <Input
                              value={block.image ?? ""}
                              onChange={(e) =>
                                updateSelectedBlock({
                                  image: e.target.value || null
                                })
                              }
                              placeholder={t(
                                "profile.inspector.coverImageUrlOptional"
                              )}
                            />
                          </>
                        );
                      }

                      if (block.youtubeUrl) {
                        return (
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.75}
                          >
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
                                })
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
                                    });
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
                                      }),
                                    setUploadingBlockMusic,
                                    "music"
                                  );
                                  event.target.value = "";
                                }}
                              />
                              <FieldHint>
                                {t("profile.inspector.blockMusicHint")}
                              </FieldHint>
                            </>
                          )}
                        </>
                      );
                    })()}

                  {selectedBlock.type === "draw" &&
                    (() => {
                      const drawBlock = selectedBlock;
                      return (
                        <Stack direction="column" spacing={1.25}>
                          {drawBlock.svgData ? (
                            <Stack
                              css={{
                                borderRadius: 8,
                                overflow: "hidden",
                                background:
                                  drawBlock.backgroundColor ?? "#1a1a2e",
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

                  {selectedBlock.type === "embed" && (
                    <ProfileEmbedInspector
                      block={selectedBlock}
                      updateSelectedBlock={updateSelectedBlock}
                    />
                  )}

                  {selectedBlock.type === "gallery" && (
                    <ProfileGalleryInspector
                      block={selectedBlock}
                      profile={profile}
                      updateSelectedBlock={updateSelectedBlock}
                      uploadImage={(file, onSuccess, setUploading) =>
                        handleAssetUpload(
                          file,
                          "image",
                          onSuccess,
                          setUploading,
                          "image"
                        )
                      }
                    />
                  )}

                  <ProfileBlockTypeInspector
                    block={selectedBlock}
                    updateSelectedBlock={updateSelectedBlock}
                  />
                </>
              )}

              {blockTab === "layout" && (
                <>
                  <ProfileBlockSizeInspector
                    block={selectedBlock}
                    updateSelectedBlock={updateSelectedBlock}
                  />
                  <ProfileBlockRotationInspector
                    block={selectedBlock}
                    updateSelectedBlock={updateSelectedBlock}
                  />
                  <ProfileBlockAppearanceInspector
                    sections={["layout"]}
                    blockTypes={[selectedBlock.type]}
                    appearance={selectedBlock.appearance}
                    onChange={updateSelectedAppearance}
                  />
                </>
              )}

              {blockTab === "style" && (
                <Stack direction="column" spacing={3}>
                  {supportsProfileBlockFont(selectedBlock.type) && (
                    <ProfileInspectorGroup
                      title={t("profile.inspector.styleGroups.text")}
                    >
                      <ProfileBlockAppearanceInspector
                        sections={["text"]}
                        blockTypes={[selectedBlock.type]}
                        appearance={selectedBlock.appearance}
                        onChange={updateSelectedAppearance}
                      />
                    </ProfileInspectorGroup>
                  )}

                  <ProfileInspectorGroup
                    title={t("profile.inspector.styleGroups.fill")}
                  >
                    <ProfileBlockBackgroundColorInspector
                      block={selectedBlock}
                      updateSelectedBlock={updateSelectedBlock}
                    />
                    <ProfileBlockAppearanceInspector
                      sections={["fill"]}
                      blockTypes={[selectedBlock.type]}
                      appearance={selectedBlock.appearance}
                      onChange={updateSelectedAppearance}
                    />
                  </ProfileInspectorGroup>

                  <ProfileInspectorGroup
                    title={t("profile.inspector.styleGroups.shape")}
                  >
                    <ProfileBlockCornerRadiusInspector
                      block={selectedBlock}
                      updateSelectedBlock={updateSelectedBlock}
                    />
                    <ProfileBlockAppearanceInspector
                      sections={["shape"]}
                      blockTypes={[selectedBlock.type]}
                      appearance={selectedBlock.appearance}
                      onChange={updateSelectedAppearance}
                    />
                  </ProfileInspectorGroup>

                  <ProfileInspectorGroup
                    title={t("profile.inspector.styleGroups.effects")}
                  >
                    <ProfileBlockAppearanceInspector
                      sections={["effects"]}
                      blockTypes={[selectedBlock.type]}
                      appearance={selectedBlock.appearance}
                      onChange={updateSelectedAppearance}
                    />
                  </ProfileInspectorGroup>

                  <ProfileBlockAppearanceInspector
                    sections={["reset"]}
                    blockTypes={[selectedBlock.type]}
                    appearance={selectedBlock.appearance}
                    onChange={updateSelectedAppearance}
                  />
                </Stack>
              )}

              {blockTab === "motion" && (
                <ProfileBlockAppearanceInspector
                  sections={["motion"]}
                  blockTypes={[selectedBlock.type]}
                  appearance={selectedBlock.appearance}
                  onChange={updateSelectedAppearance}
                />
              )}

              <Divider lineColor="muted" />

              <ProfileInspectorField
                label={t("profile.inspector.visibility.title")}
                hint={t("profile.inspector.visibility.hint")}
              >
                <ButtonGroup
                  toggleable
                  exclusive
                  size="sm"
                  color="neutral"
                  fullWidth
                  expand
                  value={
                    isProfileBlockOnlyMe(selectedBlock)
                      ? "nobody"
                      : (selectedBlock.visibility ?? "everyone")
                  }
                  onChange={(visibility: ProfileVisibility) =>
                    updateSelectedBlock({
                      hidden: undefined,
                      visibility:
                        visibility === "everyone" ? undefined : visibility
                    })
                  }
                >
                  {PROFILE_VISIBILITY_OPTIONS.map((visibility) => (
                    <Button key={visibility} value={visibility}>
                      {t(`profile.inspector.visibility.${visibility}`)}
                    </Button>
                  ))}
                </ButtonGroup>
              </ProfileInspectorField>

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
          ))}
      </Stack>
    );
  }
);
