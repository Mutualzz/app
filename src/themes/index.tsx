import { midghtEleganceTheme } from "./MidnightElegance";
import { hauntedAestheticTheme } from "./HauntedAesthetic";
import { grungeIndustrialTheme } from "./GrungeIndustrial";
import { crimsonLamentTheme } from "./CrimsonLament";
import { eternalMourningTheme } from "./EternalMourning";
import { fogOfDespairTheme } from "./FogOfDespair";
import { graveyardWhispersTheme } from "./GraveyardWhispers";
import { melancholyRomanceTheme } from "./MelancholyRomance";
import { nocturnalAbyssTheme } from "./NocturnalAbyss";
import { shadowheartTheme } from "./Shadowheart";
import { witchingHourTheme } from "./WitchingHour";
import { baseDarkTheme } from "./baseDark";
import { Theme } from "@emotion/react";

export const themes: Record<AllThemes, Theme> = {
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

export type AllThemes =
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
