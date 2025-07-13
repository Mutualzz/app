import {
    Button,
    Checkbox,
    Divider,
    Input,
    Paper,
    Radio,
    RadioGroup,
    randomHexColor,
    Slider,
    Stack,
    Typography,
    useColorInput,
    type Color,
    type ColorLike,
    type Size,
    type SliderMark,
    type SliderOrientation,
    type SliderValueLabelDisplay,
    type Variant,
} from "@mutualzz/ui";
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
import capitalize from "lodash-es/capitalize";
import { useState } from "react";

export const Route = createFileRoute("/ui/inputs/slider")({
    component: SlderPlayground,
    head: () => ({
        meta: [
            ...seo({
                title: "Slider - Mutualzz UI",
            }),
        ],
    }),
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

    const [markToDelete, setMarkToDelete] = useState<number | null>(null);

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
                width={orientation === "horizontal" ? 150 : "auto"}
                height={orientation === "vertical" ? 150 : "auto"}
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
            width={orientation === "horizontal" ? 150 : "auto"}
            height={orientation === "vertical" ? 150 : "auto"}
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
        <Stack width="100%" spacing={10} direction="row">
            <Paper
                width="100%"
                direction={variant === "all" ? "column" : "row"}
                alignItems="flex-start"
                alignContent="flex-start"
                wrap="wrap"
                p={20}
                spacing={25}
            >
                {variant === "all" &&
                    allSliders.map((sliders, i) => (
                        <Stack
                            direction="row"
                            spacing={50}
                            key={i}
                            width="100%"
                        >
                            {sliders}
                        </Stack>
                    ))}
                {variant !== "all" && sliders}
            </Paper>
            <Paper
                overflowY="auto"
                alignItems="center"
                direction="column"
                p={20}
            >
                <Divider>Playground</Divider>
                <Stack width="100%" spacing={5} direction="column">
                    <Stack direction="column" spacing={5}>
                        <label>Variant</label>
                        <RadioGroup
                            onChange={(_, vriant) =>
                                setVariant(vriant as Variant)
                            }
                            value={variant}
                            name="variants"
                        >
                            <Radio
                                key="all"
                                value="all"
                                label="All"
                                checked={variant === "all"}
                                color="neutral"
                                onChange={() => setVariant("all")}
                            />
                            {variants.map((v) => (
                                <Radio
                                    key={v}
                                    value={v}
                                    label={capitalize(v)}
                                    checked={variant === v}
                                    color="neutral"
                                    onChange={() => setVariant(v)}
                                />
                            ))}
                        </RadioGroup>
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
                                        if (prev) setSize("md");
                                        else setSize((24 + 10) / 2);
                                        return !prev;
                                    })
                                }
                            />
                        </Stack>
                        {customSizeToggle ? (
                            <Slider
                                value={size as number}
                                min={10}
                                max={24}
                                onChange={(e) =>
                                    setSize(Number(e.target.value))
                                }
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => `${value}px`}
                            />
                        ) : (
                            <RadioGroup
                                onChange={(_, size) => setSize(size as Size)}
                                value={size as Size}
                                name="sizes"
                                row
                            >
                                {Object.keys(sizeNames).map((s) => (
                                    <Radio
                                        key={s}
                                        value={s}
                                        label={sizeNames[s as Size]}
                                        checked={size === s}
                                        color="neutral"
                                        onChange={() => setSize(s as Size)}
                                    />
                                ))}
                            </RadioGroup>
                        )}
                    </Stack>
                    <Divider />
                    <Stack direction="column" spacing={5}>
                        <label>Orientation</label>
                        <RadioGroup
                            onChange={(_, orientationValue) =>
                                setOrientation(
                                    orientationValue as SliderOrientation,
                                )
                            }
                            value={orientation}
                            name="orientation"
                            row
                        >
                            <Radio
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
                            <Radio
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
                        </RadioGroup>
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
                            <Slider
                                value={controlledValue}
                                onChange={(e) =>
                                    setControlledValue(Number(e.target.value))
                                }
                                min={min}
                                max={max}
                                valueLabelDisplay="auto"
                            />
                        )}
                    </Stack>
                    <Divider />
                    <Stack direction="column" spacing={10}>
                        <label>Marks</label>
                        <RadioGroup
                            row
                            onChange={(_, markStateValue) =>
                                setMarkState(
                                    markStateValue as "off" | "on" | "custom",
                                )
                            }
                            value={markState}
                            name="markState"
                        >
                            <Radio
                                value="off"
                                label="Off"
                                checked={markState === "off"}
                                color="neutral"
                                onChange={() => setMarkState("off")}
                            />
                            <Radio
                                value="on"
                                label="On"
                                checked={markState === "on"}
                                color="neutral"
                                onChange={() => setMarkState("on")}
                            />
                            <Radio
                                value="custom"
                                label="Custom"
                                checked={markState === "custom"}
                                color="neutral"
                                onChange={() => setMarkState("custom")}
                            />
                        </RadioGroup>
                        {markState === "custom" && (
                            <Stack direction="column" spacing={10}>
                                <Stack direction="row" spacing={5}>
                                    <Input
                                        variant="solid"
                                        size="lg"
                                        color="primary"
                                        fullWidth
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
                                    />
                                    <Input
                                        variant="solid"
                                        size="lg"
                                        color="primary"
                                        fullWidth
                                        placeholder="Label (optional)"
                                        value={labelInput}
                                        onChange={(e) =>
                                            setLabelInput(e.target.value)
                                        }
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
                                                    label:
                                                        labelInput.length > 0
                                                            ? labelInput
                                                            : undefined,
                                                },
                                            ]);
                                            setMarkToDelete(valueInput);
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
                                                markToDelete ? markToDelete : ""
                                            }
                                            onChange={(e) => {
                                                const value = Number(
                                                    e.target.value,
                                                );
                                                setMarkToDelete(value);
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
                                                setMarks((prev) => {
                                                    const updated = prev.filter(
                                                        (m) =>
                                                            m.value !==
                                                            markToDelete,
                                                    );
                                                    setMarkToDelete(
                                                        updated.length > 0
                                                            ? updated[
                                                                  updated.length -
                                                                      1
                                                              ].value
                                                            : null,
                                                    );

                                                    return updated;
                                                });
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
                        <RadioGroup
                            row
                            onChange={(_, labelDisplayValue) =>
                                setValueDisplay(
                                    labelDisplayValue as SliderValueLabelDisplay,
                                )
                            }
                            value={valueDisplay}
                            name="labelDisplay"
                        >
                            <Radio
                                value="off"
                                label="Off"
                                checked={valueDisplay === "off"}
                                color="neutral"
                                onChange={() => setValueDisplay("off")}
                            />
                            <Radio
                                value="on"
                                label="On"
                                checked={valueDisplay === "on"}
                                color="neutral"
                                onChange={() => setValueDisplay("on")}
                            />
                            <Radio
                                value="auto"
                                label="Auto"
                                checked={valueDisplay === "auto"}
                                color="neutral"
                                onChange={() => setValueDisplay("auto")}
                            />
                        </RadioGroup>
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
                            <Input
                                variant="solid"
                                size="lg"
                                color="primary"
                                fullWidth
                                type="number"
                                value={step}
                                onChange={(e) =>
                                    setStep(
                                        e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    )
                                }
                            />
                        )}
                    </Stack>
                    <Divider />
                    <Stack direction="row" spacing={5} wrap="wrap" width="100%">
                        <Stack
                            minWidth={0}
                            flex={1}
                            direction="column"
                            spacing={10}
                        >
                            <label>Min</label>
                            <Input
                                variant="solid"
                                size="lg"
                                color="primary"
                                fullWidth
                                type="number"
                                value={min}
                                onChange={(e) => setMin(Number(e.target.value))}
                            />
                        </Stack>
                        <Stack
                            minWidth={0}
                            direction="column"
                            spacing={10}
                            flex={1}
                        >
                            <label>Max</label>
                            <Input
                                variant="solid"
                                size="lg"
                                color="primary"
                                fullWidth
                                type="number"
                                value={max}
                                onChange={(e) => setMax(Number(e.target.value))}
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
                            <Input
                                variant="solid"
                                size="lg"
                                color="primary"
                                fullWidth
                                error={isInvalid}
                                value={inputColorValue}
                                onChange={(e) => handleChange(e.target.value)}
                                onBlur={validate}
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
