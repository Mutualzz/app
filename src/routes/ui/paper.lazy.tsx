import { createLazyFileRoute } from "@tanstack/react-router";
import { Divider } from "@ui/components/data-display/Divider/Divider";
import { Button } from "@ui/components/inputs/Button/Button";
import { Checkbox } from "@ui/components/inputs/Checkbox/Checkbox";
import { Stack } from "@ui/components/layout/Stack/Stack";
import { Paper } from "@ui/components/surfaces/Paper/Paper";
import type {
    PaperColor,
    PaperVariant,
} from "@ui/components/surfaces/Paper/Paper.types";
import { useColorInput } from "@ui/hooks/useColorInput";
import type { ColorLike } from "@ui/types";
import { randomHexColor } from "@ui/utils/randomHexColor";
import { chunk } from "lodash";
import { useState } from "react";

export const Route = createLazyFileRoute("/ui/paper")({
    component: PlaygroundPaper,
});

const variants = ["solid", "outlined", "plain", "soft"] as PaperVariant[];
const colors = [
    "primary",
    "neutral",
    "success",
    "danger",
    "warning",
    "info",
] as PaperColor[];

function PlaygroundPaper() {
    const [customColors, setCustomColors] = useState<ColorLike[]>([]);
    const [colorToDelete, setColorToDelete] = useState<ColorLike | null>(null);

    const [customText, setCustomText] = useState(false);
    const [showColored, setShowColored] = useState(true);

    const [elevation, setElevation] = useState(1);

    const [text, setText] = useState<string | null>(null);

    const {
        inputValue: inputColor,
        color: customColor,
        isInvalid,
        handleChange,
        validate,
        setColorDirectly,
    } = useColorInput<PaperColor>();

    let papersColored = [];

    for (const color of [...colors, ...customColors]) {
        for (const variant of variants) {
            papersColored.push(
                <Paper
                    key={`${color}-${variant}`}
                    variant={variant}
                    color={color}
                    width={200}
                    height={100}
                    m={10}
                    justifyContent="center"
                    alignItems="center"
                >
                    {text ?? `${color} ${variant}`}
                </Paper>,
            );
        }
    }

    papersColored = chunk(papersColored, variants.length).map((row, index) => (
        <Stack key={index} spacing={10}>
            {row}
        </Stack>
    ));

    return (
        <Stack
            pt={40}
            pr={20}
            width="100%"
            spacing={20}
            direction="row"
            justifyContent="center"
        >
            <Paper
                direction="column"
                justifyContent="center"
                alignItems="center"
                p={20}
                spacing={5}
                width="100%"
            >
                {showColored ? (
                    papersColored
                ) : (
                    <Paper
                        width={400}
                        height={400}
                        m={10}
                        justifyContent="center"
                        alignItems="center"
                        variant="elevation"
                        elevation={elevation}
                    >
                        {text ?? `Elevation ${elevation}`}
                    </Paper>
                )}
            </Paper>
            <Paper direction="column" p={20} spacing={5}>
                <h2
                    css={{
                        textAlign: "center",
                    }}
                >
                    Customization
                </h2>
                <Stack justifyContent="center" direction="column" spacing={10}>
                    <Stack
                        spacing={5}
                        justifyContent="center"
                        alignItems="center"
                        direction="column"
                    >
                        <Divider>Properties</Divider>
                        <Stack spacing={5} direction="column">
                            <Checkbox
                                variant="outlined"
                                checked={showColored}
                                onChange={() => {
                                    setShowColored((prev) => !prev);
                                    setText(null);
                                }}
                                label="Show Colored"
                            />

                            {!showColored && (
                                <input
                                    type="number"
                                    value={elevation}
                                    min={0}
                                    max={4}
                                    onChange={(e) =>
                                        e.target.value.trim() === ""
                                            ? setElevation(0)
                                            : setElevation(
                                                  Math.max(
                                                      0,
                                                      Math.min(
                                                          4,
                                                          parseInt(
                                                              e.target.value,
                                                          ),
                                                      ),
                                                  ),
                                              )
                                    }
                                    placeholder="Elevation"
                                    style={{
                                        width: "100%",
                                        padding: 10,
                                        borderRadius: 5,
                                        border: "1px solid #ccc",
                                        backgroundColor: "#f9f9f9",
                                    }}
                                />
                            )}
                        </Stack>

                        <Stack
                            justifyContent="center"
                            alignItems="center"
                            direction="column"
                            spacing={5}
                            width="100%"
                        >
                            <Checkbox
                                variant="outlined"
                                checked={customText}
                                onChange={() => {
                                    setCustomText((prev) => !prev);
                                    setText(null);
                                }}
                                label="Custom Text"
                            />

                            {customText && (
                                <input
                                    type="text"
                                    value={text ?? ""}
                                    disabled={!customText}
                                    onChange={(e) =>
                                        setText(e.target.value.trim())
                                    }
                                    placeholder="Custom text"
                                    style={{
                                        width: "100%",
                                        padding: 10,
                                        borderRadius: 5,
                                        border: "1px solid #ccc",
                                        backgroundColor: "#f9f9f9",
                                    }}
                                />
                            )}
                        </Stack>
                    </Stack>

                    {showColored && (
                        <Stack
                            justifyContent="center"
                            direction="column"
                            spacing={5}
                        >
                            <Divider>Custom Colors</Divider>
                            <Stack alignItems="center" spacing={10}>
                                <input
                                    type="text"
                                    value={inputColor}
                                    placeholder="Input custom color"
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
                                    }}
                                />
                                <Button
                                    variant="soft"
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
                                        variant="soft"
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
                </Stack>
            </Paper>
        </Stack>
    );
}
