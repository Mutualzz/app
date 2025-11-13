import { ThemeCreator } from "@components/ThemeCreator";
import { useModal } from "@contexts/Modal.context";
import type { Theme as MzTheme } from "@emotion/react";
import { usePrefersDark } from "@hooks/usePrefersDark";
import { useAppStore } from "@hooks/useStores";
import { baseDarkTheme, baseLightTheme, styled } from "@mutualzz/ui-core";
import {
    Box,
    Button,
    IconButton,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from "@mutualzz/ui-web";
import { Theme } from "@stores/objects/Theme";
import { useMutation } from "@tanstack/react-query";
import { getAdaptiveIcon } from "@utils/index";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { FaCheck, FaTrash } from "react-icons/fa";
import { FaRepeat } from "react-icons/fa6";

const ColorBlob = styled("div")<{
    shownTheme: Theme | MzTheme;

    current: boolean;
}>(({ theme, shownTheme, current }) => ({
    width: "4rem",
    height: "4rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    background: shownTheme.colors.surface,
    border: `3px solid ${theme.colors.primary}`,
    boxShadow: current ? `0 0 0 3px ${theme.colors.primary}` : "none",
    borderRadius: "50%",
}));

const ImageBlob = styled("img")<{
    current: boolean;
}>(({ theme, current }) => ({
    width: "4rem",
    height: "4rem",
    cursor: "pointer",
    border: `3px solid ${theme.colors.primary}`,
    boxShadow: current ? `0 0 0 3px ${theme.colors.primary}` : "none",
    borderRadius: "50%",
}));

type ThemeWithIcon<T> = { theme: T; icon: string };

export const AppAppearanceSettings = observer(() => {
    const app = useAppStore();
    const { openModal } = useModal();
    const {
        theme: currentTheme,
        changeTheme,
        type: currentType,
        changeType,
    } = useTheme();
    const prefersDark = usePrefersDark();

    const [icons, setIcons] = useState<Map<string, ThemeWithIcon<Theme>>>(
        new Map(),
    );
    const [adaptiveIcon, setAdaptiveIcon] =
        useState<ThemeWithIcon<MzTheme> | null>(null);

    const [focusedTheme, setFocusedTheme] = useState("");

    useEffect(() => {
        const loadIcons = async () => {
            const allThemes = Array.from(app.themes.themes.values());
            const iconMap = new Map<string, ThemeWithIcon<Theme>>();

            // Load icons in parallel for better performance
            await Promise.all(
                allThemes.map(async (theme) => {
                    const icon = (await getAdaptiveIcon(
                        Theme.toEmotionTheme(theme),
                        "baseUrl",
                    )) as string;
                    iconMap.set(theme.id, { theme, icon });
                }),
            );

            setIcons(iconMap);
        };

        loadIcons();
    }, [app.themes.themes.size]);

    useEffect(() => {
        const setupAdaptive = async () => {
            const icon = (await getAdaptiveIcon(
                currentTheme,
                "baseUrl",
            )) as string;
            setAdaptiveIcon({ theme: currentTheme, icon });
        };

        setupAdaptive();
    }, [currentTheme]);

    const { mutate: deleteTheme, isPending: isDeleting } = useMutation({
        mutationFn: async () => {
            const response = await app.rest.delete<{ id: string }>(
                `@me/themes/${focusedTheme}`,
            );

            return response;
        },
        onSuccess: () => {
            app.themes.remove(focusedTheme);
            changeTheme(prefersDark ? baseDarkTheme : baseLightTheme);
            setFocusedTheme("");
        },
    });

    const defaultThemes = [baseDarkTheme, baseLightTheme];

    const defaultColorThemes = Array.from(app.themes.themes.values())
        .filter((t) => !t.author)
        .filter((t) => t.id !== "baseDark" && t.id !== "baseLight");

    const userThemes = Array.from(app.themes.themes.values()).filter(
        (t) => t.author,
    );

    const defaultIcons = Array.from(icons.values()).filter(
        (ic) => !ic.theme.author,
    );

    const userIcons = Array.from(icons.values()).filter(
        (ic) => ic.theme.author,
    );

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
                            <Tooltip
                                key={`${t.id}-top`}
                                title={t.name}
                                placement="top"
                            >
                                <Tooltip
                                    key={`${t.id}-bottom`}
                                    title={t.description}
                                    placement="bottom"
                                >
                                    <Box
                                        onMouseEnter={() =>
                                            setFocusedTheme(t.id)
                                        }
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
                                                changeTheme(
                                                    Theme.toEmotionTheme(t),
                                                );
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
                        <Tooltip
                            key={`${t.id}-top`}
                            title={t.name}
                            placement="top"
                        >
                            <Tooltip
                                key={`${t.id}-bottom`}
                                title={t.description}
                                placement="bottom"
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
                                        currentType === t.type && <FaCheck />}
                                </ColorBlob>
                            </Tooltip>
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
                            {currentType === "system" ? (
                                <FaCheck />
                            ) : (
                                <FaRepeat />
                            )}
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
                                    key={`${t.id}-top`}
                                    title={t.name}
                                    placement="top"
                                >
                                    <Tooltip
                                        key={`${t.id}-bottom`}
                                        title={t.description}
                                        placement="bottom"
                                    >
                                        <ColorBlob
                                            css={{
                                                position: "relative",
                                            }}
                                            onClick={() =>
                                                changeTheme(
                                                    Theme.toEmotionTheme(t),
                                                )
                                            }
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
                                    key={`${t.id}-top`}
                                    title={t.name}
                                    placement="top"
                                >
                                    <Tooltip
                                        key={`${t.id}-bottom`}
                                        title={t.description}
                                        placement="bottom"
                                    >
                                        <ColorBlob
                                            onClick={() =>
                                                changeTheme(
                                                    Theme.toEmotionTheme(t),
                                                )
                                            }
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
                                </Tooltip>
                            ))}
                    </div>
                </Stack>
            </Stack>
            {icons.size > 0 && (
                <Stack direction="column" spacing={10}>
                    <Typography level="body-lg" fontWeight="bolder">
                        Icons
                    </Typography>
                    <Stack direction="column" spacing={10}>
                        <Typography level="body-sm" fontWeight="bold">
                            Default Icons
                        </Typography>
                        <div
                            css={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(10, minmax(4rem, 1fr))",
                                gap: 10,
                            }}
                        >
                            <Tooltip
                                title="Adapt with current theme"
                                placement="top"
                            >
                                <Box
                                    position="relative"
                                    display="inline-flex"
                                    width="4rem"
                                    height="4rem"
                                >
                                    <ImageBlob
                                        current={!app.themes.currentIcon}
                                        onClick={() => {
                                            app.themes.setCurrentIcon(null);
                                        }}
                                        src={adaptiveIcon?.icon ?? undefined}
                                    />
                                    <Stack
                                        position="absolute"
                                        top={-4}
                                        right={-4}
                                        alignItems="center"
                                        border={`2px solid ${currentTheme.colors.surface}`}
                                        justifyContent="center"
                                        fontSize="0.75rem"
                                        css={{
                                            width: "1.5rem",
                                            height: "1.5rem",
                                            borderRadius: "50%",
                                            background:
                                                currentTheme.colors.primary,
                                            pointerEvents: "none",
                                        }}
                                    >
                                        {!app.themes.currentIcon ? (
                                            <FaCheck />
                                        ) : (
                                            <FaRepeat />
                                        )}
                                    </Stack>
                                </Box>
                            </Tooltip>
                            {defaultIcons.map((icon) => (
                                <Tooltip
                                    key={`${icon.theme.id}-icon`}
                                    placement="top"
                                    title={`${icon.theme.name} Icon`}
                                >
                                    <Box
                                        position="relative"
                                        display="inline-flex"
                                        width="4rem"
                                        height="4rem"
                                    >
                                        <ImageBlob
                                            src={icon.icon}
                                            css={{ width: 64, height: 64 }}
                                            onClick={() =>
                                                app.themes.setCurrentIcon(
                                                    icon.theme.id,
                                                )
                                            }
                                            current={
                                                icon.theme.id ===
                                                app.themes.currentIcon
                                            }
                                        />
                                        {icon.theme.id ===
                                            app.themes.currentIcon &&
                                            app.themes.currentIcon ===
                                                currentTheme.id && (
                                                <Stack
                                                    position="absolute"
                                                    top={-4}
                                                    right={-4}
                                                    alignItems="center"
                                                    border={`2px solid ${currentTheme.colors.surface}`}
                                                    justifyContent="center"
                                                    fontSize="0.75rem"
                                                    css={{
                                                        width: "1.5rem",
                                                        height: "1.5rem",
                                                        borderRadius: "50%",
                                                        background:
                                                            currentTheme.colors
                                                                .primary,
                                                        pointerEvents: "none",
                                                    }}
                                                >
                                                    <FaCheck />
                                                </Stack>
                                            )}
                                    </Box>
                                </Tooltip>
                            ))}
                        </div>
                    </Stack>
                    {userIcons.length > 0 && (
                        <Stack direction="column" spacing={10}>
                            <Typography level="body-sm" fontWeight="bold">
                                Your Icons
                            </Typography>
                            <div
                                css={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(10, minmax(4rem, 1fr))",
                                    gap: 10,
                                }}
                            >
                                {userIcons.map((icon) => (
                                    <Tooltip
                                        key={`${icon.theme.id}-icon`}
                                        placement="top"
                                        title={`${icon.theme.name} Icon`}
                                    >
                                        <Box
                                            position="relative"
                                            display="inline-flex"
                                            width="4rem"
                                            height="4rem"
                                        >
                                            <ImageBlob
                                                src={icon.icon}
                                                css={{ width: 64, height: 64 }}
                                                onClick={() =>
                                                    app.themes.setCurrentIcon(
                                                        icon.theme.id,
                                                    )
                                                }
                                                current={
                                                    icon.theme.id ===
                                                    app.themes.currentIcon
                                                }
                                            />
                                            {icon.theme.id ===
                                                app.themes.currentIcon &&
                                                app.themes.currentIcon ===
                                                    currentTheme.id && (
                                                    <Stack
                                                        position="absolute"
                                                        top={-4}
                                                        right={-4}
                                                        alignItems="center"
                                                        border={`2px solid ${currentTheme.colors.surface}`}
                                                        justifyContent="center"
                                                        fontSize="0.75rem"
                                                        css={{
                                                            width: "1.5rem",
                                                            height: "1.5rem",
                                                            borderRadius: "50%",
                                                            background:
                                                                currentTheme
                                                                    .colors
                                                                    .primary,
                                                            pointerEvents:
                                                                "none",
                                                        }}
                                                    >
                                                        <FaCheck />
                                                    </Stack>
                                                )}
                                        </Box>
                                    </Tooltip>
                                ))}
                            </div>
                        </Stack>
                    )}
                </Stack>
            )}
        </Stack>
    );
});
