<<<<<<< HEAD
=======
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
>>>>>>> c64b18b0ba63d0fb8b9fb255c9575caf8f81ea36
import {
    Button,
    Checkbox,
    Divider,
    Input,
    Paper,
    Radio,
    RadioGroup,
    randomHexColor,
    Stack,
    useColorInput,
    type Color,
    type ColorLike,
    type DividerInset,
    type DividerOrientation,
    type DividerVariant,
<<<<<<< HEAD
    type TypographyColor,
} from "@mutualzz/ui";
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
import capitalize from "lodash-es/capitalize";
import { useState } from "react";
=======
} from "@ui";
import capitalize from "lodash-es/capitalize";
import { useState } from "react";
import type { TypographyColor } from "ui/dist";
>>>>>>> c64b18b0ba63d0fb8b9fb255c9575caf8f81ea36

export const Route = createFileRoute("/ui/data-display/divider")({
    component: PlaygroundDivider,
    head: () => ({
        meta: [
            ...seo({
                title: "Divider - Mutualzz UI",
            }),
        ],
    }),
});

const variants = ["solid", "dashed", "dotted", "double"] as DividerVariant[];
const colors = [
    "primary",
    "neutral",
    "success",
    "danger",
    "warning",
    "info",
    "secondary",
    "accent",
    "disabled",
] as Color[] | TypographyColor[];

const insets = ["none", "start", "end"] as DividerInset[];

function PlaygroundDivider() {
    const [variant, setVariant] = useState<DividerVariant>("solid");

    const [inset, setInset] = useState<DividerInset>("none");
    const [orientation, setOrientation] =
        useState<DividerOrientation>("horizontal");

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
        setColorDirectly: setColorDirectlyLineColor,
    } = useColorInput<Color | ColorLike>();

    const {
        inputValue: inputTextColor,
        color: customTextColor,
        isInvalid: textColorInvalid,
        handleChange: handleTextColorChange,
        validate: validateTextColor,
        setColorDirectly: setColorDirectlyTextColor,
    } = useColorInput<Color | ColorLike>();

    const divider = text ? (
        <Divider
            lineColor={customLineColorEnabled ? customLineColor : lineColor}
            textColor={customTextColorEnabled ? customTextColor : textColor}
            variant={variant}
            inset={inset}
            orientation={orientation}
        >
            {text}
        </Divider>
    ) : (
        <Divider
            lineColor={customLineColorEnabled ? customLineColor : lineColor}
            textColor={customTextColorEnabled ? customTextColor : textColor}
            variant={variant}
            inset={inset}
            orientation={orientation}
        />
    );

    return (
        <Stack width="100%" spacing={10} direction="row">
            <Paper
                width="100%"
                p={20}
                justifyContent="center"
                alignItems="center"
                direction="column"
            >
                {orientation === "horizontal" && (
                    <Stack direction="column" spacing={20}>
                        <Paper
                            elevation={10}
                            p={{ xs: "2.5rem", sm: "5rem", lg: "7.5rem" }}
                        />
                        {divider}
                        <Paper
                            elevation={10}
                            p={{ xs: "2.5rem", sm: "5rem", lg: "7.5rem" }}
                        />
                    </Stack>
                )}
                {orientation === "vertical" && (
                    <Stack direction="row" spacing={20}>
                        <Paper
                            elevation={10}
                            p={{ xs: "2.5rem", sm: "5rem", lg: "7.5rem" }}
                        />
                        {divider}
                        <Paper
                            elevation={10}
                            p={{ xs: "2.5rem", sm: "5rem", lg: "7.5rem" }}
                        />
                    </Stack>
                )}
            </Paper>
            <Paper alignItems="center" direction="column" p={20}>
                <Divider>Playground</Divider>
                <Stack width="100%" direction="column" spacing={5}>
                    <Stack direction="column" spacing={5}>
                        <label>Variant</label>
                        <RadioGroup
                            onChange={(_, vriant) =>
                                setVariant(vriant as DividerVariant)
                            }
                            value={variant}
                            name="variants"
                        >
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
                        <label>Orientation</label>
                        <RadioGroup
                            onChange={(_, orientation) =>
                                setOrientation(
                                    orientation as DividerOrientation,
                                )
                            }
                            value={orientation}
                            name="orientations"
                            row
                        >
                            <Radio
                                value="horizontal"
                                label="Horizontal"
                                checked={orientation === "horizontal"}
                                color="neutral"
                                onChange={() => setOrientation("horizontal")}
                            />
                            <Radio
                                value="vertical"
                                label="Vertical"
                                checked={orientation === "vertical"}
                                color="neutral"
                                onChange={() => setOrientation("vertical")}
                            />
                        </RadioGroup>
                    </Stack>
                    <Divider />
                    <Stack
                        justifyContent="center"
                        alignItems="stretch"
                        spacing={5}
                        direction="column"
                    >
                        <label>Text</label>
                        <Input
                            variant="solid"
                            size="lg"
                            color="primary"
                            fullWidth
                            value={text ?? ""}
                            onChange={(e) =>
                                setText(
                                    e.target.value.trim() === ""
                                        ? null
                                        : e.target.value,
                                )
                            }
                        />
                    </Stack>
                    {text && (
                        <>
                            <Divider />
                            <Stack direction="column" spacing={5}>
                                <label>Inset</label>
                                <RadioGroup
                                    onChange={(_, inst) =>
                                        setInset(inst as DividerInset)
                                    }
                                    value={inset}
                                    name="insets"
                                    row
                                >
                                    {insets.map((i) => (
                                        <Radio
                                            key={i}
                                            value={i}
                                            label={capitalize(i)}
                                            checked={inset === i}
                                            color="neutral"
                                            onChange={() => setInset(i)}
                                        />
                                    ))}
                                </RadioGroup>
                            </Stack>
                        </>
                    )}
                    <Divider />
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
                            <Stack direction="row" spacing={5}>
                                <Input
                                    variant="solid"
                                    size="lg"
                                    color="primary"
                                    fullWidth
                                    error={lineColorInvalid}
                                    placeholder="Enter a color (e.g., #ff0000, red)"
                                    value={inputLineColor}
                                    onChange={(e) =>
                                        handleLineColorChange(e.target.value)
                                    }
                                    onBlur={validateLineColor}
                                />
                                <Button
                                    variant="solid"
                                    color="neutral"
                                    onClick={() => {
                                        setColorDirectlyLineColor(
                                            randomHexColor(),
                                        );
                                    }}
                                >
                                    Random
                                </Button>
                            </Stack>
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
                    <Divider />
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
                            <Stack direction="row" spacing={5}>
                                <Input
                                    variant="solid"
                                    size="lg"
                                    color="primary"
                                    fullWidth
                                    error={textColorInvalid}
                                    placeholder="Enter a color (e.g., #ff0000, red)"
                                    value={inputTextColor}
                                    onChange={(e) =>
                                        handleTextColorChange(e.target.value)
                                    }
                                    onBlur={validateTextColor}
                                />
                                <Button
                                    variant="solid"
                                    color="neutral"
                                    onClick={() => {
                                        setColorDirectlyTextColor(
                                            randomHexColor(),
                                        );
                                    }}
                                >
                                    Random
                                </Button>
                            </Stack>
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
                </Stack>
            </Paper>
        </Stack>
    );
}
