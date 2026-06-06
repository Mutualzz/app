import { observer } from "mobx-react-lite";
import { useMutation } from "@tanstack/react-query";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { Button, Stack, Typography } from "@mutualzz/ui-web";
import { useModal } from "@contexts/Modal.context";
import type { Role } from "@stores/objects/Role";

interface Props {
  role: Role;
}

export const RoleActionConfirm = observer(({ role }: Props) => {
  const app = useAppStore();
  const { closeModal } = useModal();

  const { mutate: deleteRole, isPending } = useMutation({
    mutationKey: ["delete-role", role.id],
    mutationFn: async () => role.delete(),
    onSuccess: () => {
      closeModal();
    }
  });

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      padding={5}
      borderRadius={12}
      direction="column"
    >
      <Typography level="h5" fontWeight="bold" marginBottom={2}>
        Delete Role
      </Typography>
      <Typography mb={2.5}>
        Are you sure you want to delete <b>{role.name}</b> role? This Action
        cannot be undone.
      </Typography>
      <Stack spacing={1.25}>
        <Button color="neutral" size="lg" onClick={() => closeModal()}>
          Cancel
        </Button>
        <Button
          color="danger"
          onClick={() => deleteRole()}
          disabled={isPending}
          size="lg"
        >
          Delete
        </Button>
      </Stack>
    </Paper>
  );
});
