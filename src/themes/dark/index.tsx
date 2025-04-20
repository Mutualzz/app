import type { Theme } from "@mui/joy/styles";
import { crimsonLamentTheme } from "./CrimsonLament";
import { eternalMourningTheme } from "./EternalMourning";
import { fogOfDespairTheme } from "./FogOfDespair";
import { graveyardWhispersTheme } from "./GraveyardWhispers";
import { grungeIndustrialTheme } from "./GrungeIndustrial";
import { hauntedAestheticTheme } from "./HauntedAesthetic";
import { melancholyRomanceTheme } from "./MelancholyRomance";
import { midnightEleganceTheme } from "./MidnightElegance";
import { nocturnalAbyssTheme } from "./NocturnalAbyss";
import { shadowheartTheme } from "./Shadowheart";
import { witchingHourTheme } from "./WitchingHour";

export const darkThemes: Record<DarkTheme, Theme> = {
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
    midnightElegance: midnightEleganceTheme,
};

export const themeNames = Object.keys(darkThemes) as DarkTheme[];
export const themeValues = Object.values(darkThemes);

export type DarkTheme =
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
