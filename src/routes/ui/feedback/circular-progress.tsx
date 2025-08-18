import {
    Button,
    Checkbox,
    CircularProgress,
    Divider,
    Input,
    Option,
    Paper,
    Radio,
    RadioGroup,
    randomColor,
    Select,
    Slider,
    Stack,
    Typography,
    type Color,
    type ColorLike,
    type Size,
    type Variant,
} from "@mutualzz/ui";
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
import capitalize from "lodash-es/capitalize";
import { useState } from "react";

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
        <Stack width="100%" spacing={10} direction="row">
            <Paper
                width="100%"
                direction={variant === "all" ? "column" : "row"}
                alignItems="flex-start"
                alignContent="flex-start"
                wrap={variant === "all" ? "nowrap" : "wrap"}
                p={20}
                spacing={variant === "all" ? 10 : 5}
                overflowY="auto"
            >
                {variant === "all" &&
                    allProgresses.map((progresses, i) => (
                        <Stack direction="row" spacing={5} key={i}>
                            {progresses}
                        </Stack>
                    ))}
                {variant !== "all" && progresses}
            </Paper>
            <Paper width="25%" overflowY="auto" direction="column" p={20}>
                <Divider>Playground</Divider>
                <Stack direction="column" spacing={5}>
                    <Typography>Variant</Typography>
                    <RadioGroup
                        onChange={(_, vriant) => setVariant(vriant as Variant)}
                        value={variant}
                        name="variants"
                    >
                        <Radio
                            key="all"
                            value="all"
                            label="All"
                            checked={variant === "all"}
                            color="neutral"
                            onChange={() => setVariant("all")}
                        />
                        {variants.map((v) => (
                            <Radio
                                key={v}
                                value={v}
                                label={capitalize(v)}
                                checked={variant === v}
                                color="neutral"
                                onChange={() => setVariant(v)}
                            />
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
                        >
                            {Object.keys(sizeNames).map((s) => (
                                <Radio
                                    key={s}
                                    value={s}
                                    label={sizeNames[s as Size]}
                                    checked={size === s}
                                    color="neutral"
                                    onChange={() => setSize(s as Size)}
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
                    <Typography>Custom Color</Typography>
                    <Stack alignContent="center" direction="row" spacing={5}>
                        <Input
                            type="color"
                            variant="solid"
                            size="lg"
                            color="primary"
                            fullWidth
                            placeholder="Enter a color (e.g., #ff0000, red)"
                            value={customColor}
                            onChange={setCustomColor}
                        />
                        <Button
                            color="primary"
                            disabled={!customColor}
                            onClick={() => {
                                setCustomColors(
                                    (prev) =>
                                        [...prev, customColor] as ColorLike[],
                                );
                                setCustomColor(randomColor());
                                setColorToDelete(customColor);
                            }}
                        >
                            Add Color
                        </Button>
                    </Stack>
                    {customColors.length > 0 && (
                        <Stack alignItems="center" direction="row" spacing={5}>
                            <Select
                                value={colorToDelete ?? ""}
                                onValueChange={(value) => {
                                    setColorToDelete(
                                        value.toString().trim() as ColorLike,
                                    );
                                }}
                            >
                                {customColors.map((color) => (
                                    <Option key={color} value={color}>
                                        {color}
                                    </Option>
                                ))}
                            </Select>
                            <Button
                                color="danger"
                                onClick={() => {
                                    setCustomColors((prev) => {
                                        const updated = prev.filter(
                                            (color) => color !== colorToDelete,
                                        );
                                        setColorToDelete(
                                            updated.length > 0
                                                ? updated[updated.length - 1]
                                                : null,
                                        );
                                        return updated;
                                    });
                                }}
                            >
                                Delete Color
                            </Button>
                        </Stack>
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
            </Paper>
        </Stack>
    );
}
