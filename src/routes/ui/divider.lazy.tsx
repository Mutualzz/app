import { useColorInput } from "@hooks/useColorInput";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Divider } from "@ui/data-display/Divider/Divider";
import type {
    DividerInset,
    DividerLineColor,
    DividerTextColor,
    DividerVariant,
} from "@ui/data-display/Divider/Divider.types";
import { Stack } from "@ui/layout/Stack/Stack";
import { Paper } from "@ui/surfaces/Paper/Paper";
import capitalize from "lodash/capitalize";
import { useState } from "react";

export const Route = createLazyFileRoute("/ui/divider")({
    component: PlaygroundDivider,
});

const variants = ["solid", "dashed", "dotted"] as DividerVariant[];
const lineColors = [
    "primary",
    "neutral",
    "success",
    "danger",
    "warning",
    "info",
] as DividerLineColor[];

const textColors = ["primary", "neutral", "accent"] as DividerTextColor[];

const insets = ["none", "context", "start", "end"] as DividerInset[];

function PlaygroundDivider() {
    const [variant, setVariant] = useState<DividerVariant>("solid");

    const [inset, setInset] = useState<DividerInset>("none");

    const [text, setText] = useState<string>("Text");

    const [lineColor, setLineColor] = useState<DividerLineColor>("neutral");
    const [textColor, setTextColor] = useState<DividerTextColor>("neutral");

    const [customLineColorEnabled, setCustomLineColorEnabled] = useState(false);
    const [customTextColorEnabled, setCustomTextColorEnabled] = useState(false);

    const {
        inputValue: inputLineColor,
        color: customLineColor,
        isInvalid: lineColorInvalid,
        handleChange: handleLineColorChange,
        validate: validateLineColor,
    } = useColorInput<DividerLineColor>();

    const {
        inputValue: inputTextColor,
        color: customTextColor,
        isInvalid: textColorInvalid,
        handleChange: handleTextColorChange,
        validate: validateTextColor,
    } = useColorInput<DividerTextColor>();

    return (
        <Stack
            paddingTop={40}
            width="100%"
            gap={20}
            direction="row"
            justifyContent="center"
        >
            <Paper
                padding={20}
                gap="3rem"
                justifyContent="center"
                alignItems="center"
                direction="column"
            >
                <Stack direction="row" gap={20}>
                    <Paper
                        direction="column"
                        alignItems="center"
                        gap={10}
                        padding={20}
                        elevation={2}
                    >
                        <label>Vertical Divider</label>
                        <Stack direction="row" gap={10}>
                            <Paper
                                elevation={3}
                                style={{
                                    width: 200,
                                    height: 200,
                                }}
                            />
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
                            <Paper
                                elevation={3}
                                style={{
                                    width: 200,
                                    height: 200,
                                }}
                            />
                        </Stack>
                    </Paper>
                    <Paper
                        direction="column"
                        alignItems="center"
                        gap={10}
                        padding={20}
                        elevation={2}
                    >
                        <label>Vertical Divider with Text</label>
                        <Stack direction="row" gap={10}>
                            <Paper
                                elevation={3}
                                style={{
                                    width: 200,
                                    height: 200,
                                }}
                            />
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
                                {text}
                            </Divider>
                            <Paper
                                elevation={3}
                                style={{
                                    width: 200,
                                    height: 200,
                                }}
                            />
                        </Stack>
                    </Paper>
                </Stack>
                <Stack direction="row" gap={20} alignItems="baseline">
                    <Paper
                        direction="column"
                        alignItems="center"
                        gap={10}
                        padding={20}
                        elevation={2}
                    >
                        <label>Horizontal Divider</label>
                        <Stack direction="column" gap={10}>
                            <Paper
                                elevation={3}
                                style={{
                                    width: 200,
                                    height: 200,
                                }}
                            />
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
                            <Paper
                                elevation={3}
                                style={{
                                    width: 200,
                                    height: 200,
                                }}
                            />
                        </Stack>
                    </Paper>
                    <Paper
                        direction="column"
                        alignItems="center"
                        gap={10}
                        padding={20}
                        elevation={2}
                    >
                        <label>Horizontal Divider with Text</label>
                        <Stack direction="column" gap={10}>
                            <Paper
                                elevation={3}
                                style={{
                                    width: 200,
                                    height: 200,
                                }}
                            />
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
                                {text}
                            </Divider>
                            <Paper
                                elevation={3}
                                style={{
                                    width: 200,
                                    height: 200,
                                }}
                            />
                        </Stack>
                    </Paper>
                </Stack>
            </Paper>
            <Paper direction="column" padding={20} gap={5}>
                <h2 css={{ textAlign: "center" }}>Customization</h2>
                <Stack gap={5} justifyContent="center" direction="column">
                    <Stack
                        justifyContent="center"
                        alignItems="stretch"
                        gap={5}
                        direction="column"
                    >
                        <Divider>Text</Divider>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            style={{
                                padding: 10,
                                borderRadius: 5,
                                border: "1px solid #ccc",
                                backgroundColor: "#f9f9f9",
                            }}
                        />
                    </Stack>
                    <Stack
                        justifyContent="center"
                        alignItems="stretch"
                        gap={5}
                        direction="column"
                    >
                        <Divider>Inset</Divider>
                        <select
                            value={inset}
                            onChange={(e) =>
                                setInset(e.target.value as DividerInset)
                            }
                            style={{
                                width: "100%",
                                padding: 10,
                                borderRadius: 5,
                                border: "1px solid #ccc",
                                backgroundColor: "#f9f9f9",
                            }}
                        >
                            {insets.map((inset) => (
                                <option key={inset} value={inset}>
                                    {capitalize(inset)}
                                </option>
                            ))}
                        </select>
                    </Stack>
                    <Stack
                        justifyContent="center"
                        alignItems="stretch"
                        gap={5}
                        direction="column"
                    >
                        <Divider>Variant</Divider>
                        <select
                            value={variant}
                            onChange={(e) =>
                                setVariant(e.target.value as DividerVariant)
                            }
                            style={{
                                width: "100%",
                                padding: 10,
                                borderRadius: 5,
                                border: "1px solid #ccc",
                                backgroundColor: "#f9f9f9",
                            }}
                        >
                            {variants.map((variant) => (
                                <option key={variant} value={variant}>
                                    {capitalize(variant)}
                                </option>
                            ))}
                        </select>
                    </Stack>
                    <Stack
                        justifyContent="center"
                        alignItems="stretch"
                        gap={5}
                        direction="column"
                    >
                        <Divider>Line Color</Divider>
                        <Stack
                            direction="row"
                            gap={10}
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 5,
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={customLineColorEnabled}
                                    onChange={(e) =>
                                        setCustomLineColorEnabled(
                                            e.target.checked,
                                        )
                                    }
                                />
                                Custom Line Color
                            </label>
                        </Stack>
                        {customLineColorEnabled ? (
                            <input
                                type="text"
                                value={inputLineColor}
                                onChange={(e) =>
                                    handleLineColorChange(e.target.value)
                                }
                                onBlur={validateLineColor}
                                style={{
                                    padding: 10,
                                    borderRadius: 5,
                                    border: lineColorInvalid
                                        ? "1px solid red"
                                        : "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                }}
                            />
                        ) : (
                            <select
                                value={lineColor}
                                onChange={(e) =>
                                    setLineColor(
                                        e.target.value as DividerLineColor,
                                    )
                                }
                                style={{
                                    width: "100%",
                                    padding: 10,
                                    borderRadius: 5,
                                    border: "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                }}
                            >
                                {lineColors.map((color) => (
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
                        gap={5}
                        direction="column"
                    >
                        <Divider>Text Color</Divider>
                        <Stack
                            direction="row"
                            gap={10}
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 5,
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={customTextColorEnabled}
                                    onChange={(e) =>
                                        setCustomTextColorEnabled(
                                            e.target.checked,
                                        )
                                    }
                                />
                                Custom Text Color
                            </label>
                        </Stack>
                        {customTextColorEnabled ? (
                            <input
                                type="text"
                                value={inputTextColor}
                                onChange={(e) =>
                                    handleTextColorChange(e.target.value)
                                }
                                onBlur={validateTextColor}
                                style={{
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
                                    setTextColor(
                                        e.target.value as DividerTextColor,
                                    )
                                }
                                style={{
                                    width: "100%",
                                    padding: 10,
                                    borderRadius: 5,
                                    border: "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                }}
                            >
                                {textColors.map((color) => (
                                    <option key={color} value={color}>
                                        {capitalize(color)}
                                    </option>
                                ))}
                            </select>
                        )}
                    </Stack>
                </Stack>
            </Paper>
        </Stack>
    );
}
