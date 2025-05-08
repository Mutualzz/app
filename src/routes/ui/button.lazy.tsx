import { createLazyFileRoute } from "@tanstack/react-router";
import { Divider } from "@ui/components/data-display/Divider/Divider";
import { Button } from "@ui/components/inputs/Button/Button";
import { Checkbox } from "@ui/components/inputs/Checkbox/Checkbox";
import { Stack } from "@ui/components/layout/Stack/Stack";
import { Paper } from "@ui/components/surfaces/Paper/Paper";
import { useColorInput } from "@ui/hooks/useColorInput";
import type { Color, ColorLike, Size, Variant } from "@ui/types";

import capitalize from "lodash/capitalize";
import { type ReactNode, useState } from "react";

import { randomHexColor } from "@ui/utils";
import * as AiIcons from "react-icons/ai";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import { RadioButton } from "../../ui/src/components/inputs/RadioButton/RadioButton";
import { RadioButtonGroup } from "../../ui/src/components/inputs/RadioButton/RadioButtonGroup";

export const Route = createLazyFileRoute("/ui/button")({
    component: PlaygroundButton,
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

const iconLibraries = {
    fa: FaIcons,
    md: MdIcons,
    ai: AiIcons,
};

const sizeNames = {
    sm: "Small",
    md: "Medium",
    lg: "Large",
};

const libNames = {
    fa: "Font Awesome",
    md: "Material Design",
    ai: "Ant Design",
};

function PlaygroundButton() {
    const [variant, setVariant] = useState<Variant>("solid");
    const [text, setText] = useState<string | null>(null);
    const [size, setSize] = useState<Size | number>("md");
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);

    const [iconPosition, setIconPosition] = useState<"left" | "right" | "none">(
        "none",
    );

    const [iconLibrary, setIconLibrary] =
        useState<keyof typeof iconLibraries>("fa");

    const [icon, setIcon] = useState<ReactNode | null>(null);

    const [customSizeToggle, setCustomSizeToggle] = useState(false);

    const [customColors, setCustomColors] = useState<ColorLike[]>([]);
    const [colorToDelete, setColorToDelete] = useState<ColorLike | null>(null);

    const {
        inputValue: inputColorValue,
        color: customColor,
        isInvalid,
        handleChange,
        validate,
        setColorDirectly,
    } = useColorInput<Color | ColorLike>();

    const buttons = [...colors, ...customColors].map((color) => (
        <Button
            key={`${variant}-${color}-button`}
            variant={variant}
            color={color}
            size={size}
            loading={loading}
            disabled={disabled}
            startIcon={iconPosition === "left" && icon ? icon : null}
            endIcon={iconPosition === "right" && icon ? icon : null}
        >
            {text ?? `${capitalize(variant)} ${capitalize(color)}`}
        </Button>
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
                {buttons}
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
                                placeholder="Input custom size"
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
                    <Stack direction="row" spacing={5}>
                        <Checkbox
                            checked={loading}
                            label="Loading"
                            onChange={() => setLoading((prev) => !prev)}
                            disabled={disabled}
                        />
                        <Checkbox
                            checked={disabled}
                            label="Disabled"
                            onChange={() => setDisabled((prev) => !prev)}
                            disabled={loading}
                        />
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
                        <label>Text</label>
                        <input
                            type="text"
                            value={text ?? ""}
                            placeholder="Input button text"
                            onChange={(e) =>
                                setText(
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
                    <Stack direction="column" spacing={20}>
                        <label>Icon</label>
                        <RadioButtonGroup
                            onChange={(_, iconPosition) =>
                                setIconPosition(
                                    iconPosition as "left" | "right" | "none",
                                )
                            }
                            value={iconPosition}
                            name="icon-position"
                            row
                        >
                            <RadioButton
                                value="none"
                                label="None"
                                checked={iconPosition === "none"}
                                color="neutral"
                                onChange={() => setIconPosition("none")}
                            />
                            <RadioButton
                                value="left"
                                label="Left"
                                checked={iconPosition === "left"}
                                color="neutral"
                                onChange={() => setIconPosition("left")}
                            />
                            <RadioButton
                                value="right"
                                label="Right"
                                checked={iconPosition === "right"}
                                color="neutral"
                                onChange={() => setIconPosition("right")}
                            />
                        </RadioButtonGroup>
                        {iconPosition !== "none" && (
                            <>
                                <RadioButtonGroup
                                    onChange={(_, library) =>
                                        setIconLibrary(
                                            library as keyof typeof iconLibraries,
                                        )
                                    }
                                    value={iconLibrary}
                                    name="icon-library"
                                >
                                    {Object.keys(iconLibraries).map((lib) => (
                                        <RadioButton
                                            key={lib}
                                            value={lib}
                                            label={
                                                libNames[
                                                    lib as keyof typeof libNames
                                                ]
                                            }
                                            checked={iconLibrary === lib}
                                            color="neutral"
                                            onChange={() =>
                                                setIconLibrary(
                                                    lib as keyof typeof iconLibraries,
                                                )
                                            }
                                        />
                                    ))}
                                </RadioButtonGroup>
                                <select
                                    name="icon-select"
                                    onChange={(e) => {
                                        const Icon =
                                            iconLibraries[iconLibrary][
                                                e.target
                                                    .value as keyof (typeof iconLibraries)[typeof iconLibrary]
                                            ];
                                        setIcon(Icon);
                                    }}
                                    style={{
                                        width: "100%",
                                        padding: 10,
                                        borderRadius: 5,
                                        border: "1px solid #ccc",
                                        backgroundColor: "#f9f9f9",
                                    }}
                                >
                                    <option value="">Select an icon</option>
                                    {Object.keys(
                                        iconLibraries[iconLibrary],
                                    ).map((icon) => (
                                        <option key={icon} value={icon}>
                                            {icon}
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
