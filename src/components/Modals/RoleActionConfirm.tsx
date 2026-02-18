import { observer } from "mobx-react-lite";
import { useMutation } from "@tanstack/react-query";
import { Paper } from "@components/Paper.tsx";
import { useAppStore } from "@hooks/useStores.ts";
import { Button, ButtonGroup, Typography } from "@mutualzz/ui-web";
import { useModal } from "@contexts/Modal.context.tsx";
import type { Role } from "@stores/objects/Role.ts";

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
        },
    });

    return (
        <Paper
            elevation={app.settings?.preferEmbossed ? 5 : 1}
            width="25rem"
            height="10rem"
            padding={5}
            borderRadius={12}
            direction="column"
        >
            <Typography level="h5" fontWeight="bold" marginBottom={2}>
                Delete Role
            </Typography>
            <Typography mb={2.5}>
                Are you sure you want to delete <b>{role.name}</b> role? This
                Action cannot be undone.
            </Typography>
            <ButtonGroup fullWidth size="lg" spacing={5}>
                <Button color="neutral" onClick={() => closeModal()}>
                    Cancel
                </Button>
                <Button
                    color="danger"
                    onClick={() => deleteRole()}
                    disabled={isPending}
                >
                    Delete
                </Button>
            </ButtonGroup>
        </Paper>
    );
});
