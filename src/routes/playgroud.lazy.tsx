import { createLazyFileRoute } from "@tanstack/react-router";

import { useTheme } from "../contexts/ThemeManager";
import { Button, ButtonColor, ButtonVariant } from "../ui/Button/Button";
import { Stack } from "../ui/Stack/Stack";

import chunk from "lodash/chunk";
import { AllThemes } from "../themes";

export const Route = createLazyFileRoute("/playgroud")({
    component: Playground,
});

function Playground() {
    const { changeTheme } = useTheme();

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
                >
                    {`${variant} ${color}`}
                </Button>
            );
        }
    }

    buttons = chunk(buttons, 6).map((row, index) => (
        <Stack key={index} padding={20} gap={10}>
            {row}
        </Stack>
    ));

    return (
        <Stack direction="column">
            {buttons}

            <select onChange={(e) => changeTheme(e.target.value as AllThemes)}>
                <option value="baseDark">Base Dark</option>
                <option value="crimsonLament">Crimson Lament</option>
                <option value="eternalMourning">Eternal Mourning</option>
                <option value="fogOfDespair">Fog of Despair</option>
                <option value="graveyardWhispers">Graveyard Whispers</option>
                <option value="hauntedAesthetic">Haunted Aesthetic</option>
                <option value="melancholyRomance">Melancholy Romance</option>
                <option value="midnightElegance">Midnight Elegance</option>
                <option value="nocturnalAbyss">Nocturnal Abyss</option>
                <option value="shadowheart">Shadowheart</option>
                <option value="witchingHour">Witching Hour</option>
            </select>
        </Stack>
    );
}
