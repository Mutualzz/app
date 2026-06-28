import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";

interface Props {
  onConfirm: () => void;
}

export const ProfileLeaveConfirm = observer(({ onConfirm }: Props) => {
  const app = useAppStore();
  const { closeModal } = useModal();

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      padding={5}
      borderRadius={12}
      direction="column"
      maxWidth={420}
    >
      <Typography level="h5" fontWeight="bold" marginBottom={2}>
        Leave without saving?
      </Typography>
      <Typography mb={2.5} css={{ opacity: 0.85 }}>
        You have unsaved changes. If you leave now, your changes will be lost.
      </Typography>
      <Stack spacing={1.25}>
        <Button color="neutral" size="lg" onClick={() => closeModal()}>
          Keep editing
        </Button>
        <Button
          color="danger"
          size="lg"
          onClick={() => {
            closeModal();
            onConfirm();
          }}
        >
          Leave without saving
        </Button>
      </Stack>
    </Paper>
  );
});
