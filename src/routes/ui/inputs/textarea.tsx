import { PlaygroundContent } from "@components/Playground/PlaygroundContent";
import { PlaygroundRightSidebar } from "@components/Playground/PlaygroundRightSidebar";
import {
    Button,
    Checkbox,
    Divider,
    IconButton,
    Input,
    Option,
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
import { FaPlus } from "react-icons/fa";

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
                spacing={5}
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
            spacing={5}
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
        <Stack width="100%" direction="row">
            <PlaygroundContent
                direction={variant === "all" ? "column" : "row"}
                alignItems="flex-start"
                alignContent="flex-start"
                wrap={variant === "all" ? "nowrap" : "wrap"}
                spacing={10}
            >
                {variant === "all" &&
                    allTextareas.map((textareas, i) => (
                        <Stack wrap="wrap" direction="row" spacing={5} key={i}>
                            {textareas}
                        </Stack>
                    ))}
                {variant !== "all" && textareas}
            </PlaygroundContent>
            <PlaygroundRightSidebar>
                <Stack direction="column" spacing={5}>
                    <Typography>Variant</Typography>
                    <RadioGroup
                        onChange={(_, vriant) => setVariant(vriant as Variant)}
                        value={variant}
                        name="variants"
                        spacing={5}
                        color="neutral"
                    >
                        <Radio value="all" label="All" />
                        {variants.map((v) => (
                            <Radio key={v} value={v} label={capitalize(v)} />
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
                            size="sm"
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
                            size="sm"
                        />
                    </Stack>
                    {customTextColorEnabled ? (
                        <Input
                            type="color"
                            variant="solid"
                            size="lg"
                            color="primary"
                            fullWidth
                            placeholder="Enter a text color (e.g. #ff0000)"
                            value={customTextColor}
                            onChange={setCustomTextColor}
                            showRandom
                        />
                    ) : (
                        <RadioGroup
                            onChange={(_, textColor) =>
                                setTextColor(
                                    textColor as TypographyColor | "inherit",
                                )
                            }
                            value={textColor}
                            name="textColors"
                            spacing={5}
                            color="neutral"
                        >
                            {textColors.map((c) => (
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
                <Divider />
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
                            onChange={setCustomColor}
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
