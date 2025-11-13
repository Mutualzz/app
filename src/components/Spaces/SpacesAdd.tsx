import { AnimatedPaper } from "@components/Animated/AnimatedPaper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { FileUploader } from "@mateie/react-drag-drop-files";
import type { HttpException } from "@mutualzz/types";
import {
    Button,
    ButtonGroup,
    IconButton,
    Input,
    Slider,
    Stack,
    Typography,
    useTheme,
} from "@mutualzz/ui-web";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react";
import { useCallback, useState, type ChangeEvent } from "react";
import Cropper from "react-easy-crop";
import { FaCamera } from "react-icons/fa";
import { FaMagnifyingGlass, FaRotate } from "react-icons/fa6";

interface CreateSpace {
    icon?: File | null;
    crop?: unknown;
}

export const SpacesAdd = observer(() => {
    const app = useAppStore();
    const { theme } = useTheme();

    const { closeAllModals } = useModal();

    const [name, setName] = useState("");

    const [imageFile, setImageFile] = useState<string | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);

    const [error, setError] = useState<string | null>(null);

    const { mutate: createSpace, isPending: creating } = useMutation({
        mutationFn: ({ icon, crop }: CreateSpace) => {
            const formData = new FormData();
            formData.append("name", name);
            if (icon) formData.append("icon", icon);
            if (crop)
                formData.append("crop", JSON.stringify(croppedAreaPixels));

            return app.rest.putFormData("spaces", formData);
        },
        onSuccess: () => {
            setImageFile(null);
            setError(null);
            setOriginalFile(null);
            closeAllModals();
        },
        onError: (err: HttpException) => {
            setError(
                err.errors?.[0].message ?? err.message ?? "An error occurred",
            );
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

        setError(null);
    };

    const onClear = () => {
        setImageFile(null);
        setOriginalFile(null);
        setError(null);
        setCroppedAreaPixels(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
    };

    const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleName = (e: ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setName(e.target.value);
    };

    const handleCreate = async () => {
        const shouldCrop =
            (crop.x !== 0 || crop.y !== 0 || zoom !== 1 || rotation !== 0) &&
            !!croppedAreaPixels;

        createSpace({
            icon: originalFile,
            crop: shouldCrop ? croppedAreaPixels : undefined,
        });
    };

    return (
        <AnimatedPaper
            elevation={4}
            borderRadius={40}
            minWidth={{ xs: "90vw", sm: 340, md: 420, lg: 500 }}
            maxWidth={500}
            direction="column"
            minHeight={300}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            justifyContent="center"
            alignItems="center"
        >
            <Stack
                width="100%"
                height="100%"
                position="relative"
                direction="column"
                alignItems="center"
                justifyContent="center"
                pt={{ xs: "1rem", sm: "2rem" }}
                px={{ xs: "1rem", sm: "2rem" }}
                flex={1}
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
                            spacing={{ xs: 4, sm: 10, md: 15 }}
                            width={{ xs: 180, sm: 220, md: 256 }}
                            mt={{ xs: 4, sm: 8, md: 10 }}
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
                            spacing={5}
                        >
                            <FaCamera size={16} />
                            <Typography fontWeight="bold" fontSize="x-small">
                                Upload
                            </Typography>
                        </Stack>
                    </FileUploader>
                )}

                <Stack direction="column" spacing={{ xs: 2, sm: 3, md: 3.5 }}>
                    <Typography
                        fontWeight={500}
                        level={{ xs: "body-sm", sm: "body-md" }}
                    >
                        Name{" "}
                        <Typography variant="plain" color="danger">
                            *
                        </Typography>
                    </Typography>
                    <Input type="text" value={name} onChange={handleName} />
                    {error && (
                        <Typography
                            variant="plain"
                            color="danger"
                            level="body-sm"
                        >
                            {error}
                        </Typography>
                    )}
                </Stack>
            </Stack>
            <Stack
                pb={{ xs: "1rem", sm: "2rem" }}
                px={{ xs: "1rem", sm: "2rem" }}
                direction="row"
                justifyContent="space-between"
            >
                <ButtonGroup spacing={{ xs: 2, sm: 5 }}>
                    <Button
                        disabled={creating || name.trim() === "" || !!error}
                        onClick={() => handleCreate()}
                        variant="outlined"
                        color="success"
                    >
                        Create
                    </Button>
                    {imageFile && (
                        <Button disabled={creating} onClick={onClear}>
                            Reset
                        </Button>
                    )}
                </ButtonGroup>
            </Stack>
        </AnimatedPaper>
    );
});
