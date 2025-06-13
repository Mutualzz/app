import { Typography } from "@ui/components/data-display/Typography/Typography";

import { useColorInput } from "@ui/hooks/useColorInput";
import {
    Button,
    Checkbox,
    CircularProgress,
    Divider,
    Paper,
    RadioButton,
    RadioButtonGroup,
    randomHexColor,
    Stack,
} from "@ui/index";
import type { Color, ColorLike, Size, Variant } from "@ui/types";
import capitalize from "lodash/capitalize";

import { useState } from "react";

export const Route = createLazyFileRoute({
    component: PlaygroundCircularProgress,
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

function PlaygroundCircularProgress() {
    const [variant, setVariant] = useState<Variant | "all">("solid");
    const [text, setText] = useState<string | null>(null);
    const [size, setSize] = useState<Size | number>("md");

    const [determinate, setDeterminate] = useState(false);
    const [value, setValue] = useState(0);

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

    const allProgresses = [...colors, ...customColors].map((c) =>
        variants.map((v) => (
            <Stack
                justifyContent="center"
                alignItems="center"
                direction="column"
                key={`${c}-${v}`}
            >
                <Typography>
                    {capitalize(v)} {capitalize(c)}
                </Typography>
                {text ? (
                    <CircularProgress
                        key={c}
                        size={size}
                        variant={v}
                        color={c}
                        determinate={determinate}
                        value={value}
                    >
                        {text}
                    </CircularProgress>
                ) : (
                    <CircularProgress
                        key={c}
                        size={size}
                        variant={v}
                        color={c}
                        determinate={determinate}
                        value={value}
                    />
                )}
            </Stack>
        )),
    );

    const progresses = [...colors, ...customColors].map((c) => (
        <Stack
            justifyContent="center"
            alignItems="center"
            direction="column"
            key={c}
        >
            <Typography>
                {capitalize(variant)} {capitalize(c)}
            </Typography>
            {text ? (
                <CircularProgress
                    key={c}
                    size={size}
                    variant={variant as Variant}
                    color={c}
                    determinate={determinate}
                    value={value}
                >
                    {text}
                </CircularProgress>
            ) : (
                <CircularProgress
                    key={c}
                    size={size}
                    variant={variant as Variant}
                    color={c}
                    determinate={determinate}
                    value={value}
                />
            )}
        </Stack>
    ));

    return (
        <Stack
            mt={40}
            spacing={20}
            direction="row"
            justifyContent="space-around"
        >
            <Paper
                direction={variant === "all" ? "column" : "row"}
                alignItems="flex-start"
                alignContent="flex-start"
                wrap="wrap"
                p={20}
                spacing={variant === "all" ? 10 : 5}
                width={1200}
            >
                {variant === "all" &&
                    allProgresses.map((progresses, i) => (
                        <Stack direction="row" spacing={5} key={i}>
                            {progresses}
                        </Stack>
                    ))}
                {variant !== "all" && progresses}
            </Paper>
            <Paper width={300} alignItems="center" direction="column" p={20}>
                <Divider>Playground</Divider>
                <Stack width="100%" direction="column" spacing={5}>
                    <Stack direction="column" spacing={5}>
                        <label>Variant</label>
                        <RadioButtonGroup
                            onChange={(_, vriant) =>
                                setVariant(vriant as Variant)
                            }
                            value={variant}
                            name="variants"
                        >
                            <RadioButton
                                key="all"
                                value="all"
                                label="All"
                                checked={variant === "all"}
                                color="neutral"
                                onChange={() => setVariant("all")}
                            />
                            {variants.map((v) => (
                                <RadioButton
                                    key={v}
                                    value={v}
                                    label={capitalize(v)}
                                    checked={variant === v}
                                    color="neutral"
                                    onChange={() => setVariant(v)}
                                />
                            ))}
                        </RadioButtonGroup>
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
                                        setSize("md");
                                        return !prev;
                                    })
                                }
                            />
                        </Stack>
                        {customSizeToggle ? (
                            <input
                                type="range"
                                value={size}
                                min={16}
                                max={64}
                                onChange={(e) =>
                                    setSize(Number(e.target.value))
                                }
                                css={{
                                    padding: 10,
                                    borderRadius: 5,
                                    border: isInvalid
                                        ? "1px solid red"
                                        : "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                    width: "100%",
                                }}
                            />
                        ) : (
                            <RadioButtonGroup
                                onChange={(_, size) => setSize(size as Size)}
                                value={size as Size}
                                name="sizes"
                                row
                            >
                                {Object.keys(sizeNames).map((s) => (
                                    <RadioButton
                                        key={s}
                                        value={s}
                                        label={sizeNames[s as Size]}
                                        checked={size === s}
                                        color="neutral"
                                        onChange={() => setSize(s as Size)}
                                    />
                                ))}
                            </RadioButtonGroup>
                        )}
                    </Stack>
                    <Divider />
                    <Stack direction="column" spacing={5}>
                        <label>States</label>
                        <Checkbox
                            checked={determinate}
                            label="Determinate"
                            onChange={() => setDeterminate((prev) => !prev)}
                        />
                        {determinate && (
                            <input
                                type="range"
                                value={value}
                                min={0}
                                max={100}
                                onChange={(e) =>
                                    setValue(Number(e.target.value))
                                }
                                css={{
                                    padding: 10,
                                    borderRadius: 5,
                                    border: isInvalid
                                        ? "1px solid red"
                                        : "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                    width: "100%",
                                }}
                            />
                        )}
                    </Stack>
                    <Divider />
                    <Stack direction="column" spacing={5}>
                        <label>Custom Color</label>
                        <Stack
                            alignContent="center"
                            direction="row"
                            spacing={5}
                        >
                            <input
                                type="text"
                                value={inputColorValue}
                                onChange={(e) => handleChange(e.target.value)}
                                onBlur={validate}
                                css={{
                                    padding: 10,
                                    borderRadius: 5,
                                    border: isInvalid
                                        ? "1px solid red"
                                        : "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                    width: "100%",
                                }}
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
                                spacing={5}
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
                    <Divider />
                    <Stack direction="column" spacing={5}>
                        <label>Label</label>
                        <input
                            type="text"
                            value={text ?? ""}
                            onChange={(e) =>
                                setText(
                                    e.target.value.trim() === ""
                                        ? null
                                        : e.target.value,
                                )
                            }
                            css={{
                                padding: 10,
                                borderRadius: 5,
                                border: "1px solid #ccc",
                                backgroundColor: "#f9f9f9",
                                width: "100%",
                            }}
                        />
                    </Stack>
                </Stack>
            </Paper>
        </Stack>
    );
}
