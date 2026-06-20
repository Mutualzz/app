import { observer } from "mobx-react-lite";
import type { PresencePayload } from "@mutualzz/types";
import { IconSlot, Stack, Typography, useTheme } from "@mutualzz/ui-web";
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
      return (
        <IconSlot size={14}>
          <GameControllerIcon weight="fill" color={color} />
        </IconSlot>
      );
    case "listening":
      return (
        <IconSlot size={14}>
          <HeadphonesIcon weight="fill" color={color} />
        </IconSlot>
      );
    default:
      return (
        <IconSlot size={14}>
          <NotepadIcon weight="fill" color={color} />
        </IconSlot>
      );
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
        direction={vertical ? "column" : "row"}
        alignItems="center"
        spacing={0.5}
        minWidth={0}
      >
        <CustomStatusDisplay activity={activity} fontSize={12} />
        {!vertical && presence.activities.length > 1 && (
          <Typography level="label-xs" textColor="accent">
            +{presence.activities.length - 1}
          </Typography>
        )}
      </Stack>
    );
  }

  return (
    <Stack
      direction={vertical ? "column" : "row"}
      alignItems="center"
      justifyContent="center"
      spacing={0.5}
    >
      <Stack
        direction={vertical ? "column" : "row"}
        alignItems="center"
        justifyContent="center"
      >
        <PresenceIcon color={color} type={activity.type} />
        <Typography level="label-xs" textColor={color}>
          {presence.activities.length > 1
            ? `+${presence.activities.length - 1}`
            : ""}
        </Typography>
      </Stack>
      {!vertical && `•`}
      <Typography level="label-xs" textColor="accent">
        {activity.name}
      </Typography>
    </Stack>
  );
});
