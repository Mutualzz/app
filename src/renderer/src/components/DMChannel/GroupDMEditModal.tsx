import { observer } from "mobx-react-lite";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { Avatar, Checkbox, InputDefault, Slider, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { type ChangeEvent, useCallback, useState } from "react";
import { Button } from "@components/Button";
import { useModal } from "@contexts/Modal.context";
import { useMutation } from "@tanstack/react-query";
import type { Channel } from "@stores/objects/Channel";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { FileUploader } from "@mateie/react-drag-drop-files";
import { IconButton } from "@components/IconButton";
import { Tooltip } from "@components/Tooltip";
import { cropImage } from "@utils/cropImage";
import { ArrowClockwiseIcon, CameraIcon, MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

interface Props {
  channel: Channel;
}

export const GroupDMEditModal = observer(({ channel }: Props) => {
  const app = useAppStore();
  const { theme } = useTheme();
  const { closeModal } = useModal();
  const { t } = useTranslation("chat");
  const { t: tCommon } = useTranslation("common");

  const [name, setName] = useState(channel.name ?? "");

  const [imageFile, setImageFile] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<Partial<Area> | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [roundedIcon, setRoundedIcon] = useState(
    channel.flags.has("RoundedIcon")
  );
  const [clearIcon, setClearIcon] = useState(false);

  const { mutate: save, isPending } = useMutation({
    mutationKey: ["update-group-dm", channel.id],
    mutationFn: async () => {
      let iconFile: File | null = originalFile;

      if (originalFile && imageFile && croppedAreaPixels) {
        iconFile = await cropImage(
          imageFile,
          originalFile,
          croppedAreaPixels as Area,
          rotation
        );
      }

      const formData = new FormData();

      if (name.trim()) formData.append("name", name.trim());
      if (iconFile) {
        formData.append("icon", iconFile);
        if (iconFile.type === "image/gif")
          formData.append("crop", JSON.stringify(croppedAreaPixels));
      }
      if (clearIcon) formData.append("removeIcon", "true");
      formData.append("rounded", roundedIcon ? "true" : "false");

      return app.channels.updateGroupDM(channel.id, formData);
    },
    onSuccess: (updated) => {
      if (updated) app.channels.update(updated);
      closeModal();
    }
  });

  const onUpload = (file: File | File[]) => {
    const fileToUse = Array.isArray(file) ? file[0] : file;
    const url = URL.createObjectURL(fileToUse);
    setImageFile(url);
    setOriginalFile(fileToUse);
    setClearIcon(false);
  };

  const onClearNewIcon = () => {
    if (imageFile) URL.revokeObjectURL(imageFile);
    setImageFile(null);
    setOriginalFile(null);
    setCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const onRemoveExistingIcon = () => {
    setClearIcon(true);
  };

  const onCropComplete = useCallback((_: any, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  // What to show in the icon slot
  const showCropper = !!imageFile;
  const showExisting = !showCropper && !!channel.iconUrl && !clearIcon;

  const hasChanges =
    name.trim() !== (channel.name ?? "") ||
    !!imageFile ||
    clearIcon ||
    roundedIcon !== channel.flags.has("RoundedIcon");

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      borderRadius={12}
      direction="column"
      justifyContent="space-between"
      spacing={2.5}
      width="25vw"
    >
      <Stack p={5} direction="column" spacing={2.5}>
        <Typography fontWeight="bold" level="body-lg">
          {t("groupDm.manage.title")}
        </Typography>

        <Stack direction="row" spacing={2.5} alignItems="flex-start">
          {showCropper ? (
            <Stack direction="column" spacing={1.25}>
              <Stack
                position="relative"
                width={72}
                height={72}
                css={{
                  pointerEvents: isPending ? "none" : "all",
                  filter: isPending ? "blur(4px)" : "none"
                }}
              >
                <Cropper
                  image={imageFile!}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  cropShape={roundedIcon ? "round" : "rect"}
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  style={{
                    containerStyle: {
                      width: "100%",
                      height: "100%",
                      borderRadius: roundedIcon ? "50%" : 8,
                      background: theme.colors.surface
                    },
                    cropAreaStyle: {
                      border: `2px solid ${theme.colors.neutral}`
                    }
                  }}
                />
                <Tooltip content={t("groupDm.manage.remove")}>
                  <IconButton
                    size="sm"
                    variant="soft"
                    color="danger"
                    onClick={onClearNewIcon}
                    disabled={isPending}
                    css={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      zIndex: 1
                    }}
                  >
                    <XIcon size={10} />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.25}
                width={72}
              >
                <MagnifyingGlassIcon size={12} />
                <Slider
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(_, v) => setZoom(v as number)}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `${v.toFixed(2)}x`}
                  disabled={isPending}
                  size="sm"
                />
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <Tooltip content={t("dm.rotate90")}>
                  <IconButton
                    onClick={() => setRotation((p) => p + 90)}
                    color={theme.typography.colors.primary}
                    variant="plain"
                    size="sm"
                    disabled={isPending}
                  >
                    <ArrowClockwiseIcon size={14} />
                  </IconButton>
                </Tooltip>
                <Checkbox
                  checked={roundedIcon}
                  onChange={() => setRoundedIcon((p) => !p)}
                  disabled={isPending}
                  label={t("groupDm.manage.round")}
                  size="sm"
                />
              </Stack>
            </Stack>
          ) : showExisting ? (
            <Stack direction="column" spacing={1.25} alignItems="center">
              <Stack position="relative" width={72} height={72}>
                <Avatar
                  src={channel.iconUrl}
                  shape={channel.flags.has("RoundedIcon") ? "circle" : "square"}
                />
                <Tooltip content={t("groupDm.manage.removeIcon")}>
                  <IconButton
                    size="sm"
                    variant="soft"
                    color="danger"
                    onClick={onRemoveExistingIcon}
                    disabled={isPending}
                    css={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      zIndex: 1
                    }}
                  >
                    <XIcon size={10} />
                  </IconButton>
                </Tooltip>
              </Stack>
              <FileUploader
                types={["png", "gif", "webp", "jpeg", "jpg"]}
                handleChange={onUpload}
              >
                <Typography
                  level="body-xs"
                  textColor="secondary"
                  css={{ cursor: "pointer" }}
                >
                  {t("groupDm.manage.changeIcon")}
                </Typography>
              </FileUploader>
            </Stack>
          ) : (
            <FileUploader
              types={["png", "gif", "webp", "jpeg", "jpg"]}
              handleChange={onUpload}
            >
              <Stack
                alignItems="center"
                justifyContent="center"
                direction="column"
                css={{ cursor: "pointer" }}
                borderRadius="50%"
                width={72}
                height={72}
                border={`1px dashed ${theme.colors.neutral}`}
                spacing={1.25}
                flexShrink={0}
              >
                <CameraIcon weight="fill" size={16} />
                <Typography fontWeight="bold" fontSize="x-small">
                  {t("groupDm.manage.icon")}
                </Typography>
              </Stack>
            </FileUploader>
          )}

          <Stack direction="column" spacing={0.75} flex={1}>
            <Typography level="body-sm">{t("groupDm.manage.groupName")}</Typography>
            <InputDefault
              placeholder={t("groupDm.namePlaceholder")}
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              disabled={isPending}
            />
          </Stack>
        </Stack>
      </Stack>

      <Paper
        p={5}
        borderBottom="0 !important"
        borderLeft="0 !important"
        borderRight="0 !important"
        elevation={app.settings?.preferEmbossed ? 5 : 3}
        direction="row"
        spacing={2.5}
      >
        <Button
          size="lg"
          onClick={() => closeModal()}
          expand
          color="neutral"
          disabled={isPending}
        >
          {tCommon("cancel")}
        </Button>
        <Button
          expand
          size="lg"
          disabled={isPending || !hasChanges}
          onClick={() => save()}
          color="primary"
        >
          {t("groupDm.manage.saveChanges")}
        </Button>
      </Paper>
    </Paper>
  );
});
