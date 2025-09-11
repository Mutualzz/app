import { useAppStore } from "@hooks/useStores";
import {
    Box,
    Button,
    ButtonGroup,
    type ColorLike,
    Divider,
    InputColor,
    InputNumber,
    Option,
    Paper,
    Select,
    Stack,
    Typography,
    useTheme,
} from "@mutualzz/ui";
import { useMediaQuery } from "@react-hookz/web";
import { observer } from "mobx-react";
import { useRef, useState } from "react";
import { FaEraser, FaPaintBrush } from "react-icons/fa";
import {
    ReactSketchCanvas,
    type ReactSketchCanvasRef,
} from "react-sketch-canvas";

// TODO: need to work on mobile responsiveness

export const AvatarDraw = observer(() => {
    const { theme } = useTheme();
    const { draft } = useAppStore();
    const canvasRef = useRef<ReactSketchCanvasRef>(null);
    const [brushColor, setBrushColor] = useState<ColorLike>("#000000");
    const [backgroundColor, setBackgroundColor] =
        useState<ColorLike>("#ffffff");

    const isMobile = useMediaQuery(
        theme.breakpoints.down("md").replace("@media", ""),
    );

    const selectRef = useRef<HTMLSelectElement>(null);

    const [eraserMode, setEraserMode] = useState(false);
    const [emptyCanvas, setEmptyCanvas] = useState(true);

    const [selectedAvatarValue, setSelectedAvatarValue] = useState("");
    const [selectedAvatarIndex, setSelectedAvatarIndex] = useState<
        number | null
    >(null);

    const [size, setSize] = useState(6);

    const onChange = async () => {
        const time = await canvasRef.current?.getSketchingTime();
        if (!time) return;
        setEmptyCanvas(time === 0);
    };

    const toggleEraser = () => {
        setEraserMode(!eraserMode);
        canvasRef.current?.eraseMode(!eraserMode);
    };

    const saveDraft = async () => {
        const paths = await canvasRef.current?.exportPaths();
        const image = await canvasRef.current?.exportSvg();
        if (!paths || !image) return;

        draft.saveAvatarDraft(image, paths);
    };

    const selectAvatar = (index: number) => {
        const avatar = draft.avatars[index];
        if (!avatar) return;

        canvasRef.current?.clearCanvas();
        canvasRef.current?.loadPaths(avatar.paths);
        setSelectedAvatarIndex(index);
        setSelectedAvatarValue("");
    };

    return (
        <Paper
            direction={isMobile ? "column" : "row"}
            justifyContent="space-between"
            alignItems="center"
            gap={{ xs: 2, sm: 4, md: 6, lg: 8 }}
            elevation={3}
            width="100%"
            minWidth={{ xs: "100vw", sm: 400, md: 720 }}
            minHeight={{ xs: 400, sm: 500, md: 600 }}
            maxWidth={{ xs: "100vw", sm: 600, md: 900 }}
            maxHeight={{ xs: "100vh", sm: 700, md: 900 }}
            position="relative"
            p={{ xs: "0.5rem", sm: "1rem", md: "2rem" }}
            borderRadius={{ xs: "1rem", sm: "1.5rem" }}
            overflow="auto"
        >
            <Stack
                direction="column"
                gap={{ xs: 2, sm: 4, md: 6 }}
                justifyContent="center"
                alignItems="center"
                width={isMobile ? "100%" : "auto"}
                minWidth={isMobile ? "100%" : 225}
                position={isMobile ? "static" : "absolute"}
                left={isMobile ? undefined : 20}
                top={isMobile ? undefined : 20}
            >
                <Stack
                    direction="column"
                    gap={{ xs: 2, sm: 4, md: 6 }}
                    justifyContent="center"
                    alignItems="center"
                    width={isMobile ? "100%" : "auto"}
                    minWidth={isMobile ? "100%" : 225}
                    position={isMobile ? "static" : "absolute"}
                    left={isMobile ? undefined : 20}
                    top={isMobile ? undefined : 20}
                >
                    <Divider textColor={theme.typography.colors.primary}>
                        Saved Avatars
                    </Divider>
                    <Select
                        disabled={draft.avatars.length === 0}
                        placeholder={`${draft.avatars.length > 0 ? draft.avatars.length : "No Saved"} Avatars`}
                        onValueChange={(value) => selectAvatar(Number(value))}
                        value={selectedAvatarValue}
                        ref={selectRef}
                    >
                        {draft.avatars.map((avatar, index) => (
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
                                        style={{
                                            width: 48,
                                            height: 48,
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
                                draft.deleteAvatarDraft(selectedAvatarIndex);
                                setSelectedAvatarIndex(null);
                                canvasRef.current?.clearCanvas();
                            }}
                        >
                            Delete Selected Avatar
                        </Button>
                    )}
                </Stack>
                <Stack
                    direction={isMobile ? "row" : "column"}
                    gap={{ xs: 2, sm: 4, md: 6 }}
                    alignItems="center"
                    justifyContent="center"
                    width={isMobile ? "100%" : "auto"}
                    mt={isMobile ? 2 : 0}
                >
                    <Button
                        startDecorator={
                            eraserMode ? <FaEraser /> : <FaPaintBrush />
                        }
                        onClick={toggleEraser}
                        color="neutral"
                        variant="outlined"
                    >
                        {eraserMode ? "Eraser" : "Brush"}
                    </Button>
                    <Divider
                        orientation={isMobile ? "vertical" : "horizontal"}
                        lineColor="accent"
                    />
                    <Stack direction="column" gap={2} alignItems="center">
                        <Typography level="body-sm">
                            {eraserMode ? "Eraser" : "Brush"} Size
                        </Typography>
                        <InputNumber
                            onChange={(e) => setSize(e.target.valueAsNumber)}
                            value={String(size)}
                        />
                    </Stack>
                    <Stack direction="column" gap={2} alignItems="center">
                        <Typography level="body-xs">
                            Background Color
                        </Typography>
                        <InputColor
                            size={isMobile ? 8 : 12.5}
                            value={backgroundColor}
                            onChange={(color) => setBackgroundColor(color)}
                            allowAlpha
                            showRandom
                        />
                    </Stack>
                    {!eraserMode && (
                        <Stack direction="column" gap={2} alignItems="center">
                            <Typography level="body-sm">Brush Color</Typography>
                            <InputColor
                                size={isMobile ? 8 : 12.5}
                                value={brushColor}
                                onChange={(color) => setBrushColor(color)}
                                showRandom
                            />
                        </Stack>
                    )}
                </Stack>
            </Stack>
            <Box width="512px" height="512px" position="relative">
                <ReactSketchCanvas
                    ref={canvasRef}
                    strokeColor={brushColor}
                    strokeWidth={size}
                    eraserWidth={size}
                    canvasColor={backgroundColor}
                    onStroke={onChange}
                    svgStyle={{
                        borderRadius: "50%",
                    }}
                    style={{
                        borderRadius: "50%",
                    }}
                    withTimestamp
                    exportWithBackgroundImage
                />
            </Box>
            <Stack>
                <ButtonGroup
                    color="neutral"
                    spacing={10}
                    variant="soft"
                    orientation="vertical"
                    disabled={emptyCanvas}
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
                        disabled={emptyCanvas}
                        variant="outlined"
                        color="success"
                    >
                        <Button onClick={() => canvasRef.current?.undo()}>
                            Undo
                        </Button>
                        <Button onClick={() => canvasRef.current?.redo()}>
                            Redo
                        </Button>
                    </ButtonGroup>
                    <Button>Save</Button>
                    <Button onClick={() => saveDraft()}>Save Draft</Button>
                </ButtonGroup>
            </Stack>
        </Paper>
    );
});
