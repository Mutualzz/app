import { PlaygroundContent } from "@components/Playground/PlaygroundContent";
import { PlaygroundRightSidebar } from "@components/Playground/PlaygroundRightSidebar";
import { randomColor, type Color, type ColorLike } from "@mutualzz/ui";
import {
    Button,
    Divider,
    IconButton,
    Input,
    Option,
    Paper,
    Radio,
    RadioGroup,
    Select,
    Stack,
    Typography,
    type PaperVariant,
} from "@mutualzz/ui/web";
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
import capitalize from "lodash-es/capitalize";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";

export const Route = createFileRoute("/ui/surfaces/paper")({
    component: PlaygroundPaper,
    head: () => ({
        meta: [
            ...seo({
                title: "Paper - Mutualzz UI",
            }),
        ],
    }),
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
    const [variant, setVariant] = useState<PaperVariant | "all">("solid");
    const [text, setText] = useState<string | null>(null);
    const [elevation, setElevation] = useState<number>(1);

    const [customColors, setCustomColors] = useState<ColorLike[]>([]);
    const [colorToDelete, setColorToDelete] = useState<ColorLike | null>(null);

    const [customColor, setCustomColor] = useState<ColorLike>(randomColor());

    const allPapers = [...colors, ...customColors].map((c) =>
        variants
            .filter((v) => v !== "elevation")
            .map((v) => (
                <Paper
                    key={`${v}-${c}-button`}
                    variant={v}
                    color={c}
                    p={{ xs: 5, sm: 10, lg: 20 }}
                    justifyContent="center"
                    alignItems="center"
                >
                    {text ?? `${capitalize(v)} ${capitalize(c)}`}
                </Paper>
            )),
    );

    const papers = [...colors, ...customColors].map((c) => (
        <Paper
            key={`${variant}-${c}-button`}
            variant={variant as PaperVariant}
            color={c}
            p={{ xs: 5, sm: 10, lg: 20 }}
            justifyContent="center"
            alignItems="center"
        >
            {text ?? `${capitalize(variant)} ${capitalize(c)}`}
        </Paper>
    ));

    return (
        <Stack width="100%" direction="row">
            <PlaygroundContent
                direction={variant === "all" ? "column" : "row"}
                alignItems={variant === "elevation" ? "center" : "flex-start"}
                alignContent={variant === "elevation" ? "center" : "flex-start"}
                wrap={variant === "all" ? "nowrap" : "wrap"}
                spacing={10}
                justifyContent={
                    variant === "elevation" ? "center" : "flex-start"
                }
            >
                {variant !== "elevation" && variant !== "all" && papers}
                {variant === "elevation" && (
                    <Paper
                        variant={variant}
                        elevation={elevation}
                        justifyContent="center"
                        alignItems="center"
                        p={{ xs: "2.5rem", sm: "5rem", lg: "7.5rem" }}
                    >
                        {text ?? `${capitalize(variant)} ${elevation}`}
                    </Paper>
                )}
                {variant === "all" &&
                    allPapers.map((paper, i) => (
                        <Stack direction="row" key={i} spacing={20}>
                            {paper}
                        </Stack>
                    ))}
            </PlaygroundContent>
            <PlaygroundRightSidebar>
                <Stack direction="column" spacing={5}>
                    <Typography>Variant</Typography>
                    <RadioGroup
                        onChange={(_, vriant) =>
                            setVariant(vriant as PaperVariant)
                        }
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
                    <Typography>Text</Typography>
                    <Input
                        variant="solid"
                        size="lg"
                        color="primary"
                        fullWidth
                        type="text"
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
                {variant !== "elevation" && (
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
                )}
                {variant === "elevation" && (
                    <Stack direction="column" spacing={5}>
                        <Typography>Elevation</Typography>
                        <Input
                            variant="solid"
                            size="lg"
                            color="primary"
                            fullWidth
                            type="number"
                            value={elevation}
                            onChange={(e) =>
                                setElevation(
                                    e.target.value.trim() === ""
                                        ? 0
                                        : parseInt(e.target.value),
                                )
                            }
                        />
                    </Stack>
                )}
            </PlaygroundRightSidebar>
        </Stack>
    );
}
