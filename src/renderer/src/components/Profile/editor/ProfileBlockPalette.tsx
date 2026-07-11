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
  PencilSimpleIcon,
  PulseIcon,
  QuotesIcon,
  ShieldCheckIcon,
  StickerIcon,
  TextAaIcon,
  UserCircleIcon,
  UsersThreeIcon
} from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

const ITEMS: {
  type: ProfileBlockType;
  icon: React.ReactNode;
}[] = [
  { type: "header", icon: <UserCircleIcon weight="fill" /> },
  { type: "text", icon: <TextAaIcon weight="fill" /> },
  { type: "quote", icon: <QuotesIcon weight="fill" /> },
  { type: "image", icon: <ImageIcon weight="fill" /> },
  { type: "sticker", icon: <StickerIcon weight="fill" /> },
  { type: "music", icon: <MusicNotesIcon weight="fill" /> },
  { type: "links", icon: <LinkIcon weight="fill" /> },
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
  const { t } = useTranslation("settings");
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
      variant="elevation"
      elevation={embossed ? 5 : 1}
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
          opacity: 1,
          textAlign: "center"
        }}
        textColor="muted"
      >
        {t("profile.blocks.paletteTitle")}
      </Typography>
      <Stack direction="column" spacing={1}>
        {ITEMS.map((item) => (
          <PaletteItem
            key={item.type}
            type={item.type}
            label={t(`profile.blocks.${item.type}`)}
            icon={item.icon}
            onDoubleClick={onDoubleClickAdd}
          />
        ))}
      </Stack>
    </Paper>
  );
});
