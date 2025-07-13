import {
    Button,
    ButtonGroup,
    Checkbox,
    type Color,
    type ColorLike,
    Divider,
    Input,
    Paper,
    Radio,
    RadioGroup,
    randomHexColor,
    type Size,
    Slider,
    Stack,
    useColorInput,
    type Variant,
} from "@mutualzz/ui";
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
import capitalize from "lodash-es/capitalize";
import numWords from "num-words";
import { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

export const Route = createFileRoute("/ui/inputs/button-group")({
    component: PlaygroundButtonGroup,
    head: () => ({
        meta: [
            ...seo({
                title: "Button Group - Mutualzz UI",
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

function PlaygroundButtonGroup() {
    const [color, setColor] = useState<Color | ColorLike>("primary");
    const [separatorColor, setSeparatorColor] = useState<
        Color | ColorLike | "none"
    >("none");
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

    const [customSeparatorColorToggle, setCustomSeparatorColorToggle] =
        useState(false);

    const {
        inputValue: inputColorValue,
        color: customColor,
        isInvalid,
        handleChange,
        validate,
        setColorDirectly,
    } = useColorInput<Color | ColorLike>();

    const {
        inputValue: inputSeparatorColorValue,
        color: customSeparatorColor,
        isInvalid: isSeparatorColorInvalid,
        handleChange: handleSeparatorColorChange,
        validate: validateSeparatorColor,
        setColorDirectly: setSeparatorColorDirectly,
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
        <Stack width="100%" spacing={10} direction="row">
            <Paper
                width="100%"
                direction="row"
                alignItems="flex-start"
                alignContent="flex-start"
                wrap="wrap"
                p={20}
                spacing={5}
            >
                {variant === "all" && (
                    <ButtonGroup
                        orientation={orientation}
                        spacing={spacing}
                        color={color}
                        separatorColor={
                            separatorColor !== "none"
                                ? separatorColor
                                : undefined
                        }
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
                        separatorColor={
                            separatorColor !== "none"
                                ? separatorColor
                                : undefined
                        }
                    >
                        {buttons}
                    </ButtonGroup>
                )}
            </Paper>
            <Paper alignItems="center" direction="column" p={20} shrink={1}>
                <Divider>Playground</Divider>
                <Stack width="100%" direction="column" spacing={5}>
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
                    {variant !== "all" && (
                        <>
                            <Stack direction="column" spacing={5}>
                                <label>
                                    Number of Buttons: <b>{numberOfButtons}</b>
                                </label>
                                <Stack direction="row" spacing={5}>
                                    <Button
                                        color="warning"
                                        variant="soft"
                                        onClick={() =>
                                            setNumberOfButtons((prev) =>
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
                                            setNumberOfButtons(
                                                (prev) => prev + 1,
                                            )
                                        }
                                    >
                                        <FaPlus />
                                    </Button>
                                    <Button
                                        color="danger"
                                        variant="solid"
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
                                <Input
                                    variant="solid"
                                    size="lg"
                                    color="primary"
                                    placeholder="Enter color (e.g. #ff0000)"
                                    value={inputColorValue}
                                    onChange={(e) =>
                                        handleChange(e.target.value)
                                    }
                                    onBlur={validate}
                                    error={isInvalid}
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
                            <RadioGroup
                                onChange={(_, clr) => setColor(clr as Color)}
                                value={color}
                                name="colors"
                            >
                                {colors.map((c) => (
                                    <Radio
                                        key={c}
                                        value={c}
                                        label={capitalize(c)}
                                        checked={color === c}
                                        color="neutral"
                                        onChange={() => setColor(c)}
                                    />
                                ))}
                            </RadioGroup>
                        )}
                    </Stack>
                    <Divider />
                    <Stack direction="column" spacing={10}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            spacing={5}
                        >
                            <label>
                                {customSeparatorColorToggle
                                    ? "Custom Separator Color"
                                    : "Separator Color"}
                            </label>
                            <Checkbox
                                checked={customSeparatorColorToggle}
                                label="Custom"
                                onChange={() =>
                                    setCustomSeparatorColorToggle((prev) => {
                                        setColor("primary");
                                        return !prev;
                                    })
                                }
                            />
                        </Stack>
                        {customSeparatorColorToggle ? (
                            <Stack
                                alignContent="center"
                                direction="row"
                                spacing={5}
                            >
                                <Input
                                    variant="solid"
                                    size="lg"
                                    color="primary"
                                    placeholder="Enter color (e.g. #ff0000)"
                                    value={inputSeparatorColorValue}
                                    onChange={(e) =>
                                        handleSeparatorColorChange(
                                            e.target.value,
                                        )
                                    }
                                    onBlur={validateSeparatorColor}
                                    error={isSeparatorColorInvalid}
                                />
                                <Button
                                    color="primary"
                                    disabled={!customSeparatorColor}
                                    onClick={() => {
                                        setSeparatorColor(
                                            customSeparatorColor as ColorLike,
                                        );
                                        setSeparatorColorDirectly(
                                            randomHexColor(),
                                        );
                                    }}
                                >
                                    Set Color
                                </Button>
                            </Stack>
                        ) : (
                            <RadioGroup
                                onChange={(_, clr) =>
                                    setSeparatorColor(clr as Color)
                                }
                                value={separatorColor}
                                name="separator-colors"
                            >
                                {colors.map((c) => (
                                    <Radio
                                        key={c}
                                        value={c}
                                        label={capitalize(c)}
                                        checked={separatorColor === c}
                                        color="neutral"
                                        onChange={() => setSeparatorColor(c)}
                                    />
                                ))}
                                <Radio
                                    value="none"
                                    label="None"
                                    checked={separatorColor === "none"}
                                    color="neutral"
                                    onChange={() => setSeparatorColor("none")}
                                />
                            </RadioGroup>
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
                                        if (prev) setSize("md");
                                        else setSize(Math.round((24 + 10) / 2));
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
                            row
                            onChange={(_, orientation) =>
                                setOrientation(orientation as "horizontal")
                            }
                            value={orientation}
                            name="orientation"
                        >
                            <Radio
                                value="horizontal"
                                label="Horizontal"
                                checked={orientation === "horizontal"}
                                color="neutral"
                                onChange={() => setOrientation("horizontal")}
                            />
                            <Radio
                                value="vertical"
                                label="Vertical"
                                checked={orientation === "vertical"}
                                color="neutral"
                                onChange={() => setOrientation("vertical")}
                            />
                        </RadioGroup>
                    </Stack>
                    <Divider />
                    <Stack direction="column" spacing={5}>
                        <label>Spacing</label>
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
                        <Input
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
                </Stack>
            </Paper>
        </Stack>
    );
}
