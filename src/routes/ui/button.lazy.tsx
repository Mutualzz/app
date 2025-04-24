import { useColorInput } from "@hooks/useColorInput";
import type { ColorLike, Hex } from "@mutualzz/theme";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Divider } from "@ui/data-display/Divider/Divider";
import { Button } from "@ui/inputs/Button/Button";
import type {
    ButtonColor,
    ButtonSize,
    ButtonVariant,
} from "@ui/inputs/Button/Button.types";
import { Stack } from "@ui/layout/Stack/Stack";
import { Paper } from "@ui/surfaces/Paper/Paper";
import { randomHexColor } from "@utils/randomHexColor";

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
    "danger",
    "warning",
    "info",
] as ButtonColor[];

function PlaygroundButton() {
    const [size, setSize] = useState<ButtonSize>("md");
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);

    const [customSize, setCustomSize] = useState(false);

    const [customColors, setCustomColors] = useState<ColorLike[]>([]);
    const [colorToDelete, setColorToDelete] = useState<ColorLike | null>(null);

    const {
        inputValue: inputColor,
        color: customColor,
        isInvalid,
        handleChange,
        validate,
        setColorDirectly,
    } = useColorInput();

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
                <h2
                    css={{
                        textAlign: "center",
                    }}
                >
                    Customization
                </h2>
                <Stack justifyContent="center" direction="column" gap={10}>
                    <Divider>States</Divider>
                    <Button
                        onClick={() => setLoading((prev) => !prev)}
                        variant="soft"
                        color={loading ? "danger" : "success"}
                        size="md"
                    >
                        Turn {loading ? "Off" : "On"} Loading
                    </Button>
                    <Button
                        onClick={() => setDisabled((prev) => !prev)}
                        variant="soft"
                        color={disabled ? "danger" : "success"}
                        size="md"
                    >
                        Turn {disabled ? "Off" : "On"} Disabled
                    </Button>
                    <Stack gap={5} justifyContent="center" direction="column">
                        <Divider>Properties</Divider>
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
                                    setSize(e.target.value.trim() as ButtonSize)
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
                                    setSize(e.target.value.trim() as ButtonSize)
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
                        <Stack alignItems="center" gap={10}>
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
                            <Stack alignItems="center" direction="row" gap={10}>
                                <select
                                    value={colorToDelete ?? ""}
                                    onChange={(e) => {
                                        setColorToDelete(
                                            e.target.value.trim() as Hex,
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
