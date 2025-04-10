import { createLazyFileRoute } from "@tanstack/react-router";

import { useTheme } from "../contexts/ThemeManager";
import { Button } from "../ui/Button/Button";
import { Stack } from "../ui/Stack/Stack";

import chunk from "lodash/chunk";
import { useState } from "react";
import { type AllThemes } from "../themes";
import type {
    ButtonColor,
    ButtonSize,
    ButtonVariant,
} from "../ui/Button/Button.types";
import { CircularProgress } from "../ui/CircularProgress/CircularProgress";

import capitalize from "lodash/capitalize";
import { Paper } from "../ui/Paper/Paper";
import { type PaperElevation } from "../ui/Paper/Paper.types";

export const Route = createLazyFileRoute("/playground")({
    component: Playground,
});

function Playground() {
    const { changeTheme } = useTheme();
    const [size, setSize] = useState<ButtonSize>("md");
    const [buttonLoading, setButtonLoading] = useState(false);
    const [paperElevation, setPaperElevation] = useState<PaperElevation>(0);
    const [determinate, setDeterminate] = useState(false);
    const [determinateValue, setDeterminateValue] = useState(0);

    // all the button variants and colors
    const variants = ["solid", "outlined", "plain", "soft"] as ButtonVariant[];
    const colors = [
        "primary",
        "neutral",
        "success",
        "error",
        "warning",
        "info",
    ] as ButtonColor[];

    let buttons = [];
    let progresses = [];

    for (const variant of variants) {
        for (const color of colors) {
            buttons.push(
                <Button
                    key={`${variant}-${color}-button`}
                    variant={variant}
                    color={color}
                    size={size}
                    loading={buttonLoading}
                >
                    {`${capitalize(variant)} ${capitalize(color)}`}
                </Button>,
            );

            progresses.push(
                <Stack direction="column" gap={10} key={`${variant}-${color}`}>
                    <label>{`${capitalize(variant)} ${capitalize(color)}`}</label>
                    <CircularProgress
                        key={`${variant}-${color}-progress`}
                        variant={variant}
                        color={color}
                        size={size}
                        determinate={determinate}
                        value={determinateValue}
                    />
                </Stack>,
            );
        }
    }

    buttons = chunk(buttons, 6).map((row, index) => (
        <Stack
            justifyContent="center"
            alignItems="center"
            key={index}
            padding={20}
            gap={10}
        >
            {row}
        </Stack>
    ));

    progresses = chunk(progresses, 6).map((row, index) => (
        <Stack
            justifyContent="center"
            alignItems="center"
            key={index}
            padding={20}
            gap={10}
        >
            {row}
        </Stack>
    ));

    return (
        <Stack justifyContent="center" direction="row" gap={20} paddingTop={10}>
            <Stack direction="column" justifyContent="center" gap={20}>
                <Paper
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    direction="column"
                    elevation={paperElevation}
                    padding={20}
                    gap={30}
                >
                    <Stack
                        direction="column"
                        justifyContent="center"
                        alignItems="center"
                    >
                        Buttons
                        {buttons}
                    </Stack>
                    <Stack
                        justifyContent="center"
                        alignItems="center"
                        direction="column"
                        gap={30}
                    >
                        <Button
                            onClick={() => setButtonLoading((prev) => !prev)}
                            variant="solid"
                            color="primary"
                            size="md"
                        >
                            Toggle Loading
                        </Button>
                    </Stack>
                </Paper>
                <Paper
                    justifyContent="center"
                    alignItems="center"
                    elevation={paperElevation}
                    padding={20}
                >
                    <Stack
                        justifyContent="center"
                        alignItems="center"
                        direction="column"
                    >
                        Progresses
                        {progresses}
                    </Stack>
                    <Stack
                        justifyContent="center"
                        alignItems="center"
                        direction="column"
                        gap={30}
                    >
                        <Button
                            onClick={() => setDeterminate((prev) => !prev)}
                            variant="solid"
                            color="primary"
                            size="md"
                        >
                            Toggle Determinate
                        </Button>
                        <Stack
                            justifyContent="center"
                            alignItems="center"
                            direction="column"
                            gap={10}
                        >
                            <label htmlFor="determinate-select">
                                Determinate Value
                            </label>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={determinateValue}
                                onChange={(e) =>
                                    setDeterminateValue(
                                        parseInt(e.target.value),
                                    )
                                }
                                disabled={!determinate}
                            />
                            <label>{`${determinateValue}%`}</label>
                        </Stack>
                    </Stack>
                </Paper>
            </Stack>
            <Stack position="sticky" top={0} gap={20}>
                <Paper
                    padding={20}
                    justifyContent="center"
                    alignItems="center"
                    elevation={paperElevation}
                    direction="column"
                    gap={20}
                >
                    <Stack
                        direction="column"
                        justifyContent="center"
                        alignItems="center"
                        gap={10}
                    >
                        <label htmlFor="theme-select">Theme</label>
                        <select
                            onChange={(e) =>
                                changeTheme(e.target.value as AllThemes)
                            }
                        >
                            <option value="baseDark">Base Dark</option>
                            <option value="crimsonLament">
                                Crimson Lament
                            </option>
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
                            <option value="nocturnalAbyss">
                                Nocturnal Abyss
                            </option>
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
                        <label htmlFor="size-select">Component Size</label>
                        <select
                            onChange={(e) =>
                                setSize(e.target.value as ButtonSize)
                            }
                            value={size}
                        >
                            <option value="sm">Small</option>
                            <option value="md">Medium</option>
                            <option value="lg">Large</option>
                        </select>
                    </Stack>
                    <Stack
                        direction="column"
                        justifyContent="center"
                        alignItems="center"
                        gap={10}
                    >
                        <label htmlFor="elevation-select">
                            Paper Elevation
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
                </Paper>
            </Stack>
        </Stack>
    );

    return (
        <Paper elevation={paperElevation} direction="column">
            <Stack direction="row">
                <Stack direction="column">{buttons}</Stack>
                <Stack direction="column">{progresses}</Stack>
            </Stack>
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
                        onChange={(e) => setSize(e.target.value as ButtonSize)}
                        value={size}
                    >
                        <option value="sm">Small</option>
                        <option value="md">Medium</option>
                        <option value="lg">Large</option>
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
                    variant="solid"
                    color="primary"
                    size="md"
                >
                    Toggle Loading
                </Button>

                <Stack direction="row" gap={10}>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={determinateValue}
                        onChange={(e) =>
                            setDeterminateValue(parseInt(e.target.value))
                        }
                        disabled={!determinate}
                    />
                    <label>{`${determinateValue}%`}</label>
                </Stack>
            </Stack>
        </Paper>
    );
}
