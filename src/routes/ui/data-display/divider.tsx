import { PlaygroundContent } from "@components/Playground/PlaygroundContent";
import { PlaygroundRightSidebar } from "@components/Playground/PlaygroundRightSidebar";
import {
    randomColor,
    type Color,
    type ColorLike,
    type TypographyColor,
} from "@mutualzz/ui-core";
import {
    Checkbox,
    Divider,
    Input,
    InputColor,
    Option,
    Paper,
    Radio,
    RadioGroup,
    Select,
    Stack,
    Typography,
    type DividerInset,
    type DividerOrientation,
    type DividerVariant,
} from "@mutualzz/ui-web";
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
import capitalize from "lodash-es/capitalize";
import { useState } from "react";

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
    "muted",
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

    const [customLineColor, setCustomLineColor] =
        useState<ColorLike>(randomColor());

    const [customTextColor, setCustomTextColor] =
        useState<ColorLike>(randomColor());

    const [customLineColorEnabled, setCustomLineColorEnabled] = useState(false);
    const [customTextColorEnabled, setCustomTextColorEnabled] = useState(false);

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
        <Stack width="100%" direction="row">
            <PlaygroundContent
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
            </PlaygroundContent>
            <PlaygroundRightSidebar>
                <Stack direction="column" spacing={5}>
                    <Typography>Variant</Typography>
                    <RadioGroup
                        onChange={(_, vriant) =>
                            setVariant(vriant as DividerVariant)
                        }
                        value={variant}
                        color="neutral"
                        name="variants"
                        spacing={5}
                    >
                        {variants.map((v) => (
                            <Radio key={v} value={v} label={capitalize(v)} />
                        ))}
                    </RadioGroup>
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Typography>Orientation</Typography>
                    <RadioGroup
                        onChange={(_, orientation) =>
                            setOrientation(orientation as DividerOrientation)
                        }
                        value={orientation}
                        name="orientations"
                        color="neutral"
                        spacing={5}
                    >
                        <Radio value="horizontal" label="Horizontal" />
                        <Radio value="vertical" label="Vertical" />
                    </RadioGroup>
                </Stack>
                <Divider />
                <Stack spacing={5} direction="column">
                    <Typography>Text</Typography>
                    <Input
                        type="text"
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
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography>Line Color</Typography>
                        <Checkbox
                            size="sm"
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
                        <InputColor
                            type="color"
                            variant="solid"
                            size="lg"
                            color="primary"
                            fullWidth
                            placeholder="Enter a color (e.g., #ff0000, red)"
                            value={customLineColor}
                            showRandom
                            onChange={(result) => setCustomLineColor(result)}
                        />
                    ) : (
                        <Select
                            value={lineColor}
                            onValueChange={(value) =>
                                setLineColor(value as Color)
                            }
                        >
                            {colors.map((color) => (
                                <Option key={color} value={color}>
                                    {capitalize(color)}
                                </Option>
                            ))}
                        </Select>
                    )}
                </Stack>
                {text && (
                    <>
                        <Divider />
                        <Stack spacing={5} direction="column">
                            <Stack
                                justifyContent="space-between"
                                direction="row"
                                spacing={5}
                            >
                                <Typography>Text Color</Typography>
                                <Checkbox
                                    label="Custom"
                                    size="sm"
                                    checked={customTextColorEnabled}
                                    onChange={(e) =>
                                        setCustomTextColorEnabled(
                                            e.currentTarget.checked,
                                        )
                                    }
                                />
                            </Stack>
                            {customTextColorEnabled ? (
                                <InputColor
                                    variant="solid"
                                    size="lg"
                                    color="primary"
                                    fullWidth
                                    placeholder="Enter a color (e.g., #ff0000, red)"
                                    value={customTextColor}
                                    onChange={(result) =>
                                        setCustomTextColor(result)
                                    }
                                    showRandom
                                />
                            ) : (
                                <Select
                                    value={textColor}
                                    onValueChange={(value) =>
                                        setTextColor(value as Color)
                                    }
                                >
                                    {colors.map((color) => (
                                        <Option key={color} value={color}>
                                            {capitalize(color)}
                                        </Option>
                                    ))}
                                </Select>
                            )}
                        </Stack>
                        <Divider />
                        <Stack direction="column" spacing={5}>
                            <Typography>Inset</Typography>
                            <RadioGroup
                                onChange={(_, inst) =>
                                    setInset(inst as DividerInset)
                                }
                                value={inset}
                                name="insets"
                                color="neutral"
                                spacing={5}
                            >
                                {insets.map((i) => (
                                    <Radio
                                        key={i}
                                        value={i}
                                        label={capitalize(i)}
                                    />
                                ))}
                            </RadioGroup>
                        </Stack>
                    </>
                )}
            </PlaygroundRightSidebar>
        </Stack>
    );
}
