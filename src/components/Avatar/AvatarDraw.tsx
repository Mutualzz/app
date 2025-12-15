import { AnimatedPaper } from "@components/Animated/AnimatedPaper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import type { ColorLike } from "@mutualzz/ui-core";
import {
    Button,
    ButtonGroup,
    Divider,
    InputColor,
    InputNumber,
    Option,
    Select,
    Stack,
    Typography,
    useTheme,
} from "@mutualzz/ui-web";
import { useMediaQuery } from "@react-hookz/web";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useRef, useState } from "react";
import { FaEraser, FaPaintBrush } from "react-icons/fa";
import {
    ReactSketchCanvas,
    type ReactSketchCanvasRef,
} from "react-sketch-canvas";

export const AvatarDraw = observer(() => {
    const { theme } = useTheme();
    const app = useAppStore();
    const { closeModal, closeAllModals } = useModal();
    const canvasRef = useRef<ReactSketchCanvasRef>(null);
    const [brushColor, setBrushColor] = useState<ColorLike>("#000000");
    const [backgroundColor, setBackgroundColor] =
        useState<ColorLike>("#ffffff");

    const isMobile = useMediaQuery(
        theme.breakpoints.down("md").replace("@media", ""),
    );

    const [eraserMode, setEraserMode] = useState(false);
    const [emptyCanvas, setEmptyCanvas] = useState(true);

    const [selectedAvatarValue, setSelectedAvatarValue] = useState("");
    const [selectedAvatarIndex, setSelectedAvatarIndex] = useState<
        number | null
    >(null);

    const [size, setSize] = useState(6);

    const { mutate: uploadAvatar, isPending } = useMutation({
        mutationKey: ["upload-avatar"],
        mutationFn: async (avatar: string) => {
            const blob = await (await fetch(avatar)).blob();
            const file = new File([blob], "new-avatar.png", {
                type: "image/png",
            });

            const formData = new FormData();
            formData.append("avatar", file);
            return app.rest.patchFormData("@me", formData);
        },
        onSuccess: () => {
            setSelectedAvatarIndex(null);
            setSelectedAvatarValue("");
            canvasRef.current?.clearCanvas();
            setBrushColor("#000000");
            setBackgroundColor("#ffffff");
            setSize(6);
            setEraserMode(false);
            setEmptyCanvas(true);
            if (selectedAvatarIndex)
                app.drafts.deleteAvatarDraft(selectedAvatarIndex);

            closeAllModals();
        },
    });

    const onChange = async () => {
        const time = await canvasRef.current?.getSketchingTime();
        if (!time) return;
        setEmptyCanvas(time === 0);
    };

    const toggleEraser = () => {
        setEraserMode(!eraserMode);
        canvasRef.current?.eraseMode(!eraserMode);
    };

    const save = async () => {
        const pngImage = await canvasRef.current?.exportImage("png");
        if (!pngImage) return;

        uploadAvatar(pngImage);
    };

    const saveDraft = async () => {
        const paths = await canvasRef.current?.exportPaths();
        const image = await canvasRef.current?.exportSvg();
        if (!paths || !image) return;

        app.drafts.saveAvatarDraft(image, paths);
    };

    const selectAvatar = (index: number) => {
        const avatar = app.drafts.avatars[index];
        if (!avatar) return;

        canvasRef.current?.clearCanvas();
        canvasRef.current?.loadPaths(avatar.paths);
        setSelectedAvatarIndex(index);
        setSelectedAvatarValue("");
    };

    const onClose = () => {
        setSelectedAvatarIndex(null);
        setSelectedAvatarValue("");
        canvasRef.current?.clearCanvas();
        setBrushColor("#000000");
        setBackgroundColor("#ffffff");
        setSize(6);
        setEraserMode(false);
        setEmptyCanvas(true);
        closeModal("avatar-draw");
    };

    return (
        <AnimatedPaper
            direction={isMobile ? "column" : "row"}
            justifyContent="space-between"
            alignItems="center"
            spacing={5}
            elevation={3}
            width="100%"
            minWidth={{ xs: "100vw", sm: 400, md: 720 }}
            minHeight={{ xs: 400, sm: 500, md: 600 }}
            maxWidth={{ xs: "100vw", sm: 600, md: 900 }}
            maxHeight={{ xs: "100vh", sm: 700, md: 900 }}
            position="relative"
            p={{ xs: "0.5rem", sm: "1rem", md: "2rem" }}
            borderRadius={{ xs: "1rem", sm: "1.5rem" }}
            overflow="hidden"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
        >
            <Stack
                direction="column"
                spacing={2.5}
                justifyContent="center"
                alignItems="center"
                minWidth={isMobile ? 200 : 250}
                position={isMobile ? "static" : "absolute"}
                left={isMobile ? undefined : 5}
                top={isMobile ? undefined : 5}
            >
                <Typography>Saved Avatars</Typography>
                <Select
                    disabled={app.drafts.avatars.length === 0 || isPending}
                    placeholder={`${app.drafts.avatars.length > 0 ? app.drafts.avatars.length : "No Saved"} Avatars`}
                    onValueChange={(value) => selectAvatar(Number(value))}
                    value={selectedAvatarValue}
                    size={isMobile ? "sm" : "md"}
                >
                    {app.drafts.avatars.map((avatar, index) => (
                        <Option variant="plain" key={index} value={index}>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Typography level="body-sm">
                                    Avatar {index + 1}
                                </Typography>
                                <img
                                    src={`data:image/svg+xml;utf8,${encodeURIComponent(avatar.image)}`}
                                    alt={`Avatar ${index + 1}`}
                                    css={{
                                        width: isMobile ? 48 : "100%",
                                        height: isMobile ? 48 : "100%",
                                        maxWidth: 64,
                                        maxHeight: 64,
                                    }}
                                />
                            </Stack>
                        </Option>
                    ))}
                </Select>
                {selectedAvatarIndex !== null && (
                    <Button
                        color="danger"
                        variant="outlined"
                        onClick={() => {
                            if (selectedAvatarIndex === null) return;
                            app.drafts.deleteAvatarDraft(selectedAvatarIndex);
                            setSelectedAvatarIndex(null);
                            canvasRef.current?.clearCanvas();
                        }}
                        size={isMobile ? "sm" : "md"}
                    >
                        Delete Selected Avatar
                    </Button>
                )}
            </Stack>
            {!isMobile && (
                <Stack
                    direction="column"
                    alignItems="center"
                    justifyContent="center"
                    minWidth={225}
                    spacing={2.5}
                >
                    <Button
                        startDecorator={
                            eraserMode ? <FaEraser /> : <FaPaintBrush />
                        }
                        onClick={toggleEraser}
                        color="neutral"
                        variant="outlined"
                        disabled={isPending}
                    >
                        {eraserMode ? "Eraser" : "Brush"}
                    </Button>
                    <Divider orientation="horizontal" lineColor="muted" />
                    <Stack
                        direction="column"
                        justifyContent="center"
                        spacing={2.5}
                        alignItems="center"
                    >
                        <Typography level="body-sm">
                            {eraserMode ? "Eraser" : "Brush"} Size
                        </Typography>
                        <InputNumber
                            disabled={isPending}
                            onChange={(e) => setSize(e.target.valueAsNumber)}
                            value={String(size)}
                            size="md"
                        />
                    </Stack>
                    {!eraserMode && (
                        <Stack
                            direction="column"
                            spacing={2.5}
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Typography level="body-sm">Brush Color</Typography>
                            <InputColor
                                disabled={isPending}
                                size="md"
                                value={brushColor}
                                onChange={(color) => setBrushColor(color)}
                                showRandom
                            />
                        </Stack>
                    )}
                </Stack>
            )}
            {isMobile && (
                <Stack
                    direction="column"
                    alignItems="center"
                    justifyContent="center"
                    width="100%"
                >
                    <Button
                        startDecorator={
                            eraserMode ? <FaEraser /> : <FaPaintBrush />
                        }
                        onClick={toggleEraser}
                        disabled={isPending}
                        color="neutral"
                        variant="outlined"
                        size="sm"
                    >
                        {eraserMode ? "Eraser" : "Brush"}
                    </Button>
                    <Divider />
                    <Stack
                        direction="row"
                        spacing={2.5}
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Stack
                            direction="column"
                            justifyContent="center"
                            spacing={2.5}
                            alignItems="center"
                        >
                            <Typography level="body-xs">
                                {eraserMode ? "Eraser" : "Brush"} Size
                            </Typography>
                            <InputNumber
                                disabled={isPending}
                                onChange={(e) =>
                                    setSize(e.target.valueAsNumber)
                                }
                                value={String(size)}
                                size={10}
                            />
                        </Stack>
                        {!eraserMode && (
                            <Stack
                                direction="column"
                                spacing={2.5}
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Typography level="body-xs">
                                    Brush Color
                                </Typography>
                                <InputColor
                                    size={10}
                                    value={brushColor}
                                    disabled={isPending}
                                    onChange={(color) => setBrushColor(color)}
                                    showRandom
                                />
                            </Stack>
                        )}
                    </Stack>
                </Stack>
            )}
            <Stack position="relative" spacing={2.5} direction="column">
                <ReactSketchCanvas
                    ref={canvasRef}
                    strokeColor={brushColor}
                    strokeWidth={size}
                    eraserWidth={size}
                    canvasColor={backgroundColor}
                    onStroke={onChange}
                    width={isMobile ? "256px" : "512px"}
                    height={isMobile ? "256px" : "512px"}
                    svgStyle={{
                        borderRadius: "50%",
                    }}
                    style={{
                        borderRadius: "50%",
                    }}
                    withTimestamp
                    readOnly={isPending}
                    exportWithBackgroundImage
                />
                <Stack
                    direction="column"
                    spacing={2.5}
                    justifyContent="center"
                    alignItems="center"
                >
                    <Typography level="body-sm">Background Color</Typography>
                    <InputColor
                        size={isMobile ? 10 : "md"}
                        value={backgroundColor}
                        onChange={(color) => setBackgroundColor(color)}
                        allowAlpha
                        showRandom
                        disabled={isPending}
                    />
                </Stack>
            </Stack>
            <ButtonGroup
                color="neutral"
                spacing={10}
                variant="soft"
                orientation={isMobile ? "horizontal" : "vertical"}
                disabled={emptyCanvas || isPending}
                size={isMobile ? "sm" : "md"}
            >
                <Button
                    onClick={() => {
                        setEmptyCanvas(true);
                        canvasRef.current?.clearCanvas();
                    }}
                >
                    Clear
                </Button>
                <ButtonGroup
                    disabled={emptyCanvas || isPending}
                    variant="outlined"
                    color="success"
                    orientation={isMobile ? "horizontal" : "vertical"}
                    size={isMobile ? "sm" : "md"}
                >
                    <Button onClick={() => canvasRef.current?.undo()}>
                        Undo
                    </Button>
                    <Button onClick={() => canvasRef.current?.redo()}>
                        Redo
                    </Button>
                </ButtonGroup>
                <Button onClick={() => save()}>Save</Button>
                <Button onClick={() => saveDraft()}>Save Draft</Button>
                <Button disabled={isPending} color="danger" onClick={onClose}>
                    Cancel
                </Button>
            </ButtonGroup>
        </AnimatedPaper>
    );
});
