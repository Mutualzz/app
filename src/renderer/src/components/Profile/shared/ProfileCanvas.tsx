import type { UserProfile } from "@stores/objects/UserProfile";
import { useGoogleFont } from "@hooks/useGoogleFont";
import { buildProfileBackgroundCss } from "@mutualzz/ui-core";
import { Box, useTheme } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { forwardRef, type PropsWithChildren, type Ref } from "react";

interface Props extends PropsWithChildren {
  profile: UserProfile;
  interactive?: boolean;
  onCanvasClick?: () => void;
  backgroundColorOverride?: string | null;
  backgroundImageOverride?: string | null;
  pageFontFamilyOverride?: string | null;
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
      pageFontFamilyOverride
    }: Props,
    ref: Ref<HTMLDivElement>
  ) {
    const { theme } = useTheme();

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

    const background = buildProfileBackgroundCss({
      backgroundColor,
      backgroundImageUrl,
      fallback: theme.colors.surface
    });

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
          background,
          cursor: interactive ? "default" : undefined,
          fontFamily: fontFamily ?? "inherit",
          containerType: "inline-size",
          "--pcf-xs": "clamp(10px, 0.75cqw, 14px)",
          "--pcf-sm": "clamp(12px, 0.875cqw, 16px)",
          "--pcf-md": "clamp(13px, 1.0cqw, 18px)",
          "--pcf-title": "clamp(16px, 1.25cqw, 22px)"
        }}
      >
        {children}
      </Box>
    );
  })
);
