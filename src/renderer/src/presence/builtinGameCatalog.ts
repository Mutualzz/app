import type { GameCatalogEntry } from "./gameCatalog.types";

export const FALLBACK_GAME_CATALOG: GameCatalogEntry[] = [
  {
    id: "counter-strike-2",
    name: "Counter-Strike 2",
    exes: ["cs2.exe"]
  },
  {
    id: "valorant",
    name: "VALORANT",
    exes: ["valorant-win64-shipping.exe"]
  },
  {
    id: "minecraft",
    name: "Minecraft",
    exes: ["minecraft.exe", "minecraft.windows.exe"],
    argMatchers: [
      { exe: "javaw.exe", includes: ["net.minecraft"] },
      { exe: "java.exe", includes: ["net.minecraft"] }
    ]
  },
  {
    id: "warframe",
    name: "Warframe",
    exes: ["warframe.x64.exe", "warframe.exe"]
  },
  {
    id: "league-of-legends",
    name: "League of Legends",
    exes: ["league of legends.exe", "lol.exe", "lolex.exe"]
  },
  {
    id: "fortnite",
    name: "Fortnite",
    exes: ["fortniteclient-win64-shipping.exe"]
  },
  {
    id: "apex-legends",
    name: "Apex Legends",
    exes: ["r5apex.exe", "r5apex_dx12.exe"]
  },
  {
    id: "overwatch-2",
    name: "Overwatch 2",
    exes: ["overwatch.exe"]
  },
  {
    id: "rocket-league",
    name: "Rocket League",
    exes: ["rocketleague.exe"]
  },
  {
    id: "gta-v",
    name: "Grand Theft Auto V",
    exes: [
      "gta5.exe",
      "gta5_be.exe",
      "gta5_enhanced.exe",
      "gta5_enhanced_be.exe"
    ]
  },
  {
    id: "elden-ring",
    name: "ELDEN RING",
    exes: ["eldenring.exe"]
  },
  {
    id: "cyberpunk-2077",
    name: "Cyberpunk 2077",
    exes: ["cyberpunk2077.exe"]
  },
  {
    id: "destiny-2",
    name: "Destiny 2",
    exes: ["destiny2.exe"]
  },
  {
    id: "dota-2",
    name: "Dota 2",
    exes: ["dota2.exe"]
  },
  {
    id: "rust",
    name: "Rust",
    exes: ["rustclient.exe"]
  },
  {
    id: "terraria",
    name: "Terraria",
    exes: ["terraria.exe"]
  },
  {
    id: "stardew-valley",
    name: "Stardew Valley",
    exes: ["stardew valley.exe"]
  },
  {
    id: "among-us",
    name: "Among Us",
    exes: ["among us.exe"]
  },
  {
    id: "osu",
    name: "osu!",
    exes: ["osu!.exe"]
  },
  {
    id: "roblox",
    name: "Roblox",
    exes: ["robloxplayerbeta.exe", "roblox.exe"]
  },
  {
    id: "genshin-impact",
    name: "Genshin Impact",
    exes: ["genshinimpact.exe"]
  },
  {
    id: "honkai-star-rail",
    name: "Honkai: Star Rail",
    exes: ["starrail.exe"]
  },
  {
    id: "helldivers-2",
    name: "HELLDIVERS 2",
    exes: ["helldivers2.exe"]
  },
  {
    id: "palworld",
    name: "Palworld",
    exes: ["palworld-win64-shipping.exe", "palworld-wingdk-shipping.exe"]
  },
  {
    id: "lethal-company",
    name: "Lethal Company",
    exes: ["lethal company.exe"]
  },
  {
    id: "phasmophobia",
    name: "Phasmophobia",
    exes: ["phasmophobia.exe"]
  },
  {
    id: "sea-of-thieves",
    name: "Sea of Thieves",
    exes: ["sotgame.exe", "seaofthieves.exe"]
  },
  {
    id: "rainbow-six-siege",
    name: "Rainbow Six Siege",
    exes: [
      "rainbowsix.exe",
      "rainbowsix_vulkan.exe",
      "rainbowsix_be.exe",
      "rainbowsixgame.exe"
    ]
  },
  {
    id: "call-of-duty",
    name: "Call of Duty",
    exes: [
      "cod.exe",
      "cod22-cod.exe",
      "cod23-cod.exe",
      "cod25-cod.exe",
      "sp22-cod.exe",
      "sp23-cod.exe",
      "sp24-cod.exe",
      "sp25-cod.exe",
      "mp23-cod.exe",
      "modernwarfare.exe",
      "blackopscoldwar.exe",
      "blackops4.exe",
      "vanguard.exe"
    ]
  }
];

export const BUILTIN_GAME_CATALOG = FALLBACK_GAME_CATALOG;
