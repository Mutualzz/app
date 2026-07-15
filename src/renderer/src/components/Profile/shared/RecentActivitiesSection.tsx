import { ActivityIcon } from "@components/Presence/ActivityIcon";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import type { PresenceActivity, PresenceActivityAssets } from "@mutualzz/types";
import { Box, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import {
  formatActivityDuration,
  formatActivityPrimary,
  formatActivitySecondary
} from "@utils/activityDisplay";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

dayjs.extend(relativeTime);

export type RecentActivityDto = {
  type: "playing" | "listening";
  name: string;
  applicationId?: string;
  details?: string;
  state?: string;
  url?: string;
  assets?: PresenceActivityAssets;
  startedAt: number | null;
  endedAt: number;
};

function toPresenceActivity(row: RecentActivityDto): PresenceActivity {
  return {
    type: row.type,
    name: row.name,
    ...(row.applicationId ? { applicationId: row.applicationId } : {}),
    ...(row.details ? { details: row.details } : {}),
    ...(row.state ? { state: row.state } : {}),
    ...(row.url ? { url: row.url } : {}),
    ...(row.assets ? { assets: row.assets } : {})
  };
}

function activityIdentity(activity: {
  type: string;
  name: string;
  applicationId?: string;
}) {
  return `${activity.type}|${activity.applicationId ?? ""}|${activity.name}`;
}

function dedupeRecent(rows: RecentActivityDto[]) {
  const seen = new Set<string>();
  const out: RecentActivityDto[] = [];
  for (const row of rows) {
    const key = activityIdentity(row);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}

interface Props {
  userId: string;
  liveActivities?: PresenceActivity[];
  iconSize?: number;
  showEmpty?: boolean;
  compact?: boolean;
}

export const RecentActivitiesSection = ({
  userId,
  liveActivities = [],
  iconSize = 36,
  showEmpty = false,
  compact = false
}: Props) => {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");
  const { theme } = useTheme();
  const app = useAppStore();
  const [expanded, setExpanded] = useState(false);
  const accent = theme.colors.success;

  const { data, isPending } = useQuery({
    queryKey: ["user-recent-activities", userId],
    queryFn: async () => {
      try {
        return await app.rest.get<{ activities: RecentActivityDto[] }>(
          `/users/${userId}/recent-activities`
        );
      } catch {
        return { activities: [] as RecentActivityDto[] };
      }
    },
    staleTime: 60_000
  });

  const liveKeys = useMemo(
    () => new Set(liveActivities.map(activityIdentity)),
    [liveActivities]
  );

  const recent = useMemo(
    () =>
      dedupeRecent(
        (data?.activities ?? []).filter(
          (row) => !liveKeys.has(activityIdentity(row))
        )
      ),
    [data?.activities, liveKeys]
  );

  const activitiesSignature = useMemo(
    () => recent.map(activityIdentity).join("|"),
    [recent]
  );

  useEffect(() => {
    setExpanded(false);
  }, [activitiesSignature]);

  const canCollapse = recent.length > 1;
  const visible = canCollapse && !expanded ? recent.slice(0, 1) : recent;
  const hiddenCount = recent.length - 1;

  const cardCss = {
    backgroundColor: `${theme.colors.surface}cc`,
    border: `1px solid ${theme.colors.neutral}22`
  } as const;

  if (isPending) {
    if (compact) return null;

    return (
      <Paper
        direction="column"
        spacing={1}
        p={1.25}
        borderRadius={8}
        elevation={1}
        css={cardCss}
        minWidth={0}
      >
        {[0, 1].map((i) => (
          <Stack
            key={i}
            direction="row"
            spacing={1}
            alignItems="center"
            minWidth={0}
            css={{
              "@keyframes recentActivityPulse": {
                "0%, 100%": { opacity: 0.2 },
                "50%": { opacity: 0.4 }
              },
              animation: "recentActivityPulse 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`
            }}
          >
            <Box
              width={iconSize}
              height={iconSize}
              borderRadius={8}
              css={{
                backgroundColor: theme.colors.surface,
                flexShrink: 0
              }}
            />
            <Stack direction="column" spacing={0.5} minWidth={0} flex={1}>
              <Box
                height={10}
                width="55%"
                borderRadius={4}
                css={{ backgroundColor: theme.colors.surface }}
              />
              <Box
                height={8}
                width="35%"
                borderRadius={4}
                css={{ backgroundColor: theme.colors.surface }}
              />
            </Stack>
          </Stack>
        ))}
      </Paper>
    );
  }

  if (recent.length === 0) {
    if (!showEmpty) return null;
    return (
      <Paper
        direction="column"
        spacing={0.5}
        p={1.25}
        borderRadius={8}
        elevation={1}
        css={cardCss}
        minWidth={0}
      >
        <Typography level="body-xs" css={{ opacity: 0.55 }}>
          {t("profile.blocks.noRecentActivity")}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      direction="column"
      spacing={1}
      p={1.25}
      borderRadius={8}
      elevation={1}
      css={{
        ...cardCss,
        ...(canCollapse && !expanded ? { cursor: "pointer" } : undefined),
        ...(canCollapse && {
          "&:hover": {
            borderColor: `${theme.colors.neutral}44`
          }
        })
      }}
      minWidth={0}
      onClick={
        canCollapse && !expanded
          ? (e) => {
              e.stopPropagation();
              setExpanded(true);
            }
          : undefined
      }
    >
      {visible.map((row) => {
        const activity = toPresenceActivity(row);
        const typeKey =
          row.type === "listening"
            ? "activity.listened"
            : "activity.played";
        const secondary = formatActivitySecondary(activity);
        const duration = formatActivityDuration(row.startedAt, row.endedAt);
        const durationKey =
          row.type === "listening"
            ? "profile.blocks.listenedForEnded"
            : "profile.blocks.playedForEnded";
        return (
          <Stack
            key={`${activityIdentity(row)}-${row.endedAt}`}
            direction="row"
            spacing={1}
            alignItems="center"
            minWidth={0}
          >
            <ActivityIcon
              activity={activity}
              size={iconSize}
              color={accent}
              fetchFallback
              borderRadius={8}
            />
            <Stack direction="column" spacing={0.15} minWidth={0} flex={1}>
              {!compact && (
                <Typography
                  level="body-xs"
                  css={{
                    opacity: 0.65,
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    fontWeight: 700
                  }}
                >
                  {tCommon(typeKey)}
                </Typography>
              )}
              <Typography
                level="body-xs"
                textColor="accent"
                fontWeight={700}
                css={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {compact
                  ? `${tCommon(typeKey)} ${formatActivityPrimary(activity)}`
                  : formatActivityPrimary(activity)}
              </Typography>
              {secondary && !compact && (
                <Typography
                  level="body-xs"
                  css={{
                    opacity: 0.7,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {secondary}
                </Typography>
              )}
              <Typography
                level="body-xs"
                css={{
                  opacity: 0.55,
                  fontSize: "0.65rem",
                  fontVariantNumeric: "tabular-nums"
                }}
              >
                {duration
                  ? t(durationKey, {
                      duration,
                      time: dayjs(row.endedAt).fromNow()
                    })
                  : t("profile.blocks.endedAgo", {
                      time: dayjs(row.endedAt).fromNow()
                    })}
              </Typography>
            </Stack>
          </Stack>
        );
      })}

      {canCollapse && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={0.35}
          flexShrink={0}
          onClick={
            expanded
              ? (e) => {
                  e.stopPropagation();
                  setExpanded(false);
                }
              : undefined
          }
          css={{
            opacity: 0.65,
            ...(expanded ? { cursor: "pointer" } : undefined)
          }}
        >
          {!expanded ? (
            <>
              <Typography level="body-xs">+{hiddenCount}</Typography>
              <CaretDownIcon size={12} weight="bold" />
            </>
          ) : (
            <>
              <Typography level="body-xs">
                {tCommon("activity.showLess")}
              </Typography>
              <CaretUpIcon size={12} weight="bold" />
            </>
          )}
        </Stack>
      )}
    </Paper>
  );
};
