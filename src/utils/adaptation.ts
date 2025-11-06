import {
    extractColors,
    isValidGradient,
    randomHexColor,
    type ColorLike,
} from "@mutualzz/ui-core";
import Color, { type ColorInstance } from "color";

interface AdaptColors {
    baseColor: ColorLike;
    primaryColor: ColorLike;
    primaryText: ColorLike;
}

const contrastRatio = (a: ColorInstance, b: ColorInstance) => {
    const la = a.luminosity();
    const lb = b.luminosity();
    const L1 = Math.max(la, lb);
    const L2 = Math.min(la, lb);
    return (L1 + 0.05) / (L2 + 0.05);
};

const ensureContrast = (
    bg: ColorInstance,
    fg: ColorInstance,
    minRatio = 4.5,
) => {
    let attempt = bg;
    let ratio = contrastRatio(attempt, fg);

    // adjust it by checking if background is lighter or darker than text
    const bgIsLighterThanText = attempt.luminosity() > fg.luminosity();
    let step = 0;
    const stepAmount = 0.03; // adjust lightness per iteration
    while (ratio < minRatio && step < 40) {
        attempt = bgIsLighterThanText
            ? attempt.darken(stepAmount)
            : attempt.lighten(stepAmount);
        ratio = contrastRatio(attempt, fg);
        step++;
    }
    return attempt.hex();
};

export const adaptColors = ({
    baseColor,
    primaryColor,
    primaryText,
}: AdaptColors) => {
    const baseColorObj = Color(
        isValidGradient(baseColor)
            ? (extractColors(baseColor)?.[0] ?? randomHexColor())
            : baseColor,
    );
    const primaryColorObj = Color(primaryColor);
    const primaryTextObj = Color(primaryText);

    const background = baseColorObj.hex();
    const surface = baseColorObj.lighten(0.1).hex();

    const primary = primaryColorObj.hex();
    const neutral = baseColorObj.isLight()
        ? baseColorObj.darken(0.2).hex()
        : baseColorObj.lighten(0.2).hex();

    // Typography
    const typographyPrimary = primaryTextObj.hex();
    const typographySecondary = primaryTextObj.lighten(0.2).hex();
    const typographyAccent = primaryColorObj.hex();
    const typographyMuted = primaryTextObj.desaturate(0.5).hex();

    const [, pS = 50, pL = 50] = primaryColorObj.hsl().array();

    const derive = (hue: number) => Color.hsl(hue, pS, pL);

    // Setup semantic colors
    const dangerHue = 0;
    const infoHue = 220;
    const successHue = 120;
    const warningHue = 30;

    const danger = ensureContrast(derive(dangerHue), primaryTextObj);
    const info = ensureContrast(derive(infoHue), primaryTextObj);
    const success = ensureContrast(derive(successHue), primaryTextObj);
    const warning = ensureContrast(derive(warningHue), primaryTextObj);

    return {
        colors: {
            common: {
                white: "#FFFFFF",
                black: "#000000",
            },
            primary,
            neutral,
            background,
            surface,
            danger,
            info,
            success,
            warning,
        },
        typography: {
            colors: {
                primary: typographyPrimary,
                secondary: typographySecondary,
                accent: typographyAccent,
                muted: typographyMuted,
            },
        },
    };
};
