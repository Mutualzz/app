import { Paper } from "@components/Paper";
import { Tooltip } from "@components/Tooltip";
import type { ProfileBlockType } from "@mutualzz/types";
import { Typography } from "@mutualzz/ui-web";
import { useDraggable } from "@dnd-kit/core";
import {
  ImageIcon,
  HeadphonesIcon,
  PlayCircleIcon,
  ImagesIcon,
  LinkIcon,
  LinkSimpleIcon,
  MinusIcon,
  MusicNotesIcon,
  PencilSimpleIcon,
  PulseIcon,
  QuotesIcon,
  ShieldCheckIcon,
  StickerIcon,
  TimerIcon,
  TextAaIcon,
  UserCircleIcon,
  UsersThreeIcon
} from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

export const PROFILE_BLOCK_ITEMS: {
  type: ProfileBlockType;
  icon: React.ReactNode;
}[] = [
  { type: "header", icon: <UserCircleIcon weight="fill" /> },
  { type: "text", icon: <TextAaIcon weight="fill" /> },
  { type: "quote", icon: <QuotesIcon weight="fill" /> },
  { type: "image", icon: <ImageIcon weight="fill" /> },
  { type: "gallery", icon: <ImagesIcon weight="fill" /> },
  { type: "sticker", icon: <StickerIcon weight="fill" /> },
  { type: "countdown", icon: <TimerIcon weight="fill" /> },
  { type: "music", icon: <MusicNotesIcon weight="fill" /> },
  { type: "nowPlaying", icon: <HeadphonesIcon weight="fill" /> },
  { type: "embed", icon: <PlayCircleIcon weight="fill" /> },
  { type: "links", icon: <LinkIcon weight="fill" /> },
  { type: "connections", icon: <LinkSimpleIcon weight="fill" /> },
  { type: "activity", icon: <PulseIcon weight="fill" /> },
  { type: "roles", icon: <ShieldCheckIcon weight="fill" /> },
  { type: "mutual", icon: <UsersThreeIcon weight="fill" /> },
  { type: "divider", icon: <MinusIcon weight="fill" /> },
  { type: "draw", icon: <PencilSimpleIcon weight="fill" /> }
];

const PaletteItem = observer(
  ({
    type,
    label,
    icon,
    onDoubleClick
  }: {
    type: ProfileBlockType;
    label: string;
    icon: React.ReactNode;
    onDoubleClick: (type: ProfileBlockType) => void;
  }) => {
    const { t } = useTranslation("settings");
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
      id: `palette-${type}`,
      data: { type, source: "palette" }
    });

    return (
      <Tooltip
        content={t("profile.blocks.dragHint", { label })}
        placement="right"
      >
        <Paper
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          variant="soft"
          borderRadius={10}
          p={1}
          direction="column"
          alignItems="center"
          spacing={0.5}
          onDoubleClick={() => onDoubleClick(type)}
          css={{
            cursor: "grab",
            opacity: isDragging ? 0.5 : 1,
            userSelect: "none",
            "& svg": {
              display: "block"
            }
          }}
        >
          {icon}
          <Typography
            level="body-xs"
            css={{
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {label}
          </Typography>
        </Paper>
      </Tooltip>
    );
  }
);

interface Props {
  onDoubleClickAdd: (type: ProfileBlockType) => void;
}

export const ProfileBlockPalette = observer(({ onDoubleClickAdd }: Props) => {
  const { t } = useTranslation("settings");

  return (
    <div
      css={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 6
      }}
    >
      {PROFILE_BLOCK_ITEMS.map((item) => (
        <PaletteItem
          key={item.type}
          type={item.type}
          label={t(`profile.blocks.${item.type}`)}
          icon={item.icon}
          onDoubleClick={onDoubleClickAdd}
        />
      ))}
    </div>
  );
});
