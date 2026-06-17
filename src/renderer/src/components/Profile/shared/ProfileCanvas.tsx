import type { UserProfile } from "@stores/objects/UserProfile";
import { Box, useTheme } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { forwardRef, type PropsWithChildren, type Ref } from "react";

interface Props extends PropsWithChildren {
  profile: UserProfile;
  interactive?: boolean;
  onCanvasClick?: () => void;
  backgroundColorOverride?: string | null;
  backgroundImageOverride?: string | null;
}

export const ProfileCanvas = observer(
  forwardRef(function ProfileCanvas(
    {
      profile,
      interactive,
      onCanvasClick,
      children,
      backgroundColorOverride,
      backgroundImageOverride
    }: Props,
    ref: Ref<HTMLDivElement>
  ) {
    const { theme } = useTheme();

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

    const resolvedColor = backgroundColor ?? theme.colors.surface;

    const background = backgroundImageUrl
      ? `url("${backgroundImageUrl}") center / cover no-repeat, ${resolvedColor}`
      : resolvedColor;

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
          cursor: interactive ? "default" : undefined
        }}
      >
        {children}
      </Box>
    );
  })
);
