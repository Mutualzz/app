import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@ui/components/inputs/Input/Input";
import { Textarea } from "@ui/components/inputs/Textarea/Textarea";
import {
    Button,
    Checkbox,
    Divider,
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
    type Variant,
} from "@ui/index";
import { capitalize } from "lodash-es";
import { useState } from "react";
import { seo } from "../../seo";

export const Route = createFileRoute("/ui/textarea")({
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

function TextareaPlayground() {
    const [variant, setVariant] = useState<Variant | "all">("outlined");
    const [size, setSize] = useState<Size | number>("md");
    const [disabled, setDisabled] = useState(false);

    const [resizable, setResizable] = useState(false);
    const [minRows, setMinRows] = useState(1);
    const [maxRows, setMaxRows] = useState<number | null>(null);

    const [placeholder, setPlaceholder] = useState<string | null>(null);

    const [value, setValue] = useState<string | null>(null);

    const [controlled, setControlled] = useState(false);

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
                wrap="wrap"
                p={20}
                spacing={variant === "all" ? 10 : 5}
            >
                {variant === "all" &&
                    allTextareas.map((textareas, i) => (
                        <Stack wrap="wrap" direction="row" spacing={5} key={i}>
                            {textareas}
                        </Stack>
                    ))}
                {variant !== "all" && textareas}
            </Paper>
            <Paper
                alignItems="center"
                direction="column"
                p={20}
                flexShrink={1}
                flexGrow={1}
                maxWidth="min(100%, 360px)"
                minWidth={0}
            >
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
                        <label>States</label>
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
                            <label>Min Rows</label>
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
                            <label>Max Rows</label>
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
                                            e.target.value === ""
                                                ? null
                                                : value,
                                        );
                                    }
                                }}
                                placeholder="Enter max rows (optional)"
                            />
                        </Stack>
                    </Stack>
                    <Divider />
                    <Stack direction="column" spacing={5}>
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
                                placeholder="Enter a color (e.g., #ff0000, red)"
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
