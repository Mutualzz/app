import { baseLightTheme } from "@mutualzz/ui/themes/baseLight";
import type { Theme } from "@mutualzz/ui/types";
import { arcaneSunriseTheme } from "./arcaneSunrise";
import { cemeteryDawnTheme } from "./cemeteryDawn";
import { chromeVeilTheme } from "./chromeVeil";
import { mistOfHopeTheme } from "./misftOfHope";
import { oceanReverieTheme } from "./oceanReverie";
import { phantomGraceTheme } from "./phantomGrace";
import { roseRequiemTheme } from "./RoseRequiem";
import { rustRevivalTheme } from "./RustRevival";
import { twilightElegyTheme } from "./TwilightElegy";
import { velvetLullabyTheme } from "./VelvetLullaby";
import { victorianBloomTheme } from "./VictorianBloom";

export const lightThemesObj: Record<string, Theme> = {
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
