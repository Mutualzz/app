import { ActivityIcon } from "@components/Presence/ActivityIcon";
import { useNow } from "@hooks/useNow";
import type { PresenceActivity } from "@mutualzz/types";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  activityTypeLabelKey,
  formatActivityElapsedClock,
  formatActivityPrimary,
  formatActivitySecondary
} from "@mutualzz/client";

function activityKey(activities: PresenceActivity[]) {
  return activities.map((a) => `${a.type}:${a.name}`).join("|");
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
  const secondary = formatActivitySecondary(activity);
  const elapsed = formatActivityElapsedClock(activity.timestamps?.start, now);

  return (
    <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
      <ActivityIcon
        activity={activity}
        size={iconSize}
        color={accent}
        fetchFallback={fetchFallback}
        borderRadius={8}
      />
      <Stack direction="column" spacing={0.15} minWidth={0} flex={1}>
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
          {formatActivityPrimary(activity)}
        </Typography>
        {secondary && (
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
        {activity.url && (
          <a
            href={activity.url}
            target="_blank"
            rel="noreferrer"
            css={{
              opacity: 0.85,
              textDecoration: "underline",
              width: "fit-content",
              fontSize: "0.75rem",
              color: "inherit"
            }}
          >
            Open in Spotify
          </a>
        )}
        {elapsed && (
          <Typography
            level="body-xs"
            css={{
              opacity: 0.55,
              fontSize: "0.65rem",
              fontVariantNumeric: "tabular-nums"
            }}
          >
            {t("activity.elapsed", { time: elapsed })}
          </Typography>
        )}
      </Stack>
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

  const canCollapse = collapsible && activities.length > 1;
  const visibleActivities =
    canCollapse && !expanded ? activities.slice(0, 1) : activities;
  const hiddenCount = activities.length - 1;
  const accent = theme.colors.success;
  const useScroll = scrollWhenExpanded && expanded && canCollapse;

  const toggle = () => setExpanded((open) => !open);

  const activityRows = visibleActivities.map((activity) => (
    <ActivityRow
      key={`${activity.type}-${activity.name}`}
      activity={activity}
      accent={accent}
      now={now}
      iconSize={iconSize}
      fetchFallback={fetchFallback}
      t={t}
    />
  ));

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
