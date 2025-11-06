import { PlaygroundContent } from "@components/Playground/PlaygroundContent";
import { PlaygroundRightSidebar } from "@components/Playground/PlaygroundRightSidebar";
import {
    randomColor,
    type Color,
    type ColorLike,
    type ColorResult,
    type Size,
    type Variant,
} from "@mutualzz/ui-core";
import {
    Button,
    Checkbox,
    Divider,
    IconButton,
    Input,
    Option,
    Radio,
    RadioGroup,
    Select,
    Slider,
    Stack,
    Typography,
    type SliderMark,
    type SliderOrientation,
    type SliderValueLabelDisplay,
} from "@mutualzz/ui-web";
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
import capitalize from "lodash-es/capitalize";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";

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

    const [customColor, setCustomColor] = useState<ColorLike>(randomColor());

    const allSliders = [...colors, ...customColors].map((c) =>
        variants.map((v) => (
            <Stack
                justifyContent="center"
                alignItems="center"
                direction="column"
                key={`${v}-${c}`}
                width={orientation === "horizontal" ? 150 : "auto"}
                height={orientation === "vertical" ? 150 : "auto"}
                spacing={5}
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
            spacing={5}
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
        <Stack width="100%" direction="row">
            <PlaygroundContent
                direction={variant === "all" ? "column" : "row"}
                alignItems="flex-start"
                alignContent="flex-start"
                wrap={variant === "all" ? "nowrap" : "wrap"}
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
            </PlaygroundContent>
            <PlaygroundRightSidebar>
                <Stack direction="column" spacing={5}>
                    <Typography>Variant</Typography>
                    <RadioGroup
                        onChange={(_, vriant) => setVariant(vriant as Variant)}
                        value={variant}
                        name="variants"
                        color="neutral"
                        spacing={5}
                    >
                        <Radio key="all" value="all" label="All" />
                        {variants.map((v) => (
                            <Radio key={v} value={v} label={capitalize(v)} />
                        ))}
                    </RadioGroup>
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography>Size</Typography>
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
                            size="sm"
                        />
                    </Stack>
                    {customSizeToggle ? (
                        <Slider
                            value={size as number}
                            min={10}
                            max={24}
                            onChange={(e) => setSize(Number(e.target.value))}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(value) => `${value}px`}
                        />
                    ) : (
                        <RadioGroup
                            onChange={(_, size) => setSize(size as Size)}
                            value={size as Size}
                            name="sizes"
                            orientation="horizontal"
                            spacing={10}
                            color="neutral"
                        >
                            {Object.keys(sizeNames).map((s) => (
                                <Radio
                                    key={s}
                                    value={s}
                                    label={sizeNames[s as Size]}
                                />
                            ))}
                        </RadioGroup>
                    )}
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Typography>Orientation</Typography>
                    <RadioGroup
                        onChange={(_, orientationValue) =>
                            setOrientation(
                                orientationValue as SliderOrientation,
                            )
                        }
                        value={orientation}
                        name="orientation"
                        orientation="horizontal"
                        spacing={10}
                        color="neutral"
                    >
                        <Radio value="horizontal" label="Horizontal" />
                        <Radio value="vertical" label="Vertical" />
                    </RadioGroup>
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Typography>Min</Typography>
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
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Typography>Max</Typography>
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
                <Stack
                    direction="column"
                    spacing={5}
                    wrap="wrap"
                    width="100%"
                ></Stack>
                <Divider />
                <Stack direction="column" spacing={10}>
                    <Stack
                        justifyContent="space-between"
                        direction="row"
                        spacing={5}
                    >
                        <Typography>Step</Typography>
                        <Checkbox
                            checked={step === null}
                            label="Default/Snap To Marks"
                            onChange={() =>
                                setStep((prev) => (prev ? null : 1))
                            }
                            size="sm"
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
                <Stack direction="column" spacing={10}>
                    <Stack direction="column" spacing={10}>
                        <Typography>States</Typography>
                        <Stack direction="row" spacing={10}>
                            <Checkbox
                                checked={disabled}
                                label="Disabled"
                                onChange={() => setDisabled((prev) => !prev)}
                            />
                            <Checkbox
                                checked={controlled}
                                label="Controlled"
                                disabled={disabled}
                                onChange={() => setControlled((prev) => !prev)}
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
                    <Typography>Marks</Typography>
                    <RadioGroup
                        orientation="horizontal"
                        onChange={(_, markStateValue) =>
                            setMarkState(
                                markStateValue as "off" | "on" | "custom",
                            )
                        }
                        value={markState}
                        name="markState"
                        spacing={10}
                        color="neutral"
                    >
                        <Radio value="off" label="Off" />
                        <Radio value="on" label="On" />
                        <Radio value="custom" label="Custom" />
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
                                    min={min}
                                    max={max}
                                    onChange={(e) => {
                                        let value = Number(e.target.value);
                                        if (isNaN(value)) value = min;
                                        if (value < min) value = min;
                                        if (value > max) value = max;
                                        setValueInput(value);
                                    }}
                                />
                                <Input
                                    type="text"
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
                                                (m) => m.value === valueInput,
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
                                    <Select
                                        value={markToDelete ? markToDelete : ""}
                                        onValueChange={(value) => {
                                            setMarkToDelete(Number(value));
                                        }}
                                    >
                                        {marks.map((mark) => (
                                            <Option
                                                key={mark.value}
                                                value={mark.value}
                                            >
                                                {mark.label ??
                                                    `Value: ${mark.value}`}
                                            </Option>
                                        ))}
                                    </Select>
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
                                                              updated.length - 1
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
                <Stack direction="column" spacing={5}>
                    <Typography>Value Display</Typography>
                    <RadioGroup
                        orientation="horizontal"
                        onChange={(_, labelDisplayValue) =>
                            setValueDisplay(
                                labelDisplayValue as SliderValueLabelDisplay,
                            )
                        }
                        value={valueDisplay}
                        name="labelDisplay"
                        color="neutral"
                        spacing={10}
                    >
                        <Radio value="off" label="Off" />
                        <Radio value="on" label="On" />
                        <Radio value="auto" label="Auto" />
                    </RadioGroup>
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Typography>Custom Color</Typography>
                    <Stack direction="column" spacing={10}>
                        <Input
                            type="color"
                            variant="solid"
                            size="lg"
                            color="primary"
                            placeholder="Enter a color (e.g., #ff0000)"
                            value={customColor}
                            onChangeResult={(result: ColorResult) =>
                                setCustomColor(result.hex)
                            }
                            endDecorator={
                                <IconButton
                                    color={customColor}
                                    variant="solid"
                                    onClick={() => {
                                        setCustomColors(
                                            (prev) =>
                                                [
                                                    ...prev,
                                                    customColor,
                                                ] as ColorLike[],
                                        );
                                        setCustomColor(randomColor());
                                        setColorToDelete(customColor);
                                    }}
                                >
                                    <FaPlus />
                                </IconButton>
                            }
                        />
                        {customColors.length > 0 && (
                            <Stack direction="column" spacing={10}>
                                <Select
                                    value={colorToDelete ?? ""}
                                    onValueChange={(value) => {
                                        setColorToDelete(
                                            value
                                                .toString()
                                                .trim() as ColorLike,
                                        );
                                    }}
                                    color={colorToDelete ?? "neutral"}
                                >
                                    {customColors.map((color) => (
                                        <Option
                                            color={color}
                                            key={color}
                                            value={color}
                                        >
                                            {color}
                                        </Option>
                                    ))}
                                </Select>
                                <Stack direction="column" spacing={10}>
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
                                        {customColors.length > 1
                                            ? "Delete Selected Color"
                                            : "Delete Color"}
                                    </Button>
                                    {customColors.length > 1 && (
                                        <Button
                                            variant="soft"
                                            color="danger"
                                            onClick={() => {
                                                setCustomColors([]);
                                            }}
                                        >
                                            Delete All
                                        </Button>
                                    )}
                                </Stack>
                            </Stack>
                        )}
                    </Stack>
                </Stack>
            </PlaygroundRightSidebar>
        </Stack>
    );
}
