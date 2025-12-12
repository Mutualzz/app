import { AnimatedPaper } from "@components/Animated/AnimatedPaper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { CDNRoutes } from "@mutualzz/types";
import {
    createColor,
    dynamicElevation,
    randomColor,
    type ColorLike,
} from "@mutualzz/ui-core";
import {
    Avatar,
    Box,
    Button,
    ButtonGroup,
    Checkbox,
    IconButton,
    InputColor,
    Paper,
    Stack,
    Typography,
    useTheme,
} from "@mutualzz/ui-web";
import { REST } from "@stores/REST.store";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";

export const Avatars = observer(() => {
    const { theme } = useTheme();
    const app = useAppStore();
    const { closeAllModals } = useModal();

    const [focusedAvatar, setFocusedAvatar] = useState("");
    const [customColor, setCustomColor] = useState<ColorLike | null>(null);

    const [currentPage, setCurrentPage] = useState<"default" | "previous">(
        "default",
    );

    const version = customColor
        ? createColor(customColor).isLight()
            ? "dark"
            : "light"
        : theme.type === "light"
          ? "dark"
          : "light";

    const [selectedAvatar, setSelectedAvatar] = useState<{
        avatar: number | string;
        color?: string | null;
        type: "previous" | "default";
    }>({
        avatar: -1,
        color: customColor,
        type: "default",
    });

    const { mutate: updateAvatar, isPending } = useMutation({
        mutationKey: ["update-avatar"],
        mutationFn: () => {
            if (selectedAvatar.type === "default")
                return app.rest.patch("@me", {
                    defaultAvatar: {
                        type: Number(selectedAvatar.avatar),
                        color: selectedAvatar.color ?? null,
                    },
                    avatar: null,
                });

            return app.rest.patch("@me", {
                avatar: selectedAvatar.avatar,
            });
        },
        onSuccess: () => {
            closeAllModals();
        },
    });

    const { mutate: deletePreviousAvatar, isPending: isDeleting } = useMutation(
        {
            mutationKey: ["delete-previous-avatar"],
            mutationFn: (avatar: string | number) =>
                app.rest.delete<{ avatar: string }>("@me/previousAvatar", {
                    avatar,
                }),
            onSuccess: ({ avatar }) => {
                app.account?.removePreviousAvatar(avatar);
                setSelectedAvatar({ avatar: -1, type: "default" });
            },
        },
    );

    const selectAvatar = (
        avatar: number | string,
        type: "previous" | "default",
    ) => {
        if (isPending || isDeleting) return;
        setSelectedAvatar({
            avatar,
            color: type === "default" ? customColor : null,
            type,
        });
    };

    const changePage = (page: "default" | "previous") => {
        setSelectedAvatar({ avatar: -1, color: null, type: "default" });
        setCurrentPage(page);
    };

    const handleColorChange = (color: ColorLike) => {
        setCustomColor(color);
        setSelectedAvatar({
            avatar: selectedAvatar.avatar,
            color,
            type: "default",
        });
    };

    const showSave =
        (typeof selectedAvatar.avatar === "number" &&
            selectedAvatar.avatar >= 0) ||
        (typeof selectedAvatar.avatar === "string" &&
            selectedAvatar.avatar.length > 0);

    return (
        <AnimatedPaper
            elevation={4}
            borderRadius={40}
            minWidth={{ xs: "90vw", sm: 340, md: 420, lg: 500 }}
            maxWidth={600}
            direction="column"
            minHeight={300}
            justifyContent="center"
            alignItems="center"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
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
                        direction="column"
                        spacing={1.25}
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Stack
                            spacing={2.5}
                            alignItems="center"
                            flexWrap="wrap"
                            justifyContent="center"
                        >
                            {[0, 1, 2, 3, 4, 5].map((avatar) => (
                                <Paper
                                    display="inline-block"
                                    css={{
                                        filter:
                                            selectedAvatar.avatar === avatar
                                                ? `blur(1px)`
                                                : "none",
                                        boxShadow:
                                            selectedAvatar.avatar === avatar
                                                ? `0 0 0 2px ${theme.type === "dark" ? theme.colors.common.white : theme.colors.common.black}`
                                                : "none",
                                        cursor: isPending
                                            ? "not-allowed"
                                            : "pointer",
                                    }}
                                    variant="solid"
                                    color={
                                        customColor ||
                                        dynamicElevation(
                                            theme.colors.surface,
                                            10,
                                        )
                                    }
                                    boxShadow={theme.shadows[5]}
                                    borderRadius="50%"
                                    key={avatar}
                                >
                                    <Avatar
                                        src={REST.makeCDNUrl(
                                            CDNRoutes.defaultUserAvatar(
                                                avatar,
                                                version,
                                            ),
                                        )}
                                        onClick={() =>
                                            selectAvatar(avatar, "default")
                                        }
                                        variant="plain"
                                        alt="Default Avatar"
                                        size={128}
                                    />
                                </Paper>
                            ))}
                        </Stack>
                        <Checkbox
                            value={!!customColor}
                            onChange={() => {
                                if (customColor) {
                                    setCustomColor(null);
                                    setSelectedAvatar({
                                        avatar: selectedAvatar.avatar,
                                        color: null,
                                        type: "default",
                                    });
                                } else {
                                    const color = randomColor("hex");
                                    setCustomColor(color);
                                    setSelectedAvatar({
                                        avatar: selectedAvatar.avatar,
                                        color,
                                        type: "default",
                                    });
                                }
                            }}
                            label="Custom Color"
                        />
                        {customColor && (
                            <InputColor
                                value={customColor}
                                onChange={handleColorChange}
                                showRandom
                            />
                        )}
                    </Stack>
                )}
                {currentPage === "previous" && (
                    <Stack
                        direction="row"
                        flexWrap="wrap"
                        spacing={2.5}
                        justifyContent="center"
                        alignItems="center"
                    >
                        {(app.account?.previousAvatars.length ?? 0) > 0 ? (
                            app.account?.previousAvatars.map((avatar) => (
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
                                                deletePreviousAvatar(avatar)
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
                                        src={app.account?.previousAvatarUrls.get(
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
                                                    ? `0 0 0 2px ${theme.type === "dark" ? theme.colors.common.white : theme.colors.common.black}`
                                                    : "none",
                                        }}
                                    />
                                </Box>
                            ))
                        ) : (
                            <Stack
                                spacing={2.5}
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
                px={{ xs: "1rem", sm: "2rem", md: "4rem" }}
                justifyContent="center"
                width="100%"
            >
                <ButtonGroup fullWidth disabled={isPending || isDeleting}>
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

                {showSave && (
                    <Button
                        disabled={isPending || isDeleting}
                        onClick={() => updateAvatar()}
                        color="success"
                        fullWidth
                    >
                        Save
                    </Button>
                )}
            </Stack>
        </AnimatedPaper>
    );
});
