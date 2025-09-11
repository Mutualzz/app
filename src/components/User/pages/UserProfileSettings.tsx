import { Avatars } from "@components/Avatar/Avatars";
import { AvatarUpload } from "@components/Avatar/AvatarUpload";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Button, ButtonGroup, Popover, Stack, Typography } from "@mutualzz/ui";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react";

export const UserProfileSettings = observer(() => {
    const { account, rest } = useAppStore();
    const { openModal, closeModal } = useModal();

    const { mutate: deleteAvatar, isPending } = useMutation({
        mutationFn: () => {
            return rest.patch("@me", { avatar: null });
        },
        onSuccess: () => {
            closeModal("user-settings");
        },
    });

    return (
        <Stack
            direction="column"
            spacing={{ xs: 3, sm: 5 }}
            width="100%"
            maxWidth={480}
        >
            <Stack direction="column" spacing={3}>
                <Typography
                    level={{ xs: "h6", sm: "h5" }}
                    fontSize={{ xs: "1.1rem", sm: "1.25rem" }}
                    fontWeight={600}
                >
                    Avatar
                </Typography>
                <Stack
                    spacing={5}
                    direction="row"
                    alignItems={{ xs: "stretch", sm: "center" }}
                    width="100%"
                >
                    <Popover
                        trigger={
                            <Button
                                disabled={isPending}
                                size={{ xs: "sm", sm: "md" }}
                            >
                                Change Avatar
                            </Button>
                        }
                        closeOnInteract
                    >
                        <ButtonGroup
                            disabled={isPending}
                            size={{ xs: "sm", sm: "md" }}
                        >
                            <Button
                                onClick={() => {
                                    openModal(
                                        "avatar-upload",
                                        <AvatarUpload />,
                                    );
                                }}
                            >
                                Upload
                            </Button>
                            <Button>Draw</Button>
                            <Button
                                onClick={() =>
                                    openModal("avatars", <Avatars />)
                                }
                            >
                                Avatars
                            </Button>
                        </ButtonGroup>
                    </Popover>
                    <Button
                        disabled={isPending || !account?.avatar}
                        onClick={() => deleteAvatar()}
                        color="neutral"
                        size={{ xs: "sm", sm: "md" }}
                    >
                        Remove Avatar
                    </Button>
                </Stack>
            </Stack>
        </Stack>
    );
});
