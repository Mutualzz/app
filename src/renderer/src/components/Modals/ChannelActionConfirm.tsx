import { observer } from "mobx-react-lite";
import type { Channel } from "@stores/objects/Channel";
import { useAppStore } from "@hooks/useStores";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Paper } from "@components/Paper";
import { Button, Stack, Typography } from "@mutualzz/ui-web";
import { useModal } from "@contexts/Modal.context";

interface Props {
    channel: Channel;
}

export const ChannelActionConfirm = observer(({ channel }: Props) => {
    const app = useAppStore();
    const navigate = useNavigate();
    const { closeModal } = useModal();

    const { mutate: deleteChannel, isPending: isDeleting } = useMutation({
        mutationKey: ["delete-channel", channel.id],
        mutationFn: async () => channel.delete(false),
        onSuccess: () => {
            if (app.channels.activeId === channel.id && channel.space)
                navigate({
                    to: "/spaces",
                    replace: true
                });

            closeModal();
        }
    });

    return (
        <Paper
            elevation={app.settings?.preferEmbossed ? 5 : 1}
            p={5}
            borderRadius={12}
            direction="column"
        >
            <Typography level="h5" fontWeight="bold" marginBottom={2}>
                Delete Channel
            </Typography>
            <Typography mb={2.5}>
                Are you sure you want to Delete <b>{channel.name}</b>? This
                Action cannot be undone.
            </Typography>
            <Stack spacing={1.25} direction="row">
                <Button
                    color="neutral"
                    expand
                    size="lg"
                    onClick={() => closeModal()}
                >
                    Cancel
                </Button>
                <Button
                    color="danger"
                    expand
                    onClick={() => deleteChannel()}
                    disabled={isDeleting}
                    size="lg"
                >
                    Delete Channel
                </Button>
            </Stack>
        </Paper>
    );
});
