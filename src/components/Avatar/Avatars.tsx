import { Avatar } from "@components/Avatar";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { defaultAvatars } from "@mutualzz/types";
import { useTheme } from "@mutualzz/ui-core";
import {
    Box,
    Button,
    ButtonGroup,
    IconButton,
    Paper,
    Stack,
    Typography,
} from "@mutualzz/ui-web";
import { REST } from "@stores/REST.store";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";

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
    const [focusedAvatar, setFocusedAvatar] = useState("");

    const [currentPage, setCurrentPage] = useState<"default" | "previous">(
        "default",
    );

    const { mutate: updateAvatar, isPending } = useMutation({
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

    const { mutate: deletePreviousAvatar, isPending: isDeleting } = useMutation(
        {
            mutationFn: () =>
                rest.delete<{ avatar: string }>("@me/previousAvatar", {
                    avatar: selectedAvatar.avatar || focusedAvatar,
                }),
            onSuccess: ({ avatar }) => {
                account?.removePreviousAvatar(avatar);
                setSelectedAvatar({ avatar: "", type: "default" });
            },
        },
    );

    const selectAvatar = (avatar: string, type: "previous" | "default") => {
        if (isPending || isDeleting) return;
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
            maxWidth={600}
            direction="column"
            minHeight={300}
            justifyContent="center"
            alignItems="center"
        >
            <Stack
                width="100%"
                height="100%"
                position="relative"
                direction="column"
                px="5rem"
                py={{ xs: "1rem", sm: "4rem", md: "4.5rem" }}
                alignItems="center"
                justifyContent="center"
            >
                {currentPage === "default" && (
                    <Stack
                        gap={10}
                        alignItems="center"
                        flexWrap="wrap"
                        justifyContent="center"
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
                                    boxShadow:
                                        selectedAvatar.avatar === avatar
                                            ? `0 0 0 2px ${theme.colors.common.white}`
                                            : "none",
                                    cursor: isPending
                                        ? "not-allowed"
                                        : "pointer",
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
                        {(account?.previousAvatars.length ?? 0) > 0 ? (
                            account?.previousAvatars.map((avatar) => (
                                <Box
                                    onMouseEnter={() =>
                                        setFocusedAvatar(avatar)
                                    }
                                    onMouseLeave={() => setFocusedAvatar("")}
                                    onFocus={() => setFocusedAvatar(avatar)}
                                    position="relative"
                                    key={`box-${avatar}`}
                                >
                                    {(focusedAvatar === avatar ||
                                        selectedAvatar.avatar === avatar) && (
                                        <IconButton
                                            key={`delete-${avatar}`}
                                            onClick={() =>
                                                deletePreviousAvatar()
                                            }
                                            css={{
                                                position: "absolute",
                                                top: 0,
                                                right: 0,
                                                zIndex: 1,
                                            }}
                                            color="danger"
                                            size="sm"
                                        >
                                            <FaTrash />
                                        </IconButton>
                                    )}

                                    <Avatar
                                        key={`avatar-${avatar}`}
                                        src={account?.previousAvatarUrls.get(
                                            avatar,
                                        )}
                                        onClick={() =>
                                            selectAvatar(avatar, "previous")
                                        }
                                        alt="Previous Avatar"
                                        size={80}
                                        css={{
                                            filter:
                                                selectedAvatar.avatar === avatar
                                                    ? `blur(1px)`
                                                    : "none",
                                            cursor: isPending
                                                ? "not-allowed"
                                                : "pointer",
                                            boxShadow:
                                                selectedAvatar.avatar === avatar
                                                    ? `0 0 0 2px ${theme.colors.common.white}`
                                                    : "none",
                                        }}
                                    />
                                </Box>
                            ))
                        ) : (
                            <Stack
                                spacing={10}
                                direction="column"
                                alignItems="center"
                            >
                                <Typography fontWeight="bold" level="h6">
                                    No previous avatars found.
                                </Typography>
                                <Typography level="body-sm">
                                    Your last 9 avatars will be saved here
                                    automatically.
                                </Typography>
                            </Stack>
                        )}
                    </Stack>
                )}
            </Stack>
            <Stack
                spacing="1rem"
                pb={{ xs: "1rem", sm: "2rem" }}
                justifyContent="center"
            >
                <ButtonGroup disabled={isPending || isDeleting}>
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
                    <Button
                        disabled={isPending || isDeleting}
                        onClick={() => updateAvatar()}
                        color="success"
                    >
                        Save
                    </Button>
                )}
            </Stack>
        </Paper>
    );
});
