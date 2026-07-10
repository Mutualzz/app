import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { resolveGifImageBlockSrc } from "@mutualzz/ui-core";
import { Paper, Stack, Typography } from "@mutualzz/ui-web";
import { GifIcon, XIcon } from "@phosphor-icons/react";
import { GifPicker } from "@renderer/components/Expression/GifPicker";
import { IconButton } from "@renderer/components/IconButton";

interface Props {
  onSelect: (src: string) => void;
}

export const ProfileImageGifPickerModal = ({ onSelect }: Props) => {
  const app = useAppStore();
  const { closeModal } = useModal();

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      borderRadius={16}
      padding={3}
      direction="column"
      spacing={2}
      css={{
        width: "min(92vw, 420px)",
        maxHeight: "min(85vh, 720px)",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={1.25} alignItems="center">
          <GifIcon size={18} weight="fill" />
          <Typography level="title-sm" fontWeight={700}>
            Choose a GIF
          </Typography>
        </Stack>
        <IconButton size="sm" onClick={() => closeModal("image-gif-picker")}>
          <XIcon />
        </IconButton>
      </Stack>
      <div
        css={{
          flex: 1,
          minHeight: 0,
          height: "min(55vh, 520px)",
          display: "flex"
        }}
      >
        <GifPicker
          onSelectGif={(gif) => {
            onSelect(resolveGifImageBlockSrc(gif));
            closeModal("image-gif-picker");
          }}
        />
      </div>
    </Paper>
  );
};
