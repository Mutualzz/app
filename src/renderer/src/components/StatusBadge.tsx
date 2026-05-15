import { observer } from "mobx-react-lite";
import type { PresenceStatus } from "@mutualzz/types";
import { useMemo } from "react";
import { Stack, useTheme } from "@mutualzz/ui-web";
import { type ColorLike, dynamicElevation } from "@mutualzz/ui-core";

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
}

interface BadgeVisualProps {
    status: PresenceStatus;
    diameter: number;
    ringThickness: number;
    cutColor: ColorLike;
    fillColor: string;

    drawOuterRing: boolean;

    overlay?: {
        xNudgePx: number;
        yNudgePx: number;
    };
}

const BadgeVisual = observer(
    ({
        status,
        diameter,
        ringThickness,
        cutColor,
        fillColor,
        drawOuterRing,
        overlay,
    }: BadgeVisualProps) => {
        const geometryInset = drawOuterRing ? ringThickness : 0;
        const innerDiameter = Math.max(1, diameter - geometryInset * 2);

        const dndBarHeight = roundPx(innerDiameter * 0.28);
        const dndBarWidth = roundPx(innerDiameter * 0.76);

        const idleCutoutDiameter = roundPx(innerDiameter * 0.78);
        const idleCutoutOffset = roundPx(innerDiameter * 0.18);

        const invisibleRingThickness = Math.max(
            2,
            roundPx(innerDiameter * 0.18),
        );

        return (
            <Stack
                position={overlay ? "absolute" : "relative"}
                bottom={overlay ? 0 : undefined}
                right={overlay ? 0 : undefined}
                width={diameter}
                height={diameter}
                borderRadius={9999}
                css={{
                    ...(overlay && {
                        transform: `translate(50%, 50%) translate(-${overlay.xNudgePx}px, -${overlay.yNudgePx}px)`,
                    }),

                    boxSizing: "border-box",

                    ...(drawOuterRing && {
                        border: `${ringThickness}px solid ${cutColor}`,
                    }),

                    backgroundClip: "padding-box",
                    backgroundColor: fillColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                }}
            >
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
                            transform: `translate(-${idleCutoutOffset}px, -${idleCutoutOffset}px)`,
                        }}
                    />
                )}

                {status === "invisible" && (
                    <Stack
                        width={innerDiameter}
                        height={innerDiameter}
                        borderRadius={9999}
                        css={{
                            border: `${invisibleRingThickness}px solid ${dynamicElevation(
                                cutColor,
                                10,
                            )}`,
                            backgroundColor: "transparent",
                            boxSizing: "border-box",
                        }}
                    />
                )}
            </Stack>
        );
    },
);

export const StatusBadge = observer(
    ({
        status,
        size = 48,
        cutColor,
        elevation = 0,
        inPicker = false,
        showInvisible = false,
    }: StatusBadgeProps) => {
        const { theme } = useTheme();

        const fillColor = useMemo(() => {
            switch (status) {
                case "online":
                    return theme.colors.success;
                case "idle":
                    return theme.colors.warning;
                case "dnd":
                    return theme.colors.danger;
                case "invisible":
                    return "transparent";
                case "offline":
                default:
                    return null;
            }
        }, [
            status,
            theme.colors.success,
            theme.colors.warning,
            theme.colors.danger,
        ]);

        if (!showInvisible && status === "invisible") return null;
        if (fillColor == null) return null;

        const effectiveCutColor = dynamicElevation(
            (cutColor as ColorLike) ?? theme.colors.surface,
            elevation,
        );

        const { badgeDiameter, ringThickness, xNudgePx, yNudgePx } =
            getStatusMetrics(size);

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
                        minHeight: pickerBoxSize,
                    }}
                >
                    <BadgeVisual
                        status={status}
                        diameter={pickerDotSize}
                        ringThickness={pickerRingThickness}
                        cutColor={effectiveCutColor}
                        fillColor={fillColor}
                        drawOuterRing={false}
                    />
                </Stack>
            );
        }

        return (
            <BadgeVisual
                status={status}
                diameter={badgeDiameter}
                ringThickness={ringThickness}
                cutColor={effectiveCutColor}
                fillColor={fillColor}
                drawOuterRing={true}
                overlay={{ xNudgePx, yNudgePx }}
            />
        );
    },
);
