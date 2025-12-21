import { ThemeCreator } from "@components/ThemeCreator";
import { TooltipWrapper } from "@components/TooltipWrapper";
import { useModal } from "@contexts/Modal.context";
import type { Theme as MzTheme } from "@emotion/react";
import { usePrefersDark } from "@hooks/usePrefersDark";
import { useAppStore } from "@hooks/useStores";
import { baseDarkTheme, baseLightTheme, styled } from "@mutualzz/ui-core";
import {
    Box,
    Button,
    Checkbox,
    IconButton,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from "@mutualzz/ui-web";
import { Theme } from "@stores/objects/Theme";
import { useMutation } from "@tanstack/react-query";
import { getAdaptiveIcon } from "@utils/icons";
import { observer } from "mobx-react-lite";
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
    const { theme: currentTheme, changeTheme, type: currentType } = useTheme();
    const prefersDark = usePrefersDark();

    const [icons, setIcons] = useState<Map<string, ThemeWithIcon<Theme>>>(
        new Map(),
    );
    const [adaptiveIcon, setAdaptiveIcon] =
        useState<ThemeWithIcon<MzTheme> | null>(null);

    const [focusedTheme, setFocusedTheme] = useState(currentTheme.id);

    useEffect(() => {
        const loadIcons = async () => {
            const iconMap = new Map<string, ThemeWithIcon<Theme>>();

            // Load icons in parallel for better performance
            await Promise.all(
                app.themes.all.map(async (theme) => {
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
        mutationKey: ["delete-theme", focusedTheme],
        mutationFn: async (themeId: string) =>
            app.rest.delete<{ id: string }>(`@me/themes/${themeId}`),
        onSuccess: () => {
            app.themes.remove(focusedTheme);
            changeTheme(null);
            setFocusedTheme("");
        },
    });

    const defaultThemes = [baseDarkTheme, baseLightTheme];

    const defaultColorThemes = app.themes.all
        .filter((t) => !t.author)
        .filter((t) => t.id !== "baseDark" && t.id !== "baseLight");

    const userThemes = app.themes.all.filter((t) => t.author);

    const defaultIcons = Array.from(icons.values()).filter(
        (ic) => !ic.theme.author,
    );

    const userIcons = Array.from(icons.values()).filter(
        (ic) => ic.theme.author,
    );

    const handleThemeChange = (theme: MzTheme | Theme) => {
        if (theme.id === currentTheme.id) return;
        changeTheme(Theme.toEmotionTheme(theme));
        app?.settings?.setCurrentTheme(theme.id);
    };

    const handleIconChange = (iconId: string | null) => {
        if (iconId === app.themes.currentIcon) return;
        app.themes.setCurrentIcon(iconId);
        app.settings?.setCurrentIcon(iconId);
    };

    const handleSyncWithSystem = () => {
        if (!currentType) return;
        changeTheme(null);
        app?.settings?.setCurrentTheme(null);
    };

    return (
        <Stack direction="column" pt={2.5} pb={5} spacing={7.5}>
            <Typography
                display="flex"
                alignItems="center"
                level="body-lg"
                fontWeight="bolder"
                spacing={1.25}
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
                -{" "}
                <Checkbox
                    rtl
                    label="Prefer Embossed Style"
                    checked={app.preferEmbossed}
                    onClick={() => app.togglePreferEmbossed()}
                />
            </Typography>
            {userThemes.length > 0 && (
                <Stack direction="column" spacing={2.5}>
                    <Typography fontWeight="bold" level="body-sm">
                        Your Themes
                    </Typography>
                    <Stack direction="row" spacing={2.5}>
                        {userThemes.map((t) => (
                            <Tooltip
                                key={`${t.id}-top`}
                                title={
                                    <TooltipWrapper
                                        paperProps={{ borderRadius: 10 }}
                                        typographyProps={{ level: "body-sm" }}
                                    >
                                        {t.name}
                                    </TooltipWrapper>
                                }
                                placement="top"
                            >
                                <Tooltip
                                    key={`${t.id}-bottom`}
                                    title={
                                        <TooltipWrapper
                                            paperProps={{
                                                borderRadius: 10,
                                            }}
                                            typographyProps={{
                                                level: "body-xs",
                                            }}
                                        >
                                            {t.description}
                                        </TooltipWrapper>
                                    }
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
                                                    deleteTheme(t.id);
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
                                                handleThemeChange(t);
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
            <Stack direction="column" spacing={2.5}>
                <Typography fontWeight="bold" level="body-sm">
                    Default Themes
                </Typography>
                <Stack direction="row" spacing={2.5}>
                    {defaultThemes.map((t) => (
                        <Tooltip
                            key={`${t.id}-top`}
                            title={
                                <TooltipWrapper
                                    paperProps={{ borderRadius: 10 }}
                                    typographyProps={{ level: "body-sm" }}
                                >
                                    {t.name}
                                </TooltipWrapper>
                            }
                            placement="top"
                        >
                            <Tooltip
                                key={`${t.id}-bottom`}
                                title={
                                    <TooltipWrapper
                                        paperProps={{
                                            borderRadius: 10,
                                        }}
                                        typographyProps={{
                                            level: "body-xs",
                                        }}
                                    >
                                        {t.description}
                                    </TooltipWrapper>
                                }
                                placement="bottom"
                            >
                                <ColorBlob
                                    onClick={() => handleThemeChange(t)}
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
                    <Tooltip
                        title={
                            <TooltipWrapper
                                paperProps={{ borderRadius: 10 }}
                                typographyProps={{ level: "body-sm" }}
                            >
                                Sync with System
                            </TooltipWrapper>
                        }
                        placement="top"
                    >
                        <ColorBlob
                            shownTheme={
                                prefersDark ? baseDarkTheme : baseLightTheme
                            }
                            current={!currentType}
                            onClick={() => handleSyncWithSystem()}
                        >
                            {!currentType ? (
                                <FaCheck
                                    color={currentTheme.colors.common.white}
                                />
                            ) : (
                                <FaRepeat
                                    color={currentTheme.colors.common.white}
                                />
                            )}
                        </ColorBlob>
                    </Tooltip>
                </Stack>
            </Stack>
            <Stack direction="column" spacing={2.5}>
                <Typography fontWeight="bold" level="body-sm">
                    Color Themes
                </Typography>
                <Stack direction="column" spacing={2.5}>
                    <Typography level="body-xs" fontWeight="bold">
                        Normal
                    </Typography>
                    <div
                        css={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(15, minmax(4rem, 1fr))",
                            gap: 10,
                        }}
                    >
                        {defaultColorThemes
                            .filter((t) => t.style === "normal")
                            .map((t) => (
                                <Tooltip
                                    key={`${t.id}-top`}
                                    title={
                                        <TooltipWrapper
                                            paperProps={{ borderRadius: 10 }}
                                            typographyProps={{
                                                level: "body-sm",
                                            }}
                                        >
                                            {t.name}
                                        </TooltipWrapper>
                                    }
                                    placement="top"
                                >
                                    <Tooltip
                                        key={`${t.id}-bottom`}
                                        title={
                                            <TooltipWrapper
                                                paperProps={{
                                                    borderRadius: 10,
                                                }}
                                                typographyProps={{
                                                    level: "body-xs",
                                                }}
                                            >
                                                {t.description}
                                            </TooltipWrapper>
                                        }
                                        placement="bottom"
                                    >
                                        <ColorBlob
                                            css={{
                                                position: "relative",
                                            }}
                                            onClick={() => handleThemeChange(t)}
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

                <Stack direction="column" spacing={2.5}>
                    <Typography level="body-xs" fontWeight="bold">
                        Gradient
                    </Typography>
                    <div
                        css={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(15, minmax(4rem, 1fr))",
                            gap: 10,
                        }}
                    >
                        {defaultColorThemes
                            .filter((t) => t.style === "gradient")
                            .map((t) => (
                                <Tooltip
                                    key={`${t.id}-top`}
                                    title={
                                        <TooltipWrapper
                                            paperProps={{ borderRadius: 10 }}
                                            typographyProps={{
                                                level: "body-sm",
                                            }}
                                        >
                                            {t.name}
                                        </TooltipWrapper>
                                    }
                                    placement="top"
                                >
                                    <Tooltip
                                        key={`${t.id}-bottom`}
                                        title={
                                            <TooltipWrapper
                                                paperProps={{
                                                    borderRadius: 10,
                                                }}
                                                typographyProps={{
                                                    level: "body-xs",
                                                }}
                                            >
                                                {t.description}
                                            </TooltipWrapper>
                                        }
                                        placement="bottom"
                                    >
                                        <ColorBlob
                                            onClick={() => handleThemeChange(t)}
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
                <Stack direction="column" spacing={2.5}>
                    <Typography level="body-lg" fontWeight="bolder">
                        Icons
                    </Typography>
                    <Stack direction="column" spacing={2.5}>
                        <Typography level="body-sm" fontWeight="bold">
                            Default Icons
                        </Typography>
                        <div
                            css={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(15, minmax(4rem, 1fr))",
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
                                            handleIconChange(null);
                                        }}
                                        src={adaptiveIcon?.icon ?? undefined}
                                    />
                                    <Stack
                                        position="absolute"
                                        top={-2}
                                        right={-2}
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
                                                handleIconChange(icon.theme.id)
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
                                                    top={-2}
                                                    right={-2}
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
                        <Stack direction="column" spacing={2.5}>
                            <Typography level="body-sm" fontWeight="bold">
                                Your Icons
                            </Typography>
                            <div
                                css={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(15, minmax(4rem, 1fr))",
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
                                                    handleIconChange(
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
