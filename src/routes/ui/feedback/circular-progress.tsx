import { PlaygroundContent } from "@components/Playground/PlaygroundContent";
import { PlaygroundRightSidebar } from "@components/Playground/PlaygroundRightSidebar";
import {
    randomColor,
    type Color,
    type ColorLike,
    type ColorResult,
    type Size,
    type Variant,
} from "@mutualzz/ui-core";
import {
    Button,
    Checkbox,
    CircularProgress,
    Divider,
    IconButton,
    Input,
    Option,
    Radio,
    RadioGroup,
    Select,
    Slider,
    Stack,
    Typography,
} from "@mutualzz/ui-web";
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
import capitalize from "lodash-es/capitalize";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";

export const Route = createFileRoute("/ui/feedback/circular-progress")({
    component: PlaygroundCircularProgress,
    head: () => ({
        meta: [
            ...seo({
                title: "Circular Progress - Mutualzz UI",
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

function PlaygroundCircularProgress() {
    const [variant, setVariant] = useState<Variant | "all">("solid");
    const [text, setText] = useState<string | null>(null);
    const [size, setSize] = useState<Size | number>("md");

    const [determinate, setDeterminate] = useState(false);
    const [value, setValue] = useState(0);

    const [customSizeToggle, setCustomSizeToggle] = useState(false);

    const [customColor, setCustomColor] = useState<ColorLike>(randomColor());
    const [customColors, setCustomColors] = useState<ColorLike[]>([]);
    const [colorToDelete, setColorToDelete] = useState<ColorLike | null>(null);

    const allProgresses = [...colors, ...customColors].map((c) =>
        variants.map((v) => (
            <Stack
                justifyContent="center"
                alignItems="center"
                direction="column"
                key={`${c}-${v}`}
                spacing={5}
            >
                <Typography>
                    {capitalize(v)} {capitalize(c)}
                </Typography>
                {text ? (
                    <CircularProgress
                        key={c}
                        size={size}
                        variant={v}
                        color={c}
                        determinate={determinate}
                        value={value}
                    >
                        {text}
                    </CircularProgress>
                ) : (
                    <CircularProgress
                        key={c}
                        size={size}
                        variant={v}
                        color={c}
                        determinate={determinate}
                        value={value}
                    />
                )}
            </Stack>
        )),
    );

    const progresses = [...colors, ...customColors].map((c) => (
        <Stack
            justifyContent="center"
            alignItems="center"
            direction="column"
            key={c}
            spacing={5}
        >
            <Typography>
                {capitalize(variant)} {capitalize(c)}
            </Typography>
            {text ? (
                <CircularProgress
                    key={c}
                    size={size}
                    variant={variant as Variant}
                    color={c}
                    determinate={determinate}
                    value={value}
                >
                    {text}
                </CircularProgress>
            ) : (
                <CircularProgress
                    key={c}
                    size={size}
                    variant={variant as Variant}
                    color={c}
                    determinate={determinate}
                    value={value}
                />
            )}
        </Stack>
    ));

    return (
        <Stack width="100%" direction="row">
            <PlaygroundContent
                direction={variant === "all" ? "column" : "row"}
                alignItems="flex-start"
                alignContent="flex-start"
                wrap={variant === "all" ? "nowrap" : "wrap"}
                spacing={20}
            >
                {variant === "all" &&
                    allProgresses.map((progresses, i) => (
                        <Stack direction="row" spacing={20} key={i}>
                            {progresses}
                        </Stack>
                    ))}
                {variant !== "all" && progresses}
            </PlaygroundContent>
            <PlaygroundRightSidebar>
                <Stack direction="column" spacing={5}>
                    <Typography>Variant</Typography>
                    <RadioGroup
                        onChange={(_, vriant) => setVariant(vriant as Variant)}
                        value={variant}
                        name="variants"
                        color="neutral"
                        spacing={5}
                    >
                        <Radio key="all" value="all" label="All" />
                        {variants.map((v) => (
                            <Radio key={v} value={v} label={capitalize(v)} />
                        ))}
                    </RadioGroup>
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={5}
                    >
                        <Typography>Size</Typography>
                        <Checkbox
                            checked={customSizeToggle}
                            label="Custom"
                            onChange={() =>
                                setCustomSizeToggle((prev) => {
                                    if (prev) setSize("md");
                                    else setSize((64 + 16) / 2);
                                    return !prev;
                                })
                            }
                            size="sm"
                        />
                    </Stack>
                    {customSizeToggle ? (
                        <Slider
                            value={size as number}
                            min={16}
                            max={64}
                            onChange={(e) => setSize(Number(e.target.value))}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(val) => `${val}px`}
                        />
                    ) : (
                        <RadioGroup
                            onChange={(_, size) => setSize(size as Size)}
                            value={size as Size}
                            name="sizes"
                            orientation="horizontal"
                            spacing={10}
                            color="neutral"
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
                    <Typography>States</Typography>
                    <Checkbox
                        checked={determinate}
                        label="Determinate"
                        onChange={() => setDeterminate((prev) => !prev)}
                    />
                    {determinate && (
                        <Slider
                            value={value}
                            min={0}
                            max={100}
                            onChange={(e) => setValue(Number(e.target.value))}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(val) => `${val}%`}
                        />
                    )}
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Typography>Label</Typography>
                    <Input
                        type="text"
                        variant="solid"
                        size="lg"
                        color="primary"
                        fullWidth
                        value={text ?? ""}
                        onChange={(e) =>
                            setText(
                                e.target.value.trim() === ""
                                    ? null
                                    : e.target.value,
                            )
                        }
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
                            onChange={(result: ColorResult) =>
                                setCustomColor(result.hex)
                            }
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
