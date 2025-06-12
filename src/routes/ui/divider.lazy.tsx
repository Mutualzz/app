import { createLazyFileRoute } from "@tanstack/react-router";
import { Divider } from "@ui/components/data-display/Divider/Divider";
import type {
    DividerInset,
    DividerVariant,
} from "@ui/components/data-display/Divider/Divider.types";
import { Checkbox } from "@ui/components/inputs/Checkbox/Checkbox";
import { Stack } from "@ui/components/layout/Stack/Stack";
import { Paper } from "@ui/components/surfaces/Paper/Paper";
import { useColorInput } from "@ui/hooks/useColorInput";
import { RadioButton, RadioButtonGroup } from "@ui/index";
import type { Color, ColorLike } from "@ui/types";
import capitalize from "lodash/capitalize";
import { useState } from "react";

export const Route = createLazyFileRoute("/ui/divider")({
    component: PlaygroundDivider,
});

const variants = ["solid", "dashed", "dotted", "double"] as DividerVariant[];
const colors = [
    "primary",
    "neutral",
    "success",
    "danger",
    "warning",
    "info",
] as Color[];

const insets = ["none", "start", "end"] as DividerInset[];

function PlaygroundDivider() {
    const [variant, setVariant] = useState<DividerVariant>("solid");

    const [inset, setInset] = useState<DividerInset>("none");

    const [text, setText] = useState<string | null>(null);

    const [lineColor, setLineColor] = useState<Color>("neutral");
    const [textColor, setTextColor] = useState<Color>("neutral");

    const [customLineColorEnabled, setCustomLineColorEnabled] = useState(false);
    const [customTextColorEnabled, setCustomTextColorEnabled] = useState(false);

    const {
        inputValue: inputLineColor,
        color: customLineColor,
        isInvalid: lineColorInvalid,
        handleChange: handleLineColorChange,
        validate: validateLineColor,
    } = useColorInput<Color | ColorLike>();

    const {
        inputValue: inputTextColor,
        color: customTextColor,
        isInvalid: textColorInvalid,
        handleChange: handleTextColorChange,
        validate: validateTextColor,
    } = useColorInput<Color | ColorLike>();

    return (
        <Stack
            pt={40}
            spacing={20}
            direction="row"
            justifyContent="space-around"
        >
            <Paper
                p={20}
                spacing={48}
                justifyContent="center"
                alignItems="center"
                direction="column"
                width={1200}
            >
                <Stack direction="row" spacing={20}>
                    <Paper
                        direction="column"
                        alignItems="center"
                        spacing={10}
                        p={20}
                        elevation={2}
                    >
                        <label>Vertical Divider</label>
                        <Stack direction="row" spacing={10}>
                            <Paper elevation={3} p="7.5rem" />
                            <Divider
                                lineColor={
                                    customLineColorEnabled
                                        ? customLineColor
                                        : lineColor
                                }
                                textColor={
                                    customTextColorEnabled
                                        ? customTextColor
                                        : textColor
                                }
                                variant={variant}
                                inset={inset}
                                orientation="vertical"
                            />
                            <Paper elevation={3} p="7.5rem" />
                        </Stack>
                    </Paper>
                    <Paper
                        direction="column"
                        alignItems="center"
                        spacing={10}
                        p={20}
                        elevation={2}
                    >
                        <label>Vertical Divider with Text</label>
                        <Stack direction="row" spacing={10}>
                            <Paper elevation={3} p="7.5rem" />
                            <Divider
                                lineColor={
                                    customLineColorEnabled
                                        ? customLineColor
                                        : lineColor
                                }
                                textColor={
                                    customTextColorEnabled
                                        ? customTextColor
                                        : textColor
                                }
                                variant={variant}
                                inset={inset}
                                orientation="vertical"
                            >
                                {text ?? "Text"}
                            </Divider>
                            <Paper elevation={3} p="7.5rem" />
                        </Stack>
                    </Paper>
                </Stack>
                <Stack direction="row" spacing={20} alignItems="baseline">
                    <Paper
                        direction="column"
                        alignItems="center"
                        spacing={10}
                        p={20}
                        elevation={2}
                    >
                        <label>Horizontal Divider</label>
                        <Stack direction="column" spacing={10}>
                            <Paper elevation={3} p="7.5rem" />
                            <Divider
                                lineColor={
                                    customLineColorEnabled
                                        ? customLineColor
                                        : lineColor
                                }
                                textColor={
                                    customTextColorEnabled
                                        ? customTextColor
                                        : textColor
                                }
                                variant={variant}
                                inset={inset}
                                orientation="horizontal"
                            />
                            <Paper elevation={3} p="7.5rem" />
                        </Stack>
                    </Paper>
                    <Paper
                        direction="column"
                        alignItems="center"
                        spacing={10}
                        p={20}
                        elevation={2}
                    >
                        <label>Horizontal Divider with Text</label>
                        <Stack direction="column" spacing={10}>
                            <Paper elevation={3} p="7.5rem" />
                            <Divider
                                lineColor={
                                    customLineColorEnabled
                                        ? customLineColor
                                        : lineColor
                                }
                                textColor={
                                    customTextColorEnabled
                                        ? customTextColor
                                        : textColor
                                }
                                variant={variant}
                                inset={inset}
                                orientation="horizontal"
                            >
                                {text ?? "Text"}
                            </Divider>
                            <Paper elevation={3} p="7.5rem" />
                        </Stack>
                    </Paper>
                </Stack>
            </Paper>
            <Paper width={300} alignItems="center" direction="column" p={20}>
                <Divider>Playground</Divider>
                <Stack width="100%" direction="column" spacing={40}>
                    <Stack direction="column" spacing={10}>
                        <label>Variant</label>
                        <RadioButtonGroup
                            onChange={(_, vriant) =>
                                setVariant(vriant as DividerVariant)
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
                    <Stack direction="column" spacing={10}>
                        <label>Inset</label>
                        <RadioButtonGroup
                            onChange={(_, inst) =>
                                setInset(inst as DividerInset)
                            }
                            value={inset}
                            name="insets"
                            row
                        >
                            {insets.map((i) => (
                                <RadioButton
                                    key={i}
                                    value={i}
                                    label={capitalize(i)}
                                    checked={inset === i}
                                    color="neutral"
                                    onChange={() => setInset(i)}
                                />
                            ))}
                        </RadioButtonGroup>
                    </Stack>

                    <Stack direction="column" spacing={5}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            spacing={5}
                        >
                            <label>Line Color</label>
                            <Checkbox
                                label="Custom"
                                checked={customLineColorEnabled}
                                onChange={(e) =>
                                    setCustomLineColorEnabled(
                                        e.currentTarget.checked,
                                    )
                                }
                            />
                        </Stack>

                        {customLineColorEnabled ? (
                            <input
                                type="text"
                                value={inputLineColor}
                                onChange={(e) =>
                                    handleLineColorChange(e.target.value)
                                }
                                onBlur={validateLineColor}
                                css={{
                                    padding: 10,
                                    borderRadius: 5,
                                    border: lineColorInvalid
                                        ? "1px solid red"
                                        : "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                    width: "100%",
                                }}
                            />
                        ) : (
                            <select
                                value={lineColor}
                                onChange={(e) =>
                                    setLineColor(e.target.value as Color)
                                }
                                css={{
                                    width: "100%",
                                    padding: 10,
                                    borderRadius: 5,
                                    border: "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                }}
                            >
                                {colors.map((color) => (
                                    <option key={color} value={color}>
                                        {capitalize(color)}
                                    </option>
                                ))}
                            </select>
                        )}
                    </Stack>
                    <Stack spacing={5} direction="column">
                        <Stack
                            justifyContent="space-between"
                            direction="row"
                            spacing={5}
                        >
                            <label>Text Color</label>
                            <Checkbox
                                label="Custom"
                                checked={customTextColorEnabled}
                                onChange={(e) =>
                                    setCustomTextColorEnabled(
                                        e.currentTarget.checked,
                                    )
                                }
                            />
                        </Stack>
                        {customTextColorEnabled ? (
                            <input
                                type="text"
                                value={inputTextColor}
                                onChange={(e) =>
                                    handleTextColorChange(e.target.value)
                                }
                                onBlur={validateTextColor}
                                css={{
                                    padding: 10,
                                    borderRadius: 5,
                                    border: textColorInvalid
                                        ? "1px solid red"
                                        : "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                }}
                            />
                        ) : (
                            <select
                                value={textColor}
                                onChange={(e) =>
                                    setTextColor(e.target.value as Color)
                                }
                                css={{
                                    width: "100%",
                                    padding: 10,
                                    borderRadius: 5,
                                    border: "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                }}
                            >
                                {colors.map((color) => (
                                    <option key={color} value={color}>
                                        {capitalize(color)}
                                    </option>
                                ))}
                            </select>
                        )}
                    </Stack>
                    <Stack
                        justifyContent="center"
                        alignItems="stretch"
                        spacing={5}
                        direction="column"
                    >
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
