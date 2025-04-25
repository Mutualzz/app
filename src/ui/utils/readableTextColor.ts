import { formatHex8, parse, rgb, wcagContrast } from "culori";

import { invertColor } from "@mutualzz/ui/utils/invertColor";

export const readableTextColor = (
    background: string,
    fallbackText: string,
    minContrast: number = 4.5,
): string => {
    const bgParsed = parse(background);
    const textParsed = parse(fallbackText);

    if (!bgParsed || !textParsed) throw new Error("Invalid color");

    const bgRgb = rgb(bgParsed);
    const textRgb = rgb(textParsed);

    const contrast = wcagContrast(bgRgb, textRgb);

    return contrast >= minContrast
        ? formatHex8(textParsed)
        : formatHex8(invertColor(textRgb));
};
