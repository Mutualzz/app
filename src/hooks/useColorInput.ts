import type { ColorLike } from "@mutualzz/theme";
import { formatHex8, parse } from "culori";
import { useState } from "react";

/**
 * Validates HEX, RGB, RGBA, HSL, HSLA formats.
 */
const isValidHex = (value: string): boolean =>
    /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value.trim());

const isValidRgb = (value: string): boolean =>
    /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/.test(value.trim());

const isValidRgba = (value: string): boolean =>
    /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0|1|0?\.\d+)\s*\)$/.test(
        value.trim(),
    );

const isValidHsl = (value: string): boolean =>
    /^hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)$/.test(value.trim());

const isValidHsla = (value: string): boolean =>
    /^hsla\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*,\s*(0|1|0?\.\d+)\s*\)$/.test(
        value.trim(),
    );

const isValidColorInput = (value: string): boolean =>
    isValidHex(value) ||
    isValidRgb(value) ||
    isValidRgba(value) ||
    isValidHsl(value) ||
    isValidHsla(value);

export const useColorInput = (initialColor: ColorLike = "#ffffff") => {
    const [inputValue, setInputValue] = useState<string>(initialColor);
    const [color, setColor] = useState<string>(initialColor);
    const [isInvalid, setIsInvalid] = useState<boolean>(false);

    const handleChange = (input: string) => {
        setInputValue(input);
    };

    const validate = () => {
        const trimmed = inputValue.trim();

        if (isValidColorInput(trimmed)) {
            const parsed = parse(trimmed);

            if (parsed) {
                setColor(formatHex8(parsed));
                setIsInvalid(false);

                return;
            }
        }

        setIsInvalid(true);
    };

    return {
        inputValue,
        color,
        isInvalid,
        handleChange,
        validate,
    };
};
