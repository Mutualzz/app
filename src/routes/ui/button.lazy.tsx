import { createLazyFileRoute } from "@tanstack/react-router";
import { Button } from "@ui/inputs/Button/Button";
import type {
    ButtonColor,
    ButtonSize,
    ButtonVariant,
} from "@ui/inputs/Button/Button.types";
import { Stack } from "@ui/layout/Stack/Stack";
import { Paper } from "@ui/surfaces/Paper/Paper";
import capitalize from "lodash/capitalize";
import chunk from "lodash/chunk";
import { useState } from "react";

export const Route = createLazyFileRoute("/ui/button")({
    component: PlaygroundButtons,
});

const sizeMap = {
    sm: "Small",
    md: "Medium",
    lg: "Large",
};

function PlaygroundButtons() {
    const [size, setSize] = useState<ButtonSize>("md");
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);

    // all the button variants and colors
    const variants = ["solid", "outlined", "plain", "soft"] as ButtonVariant[];
    const colors = [
        "primary",
        "neutral",
        "success",
        "error",
        "warning",
        "info",
    ] as ButtonColor[];

    let buttons = [];

    for (const variant of variants) {
        for (const color of colors) {
            buttons.push(
                <Button
                    key={`${variant}-${color}-button`}
                    variant={variant}
                    color={color}
                    size={size}
                    loading={loading}
                    disabled={disabled}
                >
                    {`${sizeMap[size]} ${capitalize(variant)} ${capitalize(color)}`}
                </Button>,
            );
        }
    }

    buttons = chunk(buttons, 6).map((row, index) => (
        <Stack
            justifyContent="center"
            alignItems="center"
            key={index}
            padding={20}
            gap={10}
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
                    maxWidth: 1400,
                }}
            >
                <Stack direction="column">{buttons}</Stack>
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    direction="row"
                    gap={40}
                >
                    <Button
                        onClick={() => setLoading((prev) => !prev)}
                        variant="soft"
                        color={loading ? "error" : "success"}
                        size="md"
                    >
                        Turn {loading ? "Off" : "On"} Loading
                    </Button>
                    <Button
                        onClick={() => setDisabled((prev) => !prev)}
                        variant="soft"
                        color={disabled ? "error" : "success"}
                        size="md"
                    >
                        Turn {disabled ? "Off" : "On"} Disabled
                    </Button>
                    <select
                        value={size}
                        onChange={(e) => setSize(e.target.value as ButtonSize)}
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
