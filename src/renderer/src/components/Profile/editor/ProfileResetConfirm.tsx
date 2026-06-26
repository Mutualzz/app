import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import {
  EMPTY_PROFILE_SAVE_PAYLOAD,
  getApiErrorMessage
} from "@components/Profile/editor/profileEditor.utils";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { toast } from "react-toastify";

interface Props {
  onSuccess: () => void;
}

export const ProfileResetConfirm = observer(({ onSuccess }: Props) => {
  const app = useAppStore();
  const { closeModal } = useModal();

  const { mutate: resetProfile, isPending } = useMutation({
    mutationKey: ["reset-profile", app.account?.id],
    mutationFn: () => app.profiles.save(EMPTY_PROFILE_SAVE_PAYLOAD),
    onSuccess: (result) => {
      if (result) onSuccess();
      closeModal();
      toast.success("Profile reset to empty");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Failed to reset profile"))
  });

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      padding={5}
      borderRadius={12}
      direction="column"
      maxWidth={420}
    >
      <Typography level="h5" fontWeight="bold" marginBottom={2}>
        Reset profile to empty?
      </Typography>
      <Typography mb={2.5} css={{ opacity: 0.85 }}>
        This removes your bio, banner, background, profile music, and all blocks.
        Your account avatar and username are not affected. This cannot be undone.
      </Typography>
      <Stack spacing={1.25}>
        <Button color="neutral" size="lg" onClick={() => closeModal()}>
          Cancel
        </Button>
        <Button
          color="danger"
          size="lg"
          loading={isPending}
          onClick={() => resetProfile()}
        >
          Reset to empty
        </Button>
      </Stack>
    </Paper>
  );
});
