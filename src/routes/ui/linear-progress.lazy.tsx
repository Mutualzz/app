import { createLazyFileRoute } from "@tanstack/react-router";
import { Divider } from "@ui/components/data-display/Divider/Divider";
import { Typography } from "@ui/components/data-display/Typography/Typography";
import { LinearProgress } from "@ui/components/feedback/LinearProgress/LinearProgress";
import type { LinearProgressAnimation } from "@ui/components/feedback/LinearProgress/LinearProgress.types";
import { Stack } from "@ui/components/layout/Stack/Stack";
import { Paper } from "@ui/components/surfaces/Paper/Paper";
import { useColorInput } from "@ui/hooks/useColorInput";
import {
    Button,
    Checkbox,
    RadioButton,
    RadioButtonGroup,
    randomHexColor,
} from "@ui/index";
import type { Color, ColorLike, Size, Variant } from "@ui/types";

import capitalize from "lodash/capitalize";
import { useState } from "react";

export const Route = createLazyFileRoute("/ui/linear-progress")({
    component: PlaygroundLinearProgress,
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
        <Stack
            pt={40}
            spacing={20}
            direction="row"
            justifyContent="space-around"
        >
            <Paper
                direction={variant === "all" ? "column" : "row"}
                alignItems="flex-start"
                alignContent="flex-start"
                wrap="wrap"
                p={20}
                spacing={25}
                width={1200}
            >
                {variant === "all" &&
                    allProgresses.map((progresses, i) => (
                        <Stack direction="row" spacing={5} key={i}>
                            {progresses}
                        </Stack>
                    ))}
                {variant !== "all" && progresses}
            </Paper>

            <Paper width={300} direction="column" p={20} spacing={10}>
                <Divider>Playground</Divider>
                <Stack width="100%" direction="column" spacing={40}>
                    <Stack direction="column" spacing={10}>
                        <label>Variant</label>
                        <RadioButtonGroup
                            onChange={(_, vriant) =>
                                setVariant(vriant as Variant)
                            }
                            value={variant}
                            name="variant"
                        >
                            <RadioButton
                                key="all"
                                value="all"
                                label="All"
                                checked={variant === "all"}
                                color="neutral"
                                onChange={() => setVariant("all")}
                            />
                            {variants.map((v) => (
                                <RadioButton
                                    key={v}
                                    value={v}
                                    label={capitalize(v)}
                                    checked={variant === v}
                                    color="neutral"
                                    onChange={() => setVariant(v)}
                                />
                            ))}
                        </RadioButtonGroup>
                    </Stack>
                    <Stack direction="column" spacing={10}>
                        <label>Animation</label>
                        <RadioButtonGroup
                            onChange={(_, animation) =>
                                setAnimation(
                                    animation as LinearProgressAnimation,
                                )
                            }
                            value={animation}
                            name="animation"
                        >
                            {animations.map((a) => (
                                <RadioButton
                                    key={a}
                                    value={a}
                                    label={capitalize(a)}
                                    checked={animation === a}
                                    color="neutral"
                                    onChange={() => setAnimation(a)}
                                />
                            ))}
                        </RadioButtonGroup>
                    </Stack>
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
                                        setLength("md");
                                        return !prev;
                                    });
                                }}
                            />
                        </Stack>
                        {customLengthToggle ? (
                            <input
                                type="range"
                                value={length}
                                min={80}
                                max={240}
                                onChange={(e) =>
                                    setLength(Number(e.target.value))
                                }
                                style={{
                                    padding: 10,
                                    borderRadius: 5,
                                    border: isInvalid
                                        ? "1px solid red"
                                        : "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                    width: "100%",
                                }}
                            />
                        ) : (
                            <RadioButtonGroup
                                onChange={(_, length) =>
                                    setLength(length as Size)
                                }
                                value={length as Size}
                                name="length"
                                row
                            >
                                {Object.keys(sizeNames).map((s) => (
                                    <RadioButton
                                        key={s}
                                        value={s}
                                        label={sizeNames[s as Size]}
                                        checked={length === s}
                                        color="neutral"
                                        onChange={() => setLength(s as Size)}
                                    />
                                ))}
                            </RadioButtonGroup>
                        )}
                    </Stack>
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
                                        setThickness("md");
                                        return !prev;
                                    });
                                }}
                            />
                        </Stack>
                        {customThicknessToggle ? (
                            <input
                                type="range"
                                value={thickness}
                                min={4}
                                max={16}
                                onChange={(e) =>
                                    setThickness(Number(e.target.value))
                                }
                                style={{
                                    padding: 10,
                                    borderRadius: 5,
                                    border: isInvalid
                                        ? "1px solid red"
                                        : "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                    width: "100%",
                                }}
                            />
                        ) : (
                            <RadioButtonGroup
                                onChange={(_, thickness) =>
                                    setThickness(thickness as Size)
                                }
                                value={thickness as Size}
                                name="thickness"
                                row
                            >
                                {Object.keys(sizeNames).map((s) => (
                                    <RadioButton
                                        key={s}
                                        value={s}
                                        label={sizeNames[s as Size]}
                                        checked={thickness === s}
                                        color="neutral"
                                        onChange={() => setThickness(s as Size)}
                                    />
                                ))}
                            </RadioButtonGroup>
                        )}
                    </Stack>
                    <Stack direction="column" spacing={5}>
                        <Checkbox
                            checked={determinate}
                            label="Determinate"
                            onChange={() => setDeterminate((prev) => !prev)}
                        />
                        {determinate && (
                            <input
                                type="range"
                                value={value}
                                min={0}
                                max={100}
                                onChange={(e) =>
                                    setValue(Number(e.target.value))
                                }
                                style={{
                                    padding: 10,
                                    borderRadius: 5,
                                    border: isInvalid
                                        ? "1px solid red"
                                        : "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                    width: "100%",
                                }}
                            />
                        )}
                    </Stack>
                    <Stack direction="column" spacing={10}>
                        <label>Custom Color</label>
                        <Stack
                            alignContent="center"
                            direction="row"
                            spacing={5}
                        >
                            <input
                                type="text"
                                value={inputColorValue}
                                onChange={(e) => handleChange(e.target.value)}
                                onBlur={validate}
                                style={{
                                    padding: 10,
                                    borderRadius: 5,
                                    border: isInvalid
                                        ? "1px solid red"
                                        : "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                    width: "100%",
                                }}
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
                                spacing={10}
                            >
                                <select
                                    value={colorToDelete ?? ""}
                                    onChange={(e) => {
                                        setColorToDelete(
                                            e.target.value.trim() as ColorLike,
                                        );
                                    }}
                                    style={{
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
