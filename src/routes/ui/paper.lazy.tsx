import { createLazyFileRoute } from "@tanstack/react-router";
import type { PaperVariant } from "@ui/components/surfaces/Paper/Paper.types";
import { useColorInput } from "@ui/hooks/useColorInput";
import {
    Button,
    Divider,
    Paper,
    RadioButton,
    RadioButtonGroup,
    randomHexColor,
    Stack,
} from "@ui/index";
import { type Color, type ColorLike } from "@ui/types";
import { capitalize } from "lodash";
import { useState } from "react";

export const Route = createLazyFileRoute("/ui/paper")({
    component: PlaygroundPaper,
});

const variants = [
    "solid",
    "outlined",
    "plain",
    "soft",
    "elevation",
] as PaperVariant[];
const colors = [
    "primary",
    "neutral",
    "success",
    "danger",
    "warning",
    "info",
] as Color[];

function PlaygroundPaper() {
    const [variant, setVariant] = useState<PaperVariant>("solid");
    const [text, setText] = useState<string | null>(null);
    const [elevation, setElevation] = useState<number>(1);

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

    const papers = [...colors, ...customColors].map((color) => (
        <Paper
            key={`${variant}-${color}-button`}
            variant={variant}
            color={color}
            width={150}
            height={75}
            justifyContent="center"
            alignItems="center"
        >
            {text ?? `${capitalize(variant)} ${capitalize(color)}`}
        </Paper>
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
                alignItems={variant === "elevation" ? "center" : "flex-start"}
                alignContent={variant === "elevation" ? "center" : "flex-start"}
                wrap="wrap"
                p={20}
                spacing={5}
                width={1200}
                justifyContent={
                    variant === "elevation" ? "center" : "flex-start"
                }
            >
                {variant !== "elevation" && papers}
                {variant === "elevation" && (
                    <Paper
                        variant={variant}
                        elevation={elevation}
                        width={500}
                        height={400}
                        justifyContent="center"
                        alignItems="center"
                    >
                        {text ?? `${capitalize(variant)} ${elevation}`}
                    </Paper>
                )}
            </Paper>
            <Paper width={300} alignItems="center" direction="column" p={20}>
                <Divider>Playground</Divider>
                <Stack width="100%" direction="column" spacing={40}>
                    <Stack direction="column" spacing={10}>
                        <label>Variant</label>
                        <RadioButtonGroup
                            onChange={(_, vriant) =>
                                setVariant(vriant as PaperVariant)
                            }
                            value={variant}
                            name="variants"
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
                    {variant !== "elevation" && (
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
                    {variant === "elevation" && (
                        <Stack direction="column" spacing={10}>
                            <label>Elevation</label>
                            <input
                                type="number"
                                value={elevation}
                                min={1}
                                max={5}
                                onChange={(e) =>
                                    setElevation(
                                        e.target.value.trim() === ""
                                            ? 0
                                            : parseInt(e.target.value),
                                    )
                                }
                                style={{
                                    padding: 10,
                                    borderRadius: 5,
                                    border: "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                    width: "100%",
                                }}
                            />
                        </Stack>
                    )}
                    <Stack direction="column" spacing={5}>
                        <label>Text</label>
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
                            style={{
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
