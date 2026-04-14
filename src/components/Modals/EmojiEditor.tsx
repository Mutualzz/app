import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores.ts";
import { useModal } from "@contexts/Modal.context.tsx";
import { useCallback, useEffect, useState } from "react";
import { Slider, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import type { APIExpression } from "@mutualzz/types";
import { HttpException } from "@mutualzz/types";
import { Button } from "@components/Button.tsx";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { useMutation } from "@tanstack/react-query";
import { Paper } from "@components/Paper.tsx";
import { InputWithLabel } from "@components/InputWithLabel.tsx";
import { IconButton } from "@components/IconButton.tsx";
import { FaX } from "react-icons/fa6";
import { AiOutlineRotateRight } from "react-icons/ai";
import {
    HiOutlineMagnifyingGlassMinus,
    HiOutlineMagnifyingGlassPlus,
} from "react-icons/hi2";
import { cropImage } from "@utils/cropImage.ts";

// File needs to be passed
interface Props {
    emoji: APIExpression;
    file: File;
}

interface Errors {
    name?: string;
}

export const EmojiEditor = observer(({ emoji, file }: Props) => {
    const app = useAppStore();
    const { theme } = useTheme();
    const { closeModal } = useModal();

    const [name, setName] = useState(emoji.name);

    const [crop, setCrop] = useState<Point>({
        x: 0,
        y: 0,
    });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);

    // TODO: add error handling here, and start using toasts
    const [, setErrors] = useState<Errors>({});

    const [croppedAreaPixels, setCroppedAreaPixels] =
        useState<Partial<Area> | null>(null);

    const [final, setFinal] = useState<string | undefined>();

    const [imageDimensions, setImageDimensions] = useState({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        if (!final) return;

        const img = new Image();
        img.onload = () =>
            setImageDimensions({
                width: img.naturalWidth,
                height: img.naturalHeight,
            });
        img.src = final;
    }, [final]);

    useEffect(() => {
        const url = URL.createObjectURL(file);
        setFinal(url);

        // revoke on unmounting to avoid memory leaks
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const { mutate: createEmoji, isPending: creating } = useMutation({
        mutationKey: ["create-emoji", emoji.authorId, name, emoji.type],
        mutationFn: async (data: FormData) => {
            return app.rest.putFormData("/expressions", data);
        },
        onSuccess: () => {
            setErrors({});
            closeModal();
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

    const handleUpload = async () => {
        if (!file || !final || !croppedAreaPixels) return;

        if (name.trim() === "") {
            setErrors({
                name: "Expression name cannot be empty",
            });
            return;
        }

        let emojiFile: File | null = file;

        if (file && final && croppedAreaPixels) {
            emojiFile = await cropImage(
                final,
                file,
                croppedAreaPixels as Area,
                rotation,
            );
        }

        const formData = new FormData();
        formData.append("expressionb", emojiFile);
        formData.append("name", name);
        formData.append("type", emoji.type.toString());
        if (emoji.spaceId) formData.append("spaceId", emoji.spaceId);
        if (file.type === "image/gif")
            formData.append("crop", JSON.stringify(croppedAreaPixels));

        createEmoji(formData);
    };

    const getPreviewStyle = (size: number) => {
        if (!croppedAreaPixels || !final || !imageDimensions.width) return {};

        const { x, y, width, height } = croppedAreaPixels as Area;
        const scaleX = size / width;
        const scaleY = size / height;

        return {
            width: size,
            height: size,
            backgroundImage: `url(${final})`,
            backgroundSize: `${imageDimensions.width * scaleX}px ${imageDimensions.height * scaleY}px`,
            backgroundPosition: `-${x * scaleX}px -${y * scaleY}px`,
            backgroundRepeat: "no-repeat",
        };
    };

    const onCropComplete = useCallback((_: any, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    return (
        <Paper
            elevation={app.settings?.preferEmbossed ? 5 : 1}
            borderRadius={8}
            minWidth={{ xs: "90vw", sm: 150, md: 200, lg: 800 }}
            minHeight={400}
            justifyContent="space-between"
            width="100%"
            px={5}
            py={2.5}
            transparency={65}
            direction="row"
            spacing={2.5}
        >
            <Stack
                width="100%"
                flex={1}
                position="relative"
                direction="column"
                alignItems="center"
                justifyContent="center"
            >
                <Stack
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                    width={{ xs: 64, sm: 128, md: 512 }}
                    height={{ xs: 64, sm: 128, md: 512 }}
                    css={{
                        pointerEvents: creating ? "none" : "all",
                        filter: creating ? "blur(4px)" : "none",
                    }}
                >
                    <Cropper
                        image={final}
                        crop={crop}
                        zoom={zoom}
                        maxZoom={5}
                        minZoom={0.5}
                        aspect={1}
                        zoomSpeed={0.1}
                        cropShape="rect"
                        cropSize={{ width: 256, height: 256 }}
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                        rotation={rotation}
                        style={{
                            containerStyle: {
                                width: "100%",
                                height: "100%",
                                backgroundImage: `
                                    linear-gradient(45deg, ${theme.colors.surface} 25%, transparent 25%),
                                    linear-gradient(-45deg, ${theme.colors.surface} 25%, transparent 25%),
                                    linear-gradient(45deg, transparent 75%, ${theme.colors.surface} 75%),
                                    linear-gradient(-45deg, transparent 75%, ${theme.colors.surface} 75%)
                                `,
                                backgroundSize: "16px 16px",
                                backgroundPosition:
                                    "0 0, 0 8px, 8px -8px, -8px 0px",
                                backgroundColor: "#333",
                            },
                            cropAreaStyle: {
                                border: `2px solid ${theme.colors.neutral}`,
                            },
                        }}
                    />
                </Stack>
                <Stack
                    mt={1.25}
                    justifyContent="center"
                    alignItems="center"
                    spacing={5}
                    width="75%"
                >
                    <Stack spacing={0.5}>
                        <IconButton>
                            <AiOutlineRotateRight
                                onClick={() =>
                                    setRotation((x) => (x === 360 ? 0 : x + 90))
                                }
                            />
                        </IconButton>
                    </Stack>
                    <Stack
                        flex={1}
                        direction="row"
                        alignItems="center"
                        spacing={3.75}
                    >
                        <IconButton
                            onClick={() => zoom > 0.5 && setZoom(zoom - 0.1)}
                        >
                            <HiOutlineMagnifyingGlassMinus />
                        </IconButton>
                        <Slider
                            valueLabelDisplay="auto"
                            valueLabelFormat={(label) => `${label.toFixed(2)}x`}
                            value={zoom}
                            onChange={(_, newZoom) => {
                                if (!Array.isArray(newZoom)) setZoom(newZoom);
                            }}
                            min={0.5}
                            max={5}
                            step={0.1}
                        />
                        <IconButton
                            onClick={() => zoom < 5 && setZoom(zoom + 0.1)}
                        >
                            <HiOutlineMagnifyingGlassPlus />
                        </IconButton>
                    </Stack>
                </Stack>
            </Stack>

            <Stack direction="column" justifyContent="space-between">
                <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    spacing={0.75}
                >
                    <Typography>Preview</Typography>
                    <div
                        css={{
                            ...getPreviewStyle(64),
                        }}
                    />
                </Stack>
                <InputWithLabel
                    name="name"
                    type="text"
                    label="Expression Name"
                    placeholder="emoji_name"
                    value={name}
                    onChange={(e) =>
                        setName(
                            e.target.value.replaceAll(" ", "_").toLowerCase(),
                        )
                    }
                    endDecorator={
                        name.trim().length > 0 && (
                            <IconButton
                                onClick={() => setName("")}
                                variant="outlined"
                                size={8}
                            >
                                <FaX />
                            </IconButton>
                        )
                    }
                />

                <Stack direction="row" spacing={1.25}>
                    <Button
                        fullWidth
                        disabled={creating}
                        onClick={handleUpload}
                        color="primary"
                    >
                        Finish
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
});
