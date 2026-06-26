import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import type { APIProfileBlock, ProfileDrawBlock } from "@mutualzz/types";
import { Paper, Stack, Typography } from "@mutualzz/ui-web";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import { ProfileDrawBlockEditor } from "./ProfileDrawBlockEditor";

interface Props {
  block: ProfileDrawBlock;
  updateBlock: (patch: Partial<APIProfileBlock>) => void;
}

export const ProfileDrawBlockModal = ({ block, updateBlock }: Props) => {
  const app = useAppStore();
  const { closeModal } = useModal();

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      borderRadius={16}
      padding={3}
      direction="column"
      spacing={2}
      css={{ width: "min(92vw, 600px)" }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <PencilSimpleIcon size={18} weight="fill" />
        <Typography level="title-sm" fontWeight={700}>
          Drawing Editor
        </Typography>
      </Stack>
      <ProfileDrawBlockEditor
        block={block}
        updateBlock={updateBlock}
        onApply={() => closeModal("draw-editor")}
      />
    </Paper>
  );
};
