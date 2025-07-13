import {
    Button,
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
    type PaperVariant,
} from "@mutualzz/ui";
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
import capitalize from "lodash-es/capitalize";
import { useState } from "react";

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

    const {
        inputValue: inputColorValue,
        color: customColor,
        isInvalid,
        handleChange,
        validate,
        setColorDirectly,
    } = useColorInput<Color | ColorLike>();

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
        <Stack width="100%" spacing={10} direction="row">
            <Paper
                width="100%"
                direction={variant === "all" ? "column" : "row"}
                alignItems={variant === "elevation" ? "center" : "flex-start"}
                alignContent={variant === "elevation" ? "center" : "flex-start"}
                wrap="wrap"
                p={20}
                spacing={variant === "all" ? 10 : 5}
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
                        <Stack direction="row" key={i} spacing={5}>
                            {paper}
                        </Stack>
                    ))}
            </Paper>
            <Paper alignItems="center" direction="column" p={20}>
                <Divider>Playground</Divider>
                <Stack width="100%" direction="column" spacing={5}>
                    <Stack direction="column" spacing={5}>
                        <label>Variant</label>
                        <RadioGroup
                            onChange={(_, vriant) =>
                                setVariant(vriant as PaperVariant)
                            }
                            value={variant}
                            name="variants"
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
                    {variant !== "elevation" && (
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
                                    placeholder="Enter a color (e.g., #ff0000)"
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
                        <Stack direction="column" spacing={5}>
                            <label>Elevation</label>
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
                    <Divider />
                    <Stack direction="column" spacing={5}>
                        <label>Text</label>
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
                </Stack>
            </Paper>
        </Stack>
    );
}
