import { Divider } from "@ui/components/data-display/Divider/Divider";
import { Button } from "@ui/components/inputs/Button/Button";
import { Checkbox } from "@ui/components/inputs/Checkbox/Checkbox";
import { Stack } from "@ui/components/layout/Stack/Stack";
import { Paper } from "@ui/components/surfaces/Paper/Paper";
import { useColorInput } from "@ui/hooks/useColorInput";
import type { Color, ColorLike, Size, Variant } from "@ui/types";

import capitalize from "lodash/capitalize";
import { useState } from "react";

import { ButtonGroup } from "@ui/components/inputs/Button/ButtonGroup";
import { RadioButton } from "@ui/components/inputs/RadioButton/RadioButton";
import { RadioButtonGroup } from "@ui/components/inputs/RadioButton/RadioButtonGroup";
import { randomHexColor } from "@ui/utils";

import numWords from "num-words";
import { FaMinus, FaPlus } from "react-icons/fa";

export const Route = createLazyFileRoute({
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

const sizeNames = {
    sm: "Small",
    md: "Medium",
    lg: "Large",
};

function PlaygroundButton() {
    const [color, setColor] = useState<Color | ColorLike>("primary");
    const [variant, setVariant] = useState<Variant | "all">("all");

    const [text, setText] = useState<string | null>(null);
    const [size, setSize] = useState<Size | number>("md");
    const [spacing, setSpacing] = useState(0);
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);

    const [numberOfButtons, setNumberOfButtons] = useState(4);

    const [orientation, setOrientation] = useState<"horizontal" | "vertical">(
        "horizontal",
    );

    const [customSizeToggle, setCustomSizeToggle] = useState(false);
    const [customColorToggle, setCustomColorToggle] = useState(false);

    const {
        inputValue: inputColorValue,
        color: customColor,
        isInvalid,
        handleChange,
        validate,
        setColorDirectly,
    } = useColorInput<Color | ColorLike>();

    const allButtons = variants.map((v) => (
        <Button
            key={`${v}-${color}-button`}
            size={size}
            loading={loading}
            disabled={disabled}
            color={color}
            variant={v}
        >
            {text ?? `${capitalize(v)} ${capitalize(color)}`}
        </Button>
    ));

    const buttons = new Array(numberOfButtons).fill(0).map((_, index) => (
        <Button
            key={`${variant}-${color}-button-${index}`}
            size={size}
            loading={loading}
            disabled={disabled}
            color={color}
        >
            {text ?? capitalize(numWords(index + 1))}
        </Button>
    ));

    return (
        <Stack
            mt={40}
            spacing={20}
            direction="row"
            justifyContent="space-around"
        >
            <Paper
                direction="row"
                alignItems="flex-start"
                alignContent="flex-start"
                p={20}
                spacing={5}
                width={1200}
            >
                {variant === "all" && (
                    <ButtonGroup
                        orientation={orientation}
                        spacing={spacing}
                        color={color}
                    >
                        {allButtons}
                    </ButtonGroup>
                )}
                {variant !== "all" && (
                    <ButtonGroup
                        orientation={orientation}
                        spacing={spacing}
                        color={color}
                        variant={variant}
                        size={size}
                        disabled={disabled}
                        loading={loading}
                    >
                        {buttons}
                    </ButtonGroup>
                )}
            </Paper>
            <Paper width={300} alignItems="center" direction="column" p={20}>
                <Divider>Playground</Divider>
                <Stack width="100%" direction="column" spacing={5}>
                    <Stack direction="column" spacing={5}>
                        <label>Variant</label>
                        <RadioButtonGroup
                            onChange={(_, vriant) =>
                                setVariant(vriant as Variant)
                            }
                            value={variant}
                            name="variants"
                        >
                            <RadioButton
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
                    <Divider />
                    {variant !== "all" && (
                        <>
                            <Stack direction="column" spacing={5}>
                                <label>
                                    Number of Buttons: <b>{numberOfButtons}</b>
                                </label>
                                <Stack direction="row" spacing={5}>
                                    <Button
                                        color="neutral"
                                        variant="outlined"
                                        onClick={() =>
                                            setNumberOfButtons((prev) =>
                                                prev > 4 ? prev - 1 : prev,
                                            )
                                        }
                                    >
                                        <FaMinus />
                                    </Button>
                                    <Button
                                        color="neutral"
                                        variant="outlined"
                                        onClick={() =>
                                            setNumberOfButtons(
                                                (prev) => prev + 1,
                                            )
                                        }
                                    >
                                        <FaPlus />
                                    </Button>
                                    <Button
                                        color="neutral"
                                        variant="outlined"
                                        onClick={() => setNumberOfButtons(4)}
                                    >
                                        Reset
                                    </Button>
                                </Stack>
                            </Stack>
                            <Divider />
                        </>
                    )}
                    <Stack direction="column" spacing={10}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            spacing={5}
                        >
                            <label>
                                {customColorToggle ? "Custom Color" : "Color"}
                            </label>
                            <Checkbox
                                checked={customColorToggle}
                                label="Custom"
                                onChange={() =>
                                    setCustomColorToggle((prev) => {
                                        setColor("primary");
                                        return !prev;
                                    })
                                }
                            />
                        </Stack>
                        {customColorToggle ? (
                            <Stack
                                alignContent="center"
                                direction="row"
                                spacing={5}
                            >
                                <input
                                    type="text"
                                    value={inputColorValue}
                                    onChange={(e) =>
                                        handleChange(e.target.value)
                                    }
                                    onBlur={validate}
                                    css={{
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
                                        setColor(customColor as ColorLike);
                                        setColorDirectly(randomHexColor());
                                    }}
                                >
                                    Set Color
                                </Button>
                            </Stack>
                        ) : (
                            <RadioButtonGroup
                                onChange={(_, clr) => setColor(clr as Color)}
                                value={color}
                                name="colors"
                            >
                                {colors.map((c) => (
                                    <RadioButton
                                        key={c}
                                        value={c}
                                        label={capitalize(c)}
                                        checked={color === c}
                                        color="neutral"
                                        onChange={() => setColor(c)}
                                    />
                                ))}
                            </RadioButtonGroup>
                        )}
                    </Stack>
                    <Divider />
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
                                max={24}
                                onChange={(e) =>
                                    setSize(Number(e.target.value))
                                }
                                css={{
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
                    <Divider />
                    <Stack direction="column" spacing={5}>
                        <label>Orientation</label>
                        <RadioButtonGroup
                            row
                            onChange={(_, orientation) =>
                                setOrientation(orientation as "horizontal")
                            }
                            value={orientation}
                            name="orientation"
                        >
                            <RadioButton
                                value="horizontal"
                                label="Horizontal"
                                checked={orientation === "horizontal"}
                                color="neutral"
                                onChange={() => setOrientation("horizontal")}
                            />
                            <RadioButton
                                value="vertical"
                                label="Vertical"
                                checked={orientation === "vertical"}
                                color="neutral"
                                onChange={() => setOrientation("vertical")}
                            />
                        </RadioButtonGroup>
                    </Stack>
                    <Divider />
                    <Stack direction="column" spacing={5}>
                        <label>Spacing</label>
                        <input
                            type="range"
                            value={spacing}
                            min={0}
                            max={100}
                            onChange={(e) => setSpacing(Number(e.target.value))}
                            css={{
                                padding: 10,
                                borderRadius: 5,
                                border: "1px solid #ccc",
                                backgroundColor: "#f9f9f9",
                                width: "100%",
                            }}
                        />
                    </Stack>
                    <Divider />
                    <Stack direction="column" spacing={5}>
                        <label>States</label>
                        <Stack direction="row" spacing={10}>
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
                    </Stack>
                    <Divider />
                    <Stack direction="column" spacing={5}>
                        <label>Text</label>
                        <input
                            type="text"
                            value={text ?? ""}
                            onChange={(e) =>
                                setText(
                                    e.target.value.trim() === ""
                                        ? null
                                        : e.target.value,
                                )
                            }
                            css={{
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
