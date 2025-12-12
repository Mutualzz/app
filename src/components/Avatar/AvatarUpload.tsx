import { AnimatedPaper } from "@components/Animated/AnimatedPaper";
import { CropperClient as Cropper } from "@components/CropperClient";
import { UserAvatar } from "@components/User/UserAvatar";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { FileUploader } from "@mateie/react-drag-drop-files";
import type { HttpException } from "@mutualzz/types";
import {
    Button,
    ButtonGroup,
    IconButton,
    Slider,
    Stack,
    Typography,
    useTheme,
} from "@mutualzz/ui-web";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react";
import { useCallback, useState } from "react";
import { FaMagnifyingGlass, FaRotate } from "react-icons/fa6";

interface UpdateAvatar {
    avatar: File;
    crop?: unknown;
}

export const AvatarUpload = observer(() => {
    const { theme } = useTheme();
    const app = useAppStore();
    const { closeModal, closeAllModals } = useModal();

    const [imageFile, setImageFile] = useState<string | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);

    const [error, setError] = useState<string | null>(null);

    const { mutate: updateAvatar, isPending: saving } = useMutation({
        mutationKey: ["upload-avatar"],
        mutationFn: ({ avatar, crop }: UpdateAvatar) => {
            const formData = new FormData();
            formData.append("avatar", avatar);

            if (crop)
                formData.append("crop", JSON.stringify(croppedAreaPixels));

            return app.rest.patchFormData("@me", formData);
        },
        onSuccess: () => {
            setImageFile(null);
            setError(null);
            setOriginalFile(null);
            closeAllModals();
        },
        onError: (err: HttpException) => {
            setError(err.message ?? "An error occurred");
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
    };

    const onClear = () => {
        setImageFile(null);
        setOriginalFile(null);
        setError(null);
        setCroppedAreaPixels(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
    };

    const onClose = () => {
        setImageFile(null);
        setOriginalFile(null);
        setError(null);
        setCroppedAreaPixels(null);
        closeModal("avatar-upload");
    };

    const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async (skipCrop = false) => {
        if (!originalFile) return;

        const shouldCrop =
            !skipCrop &&
            (crop.x !== 0 || crop.y !== 0 || zoom !== 1 || rotation !== 0) &&
            !!croppedAreaPixels;

        updateAvatar({
            avatar: originalFile,
            crop: shouldCrop ? croppedAreaPixels : undefined,
        });
    };

    if (!app.account) return <></>;

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
        >
            <Stack
                width="100%"
                height="100%"
                position="relative"
                direction="column"
                px={{ xs: "1rem", sm: "2rem" }}
                py={{ xs: "1.5rem", sm: "2.5rem", md: "3rem" }}
                alignItems="center"
                justifyContent="center"
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
                                pointerEvents: saving ? "none" : "all",
                                filter: saving ? "blur(4px)" : "none",
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
                                disabled={saving}
                                css={{
                                    flex: 1,
                                }}
                            />
                            <IconButton
                                onClick={() => setRotation((prev) => prev + 90)}
                                color={theme.typography.colors.primary}
                                variant="plain"
                                size="sm"
                                disabled={saving}
                            >
                                <FaRotate />
                            </IconButton>
                        </Stack>
                        {error && (
                            <Typography
                                color="danger"
                                variant="plain"
                                mt="2rem"
                            >
                                {error}
                            </Typography>
                        )}
                    </>
                ) : (
                    <FileUploader
                        types={["png", "gif", "webp", "jpeg", "jpg"]}
                        handleChange={onUpload}
                        required
                        disabled={saving}
                    >
                        <Stack
                            alignItems="center"
                            justifyContent="center"
                            spacing={{ xs: 2, sm: 4, md: 6.25 }}
                            direction="column"
                            css={{
                                cursor: "pointer",
                            }}
                        >
                            <UserAvatar user={app.account} size={256} />
                            <Typography level="body-xs">
                                (Click or Drag and drop)
                            </Typography>
                        </Stack>
                    </FileUploader>
                )}
            </Stack>
            <Stack
                pb={{ xs: "1rem", sm: "2rem" }}
                px={{ xs: "1rem", sm: "2rem" }}
                direction="row"
                justifyContent="space-between"
            >
                <ButtonGroup spacing={{ xs: 2, sm: 5 }}>
                    <Button
                        disabled={saving}
                        onClick={onClose}
                        variant="outlined"
                        color="danger"
                    >
                        Cancel
                    </Button>
                    {imageFile && (
                        <Button disabled={saving} onClick={onClear}>
                            Reset
                        </Button>
                    )}
                </ButtonGroup>
                {imageFile && croppedAreaPixels && (
                    <ButtonGroup spacing={{ xs: 2, sm: 5 }}>
                        <Button
                            onClick={() => handleSave(true)}
                            loading={saving}
                            color="neutral"
                            variant="plain"
                        >
                            Skip
                        </Button>
                        <Button
                            onClick={() => handleSave(false)}
                            color="success"
                            loading={saving}
                        >
                            Save
                        </Button>
                    </ButtonGroup>
                )}
            </Stack>
        </AnimatedPaper>
    );
});
