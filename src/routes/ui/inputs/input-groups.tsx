import { PlaygroundContent } from "@components/Playground/PlaygroundContent";
import { PlaygroundRightSidebar } from "@components/Playground/PlaygroundRightSidebar";
import {
    Button,
    ButtonGroup,
    Checkbox,
    CheckboxGroup,
    type Color,
    type ColorLike,
    Divider,
    Input,
    Radio,
    RadioGroup,
    randomColor,
    type Size,
    Slider,
    Stack,
    Typography,
    type Variant,
} from "@mutualzz/ui";
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
import capitalize from "lodash-es/capitalize";
import numWords from "num-words";
import { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

export const Route = createFileRoute("/ui/inputs/input-groups")({
    component: PlaygroundInputGroups,
    head: () => ({
        meta: [
            ...seo({
                title: "Input Groups - Mutualzz UI",
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

type InputType = "button" | "checkbox" | "radio";

const inputTypes = ["button", "checkbox", "radio"] as InputType[];

function PlaygroundInputGroups() {
    const [color, setColor] = useState<Color>("primary");
    const [separatorColor, setSeparatorColor] = useState<Color | "none">(
        "none",
    );
    const [variant, setVariant] = useState<Variant | "all">("all");

    const [inputType, setInputType] = useState<InputType>("button");

    const [text, setText] = useState<string | null>(null);
    const [size, setSize] = useState<Size | number>("md");
    const [spacing, setSpacing] = useState(0);
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);

    const [numberOfInputs, setNumberOfInputs] = useState(4);

    const [checkboxValues, setCheckboxValues] = useState<string[]>([
        "solid",
        "outlined",
    ]);

    const [radioValue, setRadioValue] = useState("solid");

    const [orientation, setOrientation] = useState<"horizontal" | "vertical">(
        "horizontal",
    );

    const [customSizeToggle, setCustomSizeToggle] = useState(false);
    const [customColorToggle, setCustomColorToggle] = useState(false);

    const [customSeparatorColorToggle, setCustomSeparatorColorToggle] =
        useState(false);

    const [customColor, setCustomColor] = useState<ColorLike>(randomColor());
    const [customSeparatorColor, setCustomSeparatorColor] =
        useState<ColorLike>(randomColor());

    const allInputs = variants.map((v) => {
        let componentToReturn;

        switch (inputType) {
            case "button":
                componentToReturn = (
                    <Button key={`${v}-${color}-button`} variant={v}>
                        {text ?? `${capitalize(v)} ${capitalize(color)}`}
                    </Button>
                );
                break;
            case "checkbox":
                componentToReturn = (
                    <Checkbox
                        key={`${v}-${color}-checkbox`}
                        variant={v}
                        label={text ?? `${capitalize(v)} ${capitalize(color)}`}
                        value={v}
                    />
                );
                break;
            case "radio":
                componentToReturn = (
                    <Radio
                        key={`${v}-${color}-radio`}
                        variant={v}
                        label={text ?? `${capitalize(v)} ${capitalize(color)}`}
                        value={v}
                    />
                );
                break;
        }

        return componentToReturn;
    });

    const inputs = new Array(numberOfInputs).fill(0).map((_, index) => {
        let componentToReturn;

        switch (inputType) {
            case "button":
                componentToReturn = (
                    <Button
                        key={`${variant}-${color}-button-${index}`}
                        loading={loading}
                    >
                        {text ?? capitalize(numWords(index + 1))}
                    </Button>
                );
                break;
            case "checkbox":
                componentToReturn = (
                    <Checkbox
                        key={`${variant}-${color}-checkbox-${index}`}
                        label={text ?? capitalize(numWords(index + 1))}
                        value={numWords(index + 1)}
                    />
                );
                break;
            case "radio":
                componentToReturn = (
                    <Radio
                        key={`${variant}-${color}-radio-${index}`}
                        label={text ?? capitalize(numWords(index + 1))}
                        value={numWords(index + 1)}
                    />
                );
                break;
        }

        return componentToReturn;
    });

    let group;
    let groupWithoutAll;

    switch (inputType) {
        case "button": {
            group = (
                <ButtonGroup
                    key={`${variant}-${color}-button-group`}
                    orientation={orientation}
                    spacing={spacing}
                    color={customColorToggle ? customColor : color}
                    separatorColor={
                        customSeparatorColorToggle
                            ? customSeparatorColor
                            : separatorColor !== "none"
                              ? separatorColor
                              : undefined
                    }
                    size={size}
                    loading={loading}
                    disabled={disabled}
                >
                    {allInputs}
                </ButtonGroup>
            );
            groupWithoutAll = (
                <ButtonGroup
                    key={`${variant}-${color}-button-group`}
                    orientation={orientation}
                    spacing={spacing}
                    color={customColorToggle ? customColor : color}
                    variant={variant as Variant}
                    size={size}
                    disabled={disabled}
                    loading={loading}
                    separatorColor={
                        customSeparatorColorToggle
                            ? customSeparatorColor
                            : separatorColor !== "none"
                              ? separatorColor
                              : undefined
                    }
                >
                    {inputs}
                </ButtonGroup>
            );
            break;
        }
        case "checkbox": {
            group = (
                <CheckboxGroup
                    key={`${variant}-${color}-checkbox-group`}
                    orientation={orientation}
                    spacing={spacing}
                    color={customColorToggle ? customColor : color}
                    value={checkboxValues}
                    onChange={(_, values) => setCheckboxValues(values)}
                >
                    {allInputs}
                </CheckboxGroup>
            );
            groupWithoutAll = (
                <CheckboxGroup
                    key={`${variant}-${color}-checkbox-group`}
                    orientation={orientation}
                    spacing={spacing}
                    color={customColorToggle ? customColor : color}
                    variant={variant as Variant}
                    size={size}
                    disabled={disabled}
                    value={checkboxValues}
                    onChange={(_, values) => setCheckboxValues(values)}
                >
                    {inputs}
                </CheckboxGroup>
            );
            break;
        }
        case "radio": {
            group = (
                <RadioGroup
                    key={`${variant}-${color}-radio-group`}
                    orientation={orientation}
                    spacing={spacing}
                    color={customColorToggle ? customColor : color}
                    size={size}
                    disabled={disabled}
                    value={radioValue}
                    onChange={(_, value) => setRadioValue(value)}
                >
                    {allInputs}
                </RadioGroup>
            );
            groupWithoutAll = (
                <RadioGroup
                    key={`${variant}-${color}-radio-group`}
                    orientation={orientation}
                    spacing={spacing}
                    color={customColorToggle ? customColor : color}
                    variant={variant as Variant}
                    size={size}
                    disabled={disabled}
                    value={radioValue}
                    onChange={(_, value) => setRadioValue(value)}
                >
                    {inputs}
                </RadioGroup>
            );
            break;
        }
    }

    return (
        <Stack width="100%" direction="row">
            <PlaygroundContent
                direction="row"
                alignItems="flex-start"
                alignContent="flex-start"
                wrap={variant === "all" ? "nowrap" : "wrap"}
            >
                {variant === "all" && group}
                {variant !== "all" && groupWithoutAll}
            </PlaygroundContent>
            <PlaygroundRightSidebar>
                <Stack direction="column" spacing={5}>
                    <Typography>Input Type</Typography>
                    <RadioGroup
                        onChange={(_, type) => setInputType(type as InputType)}
                        value={inputType}
                        name="input-types"
                        color="neutral"
                        spacing={5}
                    >
                        {inputTypes.map((it) => (
                            <Radio key={it} value={it} label={capitalize(it)} />
                        ))}
                    </RadioGroup>
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Typography>Variant</Typography>
                    <RadioGroup
                        onChange={(_, vriant) => setVariant(vriant as Variant)}
                        value={variant}
                        name="variants"
                        color="neutral"
                        spacing={5}
                    >
                        <Radio value="all" label="All" />
                        {variants.map((v) => (
                            <Radio key={v} value={v} label={capitalize(v)} />
                        ))}
                    </RadioGroup>
                </Stack>
                <Divider />
                {variant !== "all" && (
                    <>
                        <Stack direction="column" spacing={5}>
                            <Typography>
                                Number of Inputs:{" "}
                                <Typography fontWeight="bold">
                                    {numberOfInputs}
                                </Typography>
                            </Typography>
                            <Stack direction="row" spacing={5}>
                                <Button
                                    color="warning"
                                    variant="soft"
                                    onClick={() =>
                                        setNumberOfInputs((prev) =>
                                            prev > 4 ? prev - 1 : prev,
                                        )
                                    }
                                >
                                    <FaMinus />
                                </Button>
                                <Button
                                    color="success"
                                    variant="soft"
                                    onClick={() =>
                                        setNumberOfInputs((prev) => prev + 1)
                                    }
                                >
                                    <FaPlus />
                                </Button>
                                <Button
                                    color="danger"
                                    variant="solid"
                                    onClick={() => setNumberOfInputs(4)}
                                >
                                    Reset
                                </Button>
                            </Stack>
                        </Stack>
                        <Divider />
                    </>
                )}
                <Stack direction="column" spacing={5}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={5}
                    >
                        <Typography>Color</Typography>
                        <Checkbox
                            checked={customColorToggle}
                            label="Custom"
                            onChange={() =>
                                setCustomColorToggle((prev) => {
                                    setColor("primary");
                                    return !prev;
                                })
                            }
                            size="sm"
                        />
                    </Stack>
                    {customColorToggle ? (
                        <Input
                            type="color"
                            variant="solid"
                            size="lg"
                            color="primary"
                            placeholder="Enter color (e.g. #ff0000)"
                            value={customColor}
                            onChange={setCustomColor}
                            showRandom
                        />
                    ) : (
                        <RadioGroup
                            onChange={(_, clr) => setColor(clr as Color)}
                            value={color}
                            name="colors"
                            color="neutral"
                            spacing={5}
                        >
                            {colors.map((c) => (
                                <Radio
                                    key={c}
                                    value={c}
                                    label={capitalize(c)}
                                />
                            ))}
                        </RadioGroup>
                    )}
                </Stack>
                <Divider />
                {inputType === "button" && (
                    <>
                        <Stack direction="column" spacing={5}>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                spacing={5}
                            >
                                <Typography>Separator Color</Typography>
                                <Checkbox
                                    checked={customSeparatorColorToggle}
                                    label="Custom"
                                    onChange={() =>
                                        setCustomSeparatorColorToggle(
                                            (prev) => {
                                                setColor("primary");
                                                return !prev;
                                            },
                                        )
                                    }
                                    size="sm"
                                />
                            </Stack>
                            {customSeparatorColorToggle ? (
                                <Input
                                    type="color"
                                    variant="solid"
                                    size="lg"
                                    color="primary"
                                    placeholder="Enter color (e.g. #ff0000)"
                                    value={customSeparatorColor}
                                    onChange={setCustomSeparatorColor}
                                    showRandom
                                />
                            ) : (
                                <RadioGroup
                                    onChange={(_, clr) =>
                                        setSeparatorColor(clr as Color)
                                    }
                                    value={separatorColor}
                                    name="separator-colors"
                                    spacing={5}
                                    color="neutral"
                                >
                                    <Radio value="none" label="None" />
                                    {colors.map((c) => (
                                        <Radio
                                            key={c}
                                            value={c}
                                            label={capitalize(c)}
                                        />
                                    ))}
                                </RadioGroup>
                            )}
                        </Stack>
                        <Divider />
                    </>
                )}

                <Stack direction="column" spacing={5}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={5}
                    >
                        <Typography>Size</Typography>
                        <Checkbox
                            checked={customSizeToggle}
                            label="Custom"
                            onChange={() =>
                                setCustomSizeToggle((prev) => {
                                    if (prev) setSize("md");
                                    else setSize(Math.round((24 + 10) / 2));
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
                            spacing={5}
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
                    <Typography>Orientation</Typography>
                    <RadioGroup
                        orientation="horizontal"
                        onChange={(_, ori) =>
                            setOrientation(ori as "horizontal")
                        }
                        value={orientation}
                        name="orientation"
                        color="neutral"
                        spacing={10}
                    >
                        <Radio value="horizontal" label="Horizontal" />
                        <Radio value="vertical" label="Vertical" />
                    </RadioGroup>
                </Stack>
                <Divider />
                <Stack direction="column" spacing={10}>
                    <Typography>Spacing</Typography>
                    <Slider
                        value={spacing}
                        min={0}
                        max={100}
                        onChange={(e) => setSpacing(Number(e.target.value))}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${value}px`}
                    />
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Typography>States</Typography>
                    <Stack direction="row" spacing={10}>
                        {inputType === "button" && (
                            <Checkbox
                                checked={loading}
                                label="Loading"
                                onChange={() => setLoading((prev) => !prev)}
                                disabled={disabled}
                            />
                        )}
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
                    <Typography>Text</Typography>
                    <Input
                        type="text"
                        variant="solid"
                        size="lg"
                        color="primary"
                        placeholder="Enter button text"
                        value={text ?? ""}
                        onChange={(e) =>
                            setText(
                                e.target.value.trim() === ""
                                    ? null
                                    : e.target.value,
                            )
                        }
                        fullWidth
                    />
                </Stack>
            </PlaygroundRightSidebar>
        </Stack>
    );
}
