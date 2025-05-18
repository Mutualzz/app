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

import * as AiIcons from "react-icons/ai";
import * as FaIcons from "react-icons/fa";
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
    ai: AiIcons,
};

const libNames = {
    fa: "Font Awesome",
    md: "Material Design",
    ai: "Ant Design",
};

function PlaygroundRadioButton() {
    const [variant, setVariant] = useState<Variant | "all">("solid");
    const [label, setLabel] = useState<string | null>(null);
    const [size, setSize] = useState<Size | number>("md");
    const [disabled, setDisabled] = useState(false);

    const [currentChecked, setCurrentChecked] = useState<string>("primary");

    const [customSizeToggle, setCustomSizeToggle] = useState(false);

    const [customColors, setCustomColors] = useState<ColorLike[]>([]);
    const [colorToDelete, setColorToDelete] = useState<ColorLike | null>(null);

    const [checkedLibrary, setCheckedLibrary] = useState<
        keyof typeof iconLibraries | "none"
    >("none");
    const [checkedIconName, setCheckedIconName] = useState<string | null>(null);

    const [uncheckedLibrary, setUncheckedLibrary] = useState<
        keyof typeof iconLibraries | "none"
    >("none");
    const [uncheckedIconName, setUncheckedIconName] = useState<string | null>(
        null,
    );

    const SelectedCheckedIcon =
        checkedLibrary !== "none" && checkedIconName
            ? (
                  iconLibraries[checkedLibrary] as Record<
                      string,
                      React.ComponentType<any>
                  >
              )[checkedIconName]
            : null;

    const SelectedUncheckedIcon =
        uncheckedLibrary !== "none" && uncheckedIconName
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

    const allRadioButtons = [...colors, ...customColors].map((c) =>
        variants.map((v) => (
            <RadioButton
                name={c}
                checked={currentChecked === c}
                key={c}
                color={c}
                variant={v}
                size={size}
                label={label ?? `${capitalize(v)} ${capitalize(c)}`}
                onChange={(e) => setCurrentChecked(e.target.value)}
                disabled={disabled}
                checkedIcon={
                    SelectedCheckedIcon ? <SelectedCheckedIcon /> : undefined
                }
                uncheckedIcon={
                    SelectedUncheckedIcon ? (
                        <SelectedUncheckedIcon />
                    ) : undefined
                }
                value={c}
            />
        )),
    );
    const radioButtons = [...colors, ...customColors].map((c) => (
        <RadioButton
            name={c}
            checked={currentChecked === c}
            key={c}
            color={c}
            variant={variant as Variant}
            size={size}
            label={label ?? `${capitalize(variant)} ${capitalize(c)}`}
            onChange={(e) => setCurrentChecked(e.target.value)}
            disabled={disabled}
            checkedIcon={
                SelectedCheckedIcon ? <SelectedCheckedIcon /> : undefined
            }
            uncheckedIcon={
                SelectedUncheckedIcon ? <SelectedUncheckedIcon /> : undefined
            }
            value={c}
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
                direction={variant === "all" ? "column" : "row"}
                alignItems="flex-start"
                alignContent="flex-start"
                wrap="wrap"
                p={20}
                spacing={variant === "all" ? 10 : 5}
                width={1200}
            >
                {variant === "all" &&
                    allRadioButtons.map((radioButtons, i) => (
                        <Stack direction="row" spacing={5} key={i}>
                            {radioButtons}
                        </Stack>
                    ))}
                {variant !== "all" && radioButtons}
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
                                label="Custom"
                                onChange={() =>
                                    setCustomSizeToggle((prev) => {
                                        setSize("md");
                                        return !prev;
                                    })
                                }
                            />
                        </Stack>
                        {customSizeToggle ? (
                            <input
                                type="range"
                                value={size}
                                min={10}
                                max={28}
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
                        <label>Checked Icon</label>
                        <Stack direction="column" spacing={10}>
                            <RadioButtonGroup
                                onChange={(_, library) =>
                                    setCheckedLibrary(
                                        library as keyof typeof iconLibraries,
                                    )
                                }
                                value={checkedLibrary}
                                name="libraries"
                            >
                                <RadioButton
                                    key="none"
                                    value="none"
                                    label="None"
                                    checked={checkedLibrary === "none"}
                                    color="neutral"
                                    onChange={() => setCheckedLibrary("none")}
                                />
                                {Object.keys(iconLibraries).map((lib) => (
                                    <RadioButton
                                        key={lib}
                                        value={lib}
                                        label={
                                            libNames[
                                                lib as keyof typeof libNames
                                            ]
                                        }
                                        checked={checkedLibrary === lib}
                                        color="neutral"
                                        onChange={() =>
                                            setCheckedLibrary(
                                                lib as keyof typeof iconLibraries,
                                            )
                                        }
                                    />
                                ))}
                            </RadioButtonGroup>
                            {checkedLibrary !== "none" && (
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
                                    <option value="">Select an icon</option>
                                    {Object.keys(
                                        iconLibraries[checkedLibrary],
                                    ).map((iconName) => (
                                        <option key={iconName} value={iconName}>
                                            {iconName}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </Stack>
                    </Stack>

                    <Stack
                        justifyContent="center"
                        direction="column"
                        spacing={5}
                    >
                        <label>Unchecked Icon</label>
                        <Stack direction="column" spacing={10}>
                            <RadioButtonGroup
                                onChange={(_, library) =>
                                    setUncheckedLibrary(
                                        library as keyof typeof iconLibraries,
                                    )
                                }
                                value={uncheckedLibrary}
                                name="libraries"
                            >
                                <RadioButton
                                    key="none"
                                    value="none"
                                    label="None"
                                    checked={uncheckedLibrary === "none"}
                                    color="neutral"
                                    onChange={() => setUncheckedLibrary("none")}
                                />
                                {Object.keys(iconLibraries).map((lib) => (
                                    <RadioButton
                                        key={lib}
                                        value={lib}
                                        label={
                                            libNames[
                                                lib as keyof typeof libNames
                                            ]
                                        }
                                        checked={uncheckedLibrary === lib}
                                        color="neutral"
                                        onChange={() =>
                                            setUncheckedLibrary(
                                                lib as keyof typeof iconLibraries,
                                            )
                                        }
                                    />
                                ))}
                            </RadioButtonGroup>
                            {uncheckedLibrary !== "none" && (
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
                                    <option value="">Select an icon</option>
                                    {Object.keys(
                                        iconLibraries[uncheckedLibrary],
                                    ).map((iconName) => (
                                        <option key={iconName} value={iconName}>
                                            {iconName}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </Stack>
                    </Stack>
                </Stack>
            </Paper>
        </Stack>
    );
}
