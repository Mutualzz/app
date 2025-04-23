import { useColorInput } from "@hooks/useColorInput";
import type { ColorLike } from "@mutualzz/theme";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Divider } from "@ui/data-display/Divider/Divider";
import { CircularProgress } from "@ui/feedback/CircularProgress/CircularProgress";
import type {
    CircularProgressColor,
    CircularProgressSize,
    CircularProgressVariant,
} from "@ui/feedback/CircularProgress/CircularProgress.types";
import { Button } from "@ui/inputs/Button/Button";
import { Stack } from "@ui/layout/Stack/Stack";
import { Paper } from "@ui/surfaces/Paper/Paper";

import capitalize from "lodash/capitalize";
import chunk from "lodash/chunk";
import { useState } from "react";

const variants = [
    "solid",
    "outlined",
    "plain",
    "soft",
] as CircularProgressVariant[];

const colors = [
    "primary",
    "neutral",
    "success",
    "danger",
    "warning",
    "info",
] as CircularProgressColor[];

export const Route = createLazyFileRoute("/ui/circular-progress")({
    component: PlaygroundCircularProgress,
});

function PlaygroundCircularProgress() {
    const [size, setSize] = useState<CircularProgressSize>("md");
    const [determinate, setDeterminate] = useState(false);
    const [value, setValue] = useState(0);

    const [customSize, setCustomSize] = useState(false);

    const [customColors, setCustomColors] = useState<ColorLike[]>([]);
    const [colorToDelete, setColorToDelete] = useState<ColorLike | null>(null);

    const {
        inputValue: inputColor,
        color: customColor,
        isInvalid,
        handleChange,
        validate,
    } = useColorInput();

    let progresses = [];

    for (const color of [...colors, ...customColors]) {
        for (const variant of variants) {
            progresses.push(
                <Stack
                    direction="column"
                    gap={10}
                    key={`${variant}-${color}-stack`}
                >
                    <label>{`${capitalize(variant)} ${capitalize(color)}`}</label>
                    <CircularProgress
                        key={`${variant}-${color}-progress`}
                        variant={variant}
                        color={color}
                        size={size}
                        value={value}
                        determinate={determinate}
                    />
                </Stack>,
            );
        }
    }

    progresses = chunk(progresses, variants.length).map((row, index) => (
        <Stack key={index} padding={20} gap={50}>
            {row}
        </Stack>
    ));

    return (
        <Stack
            paddingTop={40}
            width="100%"
            gap={20}
            direction="row"
            justifyContent="center"
        >
            <Paper direction="column" alignItems="center" padding={20} gap={5}>
                <Stack direction="column">{progresses}</Stack>
            </Paper>
            <Paper direction="column" padding={20} gap={10}>
                <h2
                    css={{
                        textAlign: "center",
                    }}
                >
                    Customization
                </h2>
                <Stack direction="column" padding={20} gap={10}>
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
                        gap={5}
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
                <Stack gap={5} justifyContent="center" direction="column">
                    <Divider>Properties</Divider>
                    <Stack
                        justifyContent="center"
                        alignItems="center"
                        direction="row"
                        gap={10}
                    >
                        <input
                            type="checkbox"
                            checked={customSize}
                            onChange={() => {
                                setCustomSize((prev) => !prev);
                                setSize("md");
                            }}
                        />
                        <label>Custom Size</label>
                    </Stack>
                    {customSize ? (
                        <input
                            type="text"
                            value={size}
                            onChange={(e) =>
                                setSize(
                                    e.target.value.trim() as CircularProgressSize,
                                )
                            }
                            placeholder="Custom size"
                            style={{
                                padding: 10,
                                borderRadius: 5,
                                border: "1px solid #ccc",
                                backgroundColor: "#f9f9f9",
                            }}
                        />
                    ) : (
                        <select
                            value={size}
                            onChange={(e) =>
                                setSize(
                                    e.target.value.trim() as CircularProgressSize,
                                )
                            }
                            style={{
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
                <Stack justifyContent="center" direction="column" gap={5}>
                    <Divider>Custom Colors</Divider>
                    <Stack
                        justifyContent="center"
                        alignItems="center"
                        direction="row"
                        gap={10}
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
                                if (!customColor) return;

                                setCustomColors(
                                    (prev) =>
                                        [...prev, customColor] as ColorLike[],
                                );
                                handleChange("#ffffff");
                                setColorToDelete(customColor as ColorLike);
                            }}
                        >
                            Add Color
                        </Button>
                    </Stack>
                    {customColors.length > 0 && (
                        <Stack alignItems="center" direction="row" gap={10}>
                            <select
                                value={colorToDelete ?? ""}
                                onChange={(e) => {
                                    setColorToDelete(
                                        e.target.value as ColorLike,
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
                                    setCustomColors((prev) =>
                                        prev.filter(
                                            (color) => color !== colorToDelete,
                                        ),
                                    );
                                    setColorToDelete(customColors[0]);
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
