import { ThemeCreator } from "@components/ThemeCreator";
import { useModal } from "@contexts/Modal.context";
import type { Theme } from "@emotion/react";
import { usePrefersDark } from "@hooks/usePrefersDark";
import { useAppStore } from "@hooks/useStores";
import {
    baseDarkTheme,
    baseLightTheme,
    createColor,
    styled,
} from "@mutualzz/ui-core";
import {
    Box,
    Button,
    IconButton,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from "@mutualzz/ui-web";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react";
import { useState } from "react";
import { FaCheck, FaTrash } from "react-icons/fa";

const ColorBlob = styled("div")<{
    shownTheme: Theme;
    size?: string | number;
    current: boolean;
}>(({ theme, shownTheme, size = "4rem", current }) => ({
    width: size,
    height: size,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    background: shownTheme.colors.surface,
    border: `1px solid ${
        createColor(theme.colors.background).isLight()
            ? theme.colors.common.black
            : theme.colors.common.white
    }`,
    boxShadow: current ? `0 0 0 3px ${theme.colors.primary}` : "none",
    borderRadius: "50%",
}));

// NOTE: Upon deleting a theme, it doesn't immediately reflect in the UI until a refresh
export const AppAppearanceSettings = observer(() => {
    const app = useAppStore();
    const { openModal } = useModal();
    const {
        theme: currentTheme,
        changeTheme,
        type: currentType,
        changeType,
    } = useTheme();
    const { theme: themeStore, rest } = app;
    const prefersDark = usePrefersDark();

    const [focusedTheme, setFocusedTheme] = useState("");

    const { mutate: deleteTheme, isPending: isDeleting } = useMutation({
        mutationFn: async () => {
            const response = await rest.delete<{ id: string }>("@me/themes", {
                id: focusedTheme,
            });

            return response;
        },
        onSuccess: () => {
            themeStore.removeTheme(focusedTheme);
            setFocusedTheme("");
        },
    });

    const defaultThemes = [baseDarkTheme, baseLightTheme];

    const defaultColorThemes = themeStore.themes
        .filter((t) => !t.createdBy)
        .filter((t) => t.id !== "baseDark" && t.id !== "baseLight");

    const userThemes = themeStore.themes.filter((t) => t.createdBy);

    return (
        <Stack direction="column" spacing={30}>
            <Typography
                display="flex"
                alignItems="center"
                level="body-lg"
                fontWeight="bolder"
                spacing={5}
            >
                Themes -
                <Button
                    variant="soft"
                    color="neutral"
                    horizontalAlign="left"
                    onClick={() =>
                        openModal("theme-creator", <ThemeCreator />, {
                            height: "100%",
                        })
                    }
                >
                    Open Editor
                </Button>
            </Typography>
            {userThemes.length > 0 && (
                <Stack direction="column" spacing={10}>
                    <Typography fontWeight="bold" level="body-sm">
                        Your Themes
                    </Typography>
                    <Stack direction="row" spacing={10}>
                        {userThemes.map((t) => (
                            <Tooltip key={t.id} title={t.name} placement="top">
                                <Box
                                    onMouseEnter={() => setFocusedTheme(t.id)}
                                    onMouseLeave={() => setFocusedTheme("")}
                                    onFocus={() => setFocusedTheme(t.id)}
                                    position="relative"
                                    key={`box-${t.id}`}
                                >
                                    {(focusedTheme === t.id ||
                                        currentTheme.id === t.id) && (
                                        <IconButton
                                            key={`delete-${t.id}`}
                                            onClick={() => {
                                                deleteTheme();
                                            }}
                                            css={{
                                                position: "absolute",
                                                top: 0,
                                                right: 0,
                                                zIndex: 1,
                                            }}
                                            color="danger"
                                            size={12}
                                            disabled={isDeleting}
                                        >
                                            <FaTrash />
                                        </IconButton>
                                    )}
                                    <ColorBlob
                                        onClick={() => {
                                            changeTheme(t);
                                            setFocusedTheme(t.id);
                                        }}
                                        shownTheme={t}
                                        current={
                                            t.id === currentTheme.id &&
                                            currentType === t.type
                                        }
                                        onMouseEnter={() =>
                                            setFocusedTheme(t.id)
                                        }
                                    >
                                        {t.id === currentTheme.id &&
                                            currentType === t.type && (
                                                <FaCheck />
                                            )}
                                    </ColorBlob>
                                </Box>
                            </Tooltip>
                        ))}
                    </Stack>
                </Stack>
            )}
            <Stack direction="column" spacing={10}>
                <Typography fontWeight="bold" level="body-sm">
                    Default Themes
                </Typography>
                <Stack direction="row" spacing={10}>
                    {defaultThemes.map((t) => (
                        <Tooltip key={t.id} title={t.name} placement="top">
                            <ColorBlob
                                onClick={() => changeTheme(t)}
                                shownTheme={t}
                                current={
                                    t.id === currentTheme.id &&
                                    currentType === t.type
                                }
                            >
                                {t.id === currentTheme.id &&
                                    currentType === t.type && <FaCheck />}
                            </ColorBlob>
                        </Tooltip>
                    ))}
                    <Tooltip title="Sync with system" placement="top">
                        <ColorBlob
                            shownTheme={
                                prefersDark ? baseDarkTheme : baseLightTheme
                            }
                            current={currentType === "system"}
                            onClick={() => {
                                changeType("system");
                            }}
                        >
                            {currentType === "system" && <FaCheck />}
                        </ColorBlob>
                    </Tooltip>
                </Stack>
            </Stack>
            <Stack direction="column" spacing={10}>
                <Typography fontWeight="bold" level="body-sm">
                    Color Themes
                </Typography>
                <Stack direction="column" spacing={10}>
                    <Typography level="body-xs" fontWeight="bold">
                        Normal
                    </Typography>
                    <div
                        css={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(10, minmax(4rem, 1fr))",
                            gap: 10,
                        }}
                    >
                        {defaultColorThemes
                            .filter((t) => t.style === "normal")
                            .map((t) => (
                                <Tooltip
                                    key={t.id}
                                    title={t.name}
                                    placement="top"
                                >
                                    <ColorBlob
                                        onClick={() => changeTheme(t)}
                                        shownTheme={t}
                                        current={
                                            t.id === currentTheme.id &&
                                            currentType === t.type
                                        }
                                    >
                                        {t.id === currentTheme.id &&
                                            currentType === t.type && (
                                                <FaCheck />
                                            )}
                                    </ColorBlob>
                                </Tooltip>
                            ))}
                    </div>
                </Stack>

                <Stack direction="column" spacing={10}>
                    <Typography level="body-xs" fontWeight="bold">
                        Gradient
                    </Typography>
                    <div
                        css={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(10, minmax(4rem, 1fr))",
                            gap: 10,
                        }}
                    >
                        {defaultColorThemes
                            .filter((t) => t.style === "gradient")
                            .map((t) => (
                                <Tooltip
                                    key={t.id}
                                    title={t.name}
                                    placement="top"
                                >
                                    <ColorBlob
                                        onClick={() => changeTheme(t)}
                                        shownTheme={t}
                                        current={
                                            t.id === currentTheme.id &&
                                            currentType === t.type
                                        }
                                    >
                                        {t.id === currentTheme.id &&
                                            currentType === t.type && (
                                                <FaCheck />
                                            )}
                                    </ColorBlob>
                                </Tooltip>
                            ))}
                    </div>
                </Stack>
            </Stack>
        </Stack>
    );
});
