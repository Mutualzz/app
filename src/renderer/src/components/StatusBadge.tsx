import { observer } from "mobx-react-lite";
import type { PresenceStatus } from "@mutualzz/types";
import { Stack, useTheme } from "@mutualzz/ui-web";
import {
  type ColorLike,
  dynamicElevation,
  extractColors
} from "@mutualzz/ui-core";
import { badgePillAnimation, typingDotAnimation } from "@components/keyframes";

function roundPx(value: number) {
  return Math.max(1, Math.round(value));
}

function roundEven(value: number) {
  return Math.max(2, Math.round(value / 2) * 2);
}

function toSolidColor(color: ColorLike): ColorLike {
  return extractColors(color)?.[0] ?? color;
}

function getStatusMetrics(avatarSize: number) {
  const badgeDiameter = Math.max(12, roundEven(avatarSize * 0.35));
  const ringThickness = Math.max(2, roundPx(badgeDiameter * 0.2));

  const xNudgePx = roundPx(badgeDiameter * 0.65);
  const yNudgePx = roundPx(badgeDiameter * 0.45);

  return { badgeDiameter, ringThickness, xNudgePx, yNudgePx };
}

export function getStatusBadgeLayout(avatarSize: number, typing: boolean) {
  const { badgeDiameter, ringThickness, xNudgePx, yNudgePx } =
    getStatusMetrics(avatarSize);

  const pillWidth = roundEven(badgeDiameter * 2.2);
  const width = typing ? pillWidth : badgeDiameter;
  const xNudge = typing ? roundPx(pillWidth * 0.6) : xNudgePx;

  return {
    badgeDiameter,
    ringThickness,
    pillWidth,
    width,
    xNudge,
    yNudge: yNudgePx,
    centerX: avatarSize - xNudge,
    centerY: avatarSize - yNudgePx
  };
}

function holeMaskImage(width: number, height: number, holeShape: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><mask id="hole"><rect width="100%" height="100%" fill="white"/>${holeShape}</mask><rect width="100%" height="100%" mask="url(#hole)"/></svg>`;

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function pillShape(
  centerX: number,
  centerY: number,
  width: number,
  height: number
) {
  return `<rect x="${centerX - width / 2}" y="${centerY - height / 2}" width="${width}" height="${height}" rx="${height / 2}" fill="black"/>`;
}

export function getStatusBadgeMask(avatarSize: number, typing: boolean) {
  const { badgeDiameter, width, centerX, centerY } = getStatusBadgeLayout(
    avatarSize,
    typing
  );

  return holeMaskImage(
    avatarSize,
    avatarSize,
    pillShape(centerX, centerY, width, badgeDiameter)
  );
}

export function isStatusBadgeVisible(
  status: PresenceStatus,
  showInvisible = false,
  showOffline = false
) {
  if (status === "invisible") return showInvisible;
  if (status === "offline") return showOffline;
  return status === "online" || status === "idle" || status === "dnd";
}

interface StatusBadgeProps {
  status: PresenceStatus;
  size?: number;
  cutColor?: string;
  elevation?: number;
  inPicker?: boolean;
  showInvisible?: boolean;
  showOffline?: boolean;
  typing?: boolean;
  cutout?: boolean;
}

interface BadgeVisualProps {
  status: PresenceStatus;
  diameter: number;
  pillWidth: number;
  ringThickness: number;
  ringColor: ColorLike | "transparent";
  cutColor: ColorLike;
  fillColor: string;
  drawOuterRing: boolean;
  hollow?: boolean;
  typing?: boolean;
  cutout?: boolean;
  overlay?: {
    xNudgePx: number;
    yNudgePx: number;
  };
}

const BadgeVisual = observer(
  ({
    status,
    diameter,
    pillWidth,
    ringThickness,
    ringColor,
    cutColor,
    fillColor,
    drawOuterRing,
    hollow,
    cutout,
    typing,
    overlay
  }: BadgeVisualProps) => {
    const geometryInset = drawOuterRing ? ringThickness : 0;
    const innerDiameter = Math.max(1, diameter - geometryInset * 2);

    const dndBarHeight = roundEven(innerDiameter * 0.28);
    const dndBarWidth = roundEven(innerDiameter * 0.76);

    const idleCutoutDiameter = roundPx(innerDiameter * 0.78);
    const idleCutoutOffset = roundPx(innerDiameter * 0.18);

    const invisibleRingThickness = Math.max(2, roundPx(innerDiameter * 0.18));

    const dotSize = Math.max(3, roundPx(innerDiameter * 0.28));
    const dotGap = Math.max(2, roundPx(innerDiameter * 0.2));

    const width = typing ? pillWidth : diameter;

    const center = diameter / 2;
    const hollowHoleDiameter = innerDiameter - invisibleRingThickness * 2;

    const innerHole = (() => {
      if (status === "idle")
        return pillShape(
          center - idleCutoutOffset,
          center - idleCutoutOffset,
          idleCutoutDiameter,
          idleCutoutDiameter
        );
      if (status === "dnd")
        return pillShape(center, center, dndBarWidth, dndBarHeight);
      if (hollow)
        return pillShape(
          center,
          center,
          hollowHoleDiameter,
          hollowHoleDiameter
        );
      return null;
    })();

    const maskedHole = cutout && !typing ? innerHole : null;
    const hollowRingColor = dynamicElevation(cutColor, 10);

    return (
      <Stack
        position={overlay ? "absolute" : "relative"}
        bottom={overlay ? 0 : undefined}
        right={overlay ? 0 : undefined}
        width={width}
        height={diameter}
        borderRadius={9999}
        css={{
          ...(overlay && {
            transform: `translate(50%, 50%) translate(-${overlay.xNudgePx}px, -${overlay.yNudgePx}px)`
          }),
          boxSizing: "border-box",
          ...(drawOuterRing && {
            border: `${ringThickness}px solid ${ringColor}`
          }),
          backgroundClip: "padding-box",
          backgroundColor: maskedHole && hollow ? hollowRingColor : fillColor,
          ...(maskedHole && {
            maskImage: holeMaskImage(width, diameter, maskedHole)
          }),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: dotGap,
          pointerEvents: "none",
          ...(typing && {
            animation: `${badgePillAnimation} 0.2s ease forwards`
          })
        }}
      >
        {typing ? (
          <>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: dotSize,
                  height: dotSize,
                  borderRadius: "50%",
                  backgroundColor: "#ffffff",
                  flexShrink: 0,
                  animation: `${typingDotAnimation} 1.2s infinite ease-in-out`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </>
        ) : maskedHole ? null : (
          <>
            {status === "dnd" && (
              <Stack
                width={dndBarWidth}
                height={dndBarHeight}
                borderRadius={9999}
                css={{ backgroundColor: cutColor }}
              />
            )}

            {status === "idle" && (
              <Stack
                width={idleCutoutDiameter}
                height={idleCutoutDiameter}
                borderRadius={9999}
                css={{
                  backgroundColor: cutColor,
                  transform: `translate(-${idleCutoutOffset}px, -${idleCutoutOffset}px)`
                }}
              />
            )}

            {hollow && (
              <Stack
                width={innerDiameter}
                height={innerDiameter}
                borderRadius={9999}
                css={{
                  border: `${invisibleRingThickness}px solid ${dynamicElevation(
                    cutColor,
                    10
                  )}`,
                  backgroundColor: "transparent",
                  boxSizing: "border-box"
                }}
              />
            )}
          </>
        )}
      </Stack>
    );
  }
);

export const StatusBadge = observer(
  ({
    status,
    size = 48,
    cutColor,
    elevation = 0,
    inPicker = false,
    showInvisible = false,
    showOffline = false,
    typing = false,
    cutout = false
  }: StatusBadgeProps) => {
    const { theme } = useTheme();

    const hollow =
      status === "invisible" || (status === "offline" && showOffline);

    const surface = toSolidColor(
      (cutColor as ColorLike) ?? theme.colors.surface
    );

    const fillColor = (() => {
      switch (status) {
        case "online":
          return theme.colors.success;
        case "idle":
          return theme.colors.warning;
        case "dnd":
          return theme.colors.danger;
        case "invisible":
        case "offline":
          return hollow ? toSolidColor(theme.colors.surface) : null;
        default:
          return null;
      }
    })();

    if (!showInvisible && status === "invisible") return null;
    if (fillColor == null) return null;

    const effectiveCutColor = dynamicElevation(surface, elevation);

    const { badgeDiameter, ringThickness, pillWidth, xNudge, yNudge } =
      getStatusBadgeLayout(size, typing);

    if (inPicker) {
      const pickerBoxSize = roundPx(size * 0.6);
      const pickerDotSize = roundPx(size * 0.3);
      const pickerRingThickness = roundPx(pickerDotSize * 0.16);

      return (
        <Stack
          width={pickerBoxSize}
          height={pickerBoxSize}
          alignItems="center"
          justifyContent="center"
          css={{
            flex: "0 0 auto",
            minWidth: pickerBoxSize,
            minHeight: pickerBoxSize
          }}
        >
          <BadgeVisual
            status={status}
            diameter={pickerDotSize}
            pillWidth={roundPx(pickerDotSize * 2.2)}
            ringThickness={pickerRingThickness}
            ringColor={effectiveCutColor}
            cutColor={effectiveCutColor}
            fillColor={fillColor}
            drawOuterRing={false}
            hollow={hollow}
            typing={typing}
          />
        </Stack>
      );
    }

    return (
      <BadgeVisual
        status={status}
        diameter={badgeDiameter}
        pillWidth={pillWidth}
        ringThickness={ringThickness}
        ringColor={cutout ? "transparent" : effectiveCutColor}
        cutColor={effectiveCutColor}
        fillColor={fillColor}
        drawOuterRing={true}
        hollow={hollow}
        typing={typing}
        cutout={cutout}
        overlay={{
          xNudgePx: xNudge,
          yNudgePx: yNudge
        }}
      />
    );
  }
);
