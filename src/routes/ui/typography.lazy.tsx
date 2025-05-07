import { createLazyFileRoute } from "@tanstack/react-router";
import { type TypographyVariant } from "@ui/components/data-display/Typography/Typography.types";
import { Stack } from "@ui/components/layout/Stack/Stack";
import { Paper } from "@ui/components/surfaces/Paper/Paper";
import type { Color } from "@ui/types";
import { chunk } from "lodash";
import { Typography } from "../../ui/src/components/data-display/Typography/Typography";

export const Route = createLazyFileRoute("/ui/typography")({
    component: PlaygroundTypography,
});

const variants = [
    "solid",
    "outlined",
    "plain",
    "soft",
    "none",
] as TypographyVariant[];
const colors = [
    "primary",
    "neutral",
    "success",
    "danger",
    "warning",
    "info",
] as Color[];

function PlaygroundTypography() {
    let typographies = [];

    for (const variant of variants) {
        for (const color of [...colors]) {
            typographies.push(
                <Paper
                    key={`${color}-${variant}`}
                    elevation={4}
                    p={20}
                    spacing={10}
                >
                    <Typography level="body-md" color={color} variant={variant}>
                        {`Typography ${color} ${variant}`}
                    </Typography>
                </Paper>,
            );
        }
    }

    typographies = chunk(typographies, [...colors].length).map((row, index) => (
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
