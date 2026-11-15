import type { UserProfile } from "@stores/objects/UserProfile";
import { useGoogleFont } from "@hooks/useGoogleFont";
import {
  getProfileBackgroundImageLayer,
  resolveProfileBackgroundFill
} from "@mutualzz/ui-core";
import { Box, useTheme } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { forwardRef, type PropsWithChildren, type Ref } from "react";
import type {
  APIDisplayNameStyle,
  APIProfileTheme,
  ProfileBackgroundImageFit
} from "@mutualzz/types";
import {
  getScopedThemeCss,
  ProfileThemeScope,
  useProfileScopedTheme
} from "./ProfileThemeScope";

interface Props extends PropsWithChildren {
  profile: UserProfile;
  interactive?: boolean;
  onCanvasClick?: () => void;
  backgroundColorOverride?: string | null;
  backgroundImageOverride?: string | null;
  backgroundImageFitOverride?: ProfileBackgroundImageFit | null;
  pageFontFamilyOverride?: string | null;
  themeOverride?: APIProfileTheme | null;
  displayNameStyleOverride?: APIDisplayNameStyle | null;
}

export const ProfileCanvas = observer(
  forwardRef(function ProfileCanvas(
    {
      profile,
      interactive,
      onCanvasClick,
      children,
      backgroundColorOverride,
      backgroundImageOverride,
      backgroundImageFitOverride,
      pageFontFamilyOverride,
      themeOverride,
      displayNameStyleOverride
    }: Props,
    ref: Ref<HTMLDivElement>
  ) {
    const { theme } = useTheme();

    const profileTheme =
      themeOverride !== undefined ? themeOverride : profile.theme;
    const displayNameStyle =
      displayNameStyleOverride !== undefined
        ? displayNameStyleOverride
        : profile.displayNameStyle;

    const scopedTheme = useProfileScopedTheme(profileTheme);

    const pageFontFamily =
      pageFontFamilyOverride !== undefined
        ? pageFontFamilyOverride
        : profile.pageFontFamily;
    const { fontFamily } = useGoogleFont(pageFontFamily, profile.userId);
    void profile.updatedAt;

    const backgroundColor =
      backgroundColorOverride !== undefined
        ? backgroundColorOverride
        : profile.backgroundColor;

    const backgroundImageSource =
      backgroundImageOverride !== undefined
        ? backgroundImageOverride
        : profile.backgroundImage;

    const backgroundImageUrl = profile.constructBackgroundUrlFrom(
      backgroundImageSource
    );

    const backgroundFallback = scopedTheme
      ? String(scopedTheme.colors.background)
      : String(theme.colors.surface);

    const backgroundImageFit =
      backgroundImageFitOverride !== undefined
        ? backgroundImageFitOverride
        : profile.backgroundImageFit;

    const imageLayer = backgroundImageUrl
      ? getProfileBackgroundImageLayer(backgroundImageUrl, backgroundImageFit)
      : null;

    const canvasFill = resolveProfileBackgroundFill(
      backgroundColor,
      backgroundFallback
    );

    return (
      <Box
        ref={ref}
        position="relative"
        width="100%"
        height="100%"
        borderRadius={12}
        overflow="hidden"
        onClick={interactive ? onCanvasClick : undefined}
        css={{
          ...getScopedThemeCss(scopedTheme),
          background: canvasFill,
          cursor: interactive ? "default" : undefined,
          userSelect: interactive ? "none" : undefined,
          fontFamily: fontFamily ?? "inherit",
          containerType: "inline-size",
          "--pcf-xs": "clamp(10px, 0.75cqw, 14px)",
          "--pcf-sm": "clamp(12px, 0.875cqw, 16px)",
          "--pcf-md": "clamp(13px, 1.0cqw, 18px)",
          "--pcf-title": "clamp(16px, 1.25cqw, 22px)"
        }}
      >
        {imageLayer?.kind === "css" && (
          <div
            aria-hidden
            css={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: imageLayer.square ? "100cqw" : "100%",
              background: imageLayer.background,
              pointerEvents: "none"
            }}
          />
        )}
        {imageLayer?.kind === "image" && backgroundImageUrl && (
          <img
            aria-hidden
            alt=""
            src={backgroundImageUrl}
            draggable={false}
            css={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "auto",
              pointerEvents: "none",
              maskImage: `linear-gradient(to bottom, black ${imageLayer.fadeStart}%, transparent)`,
              WebkitMaskImage: `linear-gradient(to bottom, black ${imageLayer.fadeStart}%, transparent)`
            }}
          />
        )}
        <ProfileThemeScope
          scopedTheme={scopedTheme}
          displayNameStyle={displayNameStyle}
        >
          {children}
        </ProfileThemeScope>
      </Box>
    );
  })
);
