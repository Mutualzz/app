import { AvatarDraw } from "@components/Avatar/AvatarDraw";
import { Avatars } from "@components/Avatar/Avatars";
import { AvatarUpload } from "@components/Avatar/AvatarUpload";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import {
    Button,
    ButtonGroup,
    Popover,
    Stack,
    Typography,
} from "@mutualzz/ui-web";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";

export const UserProfileSettings = observer(() => {
    const app = useAppStore();
    const { openModal, closeModal } = useModal();

    const { mutate: deleteAvatar, isPending } = useMutation({
        mutationKey: ["delete-avatar"],
        mutationFn: () => app.rest.patch("@me", { avatar: null }),
        onSuccess: () => {
            closeModal();
        },
    });

    return (
        <Stack
            direction="column"
            spacing={{ xs: 0.75, sm: 1.25 }}
            width="100%"
            maxWidth={480}
        >
            <Stack direction="column" spacing={0.75}>
                <Typography
                    level={{ xs: "h6", sm: "h5" }}
                    fontSize={{ xs: "1.1rem", sm: "1.25rem" }}
                    fontWeight={600}
                >
                    Avatar
                </Typography>
                <Stack
                    spacing={1.25}
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
                                        {
                                            css: {
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                            },
                                        },
                                    );
                                }}
                            >
                                Upload
                            </Button>
                            <Button
                                onClick={() =>
                                    openModal("avatar-draw", <AvatarDraw />)
                                }
                            >
                                Draw
                            </Button>
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
                        disabled={isPending || !app.account?.avatar}
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
