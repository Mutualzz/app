import type { Theme as MzTheme } from "@emotion/react";
import type {
  APITheme,
  Snowflake,
  ThemeStyle,
  ThemeType,
  ThemeWallpaper
} from "@mutualzz/types";
import { CDNRoutes, ImageFormat } from "@mutualzz/types";
import {
  baseDarkTheme,
  baseLightTheme,
  DEFAULT_FONT_FAMILY,
  extractPrimaryFontFamily,
  resolveFontFamilyCss,
  resolveWallpaperSettings,
  type ColorLike,
  type TypographyLevel,
  type TypographyLevelObj
} from "@mutualzz/ui-core";
import type { AppStore } from "@stores/App.store";
import type { User } from "@stores/objects/User";
import { REST } from "@stores/REST.store";
import { makeAutoObservable, toJS } from "mobx";

export class Theme implements Partial<MzTheme> {
  id: Snowflake;
  name: string;
  description?: string | null;
  adaptive: boolean;
  type: ThemeType;
  style: ThemeStyle;
  colors: {
    common: {
      white: ColorLike;
      black: ColorLike;
    };
    primary: ColorLike;
    neutral: ColorLike;
    background: ColorLike;
    surface: ColorLike;
    danger: ColorLike;
    warning: ColorLike;
    info: ColorLike;
    success: ColorLike;
  };
  typography: {
    fontFamily: string;
    colors: {
      primary: ColorLike;
      secondary: ColorLike;
      accent: ColorLike;
      muted: ColorLike;
    };
    levels: Record<TypographyLevel, TypographyLevelObj>;
  };
  createdAt?: Date;
  updatedAt?: Date;
  backgroundImage?: string | null;
  wallpaper?: ThemeWallpaper | null;

  raw: APITheme;

  authorId?: Snowflake | null;
  spaceId?: Snowflake | null;

  constructor(
    private readonly app: AppStore,
    theme: APITheme
  ) {
    this.id = theme.id;
    this.name = theme.name;
    this.description = theme.description;
    this.adaptive = theme.adaptive;
    this.type = theme.type;
    this.style = theme.style;
    this.colors = theme.colors;
    this.typography = {
      ...theme.typography,
      levels: {
        ...(theme.type === "dark"
          ? baseDarkTheme.typography.levels
          : baseLightTheme.typography.levels),
        ...theme.typography.levels
      }
    };

    if (theme.createdAt) this.createdAt = new Date(theme.createdAt);
    if (theme.updatedAt) this.updatedAt = new Date(theme.updatedAt);

    this.backgroundImage = theme.backgroundImage ?? null;
    this.wallpaper = theme.wallpaper ?? null;
    this.raw = theme;

    this.authorId = theme.authorId;
    this.spaceId = theme.spaceId ?? null;
    if (theme.author) this._author = this.app.users.add(theme.author);

    makeAutoObservable(this, {}, { autoBind: true });
  }

  _author?: User | null;

  get author() {
    if (!this.authorId) return null;
    return this.app.users.get(this.authorId) || this._author;
  }

  get backgroundImageUrl() {
    if (!this.backgroundImage) return null;
    const animated = this.backgroundImage.startsWith("a_");
    return REST.makeCDNUrl(
      CDNRoutes.themeBackground(
        this.id,
        this.backgroundImage,
        animated ? ImageFormat.GIF : ImageFormat.WebP,
        1024,
        animated
      )
    );
  }

  static resolveBackgroundImageUrl(
    theme: APITheme | MzTheme | Theme
  ): string | null {
    if ("backgroundImageUrl" in theme && theme.backgroundImageUrl)
      return theme.backgroundImageUrl;
    if (theme instanceof Theme) return theme.backgroundImageUrl;
    const hash =
      "backgroundImage" in theme ? theme.backgroundImage : null;
    if (!hash) return null;
    const animated = hash.startsWith("a_");
    return REST.makeCDNUrl(
      CDNRoutes.themeBackground(
        theme.id,
        hash,
        animated ? ImageFormat.GIF : ImageFormat.WebP,
        1024,
        animated
      )
    );
  }

  static toEmotion(theme: APITheme | MzTheme | Theme): MzTheme {
    const toMergeWith = theme.type === "dark" ? baseDarkTheme : baseLightTheme;

    const themeToUse = toJS(theme);

    return {
      ...toMergeWith,
      ...themeToUse,
      backgroundImage:
        "backgroundImage" in themeToUse
          ? themeToUse.backgroundImage
          : null,
      backgroundImageUrl: Theme.resolveBackgroundImageUrl(theme),
      wallpaper: resolveWallpaperSettings({
        ...toMergeWith,
        ...themeToUse,
        type: themeToUse.type ?? toMergeWith.type,
        wallpaper:
          "wallpaper" in themeToUse ? themeToUse.wallpaper : null,
      } as MzTheme),
      colors: {
        ...toMergeWith.colors,
        ...themeToUse.colors
      },
      typography: {
        ...toMergeWith.typography,
        ...themeToUse.typography,
        fontFamily: themeToUse.typography?.fontFamily
          ? resolveFontFamilyCss(
              extractPrimaryFontFamily(themeToUse.typography.fontFamily) ??
                themeToUse.typography.fontFamily,
            )
          : toMergeWith.typography.fontFamily,
        colors: {
          ...toMergeWith.typography.colors,
          ...themeToUse.typography?.colors
        },
        levels: {
          ...toMergeWith.typography.levels,
          ...themeToUse.typography?.levels
        }
      }
    };
  }

  static serialize(theme: Theme | APITheme): APITheme {
    return {
      id: theme.id,
      name: theme.name,
      description: theme.description,
      adaptive: theme.adaptive,
      type: theme.type,
      style: theme.style,
      colors: theme.colors,
      typography: {
        ...theme.typography,
        fontFamily:
          extractPrimaryFontFamily(theme.typography.fontFamily) ??
          DEFAULT_FONT_FAMILY
      },
      createdAt: theme.createdAt,
      updatedAt: theme.updatedAt,
      authorId: theme.authorId,
      spaceId: theme.spaceId,
      backgroundImage: theme.backgroundImage,
      wallpaper: theme.wallpaper ?? null
    };
  }

  update(theme: APITheme) {
    this.id = theme.id;
    this.name = theme.name;
    this.description = theme.description;
    this.adaptive = theme.adaptive;
    this.type = theme.type;
    this.style = theme.style;
    this.colors = theme.colors;
    this.typography = {
      ...theme.typography,
      levels: {
        ...(theme.type === "dark"
          ? baseDarkTheme.typography.levels
          : baseLightTheme.typography.levels),
        ...theme.typography.levels
      }
    };

    if (theme.createdAt) this.createdAt = new Date(theme.createdAt);
    else this.createdAt = undefined;

    if (theme.updatedAt) this.updatedAt = new Date(theme.updatedAt);
    else this.updatedAt = undefined;

    this.authorId = theme.authorId ?? null;
    this.spaceId = theme.spaceId ?? null;
    this.backgroundImage = theme.backgroundImage ?? null;
    this.wallpaper = theme.wallpaper ?? null;

    if (theme.author) this._author = this.app.users.add(theme.author);

    this.raw = theme;
  }
}
