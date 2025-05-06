import { createLazyFileRoute } from "@tanstack/react-router";
import { Divider } from "@ui/components/data-display/Divider/Divider";
import { Button } from "@ui/components/inputs/Button/Button";
import { Checkbox } from "@ui/components/inputs/Checkbox/Checkbox";
import { Stack } from "@ui/components/layout/Stack/Stack";
import { Paper } from "@ui/components/surfaces/Paper/Paper";
import { useColorInput } from "@ui/hooks/useColorInput";
import type { Color, ColorLike, Size, Variant } from "@ui/types";

import capitalize from "lodash/capitalize";
import { useState } from "react";

import * as FaIcons from "react-icons/fa";
import * as IoIcons from "react-icons/io";
import * as MdIcons from "react-icons/md";

export const Route = createLazyFileRoute("/ui/button")({
    component: PlaygroundButton,
});

const variants = ["plain", "solid", "outlined", "soft"] as Variant[];

const colors = [
    "primary",
    "neutral",
    "success",
    "danger",
    "warning",
    "info",
] as Color[];

const iconLibraries = {
    fa: FaIcons,
    md: MdIcons,
    io: IoIcons,
};

function PlaygroundButton() {
    const [variant, setVariant] = useState<Variant>("solid");
    const [text, setText] = useState<string | null>(null);
    const [size, setSize] = useState<Size | number>("md");
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);

    const {
        inputValue: inputColorValue,
        color: customColor,
        isInvalid,
        handleChange,
        validate,
    } = useColorInput<Color | ColorLike>();

    const buttons = [...colors, ...[customColor]].map((color) => (
        <Button
            key={`${variant}-${color}-button`}
            variant={variant}
            color={color}
            size={size}
            loading={loading}
            disabled={disabled}
        >
            {text ?? `${capitalize(variant)} ${capitalize(color)}`}
        </Button>
    ));

    return (
        <Stack
            pt={40}
            width="100%"
            spacing={20}
            direction="row"
            justifyContent="center"
        >
            <Paper
                direction="row"
                alignItems="flex-start"
                alignContent="flex-start"
                justifyContent="center"
                wrap="wrap"
                p={20}
                spacing={5}
            >
                {buttons}
            </Paper>
            <Paper width={300} direction="column" p={20}>
                <Divider>Playground</Divider>
                <Stack direction="column" spacing={40}>
                    <Stack direction="column" spacing={10}>
                        <label>Variant</label>
                    </Stack>
                    <Stack direction="column" spacing={5}>
                        <Checkbox
                            checked={loading}
                            label="Loading"
                            onChange={() => setLoading((prev) => !prev)}
                            disabled={disabled}
                        />
                        <Checkbox
                            checked={disabled}
                            label="Disabled"
                            onChange={() => setDisabled((prev) => !prev)}
                            disabled={loading}
                        />
                    </Stack>
                    <Stack direction="column" spacing={5}>
                        <label>Custom Color</label>
                        <input
                            type="text"
                            value={inputColorValue}
                            placeholder="Input custom color"
                            onChange={(e) => handleChange(e.target.value)}
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
                    </Stack>
                </Stack>
            </Paper>
        </Stack>
    );
}
