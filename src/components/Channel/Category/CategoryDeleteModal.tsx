import { AnimatedPaper } from "@components/Animated/AnimatedPaper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Button, ButtonGroup, Stack, Typography } from "@mutualzz/ui-web";
import type { Channel } from "@stores/objects/Channel";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";

interface Props {
    channel: Channel;
}

export const CategoryDeleteModal = observer(({ channel }: Props) => {
    const app = useAppStore();
    const navigate = useNavigate();
    const { closeAllModals } = useModal();

    const { mutate: deleteCategory, isPending: isDeleting } = useMutation({
        mutationKey: ["delete-category", channel.id],
        mutationFn: async (parentOnly: boolean) => channel.delete(parentOnly),
        onSuccess: ({ spaceId, channelId }) => {
            if (app.channels.activeId === channelId)
                navigate({
                    to: "/spaces/$spaceId/$channelId",
                    params: {
                        spaceId: spaceId ?? "",
                        channelId: "",
                    },
                });

            closeAllModals();
        },
    });

    return (
        <AnimatedPaper
            borderRadius={12}
            minWidth={{ xs: "90vw", sm: 340, md: 420, lg: 400 }}
            maxWidth={600}
            direction="column"
            minHeight={200}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            elevation={app.preferEmbossed ? 5 : 1}
            justifyContent="space-between"
            alignItems="center"
            spacing={0}
            p={{ xs: "1rem", sm: "2rem" }}
            transparency={65}
        >
            <Stack
                width="100%"
                flex={1}
                position="relative"
                direction="column"
                alignItems="center"
                justifyContent="center"
                mt={10}
            >
                <Typography level="h6">
                    Would you like to delete this category and all of its
                    channels?
                </Typography>
            </Stack>
            <Stack
                pt={{ xs: 6, sm: 8, md: 10 }}
                direction="row"
                justifyContent="space-between"
                width="100%"
                alignItems="flex-end"
            >
                <ButtonGroup fullWidth spacing={{ xs: 2, sm: 5 }}>
                    <Button
                        variant="solid"
                        color="danger"
                        onClick={() => deleteCategory(true)}
                        disabled={isDeleting}
                    >
                        Just the category
                    </Button>
                    <Button
                        variant="soft"
                        color="danger"
                        onClick={() => deleteCategory(false)}
                        disabled={isDeleting}
                    >
                        Category and all channels related
                    </Button>
                    <Button
                        variant="solid"
                        fullWidth
                        color="success"
                        onClick={closeAllModals}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                </ButtonGroup>
            </Stack>
        </AnimatedPaper>
    );
});
