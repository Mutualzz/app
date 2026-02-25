import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import {
    type APIChannel,
    ChannelType,
    type HttpException,
} from "@mutualzz/types";
import {
    ButtonGroup,
    IconButton,
    Input,
    Radio,
    Slider,
    Stack,
    Typography,
    useTheme,
} from "@mutualzz/ui-web";
import type { Channel } from "@stores/objects/Channel";
import type { Space } from "@stores/objects/Space";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { type ChangeEvent, useCallback, useState } from "react";
import { FaCamera, FaHashtag, FaVolumeUp } from "react-icons/fa";
import { ChannelIcon } from "./ChannelIcon";
import { Button } from "@components/Button";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { FaMagnifyingGlass, FaRotate } from "react-icons/fa6";
import { FileUploader } from "@mateie/react-drag-drop-files";

interface Props {
    // Usually a category channel under which to create a new channel
    space: Space;
    parent?: Channel;
}

interface Errors {
    name?: string;
    type?: string;
}

interface CreateChannel {
    icon?: File | null;
    crop?: unknown;
}

export const ChannelCreateModal = observer(({ space, parent }: Props) => {
    const app = useAppStore();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { closeModal } = useModal();
    const [name, setName] = useState("");
    const [type, setType] = useState<ChannelType>(0);

    const [errors, setErrors] = useState<Errors>({});

    const [imageFile, setImageFile] = useState<string | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [croppedAreaPixels, setCroppedAreaPixels] =
        useState<Partial<Area> | null>(null);

    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);

    const { mutate: createChannel, isPending: creating } = useMutation({
        mutationKey: ["create-channel", space.id, parent?.id, name, type],
        mutationFn: async ({ crop, icon }: CreateChannel) => {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("type", type.toString());
            if (parent) formData.append("parentId", parent.id);
            if (icon) formData.append("icon", icon);
            if (crop) formData.append("crop", JSON.stringify(crop));
            if (space.id) formData.append("spaceId", space.id);

            return app.rest.postFormData<APIChannel>("channels", formData);
        },
        onSuccess: (newChannel) => {
            if (!newChannel.spaceId) return;
            closeModal();
            if (newChannel.type !== ChannelType.Text) return;
            navigate({
                to: "/spaces/$spaceId/$channelId",
                params: {
                    spaceId: newChannel.spaceId,
                    channelId: newChannel.id,
                },
                replace: true,
            });
        },
        onError: (err: HttpException) => {
            err.errors?.forEach((error) => {
                setErrors((prev) => ({
                    ...prev,
                    [error.path]: error.message,
                }));
            });
        },
    });

    const onUpload = async (file: File | File[]) => {
        let fileToUse: File;
        if (Array.isArray(file)) fileToUse = file[0];
        else fileToUse = file;

        const reader = new FileReader();
        reader.onload = () => {
            setImageFile(reader.result as string);
            setOriginalFile(fileToUse);
        };
        reader.readAsDataURL(fileToUse);

        setErrors({});
    };

    const onClear = () => {
        setImageFile(null);
        setOriginalFile(null);
        setErrors({});
        setCroppedAreaPixels(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setType(ChannelType.Text);
        setName("");
    };

    const onCropComplete = useCallback((_: any, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleName = (e: ChangeEvent<HTMLInputElement>) => {
        setErrors({});
        setName(e.target.value);
    };

    const handleCreate = async () => {
        if (name.trim() === "") {
            setErrors({
                name: "Channel name cannot be empty.",
            });
            return;
        }
        const shouldCrop =
            (crop.x !== 0 || crop.y !== 0 || zoom !== 1 || rotation !== 0) &&
            !!croppedAreaPixels;

        createChannel({
            icon: originalFile,
            crop: shouldCrop ? croppedAreaPixels : undefined,
        });
    };

    return (
        <Paper
            elevation={app.settings?.preferEmbossed ? 5 : 1}
            borderRadius={8}
            minWidth={{ xs: "90vw", sm: 150, md: 200, lg: 500 }}
            maxWidth={600}
            direction="column"
            minHeight={400}
            justifyContent="space-between"
            width="100%"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            px={5}
            transparency={65}
        >
            <Stack
                width="100%"
                flex={1}
                position="relative"
                direction="column"
                alignItems="center"
                justifyContent="center"
                mt={2.5}
            >
                {imageFile ? (
                    <>
                        <Stack
                            alignItems="center"
                            justifyContent="center"
                            position="relative"
                            width={{ xs: 180, sm: 220, md: 256 }}
                            height={{ xs: 180, sm: 220, md: 256 }}
                            css={{
                                pointerEvents: creating ? "none" : "all",
                                filter: creating ? "blur(4px)" : "none",
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
                                    },
                                    cropAreaStyle: {
                                        border: `2px solid ${theme.colors.neutral}`,
                                    },
                                }}
                            />
                        </Stack>
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={{ xs: 1, sm: 2.5, md: 3.75 }}
                            width={{ xs: 180, sm: 220, md: 256 }}
                            mt={{ xs: 1, sm: 2, md: 2.5 }}
                        >
                            <FaMagnifyingGlass />
                            <Slider
                                min={1}
                                max={3}
                                step={0.01}
                                value={zoom}
                                onChange={(_, value) =>
                                    setZoom(value as number)
                                }
                                disabled={creating}
                                css={{
                                    flex: 1,
                                }}
                            />
                            <IconButton
                                onClick={() => setRotation((prev) => prev + 90)}
                                color={theme.typography.colors.primary}
                                variant="plain"
                                size="sm"
                                disabled={creating}
                            >
                                <FaRotate />
                            </IconButton>
                        </Stack>
                    </>
                ) : (
                    <FileUploader
                        types={["png", "gif", "webp", "jpeg", "jpg"]}
                        handleChange={onUpload}
                    >
                        <Stack
                            alignItems="center"
                            justifyContent="center"
                            direction="column"
                            css={{
                                cursor: "pointer",
                            }}
                            borderRadius="50%"
                            width={72}
                            height={72}
                            border={`1px dashed ${theme.colors.neutral}`}
                            spacing={1.25}
                        >
                            <FaCamera size={16} />
                            <Typography fontWeight="bold" fontSize="x-small">
                                Upload
                            </Typography>
                        </Stack>
                    </FileUploader>
                )}
            </Stack>
            <Stack direction="column" my="auto" spacing={3}>
                <Stack direction="column" spacing={1.25}>
                    <Typography>Channel Name</Typography>
                    <Input
                        startDecorator={
                            <ChannelIcon type={type} color="gray" />
                        }
                        fullWidth
                        color="neutral"
                        name="channel-name"
                        type="text"
                        autoComplete="off"
                        autoFocus
                        value={name}
                        onChange={handleName}
                    />
                    {errors.name && (
                        <Typography variant="plain" color="danger">
                            {errors.name}
                        </Typography>
                    )}
                </Stack>
                <Paper
                    p={2}
                    variant="outlined"
                    borderRadius={6}
                    direction="column"
                    color="neutral"
                >
                    <Typography ml={0.5} mb={1}>
                        Channel Type
                    </Typography>
                    <ButtonGroup
                        variant="plain"
                        value={type}
                        onChange={(value) => setType(value)}
                        orientation="vertical"
                        color="neutral"
                        spacing={5}
                        toggleable
                        exclusive
                        fullWidth
                        horizontalAlign="left"
                    >
                        <Button value={0}>
                            <Stack direction="row" textAlign="left" spacing={2}>
                                <Radio
                                    variant="outlined"
                                    color="neutral"
                                    checked={type === 0}
                                />
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={2}
                                >
                                    <FaHashtag />
                                    <Stack direction="column" spacing={1}>
                                        <Typography>Text Channel</Typography>
                                        <Typography
                                            level="body-xs"
                                            textColor="secondary"
                                        >
                                            A text channel for messages, images,
                                            and more.
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Button>
                        <Button value={1}>
                            <Stack direction="row" textAlign="left" spacing={2}>
                                <Radio
                                    variant="outlined"
                                    color="neutral"
                                    checked={type === 1}
                                />
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={2}
                                >
                                    <FaVolumeUp />
                                    <Stack direction="column" spacing={1}>
                                        <Typography
                                            display="flex"
                                            spacing={1}
                                            alignItems="center"
                                        >
                                            Voice Channel
                                        </Typography>
                                        <Typography
                                            level="body-xs"
                                            textColor="secondary"
                                        >
                                            A voice channel for voice and video
                                            communication.
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Button>
                    </ButtonGroup>
                    {errors.type && (
                        <Typography variant="plain" mt={2.5} color="danger">
                            {errors.type}
                        </Typography>
                    )}
                </Paper>
            </Stack>
            <Stack width="100%" mx="auto" mb={5} mt={2.5} spacing={1.25}>
                <ButtonGroup fullWidth spacing={5}>
                    <Button
                        color="neutral"
                        variant="soft"
                        onClick={() => closeModal()}
                        disabled={creating}
                    >
                        Cancel
                    </Button>
                    {imageFile && (
                        <Button
                            color="danger"
                            variant="soft"
                            onClick={onClear}
                            disabled={creating}
                        >
                            Clear
                        </Button>
                    )}
                    <Button
                        disabled={creating || name.length === 0}
                        onClick={() => handleCreate()}
                    >
                        Create Channel
                    </Button>
                </ButtonGroup>
            </Stack>
        </Paper>
    );
});
