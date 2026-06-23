import { IconSlot } from "@mutualzz/ui-web";
import {
  GameControllerIcon,
  HeadphonesIcon,
  NotepadIcon
} from "@phosphor-icons/react";

export const PresenceIcon = ({
  color,
  type
}: {
  color: string;
  type: string;
}) => {
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
