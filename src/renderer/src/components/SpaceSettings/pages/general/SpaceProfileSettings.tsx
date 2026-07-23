import { MarkdownInput } from "@components/Markdown/MarkdownInput/MarkdownInput";
import { SpaceIcon } from "@components/Space/SpaceIcon";
import { useAppStore } from "@hooks/useStores";
import { FileUploader } from "@mateie/react-drag-drop-files";
import type { APISpace, HttpException } from "@mutualzz/types";
import {
  Button,
  ButtonGroup,
  Input,
  Slider,
  Stack,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import { IconButton } from "@components/IconButton";
import type { Space } from "@stores/objects/Space";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { type ChangeEvent, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Cropper, { type Area, type Point } from "react-easy-crop";
import {
  ArrowClockwiseIcon,
  CameraIcon,
  MagnifyingGlassIcon,
  TrashIcon
} from "@phosphor-icons/react";

interface Props {
  space: Space;
}

export const SpaceProfileSettings = observer(({ space }: Props) => {
  const { t } = useTranslation("space");
  const { t: tCommon } = useTranslation("common");
  const { t: tSettings } = useTranslation("settings");
  const app = useAppStore();
  const { theme } = useTheme();

  const [name, setName] = useState(space.name);
  const [description, setDescription] = useState(space.description ?? "");

  const [imageFile, setImageFile] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<Partial<Area> | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [removeIcon, setRemoveIcon] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const hasChanges =
    name.trim() !== space.name ||
    (description ?? "") !== (space.description ?? "") ||
    imageFile !== null ||
    removeIcon;

  const { mutate: saveProfile, isPending: saving } = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description);

      if (removeIcon) {
        formData.append("icon", "");
      } else if (originalFile) {
        formData.append("icon", originalFile);
        const shouldCrop =
          (crop.x !== 0 || crop.y !== 0 || zoom !== 1 || rotation !== 0) &&
          !!croppedAreaPixels;
        if (shouldCrop)
          formData.append("crop", JSON.stringify(croppedAreaPixels));
      }

      return app.rest.patchFormData<APISpace>(
        `/spaces/${space.id}`,
        formData
      );
    },
    onSuccess: (updated) => {
      space.update(updated);
      setImageFile(null);
      setOriginalFile(null);
      setCroppedAreaPixels(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setRemoveIcon(false);
      setError(null);
      toast.success(t("profile.updatedSuccess"));
    },
    onError: (err: HttpException) => {
      const msg =
        err.errors?.[0].message ?? err.message ?? t("profile.genericError");
      setError(msg);
      toast.error(msg);
    }
  });

  const onUpload = (file: File | File[]) => {
    const fileToUse = Array.isArray(file) ? file[0] : file;
    const reader = new FileReader();
    reader.onload = () => {
      setImageFile(reader.result as string);
      setOriginalFile(fileToUse);
    };
    reader.readAsDataURL(fileToUse);
    setRemoveIcon(false);
    setError(null);
  };

  const onClearImage = () => {
    setImageFile(null);
    setOriginalFile(null);
    setCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const onCropComplete = useCallback((_: any, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleName = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setName(e.target.value);
  };

  return (
    <Stack direction="column" spacing={4} mt={1}>
      <Stack direction="column" spacing={2}>
        <Typography fontFamily="monospace">{t("profile.spaceIcon")}</Typography>

        <Stack direction="row" alignItems="flex-start" spacing={3}>
          <Stack direction="column" alignItems="center" spacing={1.5}>
            {imageFile ? (
              <>
                <Stack
                  position="relative"
                  width={128}
                  height={128}
                  css={{
                    pointerEvents: saving ? "none" : "all",
                    filter: saving ? "blur(4px)" : "none"
                  }}
                >
                  <Cropper
                    image={imageFile}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    style={{
                      containerStyle: {
                        width: "100%",
                        height: "100%",
                        background: theme.colors.surface,
                        borderRadius: "50%",
                        overflow: "hidden"
                      },
                      cropAreaStyle: {
                        border: `2px solid ${theme.colors.neutral}`
                      }
                    }}
                  />
                </Stack>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  width={128}
                >
                  <MagnifyingGlassIcon size={14} />
                  <Slider
                    min={1}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={(_, v) => setZoom(v as number)}
                    disabled={saving}
                    css={{ flex: 1 }}
                  />
                  <IconButton
                    onClick={() => setRotation((r) => r + 90)}
                    variant="plain"
                    size="sm"
                    disabled={saving}
                  >
                    <ArrowClockwiseIcon />
                  </IconButton>
                </Stack>
                <Button
                  size="sm"
                  variant="plain"
                  color="danger"
                  onClick={onClearImage}
                  disabled={saving}
                >
                  {tCommon("cancel")}
                </Button>
              </>
            ) : (
              <FileUploader
                types={["png", "gif", "webp", "jpeg", "jpg"]}
                handleChange={onUpload}
              >
                <Stack
                  position="relative"
                  css={{ cursor: "pointer" }}
                  alignItems="center"
                  justifyContent="center"
                >
                  <SpaceIcon
                    space={removeIcon ? null : space}
                    size={80}
                    css={{
                      opacity: 0.6,
                      filter: "brightness(0.7)"
                    }}
                  />
                  <Stack
                    position="absolute"
                    alignItems="center"
                    justifyContent="center"
                    direction="column"
                    spacing={0.5}
                  >
                    <CameraIcon weight="fill" size={18} />
                    <Typography fontSize="xx-small" fontWeight="bold">
                      {tSettings("account.change")}
                    </Typography>
                  </Stack>
                </Stack>
              </FileUploader>
            )}
          </Stack>

          {!imageFile && space.icon && !removeIcon && (
            <Button
              size="sm"
              variant="soft"
              color="danger"
              startDecorator={<TrashIcon weight="fill" />}
              onClick={() => setRemoveIcon(true)}
              disabled={saving}
            >
              {t("channels.removeIcon")}
            </Button>
          )}

          {removeIcon && (
            <Button
              size="sm"
              variant="plain"
              onClick={() => setRemoveIcon(false)}
              disabled={saving}
            >
              {t("channels.restoreIcon")}
            </Button>
          )}
        </Stack>
      </Stack>

      <Stack direction="column" spacing={0.75}>
        <Typography fontWeight={500}>
          {t("profile.name")}{" "}
          <Typography variant="plain" color="danger">
            *
          </Typography>
        </Typography>
        <Input
          type="text"
          fullWidth
          value={name}
          autoComplete="off"
          onChange={handleName}
          disabled={saving}
        />
      </Stack>

      <Stack direction="column" spacing={0.75}>
        <Typography fontWeight={500}>{t("profile.description")}</Typography>
        <MarkdownInput
          value={description}
          onChange={(val) => setDescription(val)}
          disabled={saving}
          placeholder={t("profile.descriptionPlaceholder")}
          emoticons={false}
          emojiPicker={false}
          gifPicker={false}
          stickerPicker={false}
          mentions={false}
          css={{
            minHeight: 80,
            padding: "0.5rem",
            borderRadius: 8,
            alignItems: "flex-start"
          }}
        />
      </Stack>

      {error && (
        <Typography variant="plain" color="danger" level="body-sm">
          {error}
        </Typography>
      )}

      <Stack direction="row" justifyContent="flex-end">
        <ButtonGroup spacing={5}>
          {hasChanges && (
            <Button
              variant="plain"
              disabled={saving}
              onClick={() => {
                setName(space.name);
                setDescription(space.description ?? "");
                onClearImage();
                setRemoveIcon(false);
                setError(null);
              }}
            >
              {tSettings("profile.avatar.upload.reset")}
            </Button>
          )}
          <Button
            variant="solid"
            color="success"
            disabled={!hasChanges || saving || name.trim() === "" || !!error}
            onClick={() => saveProfile()}
          >
            {saving
              ? tSettings("profile.saving")
              : tSettings("profile.saveChanges")}
          </Button>
        </ButtonGroup>
      </Stack>
    </Stack>
  );
});
