import emojiData from "emoji-datasource-twitter/emoji.json";

export interface PickerEmoji {
  unified: string;
  name: string;
  shortName: string;
  sheetX: number;
  sheetY: number;
  hasSkinTones: boolean;
  skinVariations?: Record<
    string,
    { sheetX: number; sheetY: number; unified: string }
  >;
}

export interface PickerCategory {
  id: string;
  name: string;
  emojis: PickerEmoji[];
}

export const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  "Smileys & Emotion": { label: "Smileys", icon: "Smile" },
  "People & Body": { label: "People", icon: "Users" },
  "Animals & Nature": { label: "Animals", icon: "Rabbit" },
  "Food & Drink": { label: "Food", icon: "UtensilsCrossed" },
  "Travel & Places": { label: "Travel", icon: "Plane" },
  Activities: { label: "Activities", icon: "Gamepad2" },
  Objects: { label: "Objects", icon: "Lightbulb" },
  Symbols: { label: "Symbols", icon: "Hash" },
  Flags: { label: "Flags", icon: "Flag" }
};

const CATEGORY_ORDER = Object.keys(CATEGORY_META);

const raw = emojiData
  .filter((e) => e.has_img_twitter && e.category !== "Component")
  .sort((a, b) => a.sort_order - b.sort_order);

export const PICKER_CATEGORIES: PickerCategory[] = CATEGORY_ORDER.map((cat) => {
  const emojis = raw
    .filter((e) => e.category === cat)
    .map(
      (e): PickerEmoji => ({
        unified: e.unified,
        name: e.name.toLowerCase(),
        shortName: e.short_name,
        sheetX: e.sheet_x,
        sheetY: e.sheet_y,
        hasSkinTones: !!e.skin_variations,
        skinVariations: e.skin_variations
          ? Object.fromEntries(
              Object.entries(e.skin_variations).map(([tone, v]: any) => [
                tone,
                {
                  sheetX: v.sheet_x,
                  sheetY: v.sheet_y,
                  unified: v.unified
                }
              ])
            )
          : undefined
      })
    );

  return { id: cat, name: CATEGORY_META[cat].label, emojis };
}).filter((c) => c.emojis.length > 0);

export const ALL_EMOJIS: PickerEmoji[] = PICKER_CATEGORIES.flatMap(
  (c) => c.emojis
);

export function searchEmojis(query: string): PickerEmoji[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return ALL_EMOJIS.filter(
    (e) => e.name.includes(q) || e.shortName.includes(q)
  ).slice(0, 60);
}
