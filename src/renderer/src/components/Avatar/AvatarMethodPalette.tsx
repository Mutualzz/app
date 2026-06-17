import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import type { AvatarEditorMethod } from "@components/Avatar/avatarEditor.types";
import { Stack, Typography } from "@mutualzz/ui-web";
import {
  ImagesIcon,
  PaintBrushIcon,
  UploadSimpleIcon
} from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";

const ITEMS: {
  method: AvatarEditorMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    method: "upload",
    label: "Upload",
    description: "Photo or GIF",
    icon: <UploadSimpleIcon weight="fill" />
  },
  {
    method: "draw",
    label: "Draw",
    description: "Sketch your own",
    icon: <PaintBrushIcon weight="fill" />
  },
  {
    method: "avatars",
    label: "Avatars",
    description: "Defaults & history",
    icon: <ImagesIcon weight="fill" />
  }
];

interface Props {
  method: AvatarEditorMethod;
  onMethodChange: (method: AvatarEditorMethod) => void;
}

export const AvatarMethodPalette = observer(({ method, onMethodChange }: Props) => {
  const app = useAppStore();
  const embossed = app.settings?.preferEmbossed;

  return (
    <Paper
      width={148}
      minWidth={148}
      flexShrink={0}
      height="100%"
      direction="column"
      spacing={1.25}
      p={1.25}
      borderRadius={12}
      variant="plain"
      elevation={embossed ? 4 : 0}
      boxShadow="none !important"
    >
      <Typography level="body-sm" fontWeight={600} px={0.5}>
        Methods
      </Typography>
      <Stack direction="column" spacing={1}>
        {ITEMS.map((item) => {
          const selected = method === item.method;

          return (
            <Paper
              key={item.method}
              variant={selected ? "soft" : "plain"}
              borderRadius={10}
              p={1.25}
              direction="column"
              spacing={0.75}
              onClick={() => onMethodChange(item.method)}
              css={{
                cursor: "pointer",
                userSelect: "none",
                opacity: selected ? 1 : 0.85
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                {item.icon}
                <Typography level="body-sm" fontWeight={selected ? 600 : 500}>
                  {item.label}
                </Typography>
              </Stack>
              <Typography level="body-xs" css={{ opacity: 0.7 }}>
                {item.description}
              </Typography>
            </Paper>
          );
        })}
      </Stack>
    </Paper>
  );
});
