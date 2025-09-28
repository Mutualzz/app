import { PlaygroundContent } from "@components/Playground/PlaygroundContent";
import { PlaygroundRightSidebar } from "@components/Playground/PlaygroundRightSidebar";
import {
    randomColor,
    type Color,
    type ColorLike,
    type Size,
    type Variant,
} from "@mutualzz/ui-core";
import {
    Button,
    Checkbox,
    Divider,
    IconButton,
    Input,
    LinearProgress,
    Option,
    Radio,
    RadioGroup,
    Select,
    Slider,
    Stack,
    Typography,
    type LinearProgressAnimation,
} from "@mutualzz/ui-web";
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
import capitalize from "lodash-es/capitalize";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";

export const Route = createFileRoute("/ui/feedback/linear-progress")({
    component: PlaygroundLinearProgress,
    head: () => ({
        meta: [
            ...seo({
                title: "Linear Progress - Mutualzz UI",
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

const animations = [
    "bounce",
    "scale-in-out",
    "slide",
    "wave",
] as LinearProgressAnimation[];

const sizeNames = {
    sm: "Small",
    md: "Medium",
    lg: "Large",
};

function PlaygroundLinearProgress() {
    const [variant, setVariant] = useState<Variant | "all">("solid");

    const [thickness, setThickness] = useState<Size | number>("md");
    const [length, setLength] = useState<Size | number>("md");

    const [customLengthToggle, setCustomLengthToggle] = useState(false);
    const [customThicknessToggle, setCustomThicknessToggle] = useState(false);

    const [animation, setAnimation] =
        useState<LinearProgressAnimation>("bounce");

    const [determinate, setDeterminate] = useState(false);
    const [value, setValue] = useState(0);

    const [customColor, setCustomColor] = useState<ColorLike>(randomColor());
    const [customColors, setCustomColors] = useState<ColorLike[]>([]);
    const [colorToDelete, setColorToDelete] = useState<ColorLike | null>(null);

    const allProgresses = [...colors, ...customColors].map((c) =>
        variants.map((v) => (
            <Stack
                direction="column"
                alignItems="center"
                justifyContent="center"
                key={`${v}-${c}`}
                spacing={5}
            >
                <Typography>
                    {capitalize(v)} {capitalize(c)}
                </Typography>
                <LinearProgress
                    key={`${v}-${c}-progress`}
                    variant={v}
                    color={c}
                    length={length}
                    thickness={thickness}
                    animation={animation}
                    value={value}
                    determinate={determinate}
                />
            </Stack>
        )),
    );

    const progresses = [...colors, ...customColors].map((c) => (
        <Stack
            direction="column"
            alignItems="center"
            justifyContent="center"
            key={c}
        >
            <Typography>
                {capitalize(variant)} {capitalize(c)}
            </Typography>
            <LinearProgress
                key={`${variant}-${c}-progress`}
                variant={variant as Variant}
                color={c}
                length={length}
                thickness={thickness}
                animation={animation}
                value={value}
                determinate={determinate}
            />
        </Stack>
    ));

    return (
        <Stack width="100%" direction="row">
            <PlaygroundContent
                direction={variant === "all" ? "column" : "row"}
                alignItems="flex-start"
                alignContent="flex-start"
                wrap={variant === "all" ? "nowrap" : "wrap"}
                spacing={25}
            >
                {variant === "all" &&
                    allProgresses.map((progresses, i) => (
                        <Stack direction="row" spacing={10} key={i}>
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
                        name="variant"
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
                    <Typography>Animation</Typography>
                    <RadioGroup
                        onChange={(_, animation) =>
                            setAnimation(animation as LinearProgressAnimation)
                        }
                        value={animation}
                        name="animation"
                        color="neutral"
                        spacing={5}
                    >
                        {animations.map((a) => (
                            <Radio key={a} value={a} label={capitalize(a)} />
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
                        <Typography>Length</Typography>
                        <Checkbox
                            checked={customLengthToggle}
                            label="Custom"
                            onChange={() => {
                                setCustomLengthToggle((prev) => {
                                    if (prev) setLength("md");
                                    else setLength(Math.round((240 + 80) / 2));
                                    return !prev;
                                });
                            }}
                            size="sm"
                        />
                    </Stack>
                    {customLengthToggle ? (
                        <Slider
                            value={length as number}
                            min={80}
                            max={240}
                            onChange={(e) => setLength(Number(e.target.value))}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(value) => `${value}px`}
                        />
                    ) : (
                        <RadioGroup
                            onChange={(_, length) => setLength(length as Size)}
                            value={length as Size}
                            name="length"
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
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={5}
                    >
                        <Typography>Thickness</Typography>
                        <Checkbox
                            checked={customThicknessToggle}
                            label="Custom"
                            onChange={() => {
                                setCustomThicknessToggle((prev) => {
                                    if (prev) setThickness("md");
                                    else setThickness((16 + 4) / 2);
                                    return !prev;
                                });
                            }}
                            size="sm"
                        />
                    </Stack>
                    {customThicknessToggle ? (
                        <Slider
                            value={thickness as number}
                            min={2}
                            max={16}
                            onChange={(e) =>
                                setThickness(Number(e.target.value))
                            }
                            valueLabelDisplay="auto"
                            valueLabelFormat={(value) => `${value}px`}
                        />
                    ) : (
                        <RadioGroup
                            onChange={(_, thickness) =>
                                setThickness(thickness as Size)
                            }
                            value={thickness as Size}
                            name="thickness"
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
                    <Stack direction="column" spacing={10}>
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
                                onChange={(e) =>
                                    setValue(Number(e.target.value))
                                }
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => `${value}%`}
                            />
                        )}
                    </Stack>
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
