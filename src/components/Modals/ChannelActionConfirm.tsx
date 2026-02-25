import { observer } from "mobx-react-lite";
import type { Channel } from "@stores/objects/Channel.ts";
import { useAppStore } from "@hooks/useStores.ts";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Paper } from "@components/Paper.tsx";
import { Button, ButtonGroup, Typography } from "@mutualzz/ui-web";
import { useModal } from "@contexts/Modal.context.tsx";

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
                    to: "/spaces/$spaceId/$channelId",
                    params: {
                        spaceId: channel.space.id,
                        channelId:
                            channel.space.firstNavigableChannel?.id || "",
                    },
                });

            closeModal();
        },
    });

    return (
        <Paper
            elevation={app.settings?.preferEmbossed ? 5 : 1}
            width="25rem"
            height="10rem"
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
            <ButtonGroup fullWidth size="lg" spacing={5}>
                <Button color="neutral" onClick={() => closeModal()}>
                    Cancel
                </Button>
                <Button
                    color="danger"
                    onClick={() => deleteChannel()}
                    disabled={isDeleting}
                >
                    Delete Channel
                </Button>
            </ButtonGroup>
        </Paper>
    );
});
