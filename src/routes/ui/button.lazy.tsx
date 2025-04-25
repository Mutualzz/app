import { useColorInput } from "@hooks/useColorInput";
import { createLazyFileRoute } from "@tanstack/react-router";
import type { ColorLike } from "@types";
import { Divider } from "@ui/data-display/Divider/Divider";
import { Button } from "@ui/inputs/Button/Button";
import type {
    ButtonColor,
    ButtonSize,
    ButtonVariant,
} from "@ui/inputs/Button/Button.types";
import { Checkbox } from "@ui/inputs/Checkbox/Checkbox";
import { Stack } from "@ui/layout/Stack/Stack";
import { Paper } from "@ui/surfaces/Paper/Paper";
import { randomHexColor } from "@utils/randomHexColor";

import capitalize from "lodash/capitalize";
import chunk from "lodash/chunk";
import { useState } from "react";

import * as FaIcons from "react-icons/fa";
import * as IoIcons from "react-icons/io";
import * as MdIcons from "react-icons/md";

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

const iconLibraries = {
    fa: FaIcons,
    md: MdIcons,
    io: IoIcons,
};

function PlaygroundButton() {
    const [size, setSize] = useState<ButtonSize>("md");
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [fullWidth, setFullWidth] = useState(false);

    const [selectedLibrary, setSelectedLibrary] = useState<
        keyof typeof iconLibraries | null
    >(null);
    const [selectedIconName, setSelectedIconName] = useState<string | null>(
        null,
    );

    const SelectedIcon =
        selectedLibrary && selectedIconName
            ? (
                  iconLibraries[selectedLibrary] as Record<
                      string,
                      React.ComponentType<any>
                  >
              )[selectedIconName]
            : null;

    const [customSize, setCustomSize] = useState(false);
    const [customText, setCustomText] = useState(false);

    const [text, setText] = useState<string | null>(null);

    const [customColors, setCustomColors] = useState<ColorLike[]>([]);
    const [colorToDelete, setColorToDelete] = useState<ColorLike | null>(null);

    const {
        inputValue: inputColor,
        color: customColor,
        isInvalid,
        handleChange,
        validate,
        setColorDirectly,
    } = useColorInput<ButtonColor>();

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
                    fullWidth={fullWidth}
                    startIcon={SelectedIcon && <SelectedIcon />}
                    endIcon={SelectedIcon && <SelectedIcon />}
                >
                    {text ?? `${capitalize(variant)} ${capitalize(color)}`}
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
                    <Button
                        onClick={() => setFullWidth((prev) => !prev)}
                        variant="soft"
                        color={fullWidth ? "danger" : "success"}
                        size="md"
                    >
                        Turn {fullWidth ? "Off" : "On"} Full Width
                    </Button>
                    <Stack
                        gap={5}
                        justifyContent="center"
                        alignItems="center"
                        direction="column"
                    >
                        <Divider>Properties</Divider>
                        <Checkbox
                            variant="outlined"
                            checked={customText}
                            onChange={() => {
                                setCustomText((prev) => !prev);
                                setText(null);
                            }}
                            label="Custom Text"
                        />

                        {customText && (
                            <input
                                type="text"
                                value={text ?? ""}
                                disabled={!customText}
                                onChange={(e) => setText(e.target.value.trim())}
                                placeholder="Custom text"
                                style={{
                                    width: "100%",
                                    padding: 10,
                                    borderRadius: 5,
                                    border: "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                }}
                            />
                        )}

                        {!customText && <Divider />}

                        <Checkbox
                            variant="outlined"
                            checked={customSize}
                            onChange={() => {
                                setCustomSize((prev) => !prev);
                                setSize("md");
                            }}
                            label="Custom Size"
                        />

                        {customSize ? (
                            <input
                                type="text"
                                value={size}
                                onChange={(e) =>
                                    setSize(e.target.value.trim() as ButtonSize)
                                }
                                placeholder="Custom size"
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
                                value={size}
                                onChange={(e) =>
                                    setSize(e.target.value.trim() as ButtonSize)
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
                    <Divider>Button Icons</Divider>

                    <Stack justifyContent="center" direction="column" gap={5}>
                        <label>Choose Icon Library:</label>
                        <select
                            value={selectedLibrary ?? ""}
                            onChange={(e) =>
                                setSelectedLibrary(
                                    e.target
                                        .value as keyof typeof iconLibraries,
                                )
                            }
                            style={{
                                padding: 10,
                                borderRadius: 5,
                                border: "1px solid #ccc",
                                backgroundColor: "#f9f9f9",
                            }}
                        >
                            <option value="">None</option>
                            {Object.keys(iconLibraries).map((lib) => (
                                <option key={lib} value={lib}>
                                    {capitalize(lib)}
                                </option>
                            ))}
                        </select>

                        {selectedLibrary && (
                            <>
                                <label>Choose Icon:</label>
                                <select
                                    value={selectedIconName ?? ""}
                                    onChange={(e) =>
                                        setSelectedIconName(e.target.value)
                                    }
                                    style={{
                                        padding: 10,
                                        borderRadius: 5,
                                        border: "1px solid #ccc",
                                        backgroundColor: "#f9f9f9",
                                    }}
                                >
                                    <option value="">None</option>
                                    {Object.keys(
                                        iconLibraries[selectedLibrary],
                                    ).map((iconName) => (
                                        <option key={iconName} value={iconName}>
                                            {iconName}
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}
                    </Stack>
                </Stack>
            </Paper>
        </Stack>
    );
}
