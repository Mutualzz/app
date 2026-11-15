import {
  keyframes,
  type CSSObject,
  type Theme as MzTheme
} from "@emotion/react";
import { useGoogleFont } from "@hooks/useGoogleFont";
import type { APIDisplayNameStyle } from "@mutualzz/types";
import {
  type ColorLike,
  formatColor,
  isValidGradient
} from "@mutualzz/ui-core";
import { useTheme } from "@mutualzz/ui-web";
import type { ReactNode } from "react";

const RAINBOW_GRADIENT =
  "linear-gradient(90deg, #ff4d4d, #ffb84d, #fff34d, #4dff88, #4dc3ff, #b84dff, #ff4d4d)";
const SHINE_GRADIENT =
  "linear-gradient(110deg, transparent 40%, rgba(255, 255, 255, 0.85) 50%, transparent 60%)";

const shimmerSweep = keyframes({
  from: { backgroundPosition: "200% 0, 0 0" },
  to: { backgroundPosition: "-100% 0, 0 0" }
});

const rainbowSlide = keyframes({
  from: { backgroundPosition: "0% 0" },
  to: { backgroundPosition: "200% 0" }
});

const whenReducedMotion = (styles: CSSObject): CSSObject => ({
  "@media (prefers-reduced-motion: reduce)": styles,
  "[data-reduced-motion] &": styles
});

const withAlpha = (color: string, alpha: number) =>
  formatColor(color as ColorLike, { format: "hexa", alpha });

const clipToText = (background: string): CSSObject => ({
  background,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent"
});

const getFillCss = (color: string | null): CSSObject => {
  if (!color) return {};
  return isValidGradient(color) ? clipToText(color) : { color };
};

interface DisplayNameCssOptions {
  animateOnHover?: boolean;
  fallbackColor?: string | null;
}

const animateOnHoverOnly = (styles: CSSObject): CSSObject => {
  const { animation, ...staticStyles } = styles;
  if (!animation) return styles;
  return { ...staticStyles, "&:hover": { animation } };
};

export const getDisplayNameCss = (
  nameStyle: APIDisplayNameStyle | null | undefined,
  theme: MzTheme,
  options: DisplayNameCssOptions = {}
): CSSObject => {
  const styles = getEffectCss(nameStyle, theme, options.fallbackColor ?? null);
  return options.animateOnHover ? animateOnHoverOnly(styles) : styles;
};

const getEffectCss = (
  nameStyle: APIDisplayNameStyle | null | undefined,
  theme: MzTheme,
  fallbackColor: string | null
): CSSObject => {
  const color = nameStyle?.color ?? null;
  const isGradient = !!color && isValidGradient(color);
  const fill = getFillCss(color);
  const effectColor =
    nameStyle?.effectColor ??
    (color && !isGradient ? color : String(theme.colors.primary));
  const textColor = fallbackColor ?? String(theme.typography.colors.primary);
  const baseLayer =
    isGradient && color
      ? color
      : `linear-gradient(${color ?? textColor}, ${color ?? textColor})`;

  switch (nameStyle?.effect) {
    case "glow":
      return {
        ...fill,
        filter: `drop-shadow(0 0 4px ${withAlpha(effectColor, 80)})`
      };
    case "neon":
      return {
        ...fill,
        filter: [2, 6, 14]
          .map((blur) => `drop-shadow(0 0 ${blur}px ${effectColor})`)
          .join(" ")
      };
    case "shadow":
      return {
        ...fill,
        filter: `drop-shadow(2px 2px 0 ${withAlpha(effectColor, 70)})`
      };
    case "outline":
      return { ...fill, WebkitTextStroke: `1px ${effectColor}` };
    case "shimmer":
      return {
        ...clipToText(`${SHINE_GRADIENT}, ${baseLayer}`),
        backgroundSize: "200% 100%, 100% 100%",
        backgroundRepeat: "no-repeat",
        animation: `${shimmerSweep} 2.8s linear infinite`,
        ...whenReducedMotion({ animation: "none", ...clipToText(baseLayer) })
      };
    case "rainbow":
      return {
        ...clipToText(RAINBOW_GRADIENT),
        backgroundSize: "200% 100%",
        animation: `${rainbowSlide} 4s linear infinite`,
        ...whenReducedMotion({ animation: "none" })
      };
    default:
      return fill;
  }
};

interface Props {
  nameStyle: APIDisplayNameStyle | null | undefined;
  ownerUserId?: string | null;
  children: ReactNode;
}

export const ProfileDisplayName = ({
  nameStyle,
  ownerUserId,
  children
}: Props) => {
  const { theme } = useTheme();
  const { fontFamily } = useGoogleFont(nameStyle?.font, ownerUserId);

  return (
    <span
      css={{
        display: "inline-block",
        fontFamily,
        ...getDisplayNameCss(nameStyle, theme)
      }}
    >
      {children}
    </span>
  );
};
