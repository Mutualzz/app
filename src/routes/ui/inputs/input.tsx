import {
    Button,
    Checkbox,
    Divider,
    Input,
    Paper,
    Radio,
    RadioGroup,
    randomColor,
    Slider,
    Stack,
    Typography,
    type Color,
    type ColorLike,
    type InputType,
    type Size,
    type TypographyColor,
    type Variant,
} from "@mutualzz/ui";
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
import capitalize from "lodash-es/capitalize";
import startCase from "lodash-es/startCase";
import { useState, type ChangeEvent } from "react";

export const Route = createFileRoute("/ui/inputs/input")({
    component: InputPlayground,
    head: () => ({
        meta: [
            ...seo({
                title: "Input - Mutualzz UI",
            }),
        ],
    }),
});

const variants = ["solid", "outlined", "plain", "soft"] as Variant[];
const colors = [
    "primary",
    "neutral",
    "danger",
    "success",
    "warning",
    "info",
] as Color[];

const types = [
    "date",
    "datetime-local",
    "color",
    "number",
    "password",
    "text",
    "time",
] as InputType[];

const sizeNames = {
    sm: "Small",
    md: "Medium",
    lg: "Large",
};

const textColors = [
    "primary",
    "secondary",
    "accent",
    "disabled",
    "inherit",
] as (TypographyColor | "inherit")[];

function InputPlayground() {
    const [variant, setVariant] = useState<Variant | "all">("outlined");
    const [size, setSize] = useState<Size | number>("md");
    const [disabled, setDisabled] = useState(false);
    const [fullWidth, setFullWidth] = useState(false);
    const [error, setError] = useState(false);

    const [textColor, setTextColor] = useState<
        TypographyColor | ColorLike | "inherit"
    >("inherit");

    const [customTextColorEnabled, setCustomTextColorEnabled] = useState(false);

    const [placeholder, setPlaceholder] = useState<string | null>(null);
    const [type, setType] = useState<InputType>("text");

    const [min, setMin] = useState<number>(-Infinity);
    const [max, setMax] = useState<number>(Infinity);

    const [value, setValue] = useState<string | null>(null);

    const [controlled, setControlled] = useState(false);

    const [customSizeToggle, setCustomSizeToggle] = useState(false);

    const [customColors, setCustomColors] = useState<ColorLike[]>([]);
    const [colorToDelete, setColorToDelete] = useState<ColorLike | null>(null);

    const [customColor, setCustomColor] = useState<ColorLike>(randomColor());
    const [customTextColor, setCustomTextColor] =
        useState<ColorLike>(randomColor());

    const allInputs = [...colors, ...customColors].map((c) =>
        variants.map((v) => (
            <Stack
                direction="column"
                justifyContent="center"
                alignItems="center"
                key={`${v}-${c}`}
            >
                <Typography>
                    {capitalize(v)} {capitalize(c)}
                </Typography>
                <Input
                    key={`${v}-${c}-input`}
                    fullWidth={fullWidth}
                    color={c}
                    textColor={
                        customTextColorEnabled ? customTextColor : textColor
                    }
                    placeholder={placeholder ?? "Type something..."}
                    variant={v}
                    size={size}
                    error={error}
                    min={min}
                    max={max}
                    onChange={(
                        e: ColorLike | ChangeEvent<HTMLInputElement>,
                    ) => {
                        if (controlled) {
                            if (type === "color") {
                                setValue(e as ColorLike);
                                return;
                            }

                            setValue(
                                (e as ChangeEvent<HTMLInputElement>).target
                                    .value,
                            );
                        }
                    }}
                    value={controlled ? (value ?? "") : undefined}
                    disabled={disabled}
                    type={type}
                />
            </Stack>
        )),
    );

    const inputs = [...colors, ...customColors].map((c) => (
        <Stack
            justifyContent="center"
            alignItems="center"
            direction="column"
            key={c}
        >
            <Typography>
                {capitalize(variant)} {capitalize(c)}
            </Typography>
            <Input
                key={`${variant}-${c}-input`}
                variant={variant as Variant}
                placeholder={placeholder ?? "Type something..."}
                size={size}
                min={min}
                error={error}
                max={max}
                onChange={(e: ColorLike | ChangeEvent<HTMLInputElement>) => {
                    if (controlled) {
                        if (type === "color") {
                            setValue(e as ColorLike);
                            return;
                        }

                        setValue(
                            (e as ChangeEvent<HTMLInputElement>).target.value,
                        );
                    }
                }}
                value={controlled ? (value ?? "") : undefined}
                disabled={disabled}
                color={c}
                textColor={customTextColorEnabled ? customTextColor : textColor}
                fullWidth={fullWidth}
                type={type}
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
                wrap={variant === "all" ? "nowrap" : "wrap"}
                p={20}
                spacing={variant === "all" ? 10 : 5}
                overflowY="auto"
            >
                {variant === "all" &&
                    allInputs.map((inputs, i) => (
                        <Stack wrap="wrap" direction="row" spacing={5} key={i}>
                            {inputs}
                        </Stack>
                    ))}
                {variant !== "all" && inputs}
            </Paper>
            <Paper width="25%" overflowY="auto" direction="column" p={20}>
                <Divider>Playground</Divider>
                <Stack direction="column" spacing={5}>
                    <label>Variant</label>
                    <RadioGroup
                        onChange={(_, vriant) => setVariant(vriant as Variant)}
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
                            min={6}
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
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={5}
                    >
                        <label>Text Color</label>
                        <Checkbox
                            label="Custom"
                            checked={customTextColorEnabled}
                            onChange={(e) =>
                                setCustomTextColorEnabled(e.target.checked)
                            }
                        />
                    </Stack>
                    {customTextColorEnabled ? (
                        <Stack direction="row" spacing={5}>
                            <Input
                                type="color"
                                variant="solid"
                                size="lg"
                                color="primary"
                                fullWidth
                                placeholder="Enter a text color (e.g. #ff0000)"
                                value={customTextColor}
                                onChange={setCustomTextColor}
                            />
                            <Button
                                variant="solid"
                                color="neutral"
                                onClick={() => {
                                    setCustomTextColor(randomColor());
                                }}
                            >
                                Random
                            </Button>
                        </Stack>
                    ) : (
                        <RadioGroup
                            onChange={(_, textColor) =>
                                setTextColor(
                                    textColor as TypographyColor | "inherit",
                                )
                            }
                            value={textColor}
                            name="textColors"
                        >
                            {textColors.map((c) => (
                                <Radio
                                    key={c}
                                    value={c}
                                    label={capitalize(c)}
                                    checked={textColor === c}
                                    color="neutral"
                                    onChange={() =>
                                        setTextColor(c as TypographyColor)
                                    }
                                />
                            ))}
                        </RadioGroup>
                    )}
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <label>States</label>
                    <Stack direction="column" spacing={5}>
                        <Checkbox
                            checked={fullWidth}
                            label="Full Width"
                            onChange={() => setFullWidth((prev) => !prev)}
                        />
                        <Checkbox
                            checked={disabled}
                            label="Disabled"
                            onChange={() => setDisabled((prev) => !prev)}
                        />
                        <Checkbox
                            checked={controlled}
                            label="Controlled"
                            onChange={() => setControlled((prev) => !prev)}
                        />
                        <Checkbox
                            checked={error}
                            label="Error"
                            onChange={() => setError((prev) => !prev)}
                        />
                    </Stack>
                    {controlled && (
                        <Input
                            type="text"
                            variant="solid"
                            size="lg"
                            color="primary"
                            fullWidth
                            value={value ?? ""}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="Controlled value"
                        />
                    )}
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <label>Placeholder</label>
                    <Input
                        type="text"
                        variant="solid"
                        size="lg"
                        color="primary"
                        fullWidth
                        value={placeholder ?? ""}
                        onChange={(e) =>
                            e.target.value === ""
                                ? setPlaceholder(null)
                                : setPlaceholder(e.target.value)
                        }
                        placeholder="Enter placeholder text"
                    />
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <label>Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as InputType)}
                        css={{
                            padding: 10,
                            borderRadius: 5,
                            border: "1px solid #ccc",
                            backgroundColor: "#f9f9f9",
                            width: "100%",
                        }}
                    >
                        {types.map((t) => (
                            <option key={t} value={t}>
                                {startCase(t)}
                            </option>
                        ))}
                    </select>
                </Stack>
                <Divider />
                {type === "number" && (
                    <>
                        <Stack
                            direction="row"
                            spacing={5}
                            wrap="wrap"
                            width="100%"
                        >
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
                                    onChange={(e) =>
                                        setMin(Number(e.target.value))
                                    }
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
                                    onChange={(e) =>
                                        setMax(Number(e.target.value))
                                    }
                                />
                            </Stack>
                        </Stack>
                        <Divider />
                    </>
                )}
                <Stack direction="column" spacing={5}>
                    <label>Custom Color</label>
                    <Stack alignContent="center" direction="row" spacing={5}>
                        <Input
                            type="color"
                            variant="solid"
                            size="lg"
                            color="primary"
                            placeholder="Enter a color (e.g., #ff0000, red)"
                            value={customColor}
                            onChange={setCustomColor}
                        />
                        <Button
                            color="primary"
                            disabled={!customColor}
                            onClick={() => {
                                setCustomColors(
                                    (prev) =>
                                        [...prev, customColor] as ColorLike[],
                                );
                                setCustomColor(randomColor());
                                setColorToDelete(customColor);
                            }}
                        >
                            Add Color
                        </Button>
                    </Stack>
                    {customColors.length > 0 && (
                        <Stack alignItems="center" direction="row" spacing={10}>
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
                                            (color) => color !== colorToDelete,
                                        );
                                        setColorToDelete(
                                            updated.length > 0
                                                ? updated[updated.length - 1]
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
            </Paper>
        </Stack>
    );
}
