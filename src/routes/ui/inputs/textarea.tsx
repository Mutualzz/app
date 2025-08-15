import {
    Button,
    Checkbox,
    Divider,
    Input,
    Option,
    Paper,
    Radio,
    RadioGroup,
    randomColor,
    Select,
    Slider,
    Stack,
    Textarea,
    Typography,
    type Color,
    type ColorLike,
    type Size,
    type TypographyColor,
    type Variant,
} from "@mutualzz/ui";
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
import capitalize from "lodash-es/capitalize";
import { useState } from "react";

export const Route = createFileRoute("/ui/inputs/textarea")({
    component: TextareaPlayground,
    head: () => ({
        meta: [
            ...seo({
                title: "Textarea - Mutualzz UI",
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

function TextareaPlayground() {
    const [variant, setVariant] = useState<Variant | "all">("outlined");
    const [size, setSize] = useState<Size | number>("md");
    const [disabled, setDisabled] = useState(false);

    const [resizable, setResizable] = useState(false);
    const [minRows, setMinRows] = useState(1);
    const [maxRows, setMaxRows] = useState<number | null>(null);

    const [textColor, setTextColor] = useState<TypographyColor | "inherit">(
        "inherit",
    );
    const [customTextColorEnabled, setCustomTextColorEnabled] = useState(false);

    const [placeholder, setPlaceholder] = useState<string | null>(null);

    const [value, setValue] = useState<string | null>(null);

    const [controlled, setControlled] = useState(false);

    const [customSizeToggle, setCustomSizeToggle] = useState(false);

    const [customColors, setCustomColors] = useState<ColorLike[]>([]);
    const [colorToDelete, setColorToDelete] = useState<ColorLike | null>(null);

    const [customColor, setCustomColor] = useState<ColorLike>(randomColor());
    const [customTextColor, setCustomTextColor] =
        useState<ColorLike>(randomColor());

    const allTextareas = [...colors, ...customColors].map((c) =>
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
                <Textarea
                    key={`${v}-${c}-textarea`}
                    color={c}
                    textColor={
                        customTextColorEnabled ? customTextColor : textColor
                    }
                    placeholder={placeholder ?? "Type something..."}
                    variant={v}
                    size={size}
                    onChange={(e) => {
                        if (controlled) setValue(e.target.value);
                    }}
                    value={controlled ? (value ?? "") : undefined}
                    disabled={disabled}
                    resizable={resizable}
                    minRows={minRows}
                    maxRows={maxRows ?? undefined}
                />
            </Stack>
        )),
    );

    const textareas = [...colors, ...customColors].map((c) => (
        <Stack
            justifyContent="center"
            alignItems="center"
            direction="column"
            key={c}
        >
            <Typography>
                {capitalize(variant)} {capitalize(c)}
            </Typography>
            <Textarea
                key={`${variant}-${c}-textarea`}
                variant={variant as Variant}
                placeholder={placeholder ?? "Type something..."}
                size={size}
                onChange={(e) => {
                    if (controlled) setValue(e.target.value);
                }}
                value={controlled ? (value ?? "") : undefined}
                disabled={disabled}
                color={c}
                textColor={customTextColorEnabled ? customTextColor : textColor}
                startDecorator
                resizable={resizable}
                minRows={minRows}
                maxRows={maxRows ?? undefined}
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
                    allTextareas.map((textareas, i) => (
                        <Stack wrap="wrap" direction="row" spacing={5} key={i}>
                            {textareas}
                        </Stack>
                    ))}
                {variant !== "all" && textareas}
            </Paper>
            <Paper width="25%" overflowY="auto" direction="column" p={20}>
                <Divider>Playground</Divider>
                <Stack direction="column" spacing={5}>
                    <Typography>Variant</Typography>
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
                        <Typography>Text Color</Typography>
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
                    <Typography>States</Typography>
                    <Stack direction="column" spacing={5}>
                        <Checkbox
                            checked={resizable}
                            label="Resizable"
                            onChange={() => setResizable((prev) => !prev)}
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
                    <Typography>Placeholder</Typography>
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
                <Stack direction="row" spacing={5}>
                    <Stack direction="column" spacing={5}>
                        <Typography>Min Rows</Typography>
                        <Input
                            type="number"
                            variant="solid"
                            size="lg"
                            color="primary"
                            value={minRows}
                            min={1}
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                if (!isNaN(value) && value >= 1) {
                                    setMinRows(value);
                                }
                            }}
                            placeholder="Enter min rows"
                        />
                    </Stack>
                    <Stack direction="column" spacing={5}>
                        <Typography>Max Rows</Typography>
                        <Input
                            type="number"
                            variant="solid"
                            size="lg"
                            color="primary"
                            min={1}
                            value={maxRows ?? undefined}
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value >= 1 || e.target.value === "") {
                                    setMaxRows(
                                        e.target.value === "" ? null : value,
                                    );
                                }
                            }}
                            placeholder="Enter max rows (optional)"
                        />
                    </Stack>
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Typography>Custom Color</Typography>
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
                            <Select
                                value={colorToDelete ?? ""}
                                onValueChange={(value) => {
                                    setColorToDelete(
                                        value.toString().trim() as ColorLike,
                                    );
                                }}
                            >
                                {customColors.map((color) => (
                                    <Option key={color} value={color}>
                                        {color}
                                    </Option>
                                ))}
                            </Select>
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
