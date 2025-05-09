import { createLazyFileRoute } from "@tanstack/react-router";
import { Typography } from "@ui/components/data-display/Typography/Typography";
import { type TypographyVariant } from "@ui/components/data-display/Typography/Typography.types";
import { Stack } from "@ui/components/layout/Stack/Stack";
import { Paper } from "@ui/components/surfaces/Paper/Paper";
import {
    Button,
    Divider,
    RadioButton,
    RadioButtonGroup,
    randomHexColor,
    useColorInput,
} from "@ui/index";
import type { Color, ColorLike, TypographyLevel } from "@ui/types";
import { capitalize } from "lodash";
import { useState } from "react";

export const Route = createLazyFileRoute("/ui/typography")({
    component: PlaygroundTypography,
});

const variants = [
    "solid",
    "outlined",
    "plain",
    "soft",
    "none",
] as TypographyVariant[];

const levels = [
    "display-lg",
    "display-md",
    "display-sm",
    "display-xs",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "title-lg",
    "title-md",
    "title-sm",
    "body-lg",
    "body-md",
    "body-sm",
    "body-xs",
] as TypographyLevel[];

const colors = [
    "primary",
    "neutral",
    "success",
    "danger",
    "warning",
    "info",
] as Color[];

function PlaygroundTypography() {
    const [variant, setVariant] = useState<TypographyVariant>("solid");
    const [level, setLevel] = useState<TypographyLevel>("body-md");
    const [text, setText] = useState<string | null>(null);

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

    const typographies = [...colors, ...customColors].map((color) => (
        <Typography key={color} level={level} variant={variant} color={color}>
            {text ?? `${capitalize(variant)} ${capitalize(color)}`}
        </Typography>
    ));

    return (
        <Stack
            pt={40}
            spacing={20}
            direction="row"
            justifyContent="space-around"
        >
            <Paper
                direction="row"
                alignItems="flex-start"
                alignContent="flex-start"
                wrap="wrap"
                p={20}
                spacing={5}
                width={1200}
            >
                {variant === "none" && (
                    <Typography level={level} variant={variant}>
                        {text ?? "No variant applied"}
                    </Typography>
                )}
                {variant !== "none" && typographies}
            </Paper>
            <Paper width={300} alignItems="center" direction="column" p={20}>
                <Divider>Playground</Divider>
                <Stack width="100%" direction="column" spacing={40}>
                    <Stack direction="column" spacing={10}>
                        <label>Variant</label>
                        <RadioButtonGroup
                            onChange={(_, vriant) =>
                                setVariant(vriant as TypographyVariant)
                            }
                            value={variant}
                            name="variant"
                        >
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
                    <Stack direction="column" spacing={10}>
                        <label>Level</label>
                        <select
                            value={level}
                            onChange={(e) =>
                                setLevel(e.target.value as TypographyLevel)
                            }
                            style={{
                                width: "100%",
                                padding: 10,
                                borderRadius: 5,
                                border: "1px solid #ccc",
                                backgroundColor: "#f9f9f9",
                            }}
                        >
                            {levels.map((l) => (
                                <option key={l} value={l}>
                                    {l}
                                </option>
                            ))}
                        </select>
                    </Stack>
                    {variant !== "none" && (
                        <Stack direction="column" spacing={10}>
                            <label>Custom Color</label>
                            <Stack
                                alignContent="center"
                                direction="row"
                                spacing={5}
                            >
                                <input
                                    type="text"
                                    value={inputColorValue}
                                    onChange={(e) =>
                                        handleChange(e.target.value)
                                    }
                                    onBlur={validate}
                                    style={{
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
                                        setColorToDelete(
                                            customColor as ColorLike,
                                        );
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
                                        style={{
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
                    )}
                    <Stack direction="column" spacing={10}>
                        <label>Text</label>
                        <input
                            type="text"
                            value={text ?? ""}
                            onChange={(e) =>
                                e.target.value.trim() === ""
                                    ? setText(null)
                                    : setText(e.target.value)
                            }
                            style={{
                                padding: 10,
                                borderRadius: 5,
                                border: isInvalid
                                    ? "1px solid red"
                                    : "1px solid #ccc",
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
