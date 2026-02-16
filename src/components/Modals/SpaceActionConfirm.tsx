import { observer } from "mobx-react-lite";
import type { Space } from "@stores/objects/Space.ts";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Paper } from "@components/Paper.tsx";
import { useAppStore } from "@hooks/useStores.ts";
import { Button, ButtonGroup, Typography } from "@mutualzz/ui-web";
import { useModal } from "@contexts/Modal.context.tsx";

interface Props {
    space: Space;
    action: "leave" | "delete";
}

export const SpaceActionConfirm = observer(({ space, action }: Props) => {
    const app = useAppStore();
    const navigate = useNavigate();
    const { closeModal, closeAllModals } = useModal();

    const { mutate: deleteSpace, isPending } = useMutation({
        mutationKey: ["delete-space", space.id],
        mutationFn: async () => space.delete(),
        onSuccess: () => {
            navigate({ to: "/" });
            closeAllModals();
        },
    });

    const { mutate: leaveSpace, isPending: isLeaving } = useMutation({
        mutationKey: ["leave-space", space.id],
        mutationFn: async () => space.leave(),
        onSuccess: () => {
            navigate({ to: "/" });
            closeAllModals();
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
                {action === "delete"
                    ? `Delete '${space.name}'`
                    : `Leave '${space.name}'?`}
            </Typography>
            <Typography mb={2.5}>
                Are you sure you want to {action} <b>{space.name}</b>? This
                Action cannot be undone.
            </Typography>
            <ButtonGroup fullWidth size="lg" spacing={5}>
                <Button color="neutral" onClick={() => closeModal()}>
                    Cancel
                </Button>
                <Button
                    color="danger"
                    onClick={() =>
                        action === "delete" ? deleteSpace() : leaveSpace()
                    }
                    disabled={isPending || isLeaving}
                >
                    {action === "delete" ? "Delete" : "Leave"} Space
                </Button>
            </ButtonGroup>
        </Paper>
    );
});
