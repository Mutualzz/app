import { useColorInput } from "@hooks/useColorInput";
import { createLazyFileRoute } from "@tanstack/react-router";
import type { ColorLike } from "@types";
import { Divider } from "@ui/data-display/Divider/Divider";
import { Button } from "@ui/inputs/Button/Button";
import { Checkbox } from "@ui/inputs/Checkbox/Checkbox";
import type {
    CheckboxColor,
    CheckboxSize,
    CheckboxVariant,
} from "@ui/inputs/Checkbox/Checkbox.types";
import { Stack } from "@ui/layout/Stack/Stack";
import { Paper } from "@ui/surfaces/Paper/Paper";
import { randomHexColor } from "@utils/randomHexColor";

import capitalize from "lodash/capitalize";
import chunk from "lodash/chunk";
import { useState } from "react";

import * as FaIcons from "react-icons/fa";
import * as IoIcons from "react-icons/io";
import * as MdIcons from "react-icons/md";

export const Route = createLazyFileRoute("/ui/checkbox")({
    component: PlaygroundCheckbox,
});

const variants = ["solid", "outlined", "plain", "soft"] as CheckboxVariant[];
const colors = [
    "primary",
    "neutral",
    "success",
    "danger",
    "warning",
    "info",
] as CheckboxColor[];

const iconLibraries = {
    fa: FaIcons,
    md: MdIcons,
    io: IoIcons,
};

function PlaygroundCheckbox() {
    const [size, setSize] = useState<CheckboxSize>("md");
    const [disabled, setDisabled] = useState(false);

    const [customSize, setCustomSize] = useState(false);
    const [customLabel, setCustomLabel] = useState(false);

    const [label, setLabel] = useState<string | null>(null);

    const [customColors, setCustomColors] = useState<ColorLike[]>([]);
    const [colorToDelete, setColorToDelete] = useState<ColorLike | null>(null);

    const [checked, setChecked] = useState<true | undefined>();
    const [indeterminate, setIndeterminate] = useState(false);

    const [checkedLibrary, setCheckLibrary] = useState<
        keyof typeof iconLibraries | null
    >(null);
    const [checkedIconName, setCheckedIconName] = useState<string | null>(null);

    const [uncheckedLibrary, setUncheckedLibrary] = useState<
        keyof typeof iconLibraries | null
    >(null);
    const [uncheckedIconName, setUncheckedIconName] = useState<string | null>(
        null,
    );

    const [indeterminateLibrary, setIndeterminateLibrary] = useState<
        keyof typeof iconLibraries | null
    >(null);
    const [indeterminateIconName, setIndeterminateIconName] = useState<
        string | null
    >(null);

    const SelectedCheckedIcon =
        checkedLibrary && checkedIconName
            ? (
                  iconLibraries[checkedLibrary] as Record<
                      string,
                      React.ComponentType<any>
                  >
              )[checkedIconName]
            : null;

    const SelectedUncheckedIcon =
        uncheckedLibrary && uncheckedIconName
            ? (
                  iconLibraries[uncheckedLibrary] as Record<
                      string,
                      React.ComponentType<any>
                  >
              )[uncheckedIconName]
            : null;

    const SelectedIndeterminateIcon =
        indeterminateLibrary && indeterminateIconName
            ? (
                  iconLibraries[indeterminateLibrary] as Record<
                      string,
                      React.ComponentType<any>
                  >
              )[indeterminateIconName]
            : null;

    const {
        inputValue: inputColor,
        color: customColor,
        isInvalid,
        handleChange,
        validate,
        setColorDirectly,
    } = useColorInput<CheckboxColor>();

    let checkboxes = [];

    for (const color of [...colors, ...customColors]) {
        for (const variant of variants) {
            checkboxes.push(
                <Checkbox
                    key={`${variant}-${color}-checkbox`}
                    variant={variant}
                    color={color}
                    checked={checked}
                    indeterminate={indeterminate}
                    size={size}
                    label={
                        label ?? `${capitalize(variant)} ${capitalize(color)}`
                    }
                    disabled={disabled}
                    checkedIcon={SelectedCheckedIcon && <SelectedCheckedIcon />}
                    uncheckedIcon={
                        SelectedUncheckedIcon && <SelectedUncheckedIcon />
                    }
                    indeterminateIcon={
                        SelectedIndeterminateIcon && (
                            <SelectedIndeterminateIcon />
                        )
                    }
                />,
            );
        }
    }

    checkboxes = chunk(checkboxes, variants.length).map((row, index) => (
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
                <Stack direction="column">{checkboxes}</Stack>
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
                        onClick={() =>
                            setChecked((prev) =>
                                prev === undefined ? true : undefined,
                            )
                        }
                        variant="soft"
                        color={checked ? "danger" : "success"}
                        size="md"
                    >
                        {checked ? "Uncheck" : "Check"} Checkbox
                    </Button>
                    <Button
                        onClick={() => setIndeterminate((prev) => !prev)}
                        variant="soft"
                        color={indeterminate ? "danger" : "success"}
                        size="md"
                    >
                        Turn {indeterminate ? "Off" : "On"} Indeterminate
                    </Button>
                    <Button
                        onClick={() => setDisabled((prev) => !prev)}
                        variant="soft"
                        color={disabled ? "danger" : "success"}
                        size="md"
                    >
                        Turn {disabled ? "Off" : "On"} Disabled
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
                            checked={customLabel}
                            onChange={() => {
                                setCustomLabel((prev) => !prev);
                                setLabel(null);
                            }}
                            label="Custom Label"
                        />

                        {customLabel && (
                            <input
                                type="text"
                                value={label ?? ""}
                                disabled={!customLabel}
                                onChange={(e) =>
                                    setLabel(e.target.value.trim())
                                }
                                placeholder="Custom Label"
                                style={{
                                    width: "100%",
                                    padding: 10,
                                    borderRadius: 5,
                                    border: "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                }}
                            />
                        )}

                        {!customLabel && <Divider />}

                        <Checkbox
                            label="Custom Size"
                            variant="outlined"
                            checked={customSize}
                            onChange={() => {
                                setCustomSize((prev) => !prev);
                                setSize("md");
                            }}
                        />
                        {customSize ? (
                            <input
                                type="text"
                                value={size}
                                onChange={(e) =>
                                    setSize(
                                        e.target.value.trim() as CheckboxSize,
                                    )
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
                                    setSize(
                                        e.target.value.trim() as CheckboxSize,
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
                    <Divider>Checked Icon</Divider>

                    <Stack justifyContent="center" direction="column" gap={5}>
                        <label>Choose Icon Library:</label>
                        <select
                            value={checkedLibrary ?? ""}
                            onChange={(e) =>
                                setCheckLibrary(
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

                        {checkedLibrary && (
                            <>
                                <label>Choose Icon:</label>
                                <select
                                    value={checkedIconName ?? ""}
                                    onChange={(e) =>
                                        setCheckedIconName(e.target.value)
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
                                        iconLibraries[checkedLibrary],
                                    ).map((iconName) => (
                                        <option key={iconName} value={iconName}>
                                            {iconName}
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}
                    </Stack>
                    <Divider>Unchecked Icon</Divider>

                    <Stack justifyContent="center" direction="column" gap={5}>
                        <label>Choose Icon Library:</label>
                        <select
                            value={uncheckedLibrary ?? ""}
                            onChange={(e) =>
                                setUncheckedLibrary(
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

                        {uncheckedLibrary && (
                            <>
                                <label>Choose Icon:</label>
                                <select
                                    value={uncheckedIconName ?? ""}
                                    onChange={(e) =>
                                        setUncheckedIconName(e.target.value)
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
                                        iconLibraries[uncheckedLibrary],
                                    ).map((iconName) => (
                                        <option key={iconName} value={iconName}>
                                            {iconName}
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}
                    </Stack>
                    <Divider>Indeterminate Icon</Divider>

                    <Stack justifyContent="center" direction="column" gap={5}>
                        <label>Choose Icon Library:</label>
                        <select
                            value={indeterminateLibrary ?? ""}
                            onChange={(e) =>
                                setIndeterminateLibrary(
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

                        {indeterminateLibrary && (
                            <>
                                <label>Choose Icon:</label>
                                <select
                                    value={indeterminateIconName ?? ""}
                                    onChange={(e) =>
                                        setIndeterminateIconName(e.target.value)
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
                                        iconLibraries[indeterminateLibrary],
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
