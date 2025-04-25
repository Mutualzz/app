import type { Rgb } from "culori";

export const invertColor = (color: Rgb, alphaScale: number = 1): Rgb => ({
    mode: "rgb",
    r: 1 - color.r,
    g: 1 - color.g,
    b: 1 - color.b,
    alpha: Math.min(Math.max((color.alpha ?? 1) * alphaScale, 0), 1),
});
