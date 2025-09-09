import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { defaultAvatars } from "@mutualzz/types";
import {
    Avatar,
    Button,
    ButtonGroup,
    Paper,
    Stack,
    useTheme,
} from "@mutualzz/ui";
import { useMutation } from "@tanstack/react-query";
import REST from "@utils/REST";
import { observer } from "mobx-react";
import { useState } from "react";

export const Avatars = observer(() => {
    const { theme } = useTheme();
    const { account, rest } = useAppStore();
    const { closeAllModals } = useModal();
    const [selectedAvatar, setSelectedAvatar] = useState<{
        avatar: string;
        type: "previous" | "default";
    }>({
        avatar: "",
        type: "default",
    });

    const [currentPage, setCurrentPage] = useState<"default" | "previous">(
        "default",
    );

    const { mutate: updateAvatar } = useMutation({
        mutationFn: () => {
            if (selectedAvatar.type === "default")
                return rest.patch("@me", {
                    defaultAvatar: selectedAvatar.avatar,
                    avatar: null,
                });

            return rest.patch("@me", {
                avatar: selectedAvatar.avatar,
            });
        },
        onSuccess: () => {
            closeAllModals();
        },
    });

    const selectAvatar = (avatar: string, type: "previous" | "default") => {
        setSelectedAvatar({ avatar, type });
    };

    const changePage = (page: "default" | "previous") => {
        setSelectedAvatar({ avatar: "", type: "default" });
        setCurrentPage(page);
    };

    return (
        <Paper
            elevation={4}
            borderRadius={40}
            minWidth={{ xs: "90vw", sm: 340, md: 420, lg: 500 }}
            maxWidth={500}
            direction="column"
            minHeight={300}
        >
            <Stack
                width="100%"
                height="100%"
                position="relative"
                direction="column"
                px={{ xs: "1rem", sm: "2rem" }}
                py={{ xs: "3rem", sm: "4rem", md: "4.5rem" }}
                alignItems="center"
                justifyContent="space-between"
            >
                {currentPage === "default" && (
                    <Stack
                        direction="row"
                        flexWrap="wrap"
                        gap={10}
                        justifyContent="center"
                        alignItems="center"
                    >
                        {defaultAvatars.map((avatar) => (
                            <Avatar
                                key={avatar}
                                src={REST.makeCDNUrl(
                                    `/defaultAvatars/${avatar}.png`,
                                )}
                                onClick={() => selectAvatar(avatar, "default")}
                                alt="Default Avatar"
                                size={80}
                                css={{
                                    filter:
                                        selectedAvatar.avatar === avatar
                                            ? `blur(1px)`
                                            : "none",
                                    cursor: "pointer",
                                    boxShadow:
                                        selectedAvatar.avatar === avatar
                                            ? `0 0 0 2px ${theme.colors.common.white}`
                                            : "none",
                                }}
                            />
                        ))}
                    </Stack>
                )}
                {currentPage === "previous" && (
                    <Stack
                        direction="row"
                        flexWrap="wrap"
                        gap={10}
                        justifyContent="center"
                        alignItems="center"
                    >
                        {account?.previousAvatars.map((avatar) => (
                            <Avatar
                                key={avatar}
                                src={account?.previousAvatarUrls.get(avatar)}
                                onClick={() => selectAvatar(avatar, "previous")}
                                alt="Previous Avatar"
                                size={80}
                                css={{
                                    filter:
                                        selectedAvatar.avatar === avatar
                                            ? `blur(1px)`
                                            : "none",
                                    cursor: "pointer",
                                    boxShadow:
                                        selectedAvatar.avatar === avatar
                                            ? `0 0 0 2px ${theme.colors.common.white}`
                                            : "none",
                                }}
                            />
                        ))}
                    </Stack>
                )}
            </Stack>
            <Stack
                spacing="1rem"
                pb={{ xs: "1rem", sm: "2rem" }}
                justifyContent="center"
            >
                <ButtonGroup>
                    <Button
                        onClick={() => changePage("default")}
                        disabled={currentPage === "default"}
                    >
                        Default Avatars
                    </Button>
                    <Button
                        onClick={() => changePage("previous")}
                        disabled={currentPage === "previous"}
                    >
                        Previous Avatars
                    </Button>
                </ButtonGroup>

                {selectedAvatar.avatar && (
                    <Button onClick={() => updateAvatar()} color="success">
                        Save
                    </Button>
                )}
            </Stack>
        </Paper>
    );
});
