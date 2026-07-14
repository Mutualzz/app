import { CustomStatusDisplay } from "@components/CustomStatus/CustomStatusDisplay";
import { PresenceActivitiesList } from "@components/Presence/PresenceActivitiesList";
import {
  ProfileBlockBackgroundFill,
  profileBlockSurfaceCss
} from "@components/Profile/shared/ProfileBlockBackgroundFill";
import { RecentActivitiesSection } from "@components/Profile/shared/RecentActivitiesSection";
import { Paper } from "@renderer/components/Paper";
import { useAppStore } from "@hooks/useStores";
import type { ProfileActivityBlock, Snowflake } from "@mutualzz/types";
import { resolveProfileBlockCornerRadius } from "@mutualzz/ui-core";
import { Stack, Typography } from "@mutualzz/ui-web";
import { PulseIcon } from "@phosphor-icons/react";
import { getCustomActivity, getNonCustomActivities } from "@utils/customStatus";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

interface Props {
  block: ProfileActivityBlock;
  userId: Snowflake;
}

export const ProfileActivityBlockView = observer(({ block, userId }: Props) => {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const presence = app.presence.get(userId);
  const cornerRadius = resolveProfileBlockCornerRadius(block, "desktop");

  const isActive =
    presence?.status === "online" ||
    presence?.status === "idle" ||
    presence?.status === "dnd";

  const customActivity = presence ? getCustomActivity(presence) : null;
  const otherActivities = presence ? getNonCustomActivities(presence) : [];

  const showCustom =
    Boolean(customActivity) && block.showCustomStatus !== false;
  const showActivities = otherActivities.length > 0;
  const hasLiveContent = isActive && (showCustom || showActivities);

  return (
    <Paper
      direction="column"
      spacing={1}
      width="100%"
      height="100%"
      p={1.5}
      borderRadius={cornerRadius}
      elevation={app.settings?.preferEmbossed ? 5 : 2}
      css={profileBlockSurfaceCss}
    >
      <ProfileBlockBackgroundFill backgroundColor={block.backgroundColor} />
      <Stack direction="row" spacing={1} alignItems="center">
        <PulseIcon size={18} weight="fill" />
        <Typography
          level="body-sm"
          fontWeight={700}
          css={{ fontSize: "var(--pcf-sm)" }}
        >
          {t("profile.blocks.activity")}
        </Typography>
      </Stack>

      <Stack
        direction="column"
        spacing={0.75}
        minWidth={0}
        flex={1}
        minHeight={0}
        css={{ overflow: "hidden" }}
      >
        {hasLiveContent && (
          <>
            {showCustom && customActivity && (
              <CustomStatusDisplay
                activity={customActivity}
                fontSize="var(--pcf-xs)"
                textColor="primary"
              />
            )}
            {showActivities && (
              <Stack flex={1} minHeight={0} css={{ overflow: "hidden" }}>
                <PresenceActivitiesList
                  activities={otherActivities}
                  iconSize={40}
                  fetchFallback
                  scrollWhenExpanded
                />
              </Stack>
            )}
          </>
        )}

        <RecentActivitiesSection
          userId={userId}
          liveActivities={isActive ? otherActivities : []}
          iconSize={36}
          showEmpty={!hasLiveContent}
        />
      </Stack>
    </Paper>
  );
});
