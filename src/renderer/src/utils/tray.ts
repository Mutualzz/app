import type { Theme } from "@emotion/react";
import { getAdaptiveIcon } from "./icons";

export async function updateTrayProperties(theme: Theme): Promise<void> {
  if (!window.api) return;

  try {
    const icon = await getAdaptiveIcon(theme, "image/png");
    if (icon && typeof icon === "string") {
      // This updates both tray AND window icon in one call
      await window.api.theme.updateIcons(icon);
    }
  } catch (err) {
    console.error("Failed to update tray:", err);
  }
}

export async function getTray(theme: Theme): Promise<void> {
  await updateTrayProperties(theme);
}
