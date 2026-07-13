import { observer } from "mobx-react-lite";
import type { PresencePayload } from "@mutualzz/types";
import { presenceStatusKeys } from "@mutualzz/i18n";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { CustomStatusDisplay } from "@components/CustomStatus/CustomStatusDisplay";
import { useTranslation } from "react-i18next";
import { ActivityIcon } from "./Presence/ActivityIcon";
import {
  activityTypeLabelKey,
  formatActivityPrimary,
  formatActivitySecondary
} from "@utils/activityDisplay";
import {
  getCustomActivity,
  getNonCustomActivities
} from "@utils/customStatus";

interface Props {
  presence?: PresencePayload;
  vertical?: boolean;
  hideCustomStatus?: boolean;
  showStatus?: boolean;
  customOnly?: boolean;
}

export const SmallActivityStatus = observer(
  ({
    presence,
    vertical,
    hideCustomStatus = false,
    showStatus = false,
    customOnly = false
  }: Props) => {
    const { theme } = useTheme();
    const { t } = useTranslation("common");
    const color = theme.colors.success;

    if (!presence) return null;

    const customActivity = getCustomActivity(presence);
    const otherActivities = getNonCustomActivities(presence);
    const activity = otherActivities[0] ?? null;

    const statusKey =
      presence.status === "online" ||
      presence.status === "idle" ||
      presence.status === "dnd"
        ? presenceStatusKeys[presence.status]
        : null;
    const status = statusKey ? t(statusKey) : null;

    if (customOnly) {
      if (!customActivity || hideCustomStatus) return null;
      return (
        <CustomStatusDisplay activity={customActivity} fontSize={12} />
      );
    }

    if (customActivity && !hideCustomStatus) {
      const extraCount = otherActivities.length;
      return (
        <Stack
          direction={vertical ? "column" : "row"}
          alignItems="center"
          spacing={0.75}
          minWidth={0}
          width="100%"
        >
          <Stack minWidth={0} flex={1}>
            <CustomStatusDisplay activity={customActivity} fontSize={12} />
          </Stack>
          {!vertical && extraCount > 0 && (
            <Typography
              level="label-xs"
              textColor="accent"
              css={{ lineHeight: 1, flexShrink: 0, opacity: 0.85 }}
            >
              +{extraCount}
            </Typography>
          )}
        </Stack>
      );
    }

    if (!activity && !customActivity && showStatus)
      return (
        <Typography fontSize={12} textColor="accent">
          {status}
        </Typography>
      );

    if (!activity && !customActivity) return null;

    const typeKey = activityTypeLabelKey(activity.type);
    const typeLabel = typeKey ? t(typeKey) : null;
    const title = formatActivityPrimary(activity);
    const secondary = formatActivitySecondary(activity);
    const line = typeLabel
      ? secondary
        ? `${typeLabel} ${title} · ${secondary}`
        : `${typeLabel} ${title}`
      : secondary
        ? `${title} · ${secondary}`
        : title;
    const extraCount = Math.max(0, otherActivities.length - 1);

    return (
      <Stack
        direction={vertical ? "column" : "row"}
        alignItems="center"
        spacing={0.75}
        minWidth={0}
        width="100%"
      >
        <ActivityIcon activity={activity} size={16} color={color} />
        <Typography
          level="label-xs"
          textColor={color}
          css={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
            flex: 1
          }}
        >
          {line}
        </Typography>
        {extraCount > 0 && (
          <Typography
            level="label-xs"
            textColor={color}
            css={{ lineHeight: 1, flexShrink: 0, opacity: 0.85 }}
          >
            +{extraCount}
          </Typography>
        )}
      </Stack>
    );
  }
);
