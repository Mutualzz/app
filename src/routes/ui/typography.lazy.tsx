import { createLazyFileRoute } from "@tanstack/react-router";
import {
    type TypographyColor,
    type TypographyVariant,
} from "@ui/components/data-display/Typography/Typography.types";
import { Stack } from "@ui/components/layout/Stack/Stack";
import { Paper } from "@ui/components/surfaces/Paper/Paper";
import { useColorInput } from "@ui/hooks/useColorInput";
import type { ColorLike } from "@ui/types";
import { chunk } from "lodash";
import { useState } from "react";
import { Typography } from "../../ui/src/components/data-display/Typography/Typography";

export const Route = createLazyFileRoute("/ui/typography")({
    component: PlaygroundTypography,
});

const variants = ["solid", "outlined", "plain", "soft"] as TypographyVariant[];
const colors = [
    "primary",
    "neutral",
    "success",
    "danger",
    "warning",
    "info",
] as TypographyColor[];

function PlaygroundTypography() {
    const [customText, setCustomText] = useState(false);

    const [text, setText] = useState<string | null>(null);

    const [customColors, setCustomColors] = useState<ColorLike[]>([]);
    const [colorToDelete, setColorToDelete] = useState<ColorLike | null>(null);

    const {
        inputValue: inputColor,
        color: customColor,
        isInvalid,
        handleChange,
        validate,
        setColorDirectly,
    } = useColorInput<TypographyColor>();

    let typographies = [];

    for (const color of [...colors, ...customColors]) {
        for (const variant of variants) {
            typographies.push(
                <Paper
                    key={`${color}-${variant}`}
                    elevation={4}
                    p={20}
                    spacing={10}
                >
                    <Typography level="body-md" color={color} variant={variant}>
                        {text ?? `Typography ${color} ${variant}`}
                    </Typography>
                </Paper>,
            );
        }
    }

    typographies = chunk(typographies, variants.length).map((row, index) => (
        <Stack key={index} p={20} spacing={10}>
            {row}
        </Stack>
    ));

    return (
        <Stack
            pt={40}
            width="100%"
            spacing={20}
            direction="row"
            justifyContent="center"
        >
            <Paper direction="column" alignItems="center" p={20} spacing={5}>
                <Stack direction="column">{typographies}</Stack>
            </Paper>
        </Stack>
    );
}
