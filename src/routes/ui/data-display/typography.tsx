import { PlaygroundContent } from "@components/Playground/PlaygroundContent";
import { PlaygroundRightSidebar } from "@components/Playground/PlaygroundRightSidebar";
import {
    Button,
    Checkbox,
    Divider,
    IconButton,
    Input,
    Option,
    Radio,
    RadioGroup,
    randomColor,
    Select,
    Slider,
    Stack,
    Typography,
    type Color,
    type ColorLike,
    type TypographyLevel,
    type TypographyVariant,
} from "@mutualzz/ui";
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
import type { Properties } from "csstype";

import capitalize from "lodash-es/capitalize";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";

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

type FontWeight = NonNullable<Properties["fontWeight"]>;

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

    const [customColor, setCustomColor] = useState<ColorLike>(randomColor());

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
        <Stack width="100%" direction="row">
            <PlaygroundContent
                direction={variant === "all" ? "column" : "row"}
                alignItems="flex-start"
                alignContent="flex-start"
                wrap={variant === "all" ? "nowrap" : "wrap"}
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
            </PlaygroundContent>
            <PlaygroundRightSidebar>
                <Stack direction="column" spacing={5}>
                    <Typography>Variant</Typography>
                    <RadioGroup
                        onChange={(_, vriant) =>
                            setVariant(vriant as TypographyVariant)
                        }
                        value={variant}
                        name="variant"
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
                    <Typography>Level</Typography>
                    <Select
                        value={level}
                        onValueChange={(value) =>
                            setLevel(value as TypographyLevel)
                        }
                    >
                        {levels.map((l, i) => (
                            <Option key={l} value={l}>
                                {levelsNames[i]}
                            </Option>
                        ))}
                    </Select>
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={5}
                    >
                        <Typography>Weight</Typography>
                        <Checkbox
                            checked={customWeightToggle}
                            label="Custom"
                            onChange={() =>
                                setCustomWeightToggle((prev) => {
                                    setWeight("normal");
                                    return !prev;
                                })
                            }
                            size="sm"
                        />
                    </Stack>
                    {customWeightToggle ? (
                        <Slider
                            value={weight as number}
                            min={100}
                            max={1000}
                            onChange={(e) => setWeight(Number(e.target.value))}
                            marks={[
                                { value: 100, label: "1" },
                                { value: 200, label: "2" },
                                { value: 300, label: "3" },
                                { value: 400, label: "4" },
                                { value: 500, label: "5" },
                                { value: 600, label: "6" },
                                { value: 700, label: "7" },
                                { value: 800, label: "8" },
                                { value: 900, label: "9" },
                                { value: 1000, label: "1k" },
                            ]}
                        />
                    ) : (
                        <Select
                            value={weight}
                            onValueChange={(value) =>
                                setWeight(value as FontWeight)
                            }
                        >
                            {weights.map((w) => (
                                <Option key={w} value={w}>
                                    {capitalize(w.toString())}
                                </Option>
                            ))}
                        </Select>
                    )}
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Typography>Text</Typography>
                    <Input
                        type="text"
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
                {variant !== "none" && (
                    <>
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
                                    onChange={setCustomColor}
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
                                                        const updated =
                                                            prev.filter(
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
                    </>
                )}
            </PlaygroundRightSidebar>
        </Stack>
    );
}
