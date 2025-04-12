import type { ColorLike } from "@mutualzz/theme";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Button } from "@ui/inputs/Button/Button";
import type {
    ButtonColor,
    ButtonSize,
    ButtonVariant,
} from "@ui/inputs/Button/Button.types";
import { Stack } from "@ui/layout/Stack/Stack";
import { Paper } from "@ui/surfaces/Paper/Paper";
import { parseResponsiveValue } from "@utils/*";
import capitalize from "lodash/capitalize";
import chunk from "lodash/chunk";
import { useState } from "react";

export const Route = createLazyFileRoute("/ui/button")({
    component: PlaygroundButton,
});

const variants = ["solid", "outlined", "plain", "soft"] as ButtonVariant[];
const colors = [
    "primary",
    "neutral",
    "success",
    "error",
    "warning",
    "info",
] as ButtonColor[];

function PlaygroundButton() {
    const [size, setSize] = useState<ButtonSize>("md");
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);

    const [customSize, setCustomSize] = useState(false);
    const [customColor, setCustomColor] = useState<ColorLike | null>(null);

    const [customColors, setCustomColors] = useState<ButtonColor[]>([]);
    const [colorToDelete, setColorToDelete] = useState<ColorLike | null>(null);

    let buttons = [];

    for (const color of [...colors, ...customColors]) {
        for (const variant of variants) {
            buttons.push(
                <Button
                    key={`${variant}-${color}-button`}
                    variant={variant}
                    color={color}
                    size={size}
                    loading={loading}
                    disabled={disabled}
                >
                    {`${capitalize(variant)} ${capitalize(color)}`}
                </Button>,
            );
        }
    }

    buttons = chunk(buttons, variants.length).map((row, index) => (
        <Stack key={index} padding={20} gap={10}>
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
                <Stack direction="column">{buttons}</Stack>
            </Paper>
            <Paper direction="column" padding={20} gap={5}>
                <Stack justifyContent="center" direction="column" gap={10}>
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
                    <Stack gap={5} justifyContent="center" direction="column">
                        <Stack
                            direction="row"
                            gap={10}
                            justifyContent="center"
                            alignItems="center"
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
                                        parseResponsiveValue(
                                            e.target.value,
                                        ) as ButtonSize,
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
                                    setSize(e.target.value as ButtonSize)
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
                    <Stack
                        justifyContent="center"
                        alignItems="center"
                        direction="column"
                        gap={5}
                    >
                        <label>Custom Colors</label>
                        <Stack
                            justifyContent="center"
                            alignItems="center"
                            direction="row"
                            gap={10}
                        >
                            <input
                                type="text"
                                value={customColor ?? ""}
                                placeholder="Input custom color"
                                onChange={(e) =>
                                    setCustomColor(e.target.value as ColorLike)
                                }
                                style={{
                                    padding: 10,
                                    borderRadius: 5,
                                    border: "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                }}
                            />
                            <Button
                                variant="soft"
                                color="primary"
                                onClick={() => {
                                    setCustomColors(
                                        (prev) =>
                                            [
                                                ...prev,
                                                customColor,
                                            ] as ColorLike[],
                                    );
                                    setCustomColor(null);
                                    setColorToDelete(customColor);
                                }}
                            >
                                Add Color
                            </Button>
                        </Stack>
                        {customColors.length > 0 && (
                            <Stack
                                justifyContent="center"
                                alignItems="center"
                                direction="row"
                                gap={10}
                            >
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
                                    color="error"
                                    onClick={() => {
                                        setCustomColors((prev) =>
                                            prev.filter(
                                                (color) =>
                                                    color !== colorToDelete,
                                            ),
                                        );
                                        setColorToDelete(null);
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
