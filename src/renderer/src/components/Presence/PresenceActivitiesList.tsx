import { ActivityIcon } from "@components/Presence/ActivityIcon";
import { useNow } from "@hooks/useNow";
import type { PresenceActivity } from "@mutualzz/types";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import {
  ArrowSquareOutIcon,
  CaretDownIcon,
  CaretUpIcon,
  MusicNotesIcon
} from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  activityLinkHost,
  activityTypeLabelKey,
  formatActivityElapsedClock,
  formatTrackClock,
  getActivityProgress
} from "@mutualzz/client";
import { useLyricLine } from "@renderer/hooks/useLyricLine";

function activityKey(activities: PresenceActivity[]) {
  return activities.map((a) => `${a.type}:${a.name}`).join("|");
}

const singleLine = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
} as const;

const activityCardStyle = {
  padding: 10,
  borderRadius: 10,
  backgroundColor: "color-mix(in srgb, currentColor 6%, transparent)"
} as const;

const trackTimeStyle = {
  opacity: 0.55,
  fontSize: "0.65rem",
  fontVariantNumeric: "tabular-nums"
} as const;

function ListeningActivityRow({
  activity,
  accent,
  now,
  iconSize,
  t
}: {
  activity: PresenceActivity;
  accent: string;
  now: number;
  iconSize: number;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const typeKey = activityTypeLabelKey(activity.type);
  const typeLabel = typeKey ? t(typeKey) : null;
  const title = activity.details?.trim() || activity.name;
  const artist = activity.state?.trim();
  const progress = getActivityProgress(activity, now);
  const lyricLine = useLyricLine(activity);

  return (
    <Stack direction="column" spacing={1} minWidth={0} css={activityCardStyle}>
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
        {typeLabel ? `${typeLabel} · ${activity.name}` : activity.name}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
        <ActivityIcon
          activity={activity}
          size={iconSize}
          color={accent}
          borderRadius={8}
        />
        <Stack direction="column" spacing={0.15} minWidth={0} flex={1}>
          <Typography
            level="body-xs"
            textColor="accent"
            fontWeight={700}
            css={singleLine}
          >
            {title}
          </Typography>
          {artist && (
            <Typography level="body-xs" css={{ opacity: 0.7, ...singleLine }}>
              {artist}
            </Typography>
          )}
          {lyricLine && (
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              minWidth={0}
            >
              <MusicNotesIcon
                size={12}
                weight="fill"
                color={accent}
                css={{ flexShrink: 0 }}
              />
              <Typography
                level="body-xs"
                css={{ fontStyle: "italic", opacity: 0.9, ...singleLine }}
              >
                {lyricLine}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Stack>
      {progress && (
        <Stack direction="column" spacing={0.35}>
          <div
            css={{
              height: 4,
              borderRadius: 2,
              overflow: "hidden",
              backgroundColor:
                "color-mix(in srgb, currentColor 15%, transparent)"
            }}
          >
            <div
              css={{
                height: "100%",
                width: `${progress.fraction * 100}%`,
                borderRadius: 2,
                backgroundColor: accent
              }}
            />
          </div>
          <Stack direction="row" justifyContent="space-between">
            <Typography level="body-xs" css={trackTimeStyle}>
              {formatTrackClock(progress.elapsedMs)}
            </Typography>
            <Typography level="body-xs" css={trackTimeStyle}>
              {formatTrackClock(progress.durationMs)}
            </Typography>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}

function ActivityRow({
  activity,
  accent,
  now,
  iconSize,
  fetchFallback,
  t
}: {
  activity: PresenceActivity;
  accent: string;
  now: number;
  iconSize: number;
  fetchFallback: boolean;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const typeKey = activityTypeLabelKey(activity.type);
  const typeLabel = typeKey ? t(typeKey) : null;
  const details = activity.details?.trim();
  const state = activity.state?.trim();
  const elapsed = formatActivityElapsedClock(activity.timestamps?.start, now);
  const linkHost = activityLinkHost(activity.url);
  const smallImageUrl = activity.assets?.smallImageUrl;
  const badgeSize = Math.round(iconSize * 0.42);

  return (
    <Stack direction="column" spacing={1} minWidth={0} css={activityCardStyle}>
      {typeLabel && (
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
          {typeLabel}
        </Typography>
      )}
      <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
        <div
          title={activity.assets?.largeText}
          css={{ position: "relative", flexShrink: 0, lineHeight: 0 }}
        >
          <ActivityIcon
            activity={activity}
            size={iconSize}
            color={accent}
            fetchFallback={fetchFallback}
            borderRadius={8}
          />
          {smallImageUrl && (
            <img
              src={smallImageUrl}
              alt=""
              title={activity.assets?.smallText}
              width={badgeSize}
              height={badgeSize}
              css={{
                position: "absolute",
                right: -4,
                bottom: -4,
                width: badgeSize,
                height: badgeSize,
                borderRadius: "50%",
                objectFit: "cover"
              }}
            />
          )}
        </div>
        <Stack direction="column" spacing={0.15} minWidth={0} flex={1}>
          <Typography
            level="body-xs"
            textColor="accent"
            fontWeight={700}
            css={singleLine}
          >
            {activity.name}
          </Typography>
          {details && (
            <Typography level="body-xs" css={{ opacity: 0.8, ...singleLine }}>
              {details}
            </Typography>
          )}
          {state && state !== details && (
            <Typography level="body-xs" css={{ opacity: 0.7, ...singleLine }}>
              {state}
            </Typography>
          )}
          {elapsed && (
            <Typography level="body-xs" css={trackTimeStyle}>
              {t("activity.elapsed", { time: elapsed })}
            </Typography>
          )}
        </Stack>
      </Stack>
      {activity.url && linkHost && (
        <a
          href={activity.url}
          target="_blank"
          rel="noreferrer"
          css={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            width: "fit-content",
            opacity: 0.85,
            fontSize: "0.75rem",
            color: "inherit",
            textDecoration: "underline"
          }}
        >
          {linkHost}
          <ArrowSquareOutIcon size={12} weight="bold" />
        </a>
      )}
    </Stack>
  );
}

export const PresenceActivitiesList = observer(function PresenceActivitiesList({
  activities,
  iconSize = 36,
  fetchFallback = false,
  collapsible = true,
  scrollWhenExpanded = false
}: {
  activities: PresenceActivity[];
  iconSize?: number;
  fetchFallback?: boolean;
  collapsible?: boolean;
  scrollWhenExpanded?: boolean;
}) {
  const { theme } = useTheme();
  const { t } = useTranslation("common");
  const now = useNow(1000);
  const [expanded, setExpanded] = useState(false);

  const activitiesSignature = useMemo(
    () => activityKey(activities),
    [activities]
  );

  useEffect(() => {
    setExpanded(false);
  }, [activitiesSignature]);

  if (!activities.length) return null;

  const firstListening = activities.find(
    (activity) => activity.type === "listening"
  );
  const collapsedActivities =
    firstListening && firstListening !== activities[0]
      ? [activities[0], firstListening]
      : activities.slice(0, 1);
  const canCollapse =
    collapsible && activities.length > collapsedActivities.length;
  const visibleActivities =
    canCollapse && !expanded ? collapsedActivities : activities;
  const hiddenCount = activities.length - collapsedActivities.length;
  const accent = theme.colors.success;
  const useScroll = scrollWhenExpanded && expanded && canCollapse;

  const toggle = () => setExpanded((open) => !open);

  const activityRows = visibleActivities.map((activity) =>
    activity.type === "listening" ? (
      <ListeningActivityRow
        key={`${activity.type}-${activity.name}`}
        activity={activity}
        accent={accent}
        now={now}
        iconSize={iconSize}
        t={t}
      />
    ) : (
      <ActivityRow
        key={`${activity.type}-${activity.name}`}
        activity={activity}
        accent={accent}
        now={now}
        iconSize={iconSize}
        fetchFallback={fetchFallback}
        t={t}
      />
    )
  );

  const collapseControl = canCollapse ? (
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
              toggle();
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
          <Typography level="body-xs">{t("activity.showLess")}</Typography>
          <CaretUpIcon size={12} weight="bold" />
        </>
      )}
    </Stack>
  ) : null;

  return (
    <Stack
      direction="column"
      spacing={1}
      minWidth={0}
      flex={scrollWhenExpanded ? 1 : undefined}
      minHeight={scrollWhenExpanded ? 0 : undefined}
      onClick={
        canCollapse && !expanded
          ? (e) => {
              e.stopPropagation();
              toggle();
            }
          : undefined
      }
      css={{
        ...(canCollapse && !expanded ? { cursor: "pointer" } : undefined),
        ...(scrollWhenExpanded ? { overflow: "hidden" } : undefined)
      }}
    >
      <Stack
        direction="column"
        spacing={1}
        flex={useScroll ? 1 : undefined}
        minHeight={useScroll ? 0 : undefined}
        css={
          useScroll
            ? {
                overflowY: "auto",
                overscrollBehavior: "contain"
              }
            : undefined
        }
      >
        {activityRows}
      </Stack>
      {collapseControl}
    </Stack>
  );
});
