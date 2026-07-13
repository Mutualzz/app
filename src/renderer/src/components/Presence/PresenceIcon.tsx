import { IconSlot } from "@mutualzz/ui-web";
import {
  GameControllerIcon,
  HeadphonesIcon,
  NotepadIcon
} from "@phosphor-icons/react";

export const PresenceIcon = ({
  color,
  type,
  size = 14
}: {
  color: string;
  type: string;
  size?: number;
}) => {
  switch (type) {
    case "playing":
      return (
        <IconSlot size={size}>
          <GameControllerIcon weight="fill" color={color} size={size} />
        </IconSlot>
      );
    case "listening":
      return (
        <IconSlot size={size}>
          <HeadphonesIcon weight="fill" color={color} size={size} />
        </IconSlot>
      );
    default:
      return (
        <IconSlot size={size}>
          <NotepadIcon weight="fill" color={color} size={size} />
        </IconSlot>
      );
  }
};
