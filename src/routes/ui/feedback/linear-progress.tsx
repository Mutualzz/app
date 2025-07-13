<<<<<<< HEAD
=======
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
>>>>>>> c64b18b0ba63d0fb8b9fb255c9575caf8f81ea36
import {
    Button,
    Checkbox,
    Divider,
    Input,
    LinearProgress,
    Paper,
    Radio,
    RadioGroup,
    randomHexColor,
    Slider,
    Stack,
    Typography,
    useColorInput,
    type Color,
    type ColorLike,
    type LinearProgressAnimation,
    type Size,
    type Variant,
<<<<<<< HEAD
} from "@mutualzz/ui";
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
=======
} from "@ui";
>>>>>>> c64b18b0ba63d0fb8b9fb255c9575caf8f81ea36
import capitalize from "lodash-es/capitalize";
import { useState } from "react";

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

    const [customColors, setCustomColors] = useState<ColorLike[]>([]);
    const [colorToDelete, setColorToDelete] = useState<ColorLike | null>(null);

    const {
        inputValue: inputColorValue,
        color: customColor,
        isInvalid,
        handleChange,
        validate,
        setColorDirectly,
    } = useColorInput<Color | ColorLike>();

    const allProgresses = [...colors, ...customColors].map((c) =>
        variants.map((v) => (
            <Stack
                direction="column"
                alignItems="center"
                justifyContent="center"
                key={`${v}-${c}`}
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
        <Stack width="100%" spacing={10} direction="row">
            <Paper
                width="100%"
                direction={variant === "all" ? "column" : "row"}
                alignItems="flex-start"
                alignContent="flex-start"
                wrap="wrap"
                p={20}
                spacing={25}
            >
                {variant === "all" &&
                    allProgresses.map((progresses, i) => (
                        <Stack direction="row" spacing={5} key={i}>
                            {progresses}
                        </Stack>
                    ))}
                {variant !== "all" && progresses}
            </Paper>
            <Paper alignItems="center" direction="column" p={20} spacing={5}>
                <Divider>Playground</Divider>
                <Stack width="100%" direction="column" spacing={5}>
                    <Stack direction="column" spacing={5}>
                        <label>Variant</label>
                        <RadioGroup
                            onChange={(_, vriant) =>
                                setVariant(vriant as Variant)
                            }
                            value={variant}
                            name="variant"
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
                        <label>Animation</label>
                        <RadioGroup
                            onChange={(_, animation) =>
                                setAnimation(
                                    animation as LinearProgressAnimation,
                                )
                            }
                            value={animation}
                            name="animation"
                        >
                            {animations.map((a) => (
                                <Radio
                                    key={a}
                                    value={a}
                                    label={capitalize(a)}
                                    checked={animation === a}
                                    color="neutral"
                                    onChange={() => setAnimation(a)}
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
                            <label>Length</label>
                            <Checkbox
                                checked={customLengthToggle}
                                label="Custom"
                                onChange={() => {
                                    setCustomLengthToggle((prev) => {
                                        if (prev) setLength("md");
                                        else
                                            setLength(
                                                Math.round((240 + 80) / 2),
                                            );
                                        return !prev;
                                    });
                                }}
                            />
                        </Stack>
                        {customLengthToggle ? (
                            <Slider
                                value={length as number}
                                min={80}
                                max={240}
                                onChange={(e) =>
                                    setLength(Number(e.target.value))
                                }
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => `${value}px`}
                            />
                        ) : (
                            <RadioGroup
                                onChange={(_, length) =>
                                    setLength(length as Size)
                                }
                                value={length as Size}
                                name="length"
                                row
                            >
                                {Object.keys(sizeNames).map((s) => (
                                    <Radio
                                        key={s}
                                        value={s}
                                        label={sizeNames[s as Size]}
                                        checked={length === s}
                                        color="neutral"
                                        onChange={() => setLength(s as Size)}
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
                            <label>Thickness</label>
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
                            />
                        </Stack>
                        {customThicknessToggle ? (
                            <Slider
                                value={thickness as number}
                                min={4}
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
                                row
                            >
                                {Object.keys(sizeNames).map((s) => (
                                    <Radio
                                        key={s}
                                        value={s}
                                        label={sizeNames[s as Size]}
                                        checked={thickness === s}
                                        color="neutral"
                                        onChange={() => setThickness(s as Size)}
                                    />
                                ))}
                            </RadioGroup>
                        )}
                    </Stack>
                    <Divider />
                    <Stack direction="column" spacing={5}>
                        <label>States</label>
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
                    <Divider />
                    <Stack direction="column" spacing={5}>
                        <label>Custom Color</label>
                        <Stack
                            alignContent="center"
                            direction="row"
                            spacing={5}
                        >
                            <Input
                                variant="solid"
                                size="lg"
                                color="primary"
                                fullWidth
                                error={isInvalid}
                                placeholder="Enter a color (e.g., #ff0000)"
                                value={inputColorValue}
                                onChange={(e) => handleChange(e.target.value)}
                                onBlur={validate}
                            />
                            <Button
                                color="primary"
                                disabled={!customColor}
                                onClick={() => {
                                    setCustomColors(
                                        (prev) =>
                                            [
                                                ...prev,
                                                customColor,
                                            ] as ColorLike[],
                                    );
                                    setColorDirectly(randomHexColor());
                                    setColorToDelete(customColor as ColorLike);
                                }}
                            >
                                Add Color
                            </Button>
                        </Stack>
                        {customColors.length > 0 && (
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={5}
                            >
                                <select
                                    value={colorToDelete ?? ""}
                                    onChange={(e) => {
                                        setColorToDelete(
                                            e.target.value.trim() as ColorLike,
                                        );
                                    }}
                                    css={{
                                        padding: 10,
                                        borderRadius: 5,
                                        border: "1px solid #ccc",
                                        backgroundColor: "#f9f9f9",
                                        width: "100%",
                                    }}
                                >
                                    {customColors.map((color) => (
                                        <option key={color} value={color}>
                                            {color}
                                        </option>
                                    ))}
                                </select>
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
                                    Delete Color
                                </Button>
                            </Stack>
                        )}
                    </Stack>
                </Stack>
            </Paper>
        </Stack>
    );
}
