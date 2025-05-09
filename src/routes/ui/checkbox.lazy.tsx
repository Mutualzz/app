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

import { type Color, type ColorLike, type Size, type Variant } from "@ui/types";
import capitalize from "lodash/capitalize";
import { useState } from "react";

export const Route = createLazyFileRoute("/ui/checkbox")({
    component: PlaygroundCheckbox,
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

// TODO: Work on adding icons
function PlaygroundCheckbox() {
    const [variant, setVariant] = useState<Variant>("solid");
    const [label, setLabel] = useState<string | null>(null);
    const [size, setSize] = useState<Size | number>("md");
    const [disabled, setDisabled] = useState(false);

    const [checked, setChecked] = useState(false);
    const [indeterminate, setIndeterminate] = useState(false);

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

    const checkboxes = [...colors, ...customColors].map((color) => (
        <Checkbox
            key={color}
            label={label ?? `${capitalize(variant)} ${capitalize(color)}`}
            checked={checked}
            variant={variant}
            color={color}
            indeterminate={indeterminate}
            size={size}
            disabled={disabled}
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
                {checkboxes}
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
                    <Stack direction="column" spacing={5}>
                        <Checkbox
                            checked={checked}
                            label="Checked"
                            onChange={() => setChecked((prev) => !prev)}
                            disabled={disabled}
                        />
                        <Checkbox
                            checked={indeterminate}
                            label="Indeterminate"
                            onChange={() => setIndeterminate((prev) => !prev)}
                        />
                        <Checkbox
                            checked={disabled}
                            label="Disabled"
                            onChange={() => setDisabled((prev) => !prev)}
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
                </Stack>
            </Paper>
        </Stack>
    );
}
