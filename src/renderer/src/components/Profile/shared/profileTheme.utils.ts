import type { Theme as MzTheme } from "@emotion/react";
import type {
  APIDisplayNameStyle,
  APIProfileTheme,
  APITheme
} from "@mutualzz/types";
import { Theme } from "@stores/objects/Theme";
import { createContext } from "react";

export const ProfileNameStyleContext =
  createContext<APIDisplayNameStyle | null>(null);

export const toProfileEmotionTheme = (profileTheme: APIProfileTheme): MzTheme =>
  Theme.toEmotion({
    id: `profile-${profileTheme.sourceId}`,
    name: profileTheme.name,
    adaptive: false,
    type: profileTheme.type,
    style: profileTheme.style,
    colors: profileTheme.colors,
    typography: { colors: profileTheme.typographyColors }
  } as APITheme);
