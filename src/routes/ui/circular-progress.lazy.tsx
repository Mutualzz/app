import { createLazyFileRoute } from "@tanstack/react-router";
import { Button } from "@ui/Button/Button";
import { CircularProgress } from "@ui/CircularProgress/CircularProgress";
import type {
    CircularProgressColor,
    CircularProgressSize,
    CircularProgressVariant,
} from "@ui/CircularProgress/CircularProgress.types";
import { Paper } from "@ui/Paper/Paper";
import { Stack } from "@ui/Stack/Stack";
import capitalize from "lodash/capitalize";
import chunk from "lodash/chunk";
import { useState } from "react";

export const Route = createLazyFileRoute("/ui/circular-progress")({
    component: PlaygroundProgresses,
});

const sizeMap = {
    sm: "Small",
    md: "Medium",
    lg: "Large",
};

function PlaygroundProgresses() {
    const [size, setSize] = useState<CircularProgressSize>("md");
    const [determinate, setDeterminate] = useState(false);
    const [value, setValue] = useState(0);

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
        "error",
        "warning",
        "info",
    ] as CircularProgressColor[];

    let progresses = [];

    for (const variant of variants) {
        for (const color of colors) {
            progresses.push(
                <Stack
                    direction="column"
                    gap={10}
                    key={`${variant}-${color}-stack`}
                >
                    <label>{`${sizeMap[size]} ${capitalize(variant)} ${capitalize(color)}`}</label>
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

    progresses = chunk(progresses, 6).map((row, index) => (
        <Stack
            justifyContent="center"
            alignItems="center"
            key={index}
            padding={20}
            gap={50}
        >
            {row}
        </Stack>
    ));

    return (
        <Stack direction="column" alignItems="center" paddingTop={40}>
            <Paper
                direction="column"
                justifyContent="center"
                alignItems="center"
                padding={20}
                gap={5}
                style={{
                    width: "100%",
                    maxWidth: 1600,
                }}
            >
                <Stack direction="column">{progresses}</Stack>
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    direction="row"
                    gap={40}
                >
                    <Button
                        color={determinate ? "success" : "error"}
                        variant="soft"
                        onClick={() => setDeterminate((prev) => !prev)}
                    >
                        Turn {determinate ? "off" : "on"} determinate
                    </Button>
                    <Stack
                        direction="column"
                        justifyContent="center"
                        alignItems="center"
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
                    <select
                        value={size}
                        onChange={(e) =>
                            setSize(e.target.value as CircularProgressSize)
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
                </Stack>
            </Paper>
        </Stack>
    );
}
