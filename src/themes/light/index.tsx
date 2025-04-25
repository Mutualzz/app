import type { Theme } from "@mutualzz/ui/src/types";
import { baseLightTheme } from "@mutualzz/ui/themes/baseLight";
import { arcaneSunriseTheme } from "./arcaneSunrise";
import { cemeteryDawnTheme } from "./cemeteryDawn";
import { chromeVeilTheme } from "./chromeVeil";
import { mistOfHopeTheme } from "./misftOfHope";
import { oceanReverieTheme } from "./oceanReverie";
import { phantomGraceTheme } from "./phantomGrace";
import { roseRequiemTheme } from "./roseRequiem";
import { rustRevivalTheme } from "./rustRevival";
import { twilightElegyTheme } from "./twilightElegy";
import { velvetLullabyTheme } from "./velvetLullaby";
import { victorianBloomTheme } from "./victorianBloom";

export const lightThemesObj: Record<LightTheme, Theme> = {
    baseLight: baseLightTheme,
    arcaneSunrise: arcaneSunriseTheme,
    cemeteryDawn: cemeteryDawnTheme,
    chromeVeil: chromeVeilTheme,
    mistOfHope: mistOfHopeTheme,
    oceanReverie: oceanReverieTheme,
    phantomGrace: phantomGraceTheme,
    roseRequiem: roseRequiemTheme,
    rustRevival: rustRevivalTheme,
    twilightElegy: twilightElegyTheme,
    velvetLullaby: velvetLullabyTheme,
    victorianBloom: victorianBloomTheme,
};

export const lightThemes = Object.values(lightThemesObj);

export type LightTheme =
    | "baseLight"
    | "arcaneSunrise"
    | "cemeteryDawn"
    | "chromeVeil"
    | "mistOfHope"
    | "oceanReverie"
    | "phantomGrace"
    | "roseRequiem"
    | "rustRevival"
    | "twilightElegy"
    | "velvetLullaby"
    | "victorianBloom";
