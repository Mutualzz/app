import { defaultAvatars } from "@mutualzz/types";
import {
    Avatar,
    Button,
    ButtonGroup,
    Paper,
    Stack,
    useTheme,
} from "@mutualzz/ui";
import REST from "@utils/REST";
import { observer } from "mobx-react";
import { useState } from "react";

export const Avatars = observer(() => {
    const { theme } = useTheme();
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
                justifyContent="center"
            >
                {currentPage === "default" && (
                    <Stack
                        direction="row"
                        flexWrap="wrap"
                        gap={2}
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
                                    border:
                                        selectedAvatar.avatar === avatar
                                            ? `${theme.colors.common.white} 2px solid`
                                            : "none",
                                }}
                            />
                        ))}
                    </Stack>
                )}
            </Stack>
            <Stack pb={{ xs: "1rem", sm: "2rem" }} justifyContent="center">
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
            </Stack>
        </Paper>
    );
});
