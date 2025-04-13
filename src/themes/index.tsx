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
import { baseTheme } from "./base";

export const themes: Record<AllThemes, Theme> = {
    base: baseTheme,
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

export const themeNames = Object.keys(themes) as AllThemes[];

export type AllThemes =
    | "base"
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
