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
    Slider,
    Stack,
    Typography,
    useColorInput,
    type Color,
    type ColorLike,
    type TypographyLevel,
    type TypographyVariant,
<<<<<<< HEAD
} from "@mutualzz/ui";
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";

import type { FontWeight } from "@mutualzz/ui/Typography.props";
=======
} from "@ui";

import type { FontWeight } from "@ui/types/Typography.props";
>>>>>>> c64b18b0ba63d0fb8b9fb255c9575caf8f81ea36
import capitalize from "lodash-es/capitalize";
import { useState } from "react";

export const Route = createFileRoute("/ui/data-display/typography")({
    component: PlaygroundTypography,
    head: () => ({
        meta: [
            ...seo({
                title: "Typography - Mutualzz UI",
            }),
        ],
    }),
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

const levelsNames = [
    "Display Large",
    "Display Medium",
    "Display Small",
    "Display Extra Small",
    "Heading 1",
    "Heading 2",
    "Heading 3",
    "Heading 4",
    "Heading 5",
    "Heading 6",
    "Title Large",
    "Title Medium",
    "Title Small",
    "Body Large",
    "Body Medium",
    "Body Small",
    "Body Extra Small",
];

const weights = ["lighter", "normal", "bold", "bolder"] as FontWeight[];

const colors = [
    "primary",
    "neutral",
    "success",
    "danger",
    "warning",
    "info",
] as Color[];

function PlaygroundTypography() {
    const [variant, setVariant] = useState<TypographyVariant | "all">("solid");
    const [level, setLevel] = useState<TypographyLevel>("body-md");
    const [weight, setWeight] = useState<FontWeight>("normal");
    const [text, setText] = useState<string | null>(null);

    const [customWeightToggle, setCustomWeightToggle] = useState(false);

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

    const allTypographies = [...colors, ...customColors].map((c) =>
        variants
            .filter((v) => v !== "none")
            .map((v) => (
                <Typography
                    key={`${v}-${c}`}
                    level={level}
                    variant={v}
                    weight={weight}
                    color={c}
                >
                    {text ?? `${capitalize(v)} ${capitalize(c)}`}
                </Typography>
            )),
    );

    const typographies = [...colors, ...customColors].map((c) => (
        <Typography
            key={c}
            level={level}
            variant={variant as TypographyVariant}
            weight={weight}
            color={c}
        >
            {text ?? `${capitalize(variant)} ${capitalize(c)}`}
        </Typography>
    ));

    return (
        <Stack width="100%" spacing={10} direction="row">
            <Paper
                width="100%"
                direction={variant === "all" ? "column" : "row"}
                alignItems="flex-start"
                alignContent="flex-start"
                wrap="wrap"
                p={20}
                spacing={variant === "all" ? 10 : 5}
            >
                {variant === "none" && (
                    <Typography level={level} weight={weight} variant={variant}>
                        {text ?? "No variant applied"}
                    </Typography>
                )}
                {variant === "all" &&
                    allTypographies.map((typographies, i) => (
                        <Stack direction="row" spacing={5} key={i}>
                            {typographies}
                        </Stack>
                    ))}
                {variant !== "none" && variant !== "all" && typographies}
            </Paper>
            <Paper alignItems="center" direction="column" p={20}>
                <Divider>Playground</Divider>
                <Stack width="100%" direction="column" spacing={5}>
                    <Stack direction="column" spacing={5}>
                        <label>Variant</label>
                        <RadioGroup
                            onChange={(_, vriant) =>
                                setVariant(vriant as TypographyVariant)
                            }
                            value={variant}
                            name="variant"
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
                        <label>Level</label>
                        <select
                            value={level}
                            onChange={(e) =>
                                setLevel(e.target.value as TypographyLevel)
                            }
                            css={{
                                width: "100%",
                                padding: 10,
                                borderRadius: 5,
                                border: "1px solid #ccc",
                                backgroundColor: "#f9f9f9",
                            }}
                        >
                            {levels.map((l, i) => (
                                <option key={l} value={l}>
                                    {levelsNames[i]}
                                </option>
                            ))}
                        </select>
                    </Stack>
                    <Divider />
                    <Stack direction="column" spacing={5}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            spacing={5}
                        >
                            <label>Weight</label>
                            <Checkbox
                                checked={customWeightToggle}
                                label="Custom"
                                onChange={() =>
                                    setCustomWeightToggle((prev) => {
                                        setWeight("normal");
                                        return !prev;
                                    })
                                }
                            />
                        </Stack>
                        {customWeightToggle ? (
                            <Slider
                                value={weight as number}
                                min={100}
                                max={1000}
                                onChange={(e) =>
                                    setWeight(Number(e.target.value))
                                }
                                marks={[
                                    { value: 100, label: "100" },
                                    { value: 200, label: "200" },
                                    { value: 300, label: "300" },
                                    { value: 400, label: "400" },
                                    { value: 500, label: "500" },
                                    { value: 600, label: "600" },
                                    { value: 700, label: "700" },
                                    { value: 800, label: "800" },
                                    { value: 900, label: "900" },
                                    { value: 1000, label: "1k" },
                                ]}
                            />
                        ) : (
                            <select
                                value={weight}
                                onChange={(e) =>
                                    setWeight(e.target.value as FontWeight)
                                }
                                css={{
                                    width: "100%",
                                    padding: 10,
                                    borderRadius: 5,
                                    border: "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                }}
                            >
                                {weights.map((w) => (
                                    <option key={w} value={w}>
                                        {capitalize(w as string)}
                                    </option>
                                ))}
                            </select>
                        )}
                    </Stack>
                    <Divider />
                    {variant !== "none" && (
                        <>
                            <Stack direction="column" spacing={5}>
                                <label>Custom Color</label>
                                <Stack
                                    alignContent="center"
                                    direction="row"
                                    spacing={5}
                                >
                                    <Input
                                        variant="solid"
                                        size="lg"
                                        color="primary"
                                        fullWidth
                                        error={isInvalid}
                                        value={inputColorValue}
                                        onChange={(e) =>
                                            handleChange(e.target.value)
                                        }
                                        onBlur={validate}
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
                                                <option
                                                    key={color}
                                                    value={color}
                                                >
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
                                                            color !==
                                                            colorToDelete,
                                                    );
                                                    setColorToDelete(
                                                        updated.length > 0
                                                            ? updated[
                                                                  updated.length -
                                                                      1
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
                        </>
                    )}
                    <Stack direction="column" spacing={5}>
                        <label>Text</label>
                        <Input
                            variant="solid"
                            size="lg"
                            color="primary"
                            fullWidth
                            value={text ?? ""}
                            onChange={(e) =>
                                e.target.value.trim() === ""
                                    ? setText(null)
                                    : setText(e.target.value)
                            }
                        />
                    </Stack>
                </Stack>
            </Paper>
        </Stack>
    );
}
