import { Paper } from "@components/Paper";
import { Tooltip } from "@components/Tooltip";
import { useAppStore } from "@hooks/useStores";
import type { ProfileBlockType } from "@mutualzz/types";
import { Stack, Typography } from "@mutualzz/ui-web";
import { useDraggable } from "@dnd-kit/core";
import {
  ImageIcon,
  LinkIcon,
  MinusIcon,
  MusicNotesIcon,
  PulseIcon,
  QuotesIcon,
  ShieldCheckIcon,
  TextAaIcon,
  UserCircleIcon,
  UsersThreeIcon
} from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";

const ITEMS: {
  type: ProfileBlockType;
  label: string;
  icon: React.ReactNode;
}[] = [
  { type: "header", label: "Header", icon: <UserCircleIcon weight="fill" /> },
  { type: "text", label: "Text", icon: <TextAaIcon weight="fill" /> },
  { type: "quote", label: "Quote", icon: <QuotesIcon weight="fill" /> },
  { type: "image", label: "Image", icon: <ImageIcon weight="fill" /> },
  { type: "music", label: "Music", icon: <MusicNotesIcon weight="fill" /> },
  { type: "links", label: "Links", icon: <LinkIcon weight="fill" /> },
  { type: "activity", label: "Activity", icon: <PulseIcon weight="fill" /> },
  { type: "roles", label: "Roles", icon: <ShieldCheckIcon weight="fill" /> },
  {
    type: "mutual",
    label: "Mutual",
    icon: <UsersThreeIcon weight="fill" />
  },
  { type: "divider", label: "Divider", icon: <MinusIcon weight="fill" /> }
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
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
      id: `palette-${type}`,
      data: { type, source: "palette" }
    });

    return (
      <Tooltip content={`Drag ${label} onto canvas`} placement="right">
        <Paper
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          variant="soft"
          borderRadius={10}
          p={1.25}
          direction="column"
          alignItems="center"
          spacing={0.75}
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
          <Typography level="body-xs">{label}</Typography>
        </Paper>
      </Tooltip>
    );
  }
);

interface Props {
  onDoubleClickAdd: (type: ProfileBlockType) => void;
}

export const ProfileBlockPalette = observer(({ onDoubleClickAdd }: Props) => {
  const app = useAppStore();
  const embossed = app.settings?.preferEmbossed;

  return (
    <Paper
      width={120}
      minWidth={120}
      direction="column"
      spacing={1}
      p={1.25}
      borderRadius={12}
      variant={embossed ? "elevation" : "plain"}
      elevation={embossed ? 2 : 0}
      css={{
        overflowY: "auto",
        maxHeight: "100%"
      }}
    >
      <Typography
        level="body-xs"
        fontWeight={700}
        css={{
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          opacity: 0.55,
          px: 0.5
        }}
      >
        Blocks
      </Typography>
      <Stack direction="column" spacing={1}>
        {ITEMS.map((item) => (
          <PaletteItem
            key={item.type}
            type={item.type}
            label={item.label}
            icon={item.icon}
            onDoubleClick={onDoubleClickAdd}
          />
        ))}
      </Stack>
    </Paper>
  );
});
