import { Typography } from "@ui/components/data-display/Typography/Typography";
import { Slider } from "@ui/components/inputs/Slider/Slider";
import {
    type SliderMark,
    type SliderOrientation,
    type SliderValueLabelDisplay,
} from "@ui/components/inputs/Slider/Slider.types";
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

export const Route = createLazyFileRoute({
    component: SlderPlayground,
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

function SlderPlayground() {
    const [variant, setVariant] = useState<Variant | "all">("solid");
    const [size, setSize] = useState<Size | number>("md");
    const [disabled, setDisabled] = useState(false);
    const [orientation, setOrientation] =
        useState<SliderOrientation>("horizontal");

    const [controlled, setControlled] = useState(false);
    const [controlledValue, setControlledValue] = useState(0);

    const [min, setMin] = useState(0);
    const [max, setMax] = useState(100);
    const [step, setStep] = useState<number | null>(null);

    const [markState, setMarkState] = useState<"off" | "on" | "custom">("off");

    const [marks, setMarks] = useState<SliderMark[]>([]);
    const [valueDisplay, setValueDisplay] =
        useState<SliderValueLabelDisplay>("off");

    const [customSizeToggle, setCustomSizeToggle] = useState(false);

    const [customColors, setCustomColors] = useState<ColorLike[]>([]);
    const [colorToDelete, setColorToDelete] = useState<ColorLike | null>(null);

    const [markToDelete, setMarkToDelete] = useState<SliderMark | null>(null);

    const [valueInput, setValueInput] = useState<number | null>(null);
    const [labelInput, setLabelInput] = useState<string>("");

    const {
        inputValue: inputColorValue,
        color: customColor,
        isInvalid,
        handleChange,
        validate,
        setColorDirectly,
    } = useColorInput<Color | ColorLike>();

    const allSliders = [...colors, ...customColors].map((c) =>
        variants.map((v) => (
            <Stack
                justifyContent="center"
                alignItems="center"
                direction="column"
                key={`${v}-${c}`}
            >
                <Typography>
                    {capitalize(v)} {capitalize(c)}
                </Typography>
                <Slider
                    key={`${v}-${c}-slider`}
                    variant={v}
                    color={c}
                    size={size}
                    min={min}
                    max={max}
                    step={step}
                    defaultValue={0}
                    disabled={disabled}
                    marks={
                        markState === "off"
                            ? false
                            : markState === "on"
                              ? true
                              : marks
                    }
                    orientation={orientation}
                    valueLabelDisplay={valueDisplay}
                    value={controlled ? controlledValue : undefined}
                    onChange={
                        controlled
                            ? (_, value) => setControlledValue(value as number)
                            : undefined
                    }
                    onChangeCommitted={
                        controlled
                            ? (_, value) => setControlledValue(value as number)
                            : undefined
                    }
                />
            </Stack>
        )),
    );

    const sliders = [...colors, ...customColors].map((c) => (
        <Stack
            justifyContent="center"
            alignItems="center"
            direction="column"
            key={c}
        >
            <Typography>
                {capitalize(variant)} {capitalize(c)}
            </Typography>
            <Slider
                variant={variant as Variant}
                color={c}
                size={size}
                defaultValue={0}
                value={controlled ? controlledValue : undefined}
                disabled={disabled}
                marks={
                    markState === "off"
                        ? false
                        : markState === "on"
                          ? true
                          : marks
                }
                step={step}
                min={min}
                max={max}
                valueLabelDisplay={valueDisplay}
                orientation={orientation}
                onChange={
                    controlled
                        ? (_, value) => setControlledValue(value as number)
                        : undefined
                }
                onChangeCommitted={
                    controlled
                        ? (_, value) => setControlledValue(value as number)
                        : undefined
                }
            />
        </Stack>
    ));

    return (
        <Stack
            mt={40}
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
                spacing={50}
                width={1200}
            >
                {variant === "all" &&
                    allSliders.map((sliders, i) => (
                        <Stack direction="row" spacing={50} key={i}>
                            {sliders}
                        </Stack>
                    ))}
                {variant !== "all" && sliders}
            </Paper>
            <Paper width={300} alignItems="center" direction="column" p={20}>
                <Divider>Playground</Divider>
                <Stack width="100%" spacing={5} direction="column">
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
                    <Divider />
                    <Stack direction="column" spacing={5}>
                        <Stack direction="row" justifyContent="space-between">
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
                            onChange={(_, orientationValue) =>
                                setOrientation(
                                    orientationValue as SliderOrientation,
                                )
                            }
                            value={orientation}
                            name="orientation"
                            row
                        >
                            <RadioButton
                                value="horizontal"
                                label="Horizontal"
                                checked={orientation === "horizontal"}
                                color="neutral"
                                onChange={() =>
                                    setOrientation(
                                        "horizontal" as SliderOrientation,
                                    )
                                }
                            />
                            <RadioButton
                                value="vertical"
                                label="Vertical"
                                checked={orientation === "vertical"}
                                color="neutral"
                                onChange={() =>
                                    setOrientation(
                                        "vertical" as SliderOrientation,
                                    )
                                }
                            />
                        </RadioButtonGroup>
                    </Stack>
                    <Divider />
                    <Stack direction="column" spacing={10}>
                        <Stack direction="column" spacing={10}>
                            <label>States</label>
                            <Stack direction="row" spacing={5}>
                                <Checkbox
                                    checked={disabled}
                                    label="Disabled"
                                    onChange={() =>
                                        setDisabled((prev) => !prev)
                                    }
                                />
                                <Checkbox
                                    checked={controlled}
                                    label="Controlled"
                                    disabled={disabled}
                                    onChange={() =>
                                        setControlled((prev) => !prev)
                                    }
                                />
                            </Stack>
                        </Stack>
                        {controlled && !disabled && (
                            <input
                                type="number"
                                value={controlledValue}
                                onChange={(e) =>
                                    setControlledValue(Number(e.target.value))
                                }
                                css={{
                                    padding: 10,
                                    borderRadius: 5,
                                    border: "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                    width: "100%",
                                }}
                            />
                        )}
                    </Stack>
                    <Divider />
                    <Stack direction="column" spacing={10}>
                        <label>Marks</label>
                        <RadioButtonGroup
                            row
                            onChange={(_, markStateValue) =>
                                setMarkState(
                                    markStateValue as "off" | "on" | "custom",
                                )
                            }
                            value={markState}
                            name="markState"
                        >
                            <RadioButton
                                value="off"
                                label="Off"
                                checked={markState === "off"}
                                color="neutral"
                                onChange={() => setMarkState("off")}
                            />
                            <RadioButton
                                value="on"
                                label="On"
                                checked={markState === "on"}
                                color="neutral"
                                onChange={() => setMarkState("on")}
                            />
                            <RadioButton
                                value="custom"
                                label="Custom"
                                checked={markState === "custom"}
                                color="neutral"
                                onChange={() => setMarkState("custom")}
                            />
                        </RadioButtonGroup>
                        {markState === "custom" && (
                            <Stack direction="column" spacing={10}>
                                <Stack direction="row" spacing={5}>
                                    <input
                                        type="number"
                                        placeholder="Value"
                                        value={valueInput ?? ""}
                                        onChange={(e) => {
                                            let value = Number(e.target.value);
                                            if (isNaN(value)) value = min;
                                            if (value < min) value = min;
                                            if (value > max) value = max;
                                            setValueInput(value);
                                        }}
                                        css={{
                                            padding: 10,
                                            borderRadius: 5,
                                            border: "1px solid #ccc",
                                            backgroundColor: "#f9f9f9",
                                            width: "100%",
                                        }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Label (optional)"
                                        value={labelInput}
                                        onChange={(e) =>
                                            setLabelInput(e.target.value)
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
                                <Button
                                    color="primary"
                                    onClick={() => {
                                        if (valueInput !== null) {
                                            if (
                                                marks.some(
                                                    (m) =>
                                                        m.value === valueInput,
                                                )
                                            ) {
                                                alert(
                                                    "A mark with this value already exists.",
                                                );
                                                setValueInput(null);
                                                return;
                                            }
                                            setMarks((prev) => [
                                                ...prev,
                                                {
                                                    value: valueInput,
                                                    label: labelInput,
                                                },
                                            ]);
                                            setValueInput(null);
                                            setLabelInput("");
                                        }
                                    }}
                                >
                                    Add Mark
                                </Button>
                                {marks.length > 0 && (
                                    <Stack
                                        alignItems="center"
                                        direction="row"
                                        spacing={10}
                                    >
                                        <select
                                            value={
                                                markToDelete
                                                    ? markToDelete.value
                                                    : ""
                                            }
                                            onChange={(e) => {
                                                const value = Number(
                                                    e.target.value,
                                                );
                                                setMarkToDelete(
                                                    marks.find(
                                                        (m) =>
                                                            m.value === value,
                                                    ) ?? null,
                                                );
                                            }}
                                            css={{
                                                padding: 10,
                                                borderRadius: 5,
                                                border: "1px solid #ccc",
                                                backgroundColor: "#f9f9f9",
                                                width: "100%",
                                            }}
                                        >
                                            {marks.map((mark) => (
                                                <option
                                                    key={mark.value}
                                                    value={mark.value}
                                                >
                                                    {mark.label ??
                                                        `Value: ${mark.value}`}
                                                </option>
                                            ))}
                                        </select>
                                        <Button
                                            color="danger"
                                            onClick={() => {
                                                setMarks((prev) =>
                                                    prev.filter(
                                                        (m) =>
                                                            m !== markToDelete,
                                                    ),
                                                );
                                                setMarkToDelete(
                                                    marks[0] ?? null,
                                                );
                                            }}
                                        >
                                            Delete Mark
                                        </Button>
                                    </Stack>
                                )}
                            </Stack>
                        )}
                    </Stack>
                    <Divider />
                    <Stack direction="column" spacing={10}>
                        <label>Value Display</label>
                        <RadioButtonGroup
                            row
                            onChange={(_, labelDisplayValue) =>
                                setValueDisplay(
                                    labelDisplayValue as SliderValueLabelDisplay,
                                )
                            }
                            value={valueDisplay}
                            name="labelDisplay"
                        >
                            <RadioButton
                                value="off"
                                label="Off"
                                checked={valueDisplay === "off"}
                                color="neutral"
                                onChange={() => setValueDisplay("off")}
                            />
                            <RadioButton
                                value="on"
                                label="On"
                                checked={valueDisplay === "on"}
                                color="neutral"
                                onChange={() => setValueDisplay("on")}
                            />
                            <RadioButton
                                value="auto"
                                label="Auto"
                                checked={valueDisplay === "auto"}
                                color="neutral"
                                onChange={() => setValueDisplay("auto")}
                            />
                        </RadioButtonGroup>
                    </Stack>
                    <Divider />
                    <Stack direction="column" spacing={10}>
                        <Stack
                            justifyContent="space-between"
                            direction="row"
                            spacing={5}
                        >
                            <label>Step</label>
                            <Checkbox
                                checked={step === null}
                                label={
                                    <span css={{ fontSize: 12 }}>
                                        Default/Snap To Marks
                                    </span>
                                }
                                onChange={() =>
                                    setStep((prev) => (prev ? null : 1))
                                }
                            />
                        </Stack>
                        {step !== null && (
                            <input
                                type="number"
                                value={step}
                                onChange={(e) =>
                                    setStep(
                                        e.target.value
                                            ? Number(e.target.value)
                                            : null,
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
                        )}
                    </Stack>
                    <Divider />
                    <Stack direction="row" spacing={5}>
                        <Stack direction="column" spacing={10}>
                            <label>Min</label>
                            <input
                                type="number"
                                value={min}
                                onChange={(e) => setMin(Number(e.target.value))}
                                css={{
                                    padding: 10,
                                    borderRadius: 5,
                                    border: "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                    width: "100%",
                                }}
                            />
                        </Stack>
                        <Stack direction="column" spacing={10}>
                            <label>Max</label>
                            <input
                                type="number"
                                value={max}
                                onChange={(e) => setMax(Number(e.target.value))}
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
                    <Divider />
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
                                    css={{
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
                </Stack>
            </Paper>
        </Stack>
    );
}
