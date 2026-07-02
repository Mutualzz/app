import { observer } from "mobx-react-lite";
import type { PresenceStatus } from "@mutualzz/types";
import { Stack, useTheme } from "@mutualzz/ui-web";
import { type ColorLike, dynamicElevation } from "@mutualzz/ui-core";
import { badgePillAnimation, typingDotAnimation } from "@components/keyframes";

function roundPx(value: number) {
  return Math.max(1, Math.round(value));
}

function getStatusMetrics(avatarSize: number) {
  const badgeDiameter = roundPx(avatarSize * 0.3);
  const ringThickness = roundPx(badgeDiameter * 0.16);

  const xNudgePx = roundPx(badgeDiameter * 0.65);
  const yNudgePx = roundPx(badgeDiameter * 0.45);

  return { badgeDiameter, ringThickness, xNudgePx, yNudgePx };
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
}

interface BadgeVisualProps {
  status: PresenceStatus;
  diameter: number;
  pillWidth: number;
  ringThickness: number;
  cutColor: ColorLike;
  fillColor: string;
  drawOuterRing: boolean;
  hollow?: boolean;
  typing?: boolean;
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
    cutColor,
    fillColor,
    drawOuterRing,
    hollow,
    typing,
    overlay
  }: BadgeVisualProps) => {
    const geometryInset = drawOuterRing ? ringThickness : 0;
    const innerDiameter = Math.max(1, diameter - geometryInset * 2);

    const dndBarHeight = roundPx(innerDiameter * 0.28);
    const dndBarWidth = roundPx(innerDiameter * 0.76);

    const idleCutoutDiameter = roundPx(innerDiameter * 0.78);
    const idleCutoutOffset = roundPx(innerDiameter * 0.18);

    const invisibleRingThickness = Math.max(2, roundPx(innerDiameter * 0.18));

    const dotSize = Math.max(3, roundPx(innerDiameter * 0.28));
    const dotGap = Math.max(2, roundPx(innerDiameter * 0.2));

    const width = typing ? pillWidth : diameter;

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
            border: `${ringThickness}px solid ${cutColor}`
          }),
          backgroundClip: "padding-box",
          backgroundColor: fillColor,
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
        ) : (
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
    typing = false
  }: StatusBadgeProps) => {
    const { theme } = useTheme();

    const hollow =
      status === "invisible" || (status === "offline" && showOffline);

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
          return hollow ? theme.colors.surface : null;
        default:
          return null;
      }
    })();

    if (!showInvisible && status === "invisible") return null;
    if (fillColor == null) return null;

    const effectiveCutColor = dynamicElevation(
      (cutColor as ColorLike) ?? theme.colors.surface,
      elevation
    );

    const { badgeDiameter, ringThickness, xNudgePx, yNudgePx } =
      getStatusMetrics(size);

    const pillWidth = roundPx(badgeDiameter * 2.2);

    // nudge accounts for pill width so it stays anchored bottom-right
    const effectiveXNudge = typing ? roundPx(pillWidth * 0.6) : xNudgePx;
    const effectiveYNudge = typing ? roundPx(badgeDiameter * 0.45) : yNudgePx;

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
        cutColor={effectiveCutColor}
        fillColor={fillColor}
        drawOuterRing={true}
        hollow={hollow}
        typing={typing}
        overlay={{
          xNudgePx: effectiveXNudge,
          yNudgePx: effectiveYNudge
        }}
      />
    );
  }
);
