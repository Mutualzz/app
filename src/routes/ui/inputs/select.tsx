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
} from "@mutualzz/ui-web";
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
    const [variant, setVariant] = useState<Variant | "all">("outlined");
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
                spacing={5}
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
            spacing={5}
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
        <Stack width="100%" direction="row">
            <PlaygroundContent
                direction={variant === "all" ? "column" : "row"}
                alignItems="flex-start"
                alignContent="flex-start"
                wrap={variant === "all" ? "nowrap" : "wrap"}
                spacing={25}
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
                    <Typography>States</Typography>
                    <Checkbox
                        checked={disabled}
                        label="Disabled"
                        onChange={() => setDisabled((prev) => !prev)}
                    />
                </Stack>
                <Divider />
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
                            onChange={(result: ColorResult) =>
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
