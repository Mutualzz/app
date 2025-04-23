import { type Theme } from "@emotion/react";
import { crimsonLamentTheme } from "./CrimsonLament";
import { eternalMourningTheme } from "./EternalMourning";
import { fogOfDespairTheme } from "./FogOfDespair";
import { graveyardWhispersTheme } from "./GraveyardWhispers";
import { grungeIndustrialTheme } from "./GrungeIndustrial";
import { hauntedAestheticTheme } from "./HauntedAesthetic";
import { melancholyRomanceTheme } from "./MelancholyRomance";
import { midghtEleganceTheme } from "./MidnightElegance";
import { nocturnalAbyssTheme } from "./NocturnalAbyss";
import { shadowheartTheme } from "./Shadowheart";
import { witchingHourTheme } from "./WitchingHour";
import { baseDarkTheme } from "./baseDark";

export const darkThemesObj: Record<DarkTheme, Theme> = {
    baseDark: baseDarkTheme,
    crimsonLament: crimsonLamentTheme,
    eternalMourning: eternalMourningTheme,
    fogOfDespair: fogOfDespairTheme,
    graveyardWhispers: graveyardWhispersTheme,
    grungeIndustrial: grungeIndustrialTheme,
    hauntedAesthetic: hauntedAestheticTheme,
    melancholyRomance: melancholyRomanceTheme,
    nocturnalAbyss: nocturnalAbyssTheme,
    shadowheart: shadowheartTheme,
    witchingHour: witchingHourTheme,
    midnightElegance: midghtEleganceTheme,
};

export const darkThemes = Object.values(darkThemesObj);

export type DarkTheme =
    | "baseDark"
    | "crimsonLament"
    | "eternalMourning"
    | "fogOfDespair"
    | "graveyardWhispers"
    | "grungeIndustrial"
    | "hauntedAesthetic"
    | "melancholyRomance"
    | "midnightElegance"
    | "nocturnalAbyss"
    | "shadowheart"
    | "witchingHour";
