import { Button } from "@components/Button";
import { IconButton } from "@components/IconButton";
import { Tooltip } from "@components/Tooltip";
import { ProfileImageGifPickerModal } from "@components/Profile/editor/ProfileImageGifPickerModal";
import { ProfileInspectorField } from "@components/Profile/editor/ProfileInspectorField";
import { useModal } from "@contexts/Modal.context";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  PROFILE_GALLERY_LAYOUTS,
  PROFILE_GALLERY_MAX_IMAGES,
  type APIProfileBlock,
  type ProfileGalleryBlock,
  type ProfileGalleryImage,
  type ProfileGalleryLayout
} from "@mutualzz/types";
import {
  isProfileImageVideoUrl,
  resolveProfileImageBlockUrl
} from "@mutualzz/ui-core";
import { Input, Stack } from "@mutualzz/ui-web";
import { GifIcon, PlusIcon, UploadIcon, XIcon } from "@phosphor-icons/react";
import type { UserProfile } from "@stores/objects/UserProfile";
import { observer } from "mobx-react-lite";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  block: ProfileGalleryBlock;
  profile: UserProfile;
  updateSelectedBlock: (patch: Partial<APIProfileBlock>) => void;
  uploadImage: (
    file: File,
    onSuccess: (hash: string) => void,
    setUploading: (value: boolean) => void
  ) => Promise<void>;
}

const getImageSortId = (image: ProfileGalleryImage, index: number) =>
  `${index}:${image.src}`;

const isHttpsUrl = (value: string) => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

const GalleryThumbnail = ({
  sortId,
  previewUrl,
  removeLabel,
  onRemove
}: {
  sortId: string;
  previewUrl: string | null;
  removeLabel: string;
  onRemove: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: sortId });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      css={{
        position: "relative",
        aspectRatio: "1 / 1",
        borderRadius: 6,
        overflow: "hidden",
        background: "rgba(0,0,0,0.2)",
        cursor: "grab",
        zIndex: isDragging ? 1 : undefined,
        opacity: isDragging ? 0.7 : 1
      }}
    >
      {previewUrl &&
        (isProfileImageVideoUrl(previewUrl) ? (
          <video
            src={previewUrl}
            muted
            loop
            autoPlay
            playsInline
            css={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              pointerEvents: "none"
            }}
          />
        ) : (
          <img
            src={previewUrl}
            alt=""
            draggable={false}
            css={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              pointerEvents: "none"
            }}
          />
        ))}
      <Tooltip content={removeLabel}>
        <IconButton
          size="sm"
          variant="soft"
          aria-label={removeLabel}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onRemove}
          css={{ position: "absolute", top: 2, right: 2 }}
        >
          <XIcon size={12} weight="bold" />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export const ProfileGalleryInspector = observer(
  ({ block, profile, updateSelectedBlock, uploadImage }: Props) => {
    const { t } = useTranslation("settings");
    const { openModal } = useModal();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [urlDraft, setUrlDraft] = useState("");
    const imagesRef = useRef(block.images);
    imagesRef.current = block.images;

    const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
    );

    const remainingSlots = PROFILE_GALLERY_MAX_IMAGES - block.images.length;
    const isFull = remainingSlots <= 0;
    const sortIds = block.images.map(getImageSortId);

    const appendImage = (src: string) => {
      if (imagesRef.current.length >= PROFILE_GALLERY_MAX_IMAGES) return;
      const nextImages = [...imagesRef.current, { src }];
      imagesRef.current = nextImages;
      updateSelectedBlock({ images: nextImages });
    };

    const handleFiles = async (files: File[]) => {
      for (const file of files.slice(0, remainingSlots)) {
        await uploadImage(file, appendImage, setUploading);
      }
    };

    const addUrl = () => {
      const url = urlDraft.trim();
      if (!isHttpsUrl(url)) return;
      appendImage(url);
      setUrlDraft("");
    };

    const removeImage = (index: number) =>
      updateSelectedBlock({
        images: block.images.filter(
          (_galleryImage, imageIndex) => imageIndex !== index
        )
      });

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) return;
      const oldIndex = sortIds.indexOf(String(active.id));
      const newIndex = sortIds.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0) return;
      updateSelectedBlock({
        images: arrayMove(block.images, oldIndex, newIndex)
      });
    };

    return (
      <Stack direction="column" spacing={2}>
        <ProfileInspectorField label={t("profile.inspector.gallery.layout")}>
          <div
            css={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 6
            }}
          >
            {PROFILE_GALLERY_LAYOUTS.map((layout: ProfileGalleryLayout) => {
              const selected = (block.layout ?? "grid") === layout;
              return (
                <Button
                  key={layout}
                  size="sm"
                  color={selected ? "primary" : "neutral"}
                  aria-pressed={selected}
                  onClick={() => updateSelectedBlock({ layout })}
                >
                  {t(`profile.inspector.gallery.layouts.${layout}`)}
                </Button>
              );
            })}
          </div>
        </ProfileInspectorField>

        <ProfileInspectorField
          label={t("profile.inspector.gallery.images")}
          value={`${block.images.length}/${PROFILE_GALLERY_MAX_IMAGES}`}
          hint={
            block.images.length > 1
              ? t("profile.inspector.gallery.reorderHint")
              : undefined
          }
        >
          {block.images.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sortIds} strategy={rectSortingStrategy}>
                <div
                  css={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                    gap: 6
                  }}
                >
                  {block.images.map((image, index) => (
                    <GalleryThumbnail
                      key={sortIds[index]}
                      sortId={sortIds[index]}
                      previewUrl={resolveProfileImageBlockUrl(
                        image.src,
                        (hash, animated) =>
                          profile.constructBlockImageUrl(
                            hash,
                            undefined,
                            undefined,
                            animated
                          )
                      )}
                      removeLabel={t("profile.inspector.gallery.remove")}
                      onRemove={() => removeImage(index)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          <Stack direction="row" spacing={1}>
            <Button
              size="sm"
              color="neutral"
              loading={uploading}
              disabled={isFull}
              startDecorator={<UploadIcon weight="fill" />}
              onClick={() => fileInputRef.current?.click()}
            >
              {t("profile.inspector.gallery.upload")}
            </Button>
            <Button
              size="sm"
              color="neutral"
              disabled={isFull}
              startDecorator={<GifIcon weight="fill" />}
              onClick={() =>
                openModal(
                  "image-gif-picker",
                  <ProfileImageGifPickerModal onSelect={appendImage} />
                )
              }
            >
              {t("profile.inspector.chooseGif")}
            </Button>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Input
              size="sm"
              value={urlDraft}
              disabled={isFull}
              placeholder={t("profile.inspector.gallery.urlPlaceholder")}
              onChange={(event) => setUrlDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addUrl();
              }}
              css={{ flex: 1, minWidth: 0 }}
            />
            <Tooltip content={t("profile.inspector.gallery.addUrl")}>
              <IconButton
                size="sm"
                variant="soft"
                aria-label={t("profile.inspector.gallery.addUrl")}
                disabled={isFull || !isHttpsUrl(urlDraft.trim())}
                onClick={addUrl}
              >
                <PlusIcon weight="bold" />
              </IconButton>
            </Tooltip>
          </Stack>

          {isFull && (
            <span css={{ fontSize: 12, opacity: 0.6 }}>
              {t("profile.inspector.gallery.full")}
            </span>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={async (event) => {
              const files = Array.from(event.target.files ?? []);
              event.target.value = "";
              if (files.length > 0) await handleFiles(files);
            }}
          />
        </ProfileInspectorField>
      </Stack>
    );
  }
);
