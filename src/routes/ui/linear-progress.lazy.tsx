import { createLazyFileRoute } from "@tanstack/react-router";
import { Divider } from "@ui/components/data-display/Divider/Divider";
import { LinearProgress } from "@ui/components/feedback/LinearProgress/LinearProgress";
import type {
    LinearProgressAnimation,
    LinearProgressColor,
    LinearProgressLength,
    LinearProgressThickness,
    LinearProgressVariant,
} from "@ui/components/feedback/LinearProgress/LinearProgress.types";
import { Button } from "@ui/components/inputs/Button/Button";
import { Checkbox } from "@ui/components/inputs/Checkbox/Checkbox";
import { Stack } from "@ui/components/layout/Stack/Stack";
import { Paper } from "@ui/components/surfaces/Paper/Paper";
import { useColorInput } from "@ui/hooks/useColorInput";
import type { ColorLike } from "@ui/types";
import { randomHexColor } from "@ui/utils/randomHexColor";

import capitalize from "lodash/capitalize";
import chunk from "lodash/chunk";
import { useState } from "react";

export const Route = createLazyFileRoute("/ui/linear-progress")({
    component: PlaygroundLinearProgress,
});

const variants = [
    "solid",
    "outlined",
    "plain",
    "soft",
] as LinearProgressVariant[];

const colors = [
    "primary",
    "neutral",
    "success",
    "danger",
    "warning",
    "info",
] as LinearProgressColor[];

const animations = [
    "bounce",
    "scale-in-out",
    "slide",
    "wave",
] as LinearProgressAnimation[];

function PlaygroundLinearProgress() {
    const [thickness, setThickness] = useState<LinearProgressThickness>("md");
    const [length, setLength] = useState<LinearProgressLength>("md");

    const [customLength, setCustomLength] = useState(false);
    const [customThickness, setCustomThickness] = useState(false);

    const [animation, setAnimation] =
        useState<LinearProgressAnimation>("bounce");
    const [determinate, setDeterminate] = useState(false);
    const [value, setValue] = useState(0);

    const [customColors, setCustomColors] = useState<ColorLike[]>([]);

    const [colorToDelete, setColorToDelete] = useState<ColorLike | null>(null);

    const {
        inputValue: inputColor,
        color: customColor,
        isInvalid,
        handleChange,
        validate,
        setColorDirectly,
    } = useColorInput<LinearProgressColor>();

    let progresses = [];

    for (const color of [...colors, ...customColors]) {
        for (const variant of variants) {
            progresses.push(
                <Stack
                    direction="column"
                    spacing={10}
                    key={`${variant}-${color}-stack`}
                >
                    <label>{`${capitalize(variant)} ${capitalize(color)}`}</label>
                    <LinearProgress
                        key={`${variant}-${color}-progress`}
                        variant={variant}
                        color={color}
                        length={length}
                        thickness={thickness}
                        animation={animation}
                        value={value}
                        determinate={determinate}
                    />
                </Stack>,
            );
        }
    }

    progresses = chunk(progresses, variants.length).map((row, index) => (
        <Stack key={index} p={20} spacing={50}>
            {row}
        </Stack>
    ));

    return (
        <Stack
            pt={40}
            width="100%"
            spacing={20}
            direction="row"
            justifyContent="center"
        >
            <Paper direction="column" alignItems="center" p={20} spacing={5}>
                <Stack direction="column">{progresses}</Stack>
            </Paper>

            <Paper direction="column" p={20} spacing={10}>
                <h2
                    css={{
                        textAlign: "center",
                    }}
                >
                    Customization
                </h2>
                <Stack justifyContent="center" direction="column" spacing={10}>
                    <Divider>States</Divider>
                    <Button
                        color={determinate ? "success" : "danger"}
                        variant="soft"
                        onClick={() => setDeterminate((prev) => !prev)}
                    >
                        Turn {determinate ? "off" : "on"} determinate
                    </Button>
                    <Stack
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={5}
                    >
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={value}
                            onChange={(e) => setValue(Number(e.target.value))}
                            disabled={!determinate}
                        />
                        <label>{value}%</label>
                    </Stack>
                </Stack>
                <Stack justifyContent="center" direction="column" spacing={5}>
                    <Divider>Animation</Divider>
                    <select
                        value={animation}
                        onChange={(e) =>
                            setAnimation(
                                e.target.value as LinearProgressAnimation,
                            )
                        }
                        style={{
                            padding: 10,
                            borderRadius: 5,
                            border: "1px solid #ccc",
                            backgroundColor: "#f9f9f9",
                        }}
                    >
                        {animations.map((animation) => (
                            <option key={animation} value={animation}>
                                {capitalize(animation)}
                            </option>
                        ))}
                    </select>
                </Stack>
                <Divider />
                <Stack
                    spacing={5}
                    justifyContent="center"
                    alignItems="center"
                    direction="column"
                >
                    <Checkbox
                        variant="outlined"
                        label="Custom Length"
                        checked={customLength}
                        onChange={() => {
                            setCustomLength((prev) => !prev);
                            setLength("md");
                        }}
                    />

                    {customLength ? (
                        <input
                            type="text"
                            value={length}
                            onChange={(e) =>
                                setLength(
                                    e.target.value.trim() as LinearProgressLength,
                                )
                            }
                            placeholder="Custom length"
                            style={{
                                width: "100%",
                                padding: 10,
                                borderRadius: 5,
                                border: "1px solid #ccc",
                                backgroundColor: "#f9f9f9",
                            }}
                        />
                    ) : (
                        <select
                            value={length}
                            onChange={(e) =>
                                setLength(
                                    e.target.value.trim() as LinearProgressLength,
                                )
                            }
                            style={{
                                width: "100%",
                                padding: 10,
                                borderRadius: 5,
                                border: "1px solid #ccc",
                                backgroundColor: "#f9f9f9",
                            }}
                        >
                            <option value="sm">Small</option>
                            <option value="md">Medium</option>
                            <option value="lg">Large</option>
                        </select>
                    )}
                </Stack>
                <Divider />
                <Stack
                    spacing={5}
                    justifyContent="center"
                    alignItems="center"
                    direction="column"
                >
                    <Checkbox
                        variant="outlined"
                        label="Custom Thickness"
                        checked={customThickness}
                        onChange={() => {
                            setCustomThickness((prev) => !prev);
                            setThickness("md");
                        }}
                    />

                    {customThickness ? (
                        <input
                            type="text"
                            value={thickness}
                            onChange={(e) =>
                                setThickness(
                                    e.target.value.trim() as LinearProgressThickness,
                                )
                            }
                            placeholder="Custom thickness"
                            style={{
                                width: "100%",
                                padding: 10,
                                borderRadius: 5,
                                border: "1px solid #ccc",
                                backgroundColor: "#f9f9f9",
                            }}
                        />
                    ) : (
                        <select
                            value={thickness}
                            onChange={(e) =>
                                setThickness(
                                    e.target.value.trim() as LinearProgressThickness,
                                )
                            }
                            style={{
                                width: "100%",
                                padding: 10,
                                borderRadius: 5,
                                border: "1px solid #ccc",
                                backgroundColor: "#f9f9f9",
                            }}
                        >
                            <option value="sm">Small</option>
                            <option value="md">Medium</option>
                            <option value="lg">Large</option>
                        </select>
                    )}
                </Stack>

                <Stack justifyContent="center" direction="column" spacing={5}>
                    <Divider>Custom Colors</Divider>
                    <Stack
                        justifyContent="center"
                        alignItems="center"
                        direction="row"
                        spacing={10}
                    >
                        <input
                            type="text"
                            value={inputColor}
                            placeholder="Input custom color"
                            onChange={(e) => handleChange(e.target.value)}
                            onBlur={validate}
                            style={{
                                padding: 10,
                                borderRadius: 5,
                                border: isInvalid
                                    ? "1px solid red"
                                    : "1px solid #ccc",
                                backgroundColor: "#f9f9f9",
                            }}
                        />
                        <Button
                            variant="soft"
                            color="primary"
                            disabled={!customColor}
                            onClick={() => {
                                setCustomColors(
                                    (prev) =>
                                        [...prev, customColor] as ColorLike[],
                                );
                                setColorDirectly(randomHexColor());
                                setColorToDelete(customColor as ColorLike);
                            }}
                        >
                            Add Color
                        </Button>
                    </Stack>
                    {customColors.length > 0 && (
                        <Stack alignItems="center" direction="row" spacing={10}>
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
                                }}
                            >
                                {customColors.map((color) => (
                                    <option key={color} value={color}>
                                        {color}
                                    </option>
                                ))}
                            </select>
                            <Button
                                variant="soft"
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
            </Paper>
        </Stack>
    );
}
