import { PlaygroundContent } from "@components/Playground/PlaygroundContent";
import { PlaygroundRightSidebar } from "@components/Playground/PlaygroundRightSidebar";
import {
    Avatar,
    Button,
    Checkbox,
    Divider,
    IconButton,
    Input,
    Option,
    Radio,
    RadioGroup,
    randomColor,
    Select,
    Slider,
    Stack,
    Typography,
    type AvatarShape,
    type Color,
    type ColorLike,
    type Size,
    type SizeValue,
    type Variant,
} from "@mutualzz/ui";
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
import capitalize from "lodash-es/capitalize";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";

export const Route = createFileRoute("/ui/data-display/avatar")({
    component: RouteComponent,
    head: () => ({
        meta: [
            ...seo({
                title: "Avatar - Mutualzz UI",
            }),
        ],
    }),
});

const variants = ["solid", "outlined", "plain", "soft"] as Variant[];
const colors = [
    "primary",
    "neutral",
    "success",
    "danger",
    "warning",
    "info",
] as Color[];

const sizeNames = {
    sm: "Small",
    md: "Medium",
    lg: "Large",
};

const shapes = ["circle", "square", "rounded"] as AvatarShape[];

function RouteComponent() {
    const [variant, setVariant] = useState<Variant | "all">("solid");
    const [size, setSize] = useState<Size | number>("md");
    const [shape, setShape] = useState<AvatarShape | SizeValue | number>(
        "circle",
    );

    const [image, setImage] = useState("");
    const [text, setText] = useState("AM");

    const [customShapeToggle, setCustomShapeToggle] = useState(false);
    const [customSizeToggle, setCustomSizeToggle] = useState(false);

    const [customColor, setCustomColor] = useState<ColorLike>(randomColor());
    const [customColors, setCustomColors] = useState<ColorLike[]>([]);
    const [colorToDelete, setColorToDelete] = useState<ColorLike | null>(null);

    const allAvatars = [...colors, ...customColors].map((c) =>
        variants.map((v) => (
            <Stack
                justifyContent="center"
                alignItems="center"
                direction="column"
                key={`${c}-${v}`}
            >
                <Typography>
                    {capitalize(v)} {capitalize(c)}
                </Typography>
                <Avatar
                    key={`${v}-${c}-button`}
                    variant={v}
                    color={c}
                    size={size}
                    shape={shape}
                    src={image}
                >
                    {text ?? `${capitalize(v)} ${capitalize(c)}`}
                </Avatar>
            </Stack>
        )),
    );

    const avatars = [...colors, ...customColors].map((c) => (
        <Stack
            justifyContent="center"
            alignItems="center"
            direction="column"
            key={`${c}-${variant}`}
        >
            <Typography>
                {capitalize(variant)} {capitalize(c)}
            </Typography>
            <Avatar
                key={`${variant}-${c}-button`}
                variant={variant as Variant}
                color={c}
                size={size}
                shape={shape}
                src={image}
            >
                {text}
            </Avatar>
        </Stack>
    ));

    return (
        <Stack direction="row" width="100%">
            <PlaygroundContent
                direction={variant === "all" ? "column" : "row"}
                alignItems="flex-start"
                alignContent="flex-start"
                wrap={variant === "all" ? "nowrap" : "wrap"}
                spacing={25}
            >
                {variant === "all" &&
                    allAvatars.map((buttons, i) => (
                        <Stack direction="row" spacing={25} key={i}>
                            {buttons}
                        </Stack>
                    ))}
                {variant !== "all" && avatars}
            </PlaygroundContent>
            <PlaygroundRightSidebar>
                <Stack direction="column" spacing={5}>
                    <Typography>Variant</Typography>
                    <RadioGroup
                        onChange={(_, vriant) => setVariant(vriant as Variant)}
                        value={variant}
                        name="variants"
                        spacing={5}
                        color="neutral"
                    >
                        <Radio key="all" value="all" label="All" />
                        {variants.map((v) => (
                            <Radio key={v} value={v} label={capitalize(v)} />
                        ))}
                    </RadioGroup>
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography>Size</Typography>
                        <Checkbox
                            checked={customSizeToggle}
                            label="Custom"
                            onChange={() =>
                                setCustomSizeToggle((prev) => {
                                    if (prev) setSize("md");
                                    else setSize(Math.round((64 + 20) / 2));
                                    return !prev;
                                })
                            }
                            size="sm"
                        />
                    </Stack>
                    {customSizeToggle ? (
                        <Slider
                            value={size as number}
                            min={20}
                            max={64}
                            onChange={(e) => setSize(Number(e.target.value))}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(value) => `${value}px`}
                        />
                    ) : (
                        <RadioGroup
                            onChange={(_, size) => setSize(size as Size)}
                            value={size as Size}
                            name="sizes"
                            color="neutral"
                            spacing={10}
                            orientation="horizontal"
                        >
                            {Object.keys(sizeNames).map((s) => (
                                <Radio
                                    key={s}
                                    value={s}
                                    label={sizeNames[s as Size]}
                                />
                            ))}
                        </RadioGroup>
                    )}
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Stack justifyContent="space-between" direction="row">
                        <Typography>Shape</Typography>
                        <Checkbox
                            onChange={() =>
                                setCustomShapeToggle((prev) => {
                                    if (prev) setShape("circle");
                                    else setShape("20px");
                                    return !prev;
                                })
                            }
                            value={customShapeToggle}
                            label="Custom Shape"
                            size="sm"
                        />
                    </Stack>
                    {customShapeToggle ? (
                        <Input
                            type="text"
                            onChange={(e) => {
                                const value = isNaN(Number(e.target.value))
                                    ? e.target.value
                                    : Number(e.target.value);
                                setShape(value as AvatarShape);
                            }}
                            value={shape}
                            variant="solid"
                            color="primary"
                            fullWidth
                        />
                    ) : (
                        <RadioGroup
                            onChange={(_, shape) =>
                                setShape(shape as AvatarShape)
                            }
                            value={shape as AvatarShape}
                            name="shapes"
                            color="neutral"
                            spacing={5}
                        >
                            {shapes.map((br) => (
                                <Radio
                                    key={br}
                                    value={br}
                                    label={capitalize(br)}
                                />
                            ))}
                        </RadioGroup>
                    )}
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Typography>Text</Typography>
                    <Input
                        type="text"
                        variant="solid"
                        size="lg"
                        color="primary"
                        placeholder="Enter avatar text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        fullWidth
                    />
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Typography>Image URL</Typography>
                    <Input
                        type="text"
                        variant="solid"
                        size="lg"
                        color="primary"
                        placeholder="Enter Image URL"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        fullWidth
                    />
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Typography>Custom Color</Typography>
                    <Stack direction="column" spacing={10}>
                        <Input
                            type="color"
                            variant="solid"
                            size="lg"
                            color="primary"
                            placeholder="Enter a color (e.g., #ff0000)"
                            value={customColor}
                            onChange={setCustomColor}
                            endDecorator={
                                <IconButton
                                    color={customColor}
                                    variant="solid"
                                    onClick={() => {
                                        setCustomColors(
                                            (prev) =>
                                                [
                                                    ...prev,
                                                    customColor,
                                                ] as ColorLike[],
                                        );
                                        setCustomColor(randomColor());
                                        setColorToDelete(customColor);
                                    }}
                                >
                                    <FaPlus />
                                </IconButton>
                            }
                        />
                        {customColors.length > 0 && (
                            <Stack direction="column" spacing={10}>
                                <Select
                                    value={colorToDelete ?? ""}
                                    onValueChange={(value) => {
                                        setColorToDelete(
                                            value
                                                .toString()
                                                .trim() as ColorLike,
                                        );
                                    }}
                                    color={colorToDelete ?? "neutral"}
                                >
                                    {customColors.map((color) => (
                                        <Option
                                            color={color}
                                            key={color}
                                            value={color}
                                        >
                                            {color}
                                        </Option>
                                    ))}
                                </Select>
                                <Stack direction="column" spacing={10}>
                                    <Button
                                        color="danger"
                                        onClick={() => {
                                            setCustomColors((prev) => {
                                                const updated = prev.filter(
                                                    (color) =>
                                                        color !== colorToDelete,
                                                );
                                                setColorToDelete(
                                                    updated.length > 0
                                                        ? updated[
                                                              updated.length - 1
                                                          ]
                                                        : null,
                                                );
                                                return updated;
                                            });
                                        }}
                                    >
                                        {customColors.length > 1
                                            ? "Delete Selected Color"
                                            : "Delete Color"}
                                    </Button>
                                    {customColors.length > 1 && (
                                        <Button
                                            variant="soft"
                                            color="danger"
                                            onClick={() => {
                                                setCustomColors([]);
                                            }}
                                        >
                                            Delete All
                                        </Button>
                                    )}
                                </Stack>
                            </Stack>
                        )}
                    </Stack>
                </Stack>
            </PlaygroundRightSidebar>
        </Stack>
    );
}
