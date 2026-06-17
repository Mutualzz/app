import { observer } from "mobx-react-lite";
import type { PresencePayload } from "@mutualzz/types";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import {
  GameControllerIcon,
  HeadphonesIcon,
  NotepadIcon
} from "@phosphor-icons/react";
import { CustomStatusDisplay } from "@components/CustomStatus/CustomStatusDisplay";

interface Props {
  presence?: PresencePayload;
  vertical?: boolean;
}

const PresenceIcon = ({ color, type }: { color: string; type: string }) => {
  switch (type) {
    case "playing":
      return <GameControllerIcon size={14} weight="fill" color={color} />;
    case "listening":
      return <HeadphonesIcon size={14} weight="fill" color={color} />;
    default:
      return <NotepadIcon size={14} weight="fill" color={color} />;
  }
};

export const SmallActivityStatus = observer(({ presence, vertical }: Props) => {
  const { theme } = useTheme();
  const color = theme.colors.success;

  if (!presence) return null;

  const activity = Array.isArray(presence.activities)
    ? (presence.activities[0] ?? null)
    : null;

  if (!activity) return null;

  if (activity.type === "custom") {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        direction={vertical ? "column" : "row"}
        spacing={0.5}
        minWidth={0}
      >
        <CustomStatusDisplay activity={activity} fontSize={12} />
        {!vertical && presence.activities.length > 1 && (
          <Typography fontSize={12} textColor="accent">
            +{presence.activities.length - 1}
          </Typography>
        )}
      </Stack>
    );
  }

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      direction={vertical ? "column" : "row"}
      spacing={0.5}
    >
      <Stack
        alignItems="center"
        direction={vertical ? "column" : "row"}
        justifyContent="center"
      >
        <PresenceIcon color={color} type={activity.type} />
        <Typography fontSize={12} textColor={color}>
          {presence.activities.length > 1
            ? `+${presence.activities.length - 1}`
            : ""}
        </Typography>
      </Stack>
      {!vertical && `•`}
      <Typography textColor="accent" fontSize={12}>
        {activity.name}
      </Typography>
    </Stack>
  );
});
