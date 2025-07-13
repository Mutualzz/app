import type { Theme } from "@emotion/react";
import { baseDarkTheme } from "@mutualzz/ui";
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

export const darkThemesObj: Record<string, Theme> = {
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
    midnightElegance: midnightEleganceTheme,
};

export const darkThemes = Object.values(darkThemesObj);
