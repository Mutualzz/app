import { AvatarUpload } from "@components/Avatar/AvatarUpload";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Button, ButtonGroup, Popover, Stack, Typography } from "@mutualzz/ui";
import { observer } from "mobx-react";

export const UserProfileSettings = observer(() => {
    const { account } = useAppStore();
    const { openModal } = useModal();

    if (!account) return null;

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
                            <Button size={{ xs: "sm", sm: "md" }}>
                                Change Avatar
                            </Button>
                        }
                        closeOnInteract
                    >
                        <ButtonGroup size={{ xs: "sm", sm: "md" }}>
                            <Button>Avatars</Button>
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
                        </ButtonGroup>
                    </Popover>
                    <Button color="neutral" size={{ xs: "sm", sm: "md" }}>
                        Remove Avatar
                    </Button>
                </Stack>
            </Stack>
        </Stack>
    );
});
