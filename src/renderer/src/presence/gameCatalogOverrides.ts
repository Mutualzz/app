import type { GameArgMatcher, GameCatalogEntry } from "./gameCatalog.types";

export type GameCatalogOverride = {
  matchExes: string[];
  name?: string;
  exes?: string[];
  argMatchers?: GameArgMatcher[];
};

export const GAME_CATALOG_OVERRIDES: GameCatalogOverride[] = [
  {
    matchExes: ["minecraft.exe", "minecraft.windows.exe"],
    name: "Minecraft",
    exes: ["minecraft.exe", "minecraft.windows.exe"],
    argMatchers: [
      { exe: "javaw.exe", includes: ["net.minecraft"] },
      { exe: "java.exe", includes: ["net.minecraft"] }
    ]
  }
];

export function applyGameCatalogOverrides(
  entries: GameCatalogEntry[]
): GameCatalogEntry[] {
  const next = entries.map((entry) => ({
    ...entry,
    exes: [...entry.exes],
    ...(entry.argMatchers ? { argMatchers: [...entry.argMatchers] } : {})
  }));

  for (const override of GAME_CATALOG_OVERRIDES) {
    const needles = new Set(
      override.matchExes.map((exe) => exe.trim().toLowerCase()).filter(Boolean)
    );
    const target = next.find((entry) =>
      entry.exes.some((exe) => needles.has(exe.toLowerCase()))
    );
    if (!target) continue;

    if (override.name) target.name = override.name;
    if (override.exes) {
      target.exes = override.exes.map((exe) => exe.trim().toLowerCase());
    }
    if (override.argMatchers) {
      target.argMatchers = override.argMatchers.map((matcher) => ({
        exe: matcher.exe.trim().toLowerCase(),
        includes: matcher.includes.map((s) => s.toLowerCase())
      }));
    }
  }

  return next;
}
