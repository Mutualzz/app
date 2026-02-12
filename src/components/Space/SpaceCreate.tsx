import { AnimatedPaper } from "@components/Animated/AnimatedPaper";
import { Link } from "@components/Link";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { FileUploader } from "@mateie/react-drag-drop-files";
import type { APISpace, HttpException } from "@mutualzz/types";
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
import { useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useCallback, useState, type ChangeEvent } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { FaCamera } from "react-icons/fa";
import { FaMagnifyingGlass, FaRotate } from "react-icons/fa6";

interface CreateSpace {
    icon?: File | null;
    crop?: unknown;
}

interface Props {
    setCreating: (creating: boolean) => void;
}

export const SpaceCreate = observer(({ setCreating }: Props) => {
    const app = useAppStore();
    const navigate = useNavigate();
    const { theme } = useTheme();

    const { closeModal } = useModal();

    const [name, setName] = useState("");

    const [imageFile, setImageFile] = useState<string | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [croppedAreaPixels, setCroppedAreaPixels] =
        useState<Partial<Area> | null>(null);

    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
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

            return app.rest.postFormData<APISpace>("spaces", formData);
        },
        onSuccess: (space) => {
            if (space.channels && space.channels.length > 1)
                navigate({ to: `/spaces/${space.id}/${space.channels[0].id}` });
            else navigate({ to: `/spaces/${space.id}/` });

            setImageFile(null);
            setError(null);
            setOriginalFile(null);
            closeModal();
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

    const onCropComplete = useCallback((_: any, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleName = (e: ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setName(e.target.value);
    };

    const handleCreate = async () => {
        if (name.trim() === "") {
            setError("Name is required");
            return;
        }
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
            borderRadius={12}
            minWidth={{ xs: "90vw", sm: 340, md: 420, lg: 400 }}
            maxWidth={500}
            direction="column"
            minHeight={300}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            justifyContent="space-between"
            alignItems="center"
            elevation={2}
            p={{ xs: "1rem", sm: "2rem" }}
            transparency={10}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        >
            <Typography level="h5" fontWeight="bold" mb={10}>
                Create a space
            </Typography>
            <Stack
                width="100%"
                flex={1}
                position="relative"
                direction="column"
                alignItems="center"
                justifyContent="center"
                pb={{ xs: 0.5, sm: 0.75 }}
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
            <Stack
                direction="column"
                spacing={{ xs: 0.5, sm: 0.75, md: 0.875 }}
                width="100%"
            >
                <Typography
                    fontWeight={500}
                    level={{ xs: "body-sm", sm: "body-md" }}
                >
                    Name{" "}
                    <Typography variant="plain" color="danger">
                        *
                    </Typography>
                </Typography>
                <Input
                    type="text"
                    fullWidth
                    value={name}
                    onChange={handleName}
                />
                {error && (
                    <Typography variant="plain" color="danger" level="body-sm">
                        {error}
                    </Typography>
                )}
            </Stack>
            <Stack
                pt={{ xs: 6, sm: 8, md: 10 }}
                direction="row"
                justifyContent="space-between"
                width="100%"
                alignItems="flex-end"
            >
                <ButtonGroup fullWidth spacing={{ xs: 2, sm: 5 }}>
                    <Button
                        disabled={creating || name.trim() === "" || !!error}
                        onClick={() => handleCreate()}
                        variant="solid"
                        color="success"
                    >
                        Create Space
                    </Button>
                    {imageFile && (
                        <Button disabled={creating} onClick={onClear}>
                            Reset
                        </Button>
                    )}
                </ButtonGroup>
            </Stack>
            <Stack mt={2.5} alignItems="center" spacing={2}>
                <Typography>Already have an invite?</Typography>
                <Link
                    variant="plain"
                    color="success"
                    disabled={creating}
                    underline="always"
                    onClick={() => setCreating(false)}
                >
                    Back to join
                </Link>
            </Stack>
        </AnimatedPaper>
    );
});
