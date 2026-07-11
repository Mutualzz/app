import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Paper, Stack, Typography } from "@mutualzz/ui-web";
import { StickerIcon, XIcon } from "@phosphor-icons/react";
import { StickerPicker } from "@renderer/components/Expression/StickerPicker";
import { IconButton } from "@renderer/components/IconButton";
import type { Expression } from "@stores/objects/Expression";
import { useTranslation } from "react-i18next";

interface Props {
  onSelect: (sticker: Expression) => void;
}

export const ProfileStickerPickerModal = ({ onSelect }: Props) => {
  const { t } = useTranslation("settings");
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
        flexDirection: "column",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={1.25} alignItems="center">
          <StickerIcon size={18} weight="fill" />
          <Typography level="title-sm" fontWeight={700}>
            {t("profile.inspector.chooseSticker")}
          </Typography>
        </Stack>
        <IconButton size="sm" onClick={() => closeModal("sticker-picker")}>
          <XIcon />
        </IconButton>
      </Stack>
      <div
        css={{
          flex: 1,
          minHeight: 0,
          height: "min(55vh, 520px)",
          display: "flex",
        }}
      >
        <StickerPicker
          profileMode
          onSelectSticker={(sticker) => {
            onSelect(sticker);
            closeModal("sticker-picker");
          }}
        />
      </div>
    </Paper>
  );
};
