import { createLazyFileRoute } from "@tanstack/react-router";

import { useTheme } from "../contexts/ThemeManager";
import { Button } from "../ui/Button/Button";
import { Stack } from "../ui/Stack/Stack";

import chunk from "lodash/chunk";
import { useState } from "react";
import { type AllThemes } from "../themes";
import type { ButtonColor, ButtonVariant } from "../ui/Button/Button.types";
import { Paper } from "../ui/Paper/Paper";
import { type PaperElevation } from "../ui/Paper/Paper.types";

export const Route = createLazyFileRoute("/playground")({
    component: Playground,
});

function Playground() {
    const { changeTheme } = useTheme();
    const [buttonSize, setButtonSize] = useState<
        "xs" | "sm" | "md" | "lg" | "xl"
    >("md");
    const [buttonLoading, setButtonLoading] = useState(false);
    const [paperElevation, setPaperElevation] = useState<PaperElevation>(0);

    // all the button variants and colors
    const buttonVariants = [
        "contained",
        "outlined",
        "text",
        "subtle",
    ] as ButtonVariant[];
    const buttonColors = [
        "primary",
        "secondary",
        "success",
        "error",
        "warning",
        "info",
    ] as ButtonColor[];

    let buttons = [];

    for (const variant of buttonVariants) {
        for (const color of buttonColors) {
            buttons.push(
                <Button
                    key={`${variant}-${color}`}
                    variant={variant}
                    color={color}
                    size={buttonSize}
                    loading={buttonLoading}
                >
                    {`${variant} ${color}`}
                </Button>,
            );
        }
    }

    buttons = chunk(buttons, 6).map((row, index) => (
        <Stack key={index} padding={20} gap={10}>
            {row}
        </Stack>
    ));

    return (
        <Paper elevation={paperElevation} direction="column">
            {buttons}
            <Stack
                gap="5rem"
                padding={20}
                justifyContent="center"
                alignItems="center"
            >
                <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    gap={10}
                >
                    <label htmlFor="theme-select">Select Theme</label>
                    <select
                        onChange={(e) =>
                            changeTheme(e.target.value as AllThemes)
                        }
                    >
                        <option value="baseDark">Base Dark</option>
                        <option value="crimsonLament">Crimson Lament</option>
                        <option value="eternalMourning">
                            Eternal Mourning
                        </option>
                        <option value="fogOfDespair">Fog of Despair</option>
                        <option value="graveyardWhispers">
                            Graveyard Whispers
                        </option>
                        <option value="grungeIndustrial">
                            Grunge & Industrial
                        </option>
                        <option value="hauntedAesthetic">
                            Haunted Aesthetic
                        </option>
                        <option value="melancholyRomance">
                            Melancholy Romance
                        </option>
                        <option value="midnightElegance">
                            Midnight Elegance
                        </option>
                        <option value="nocturnalAbyss">Nocturnal Abyss</option>
                        <option value="shadowheart">Shadowheart</option>
                        <option value="witchingHour">Witching Hour</option>
                    </select>
                </Stack>
                <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    gap={10}
                >
                    <label htmlFor="size-select">Select Button Size</label>
                    <select
                        onChange={(e) =>
                            setButtonSize(
                                e.target.value as
                                    | "xs"
                                    | "sm"
                                    | "md"
                                    | "lg"
                                    | "xl",
                            )
                        }
                        value={buttonSize}
                    >
                        <option value="xs">Extra Small</option>
                        <option value="sm">Small</option>
                        <option value="md">Medium</option>
                        <option value="lg">Large</option>
                        <option value="xl">Extra Large</option>
                    </select>
                </Stack>
                <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    gap={10}
                >
                    <label htmlFor="elevation-select">
                        Select Paper Elevation
                    </label>
                    <select
                        onChange={(e) =>
                            setPaperElevation(
                                parseInt(e.target.value) as PaperElevation,
                            )
                        }
                        value={paperElevation}
                    >
                        <option value={0}>0</option>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                    </select>
                </Stack>
                <Button
                    onClick={() => setButtonLoading((prev) => !prev)}
                    variant="contained"
                    color="primary"
                    size="md"
                >
                    Toggle Loading
                </Button>
            </Stack>
        </Paper>
    );
}
