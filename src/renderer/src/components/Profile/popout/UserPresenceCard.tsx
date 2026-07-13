import { Paper } from "@components/Paper";
import { PresenceActivitiesList } from "@components/Presence/PresenceActivitiesList";
import type { PresencePayload } from "@mutualzz/types";
import { useTheme } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { getNonCustomActivities } from "@utils/customStatus";

interface Props {
  presence: PresencePayload;
}

export const UserPresenceCard = observer(({ presence }: Props) => {
  const { theme } = useTheme();

  const otherActivities = useMemo(
    () => getNonCustomActivities(presence),
    [presence]
  );

  const isVisible =
    (presence.status === "online" ||
      presence.status === "idle" ||
      presence.status === "dnd") &&
    otherActivities.length > 0;

  if (!isVisible) return null;

  const collapsible = otherActivities.length > 1;

  return (
    <Paper
      direction="column"
      spacing={1}
      p={1.25}
      borderRadius={8}
      elevation={1}
      css={{
        backgroundColor: `${theme.colors.surface}cc`,
        border: `1px solid ${theme.colors.neutral}22`,
        ...(collapsible && {
          "&:hover": {
            borderColor: `${theme.colors.neutral}44`
          }
        })
      }}
    >
      <PresenceActivitiesList
        activities={otherActivities}
        iconSize={36}
        fetchFallback
      />
    </Paper>
  );
});
