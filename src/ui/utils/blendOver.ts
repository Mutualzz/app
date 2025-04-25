import type { Color, Rgb } from "culori";

export const blendOver = (fg: Rgb, bg: Rgb): Color => {
    const alpha = fg.alpha ?? 1;
    return {
        mode: "rgb",
        r: fg.r * alpha + bg.r * (1 - alpha),
        g: fg.g * alpha + bg.g * (1 - alpha),
        b: fg.b * alpha + bg.b * (1 - alpha),
        alpha: 1,
    };
};
