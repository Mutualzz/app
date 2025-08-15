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
    Typography,
    type Color,
    type ColorLike,
    type Size,
    type Variant,
} from "@mutualzz/ui";
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
import capitalize from "lodash-es/capitalize";
import { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

export const Route = createFileRoute("/ui/inputs/select")({
    component: SelectPlayground,
    head: () => ({
        meta: [
            ...seo({
                title: "Select - Mutualzz UI",
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

function SelectPlayground() {
    const [variant, setVariant] = useState<Variant | "all">("all");
    const [size, setSize] = useState<Size | number>("md");
    const [disabled, setDisabled] = useState(false);

    const [customSizeToggle, setCustomSizeToggle] = useState(false);

    const [customColors, setCustomColors] = useState<ColorLike[]>([]);
    const [colorToDelete, setColorToDelete] = useState<ColorLike | null>(null);

    const [numberOfOptions, setNumberOfOptions] = useState(3);

    const [customColor, setCustomColor] = useState<ColorLike>(randomColor());

    const allSelects = [...colors, ...customColors].map((c) =>
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
                <Select
                    key={`${v}-${c}-select`}
                    variant={v}
                    color={c}
                    size={size}
                    disabled={disabled}
                >
                    {new Array(numberOfOptions).fill(0).map((_, index) => (
                        <Option
                            value={`option-${index + 1}`}
                            key={`item-${index}`}
                        >
                            <Typography>{`Option ${index + 1}`}</Typography>
                        </Option>
                    ))}
                </Select>
            </Stack>
        )),
    );

    const selects = [...colors, ...customColors].map((c) => (
        <Stack
            justifyContent="center"
            alignItems="center"
            direction="column"
            key={c}
        >
            <Typography>
                {capitalize(variant)} {capitalize(c)}
            </Typography>
            <Select
                variant={variant as Variant}
                color={c}
                size={size}
                disabled={disabled}
            >
                {new Array(numberOfOptions).fill(0).map((_, index) => (
                    <Option value={`option-${index + 1}`} key={`item-${index}`}>
                        <Typography>{`Option ${index + 1}`}</Typography>
                    </Option>
                ))}
            </Select>
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
                spacing={25}
                overflowY="auto"
            >
                {variant === "all" &&
                    allSelects.map((selects, i) => (
                        <Stack
                            direction="row"
                            spacing={50}
                            key={i}
                            width="100%"
                        >
                            {selects}
                        </Stack>
                    ))}
                {variant !== "all" && selects}
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
                <Stack direction="column" spacing={10}>
                    <Typography>States</Typography>
                    <Stack direction="row" spacing={5}>
                        <Checkbox
                            checked={disabled}
                            label="Disabled"
                            onChange={() => setDisabled((prev) => !prev)}
                        />
                    </Stack>
                </Stack>
                <Stack direction="column" spacing={5}>
                    <Typography>
                        Number of Options:{" "}
                        <Typography fontWeight="bold">
                            {numberOfOptions}
                        </Typography>
                    </Typography>
                    <Stack direction="row" spacing={5}>
                        <Button
                            color="warning"
                            variant="soft"
                            onClick={() =>
                                setNumberOfOptions((prev) =>
                                    prev > 3 ? prev - 1 : prev,
                                )
                            }
                        >
                            <FaMinus />
                        </Button>
                        <Button
                            color="success"
                            variant="soft"
                            onClick={() =>
                                setNumberOfOptions((prev) => prev + 1)
                            }
                        >
                            <FaPlus />
                        </Button>
                        <Button
                            color="danger"
                            variant="solid"
                            onClick={() => setNumberOfOptions(3)}
                        >
                            Reset
                        </Button>
                    </Stack>
                </Stack>
                <Divider />
                <Stack direction="column" spacing={10}>
                    <Typography>Custom Color</Typography>
                    <Stack alignContent="center" direction="row" spacing={5}>
                        <Input
                            type="color"
                            variant="solid"
                            size="lg"
                            color="primary"
                            fullWidth
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
