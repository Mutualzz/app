import { createLazyFileRoute } from "@tanstack/react-router";
import {
    Button,
    Checkbox,
    Divider,
    Paper,
    RadioButton,
    RadioButtonGroup,
    randomHexColor,
    Stack,
    useColorInput,
} from "@ui/index";
import type { Color, ColorLike, Size, Variant } from "@ui/types";
import capitalize from "lodash/capitalize";
import { useState } from "react";

import * as FaIcons from "react-icons/fa";
import * as IoIcons from "react-icons/io";
import * as MdIcons from "react-icons/md";

export const Route = createLazyFileRoute("/ui/radio-button")({
    component: PlaygroundRadioButton,
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

const sizeNames = {
    sm: "Small",
    md: "Medium",
    lg: "Large",
};

const iconLibraries = {
    fa: FaIcons,
    md: MdIcons,
    io: IoIcons,
};

function PlaygroundRadioButton() {
    const [variant, setVariant] = useState<Variant>("solid");
    const [label, setLabel] = useState<string | null>(null);
    const [size, setSize] = useState<Size | number>("md");
    const [disabled, setDisabled] = useState(false);

    const [currentChecked, setCurrentChecked] = useState<string>("primary");

    const [customSizeToggle, setCustomSizeToggle] = useState(false);

    const [customColors, setCustomColors] = useState<ColorLike[]>([]);
    const [colorToDelete, setColorToDelete] = useState<ColorLike | null>(null);

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

    const {
        inputValue: inputColorValue,
        color: customColor,
        isInvalid,
        handleChange,
        validate,
        setColorDirectly,
    } = useColorInput<Color | ColorLike>();

    const radioButtons = [...colors, ...customColors].map((color) => (
        <RadioButton
            name={color}
            checked={currentChecked === color}
            key={color}
            color={color}
            variant={variant}
            size={size}
            label={label ?? `${capitalize(variant)} ${capitalize(color)}`}
            onChange={(e) => setCurrentChecked(e.target.value)}
            disabled={disabled}
            checkedIcon={
                SelectedCheckedIcon ? <SelectedCheckedIcon /> : undefined
            }
            uncheckedIcon={
                SelectedUncheckedIcon ? <SelectedUncheckedIcon /> : undefined
            }
            value={color}
        />
    ));

    return (
        <Stack
            pt={40}
            spacing={20}
            direction="row"
            justifyContent="space-around"
        >
            <Paper
                direction="row"
                alignItems="flex-start"
                alignContent="flex-start"
                wrap="wrap"
                p={20}
                spacing={5}
                width={1200}
            >
                {radioButtons}
            </Paper>
            <Paper width={300} alignItems="center" direction="column" p={20}>
                <Divider>Playground</Divider>
                <Stack width="100%" direction="column" spacing={40}>
                    <Stack direction="column" spacing={10}>
                        <label>Variant</label>
                        <RadioButtonGroup
                            onChange={(_, vriant) =>
                                setVariant(vriant as Variant)
                            }
                            value={variant}
                            name="variants"
                        >
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
                    <Stack direction="column" spacing={5}>
                        <Checkbox
                            checked={disabled}
                            label="Disabled"
                            onChange={() => setDisabled((prev) => !prev)}
                        />
                    </Stack>
                    <Stack direction="column" spacing={5}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            spacing={5}
                        >
                            <label>Size</label>
                            <Checkbox
                                checked={customSizeToggle}
                                label="Custom Size"
                                onChange={() =>
                                    setCustomSizeToggle((prev) => !prev)
                                }
                            />
                        </Stack>
                        {customSizeToggle ? (
                            <input
                                type="number"
                                value={size}
                                min={10}
                                max={24}
                                onChange={(e) =>
                                    setSize(Number(e.target.value))
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
                                onChange={(_, size) => setSize(size as Size)}
                                value={size as Size}
                                name="sizes"
                                row
                            >
                                {Object.keys(sizeNames).map((s) => (
                                    <RadioButton
                                        key={s}
                                        value={s}
                                        label={sizeNames[s as Size]}
                                        checked={size === s}
                                        color="neutral"
                                        onChange={() => setSize(s as Size)}
                                    />
                                ))}
                            </RadioButtonGroup>
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
                    <Stack direction="column" spacing={5}>
                        <label>Label</label>
                        <input
                            type="text"
                            value={label ?? ""}
                            onChange={(e) =>
                                setLabel(
                                    e.target.value.trim() === ""
                                        ? null
                                        : e.target.value,
                                )
                            }
                            style={{
                                padding: 10,
                                borderRadius: 5,
                                border: "1px solid #ccc",
                                backgroundColor: "#f9f9f9",
                                width: "100%",
                            }}
                        />
                    </Stack>

                    <Stack
                        justifyContent="center"
                        direction="column"
                        spacing={5}
                    >
                        <Divider>Checked Icon</Divider>
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

                    <Stack
                        justifyContent="center"
                        direction="column"
                        spacing={5}
                    >
                        <Divider>Unchecked Icon</Divider>
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
                </Stack>
            </Paper>
        </Stack>
    );
}
