import { Theme as EmotionTheme, ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import { useAppStore } from "@hooks/useStores";
import {
  resolveWallpaperDimOverlay,
  resolveWallpaperImageFilter,
  resolveWallpaperScrim,
} from "@mutualzz/ui-core";
import { Stack, ThemeContext } from "@mutualzz/ui-web";
import { Theme } from "@stores/objects/Theme";
import { observer } from "mobx-react-lite";
import { type PropsWithChildren, useMemo } from "react";

export const SpaceThemeProvider = observer(
  ({ children }: PropsWithChildren) => {
    const app = useAppStore();
    const space = app.spaces.active;
    const themeCreator = app.themeCreator;

    const previewingSpaceTheme =
      themeCreator.inPreview &&
      !!themeCreator.spaceId &&
      themeCreator.spaceId === space?.id;

    const source =
      space?.theme ??
      (space?.themeId
        ? (app.themes.themes.get(space.themeId) ?? null)
        : null);

    const emotionTheme = useMemo(() => {
      if (!space?.themeId && !previewingSpaceTheme) return null;
      if (previewingSpaceTheme) return themeCreator.buildPreviewEmotion();
      if (!source) return null;
      return Theme.toEmotion(source);
    }, [
      previewingSpaceTheme,
      source,
      space?.themeId,
      themeCreator.inPreview,
      themeCreator.spaceId,
      themeCreator.values
    ]);

    if (!emotionTheme) return children;

    const backgroundImageUrl = emotionTheme.backgroundImageUrl;

    return (
      <ThemeContext.Provider
        value={{
          theme: emotionTheme,
          changeTheme: () => undefined,
          type: emotionTheme.type
        }}
      >
        <EmotionThemeProvider theme={emotionTheme as EmotionTheme}>
          <Stack
            direction="column"
            flex={1}
            minWidth={0}
            height="100%"
            width="100%"
            position="relative"
            overflow="hidden"
            css={{
              background: backgroundImageUrl ? undefined : "transparent"
            }}
          >
            {backgroundImageUrl && (
              <>
                <div
                  aria-hidden
                  css={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 0,
                    pointerEvents: "none",
                    backgroundImage: `url(${backgroundImageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    filter: resolveWallpaperImageFilter(emotionTheme)
                  }}
                />
                <div
                  aria-hidden
                  css={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 0,
                    pointerEvents: "none",
                    backgroundImage: `linear-gradient(${resolveWallpaperDimOverlay(emotionTheme)}, ${resolveWallpaperDimOverlay(emotionTheme)}), linear-gradient(${resolveWallpaperScrim(emotionTheme)}, ${resolveWallpaperScrim(emotionTheme)})`
                  }}
                />
              </>
            )}
            <Stack
              direction="column"
              flex={1}
              minWidth={0}
              height="100%"
              width="100%"
              css={{ position: "relative", zIndex: 1 }}
            >
              {children}
            </Stack>
          </Stack>
        </EmotionThemeProvider>
      </ThemeContext.Provider>
    );
  }
);
