import { AvatarEditor } from "@components/Avatar/AvatarEditor";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Button, Stack, Typography } from "@mutualzz/ui";
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
                    <Button
                        onClick={() =>
                            openModal("avatar-editor", <AvatarEditor />)
                        }
                        size={{ xs: "sm", sm: "md" }}
                    >
                        Change Avatar
                    </Button>
                    <Button color="neutral" size={{ xs: "sm", sm: "md" }}>
                        Remove Avatar
                    </Button>
                </Stack>
            </Stack>
        </Stack>
    );
});
