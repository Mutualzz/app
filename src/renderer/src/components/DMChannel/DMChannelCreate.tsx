import { observer } from "mobx-react-lite";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import {
  Checkbox,
  InputDefault,
  Slider,
  Stack,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import { type ChangeEvent, useCallback, useState } from "react";
import { Button } from "@components/Button";
import { UserAvatar } from "@components/User/UserAvatar";
import { useModal } from "@contexts/Modal.context";
import { useMutation } from "@tanstack/react-query";
import { Snowflake } from "@mutualzz/types";
import { useNavigate } from "@tanstack/react-router";
import type { Area, Point } from "react-easy-crop";
import Cropper from "react-easy-crop";
import { FileUploader } from "@mateie/react-drag-drop-files";
import { IconButton } from "@components/IconButton";
import { Tooltip } from "@components/Tooltip";
import { cropImage } from "@utils/cropImage";
import {
  ArrowClockwiseIcon,
  CameraIcon,
  MagnifyingGlassIcon,
  XIcon
} from "@phosphor-icons/react";
import type { OpenGroupDMOptions } from "@stores/Channel.store";
import { User } from "@stores/objects/User";
import { useTranslation } from "react-i18next";

interface GroupDMChannelInfoProps {
  recipientNames: string[];
  name: string;
  onNameChange: (name: string) => void;
  iconFile: string | null;
  onUpload: (file: File | File[]) => void;
  onClear: () => void;
  crop: Point;
  onCropChange: (crop: Point) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  rotation: number;
  onRotate: () => void;
  onCropComplete: (_: any, croppedAreaPixels: Area) => void;
  roundedIcon: boolean;
  onRoundedChange: () => void;
  disabled?: boolean;
}

const GroupDMChannelInfo = observer(
  ({
    recipientNames,
    name,
    onNameChange,
    iconFile,
    onUpload,
    onClear,
    crop,
    onCropChange,
    zoom,
    onZoomChange,
    rotation,
    onRotate,
    onCropComplete,
    roundedIcon,
    onRoundedChange,
    disabled
  }: GroupDMChannelInfoProps) => {
    const { theme } = useTheme();
    const { t } = useTranslation("chat");

    return (
      <Stack direction="row" spacing={2.5} alignItems="flex-start">
        {iconFile ? (
          <Stack direction="column" spacing={1.25}>
            <Stack
              position="relative"
              width={72}
              height={72}
              css={{
                pointerEvents: disabled ? "none" : "all",
                filter: disabled ? "blur(4px)" : "none"
              }}
            >
              <Cropper
                image={iconFile}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                cropShape={roundedIcon ? "round" : "rect"}
                showGrid={false}
                onCropChange={onCropChange}
                onZoomChange={onZoomChange}
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
              {/* Clear icon button */}
              <Tooltip content={t("groupDm.manage.removeIcon")}>
                <IconButton
                  size="sm"
                  variant="soft"
                  color="danger"
                  onClick={onClear}
                  disabled={disabled}
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
                onChange={(_, value) => onZoomChange(value as number)}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${v.toFixed(2)}x`}
                disabled={disabled}
                size="sm"
              />
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Tooltip content={t("dm.rotate90")}>
                <IconButton
                  onClick={onRotate}
                  color={theme.typography.colors.primary}
                  variant="plain"
                  size="sm"
                  disabled={disabled}
                >
                  <ArrowClockwiseIcon size={14} />
                </IconButton>
              </Tooltip>
              <Checkbox
                checked={roundedIcon}
                onChange={onRoundedChange}
                disabled={disabled}
                label={t("groupDm.manage.round")}
                size="sm"
              />
            </Stack>
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
            placeholder={recipientNames.join(", ")}
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onNameChange(e.target.value)
            }
            disabled={disabled}
          />
        </Stack>
      </Stack>
    );
  }
);

export const DMChannelCreate = observer(() => {
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("chat");
  const app = useAppStore();
  const [search, setSearch] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<Snowflake[]>([]);
  const [recipientNames, setRecipientNames] = useState<string[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);

  // Group DM info state (only used when recipients.length > 1)
  const [groupName, setGroupName] = useState("");
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<Partial<Area> | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [roundedIcon, setRoundedIcon] = useState(false);

  const navigate = useNavigate();
  const { closeModal } = useModal();

  const onUpload = (file: File | File[]) => {
    const fileToUse = Array.isArray(file) ? file[0] : file;
    const url = URL.createObjectURL(fileToUse);
    if (imageFile) URL.revokeObjectURL(imageFile);
    setImageFile(url);
    setOriginalFile(fileToUse);
  };

  const onClearIcon = () => {
    if (imageFile) URL.revokeObjectURL(imageFile);
    setImageFile(null);
    setOriginalFile(null);
    setCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setRoundedIcon(false);
  };

  const onCropComplete = useCallback((_: any, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const { mutate: createMessage, isPending: isCreating } = useMutation({
    mutationKey: ["create-dm"],
    mutationFn: async () => {
      if (recipients.length === 1) return app.channels.openDM(recipients[0]);

      let iconFile: File | null = originalFile;

      if (originalFile && imageFile && croppedAreaPixels) {
        iconFile = await cropImage(
          imageFile,
          originalFile,
          croppedAreaPixels as Area,
          rotation
        );
      }

      const options: OpenGroupDMOptions = {
        recipientIds: recipients,
        name: groupName.trim() || undefined,
        iconFile: iconFile ?? undefined,
        rounded: roundedIcon
      };

      return app.channels.openGroupDM(options);
    },
    onSuccess: (channel) => {
      if (imageFile) URL.revokeObjectURL(imageFile);
      if (channel) navigate({ to: `/@me/${channel.id}`, replace: true });
      closeModal();
    }
  });

  const suggestions = app
    .getSuggestedGroupDMRecipients()
    .filter((user) =>
      search
        ? user.displayName.includes(search) || user.username.includes(search)
        : true
    );

  const onChangeSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value.trim().length === 0 ? null : e.target.value);
  };

  const addRecipient = (recipient: User) => {
    if (recipients.includes(recipient.id)) return;
    setRecipients([...recipients, recipient.id]);
    setRecipientNames([...recipientNames, recipient.displayName]);
  };

  const removeRecipient = (recipient: User) => {
    setRecipients(recipients.filter((r) => r !== recipient.id));
    setRecipientNames(
      recipientNames.filter((r) => r !== recipient.displayName)
    );
  };

  const hasRecipient = (recipient: string) => recipients.includes(recipient);

  const toggleRecipient = (recipient: User) => {
    if (recipients.includes(recipient.id)) removeRecipient(recipient);
    else addRecipient(recipient);
  };

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      borderRadius={12}
      direction="column"
      justifyContent="space-between"
      spacing={2.5}
      height="80vh"
      width="25vw"
    >
      <Stack p={5} direction="column" spacing={2.5}>
        <Stack direction="column" spacing={2.5}>
          <Typography fontWeight="bold" level="body-lg">
            {t("dm.createTitle")}
          </Typography>
          <Typography>
            {t("dm.addFriendsHint", { count: 9 - recipients.length })}
          </Typography>
        </Stack>
        <Stack direction="column" spacing={2.5}>
          <InputDefault value={search || ""} onChange={onChangeSearch} />
          <Stack
            direction="column"
            spacing={1.25}
            maxHeight="40vh"
            overflow="auto"
          >
            {suggestions?.map((user) => (
              <Paper
                key={user.id}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                onMouseEnter={() => setHovered(user.id)}
                onMouseLeave={() => setHovered(null)}
                variant="elevation"
                elevation={hovered === user.id || hasRecipient(user.id) ? 3 : 1}
                p={2.5}
                boxShadow="none !important"
                borderRadius={10}
                css={{ cursor: "pointer" }}
                onClick={() => toggleRecipient(user)}
              >
                <Stack direction="row" alignItems="center" spacing={2.5}>
                  <UserAvatar size={36} user={user} />
                  <Stack direction="column" spacing={0.25}>
                    <Typography fontWeight={500}>{user.displayName}</Typography>
                    <Typography level="body-xs" textColor="secondary">
                      @{user.username}
                    </Typography>
                  </Stack>
                </Stack>
                <Checkbox
                  checked={hasRecipient(user.id)}
                  onChange={() => toggleRecipient(user)}
                  size="lg"
                />
              </Paper>
            ))}
          </Stack>
        </Stack>
      </Stack>

      <Paper
        p={5}
        borderBottom="0 !important"
        borderLeft="0 !important"
        borderRight="0 !important"
        elevation={app.settings?.preferEmbossed ? 5 : 3}
        direction="column"
        spacing={2.5}
      >
        {recipients.length > 1 && (
          <GroupDMChannelInfo
            recipientNames={recipientNames}
            name={groupName}
            onNameChange={setGroupName}
            iconFile={imageFile}
            onUpload={onUpload}
            onClear={onClearIcon}
            crop={crop}
            onCropChange={setCrop}
            zoom={zoom}
            onZoomChange={setZoom}
            rotation={rotation}
            onRotate={() => setRotation((prev) => prev + 90)}
            onCropComplete={onCropComplete}
            roundedIcon={roundedIcon}
            onRoundedChange={() => setRoundedIcon((prev) => !prev)}
            disabled={isCreating}
          />
        )}
        <Stack direction="row" spacing={2.5}>
          <Button
            size="lg"
            onClick={() => {
              onClearIcon();
              closeModal();
            }}
            expand
            color="neutral"
            disabled={isCreating}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            expand
            size="lg"
            disabled={
              recipients.length === 0 || isCreating || recipients.length > 9
            }
            onClick={() => createMessage()}
            color="primary"
          >
            {recipients.length > 1
              ? t("dm.createGroupMessage")
              : t("dm.createMessage")}
          </Button>
        </Stack>
      </Paper>
    </Paper>
  );
});
