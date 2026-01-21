import { ThemeCreatorModal } from "@components/ThemeCreator/ThemeCreatorModal";
import { TooltipWrapper } from "@components/TooltipWrapper";
import { useModal } from "@contexts/Modal.context";
import type { CSSObject, Theme as MzTheme } from "@emotion/react";
import { usePrefersDark } from "@hooks/usePrefersDark";
import { useAppStore } from "@hooks/useStores";
import type { ThemeType } from "@mutualzz/types";
import {
    baseDarkTheme,
    baseLightTheme,
    type ColorLike,
    extractColors,
    isValidGradient,
    styled,
} from "@mutualzz/ui-core";
import {
    Box,
    Button,
    Checkbox,
    Divider,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from "@mutualzz/ui-web";
import { Theme } from "@stores/objects/Theme";
import { useMutation } from "@tanstack/react-query";
import { getAdaptiveIcon } from "@utils/icons";
import { observer } from "mobx-react-lite";
import {
    forwardRef,
    type HTMLProps,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { FaCheck, FaTrash } from "react-icons/fa";
import { FaRepeat } from "react-icons/fa6";
import { VirtuosoGrid } from "react-virtuoso";

const ImageBlob = styled("img")<{
    current: boolean;
}>(({ theme, current }) => ({
    width: "4rem",
    height: "4rem",
    cursor: "pointer",
    outline: `3px solid ${theme.colors.primary}`,
    boxShadow: current ? `0 0 0 3px ${theme.colors.primary}` : "none",
    borderRadius: "50%",
}));

interface ThemeWithIcon<T> {
    theme: T;
    icon: string;
}

const GRID_COLUMNS = 15;
const GRID_ITEM_SIZE = "4rem";

const gridStyles: CSSObject = {
    display: "grid",
    gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(${GRID_ITEM_SIZE}, 1fr))`,
    paddingLeft: "0.25rem",
    width: "100%",
    boxSizing: "border-box",
};

function gradientToDataUrl(colors: string[]): string {
    const stops = colors
        .map(
            (color, i) =>
                `<stop offset="${(i / (colors.length - 1)) * 100}%" stop-color="${color}"/>`,
        )
        .join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0">${stops}</linearGradient></defs><circle cx="32" cy="32" r="32" fill="url(#g)" /></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function solidColorToDataUrl(color: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="32" fill="${color}" /></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function colorOrGradientToDataUrl(colorOrGradient: ColorLike): string {
    if (isValidGradient(colorOrGradient)) {
        const colors = extractColors(colorOrGradient) || ["#888", "#ccc"];
        return gradientToDataUrl(colors);
    }
    return solidColorToDataUrl(colorOrGradient);
}

const VirtuosoGridList = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(
    (props, ref) => (
        <Stack
            {...(props as any)}
            ref={ref}
            display="grid"
            style={{
                ...gridStyles,
                ...(props.style || {}),
            }}
        />
    ),
);

VirtuosoGridList.displayName = "VirtuosoGridList";

const VirtuosoGridItem = (props: HTMLProps<HTMLDivElement>) => (
    <Stack {...(props as any)} py={2} />
);

export const AppAppearanceSettings = observer(() => {
    const app = useAppStore();
    const { openModal } = useModal();
    const { theme: currentTheme, changeTheme, type: currentType } = useTheme();
    const prefersDark = usePrefersDark();

    // Use ref for icons to avoid unnecessary re-renders
    const iconsRef = useRef<Map<string, ThemeWithIcon<Theme>>>(new Map());
    const [_iconsVersion, setIconsVersion] = useState(0); // Used to trigger re-renders when icons are loaded
    const [adaptiveIcon, setAdaptiveIcon] =
        useState<ThemeWithIcon<MzTheme> | null>(null);

    const [focusedTheme, setFocusedTheme] = useState(currentTheme.id);

    useEffect(() => {
        let cancelled = false;
        const loadIcons = async () => {
            const iconMap = new Map<string, ThemeWithIcon<Theme>>();
            await Promise.all(
                app.themes.all.map(async (theme) => {
                    const icon = await getAdaptiveIcon(
                        Theme.toEmotion(theme),
                        "baseUrl",
                    );
                    iconMap.set(theme.id, { theme, icon });
                }),
            );
            if (!cancelled) {
                iconsRef.current = iconMap;
                setIconsVersion((v) => v + 1);
            }
        };
        loadIcons();
        return () => {
            cancelled = true;
        };
    }, [app.themes.themes.size]);

    useEffect(() => {
        let cancelled = false;
        const setupAdaptive = async () => {
            const icon = await getAdaptiveIcon(currentTheme, "baseUrl");
            if (!cancelled) setAdaptiveIcon({ theme: currentTheme, icon });
        };
        setupAdaptive();
        return () => {
            cancelled = true;
        };
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

    const defaultThemes = useMemo(() => [baseDarkTheme, baseLightTheme], []);

    const defaultColorThemes = useMemo(
        () =>
            app.themes.all
                .filter((theme) => !theme.author)
                .filter(
                    (theme) =>
                        theme.id !== "baseDark" && theme.id !== "baseLight",
                ),
        [app.themes.all],
    );

    const normalThemes = useMemo(
        () => defaultColorThemes.filter((theme) => theme.style === "normal"),
        [defaultColorThemes],
    );

    const gradientThemes = useMemo(
        () => defaultColorThemes.filter((theme) => theme.style === "gradient"),
        [defaultColorThemes],
    );

    const userThemes = useMemo(
        () => app.themes.all.filter((theme) => theme.author),
        [app.themes.all],
    );

    const icons = iconsRef.current;

    const defaultIcons = useMemo(
        () => Array.from(icons.values()).filter((ic) => !ic.theme.author),
        [icons],
    );
    const userIcons = useMemo(
        () => Array.from(icons.values()).filter((ic) => ic.theme.author),
        [icons],
    );

    const handleThemeChange = (theme: MzTheme | Theme) => {
        if (theme.id === currentTheme.id) return;
        changeTheme(Theme.toEmotion(theme));
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

    const renderThemeColorBlob =
        (
            themes: (Theme | MzTheme)[],
            currentTheme: MzTheme,
            currentType: ThemeType | null,
            onDelete?: (id: string) => void,
            focusedThemeId?: string,
            isDeleting?: boolean,
            setFocusedTheme?: (id: string) => void,
        ) =>
        (index: number) => {
            const theme = themes[index];
            const description = theme.description || "No description";
            return (
                <Tooltip
                    key={`${theme.id}-top`}
                    title={
                        <TooltipWrapper typographyProps={{ level: "body-sm" }}>
                            {theme.name}
                        </TooltipWrapper>
                    }
                    placement="top"
                >
                    <Tooltip
                        key={`${theme.id}-bottom`}
                        title={
                            <TooltipWrapper
                                typographyProps={{ level: "body-xs" }}
                            >
                                {description}
                            </TooltipWrapper>
                        }
                        placement="bottom"
                    >
                        <Box
                            position="relative"
                            onMouseEnter={() => setFocusedTheme?.(theme.id)}
                            onMouseLeave={() => setFocusedTheme?.("")}
                            onFocus={() => setFocusedTheme?.(theme.id)}
                        >
                            {onDelete &&
                                (focusedThemeId === theme.id ||
                                    currentTheme.id === theme.id) && (
                                    <IconButton
                                        onClick={() => onDelete(theme.id)}
                                        css={{
                                            position: "absolute",
                                            bottom: -3,
                                            right: -3,
                                            zIndex: 1,
                                        }}
                                        color="danger"
                                        size={12}
                                        disabled={isDeleting}
                                    >
                                        <FaTrash />
                                    </IconButton>
                                )}
                            <ImageBlob
                                src={colorOrGradientToDataUrl(
                                    theme.colors.surface,
                                )}
                                onClick={() => handleThemeChange(theme)}
                                current={
                                    theme.id === currentTheme.id &&
                                    currentType === theme.type
                                }
                                onMouseEnter={() => setFocusedTheme?.(theme.id)}
                            />
                            {theme.id === currentTheme.id &&
                                currentType === theme.type && (
                                    <Stack
                                        position="absolute"
                                        top={-2}
                                        right={-2}
                                        alignItems="center"
                                        border={`2px solid ${currentTheme.colors.surface}`}
                                        justifyContent="center"
                                        fontSize="0.75rem"
                                        width="1.5rem"
                                        height="1.5rem"
                                        borderRadius="50%"
                                        css={{
                                            background:
                                                currentTheme.colors.primary,
                                            pointerEvents: "none",
                                        }}
                                    >
                                        <FaCheck
                                            color={
                                                currentTheme.typography.colors
                                                    .primary
                                            }
                                        />
                                    </Stack>
                                )}
                        </Box>
                    </Tooltip>
                </Tooltip>
            );
        };

    const renderIconBlob =
        (
            iconsArr: ThemeWithIcon<Theme>[],
            currentIcon: string | null,
            currentTheme: MzTheme,
        ) =>
        (index: number) => {
            const icon = iconsArr[index];
            return (
                <Tooltip
                    key={`${icon.theme.id}-icon`}
                    placement="top"
                    title={
                        <TooltipWrapper typographyProps={{ level: "body-sm" }}>
                            {icon.theme.name} Icon
                        </TooltipWrapper>
                    }
                >
                    <Box
                        position="relative"
                        display="inline-flex"
                        width="4rem"
                        height="4rem"
                    >
                        <ImageBlob
                            src={icon.icon}
                            css={{ width: "4rem", height: "4rem" }}
                            onClick={() => handleIconChange(icon.theme.id)}
                            current={icon.theme.id === currentIcon}
                        />
                        {icon.theme.id === currentIcon && (
                            <Stack
                                position="absolute"
                                top={-2}
                                right={-2}
                                alignItems="center"
                                border={`2px solid ${currentTheme.colors.surface}`}
                                justifyContent="center"
                                fontSize="0.75rem"
                                width="1.5rem"
                                height="1.5rem"
                                borderRadius="50%"
                                css={{
                                    background: currentTheme.colors.primary,
                                    pointerEvents: "none",
                                }}
                            >
                                <FaCheck
                                    color={
                                        currentTheme.typography.colors.primary
                                    }
                                />
                            </Stack>
                        )}
                    </Box>
                </Tooltip>
            );
        };

    return (
        <Stack direction="column" pt={2.5} pb={5} spacing={7.5}>
            <Paper
                direction="column"
                py={2.5}
                px={4}
                variant="outlined"
                spacing={5}
                borderRadius={10}
            >
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
                            openModal("theme-creator", <ThemeCreatorModal />)
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
                <Stack direction="column" spacing={2.5}>
                    <Typography fontWeight="bold" level="body-sm">
                        Default Themes
                    </Typography>
                    <Stack css={gridStyles} display="grid" spacing={2.5}>
                        {defaultThemes.map((_, idx) =>
                            renderThemeColorBlob(
                                defaultThemes,
                                currentTheme,
                                currentType,
                            )(idx),
                        )}
                        <Tooltip
                            title={
                                <TooltipWrapper
                                    typographyProps={{ level: "body-sm" }}
                                >
                                    Sync with System
                                </TooltipWrapper>
                            }
                            placement="top"
                        >
                            <Box position="relative">
                                <ImageBlob
                                    src={colorOrGradientToDataUrl(
                                        prefersDark
                                            ? baseDarkTheme.colors.surface
                                            : baseLightTheme.colors.surface,
                                    )}
                                    current={!currentType}
                                    onClick={() => handleSyncWithSystem()}
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
                                        background: currentTheme.colors.primary,
                                        pointerEvents: "none",
                                    }}
                                >
                                    {!currentType ? (
                                        <FaCheck
                                            color={
                                                currentTheme.typography.colors
                                                    .primary
                                            }
                                        />
                                    ) : (
                                        <FaRepeat
                                            color={
                                                currentTheme.typography.colors
                                                    .primary
                                            }
                                        />
                                    )}
                                </Stack>
                            </Box>
                        </Tooltip>
                    </Stack>
                </Stack>
                {userThemes.length > 0 && (
                    <Stack direction="column" spacing={2.5}>
                        <Typography fontWeight="bold" level="body-sm">
                            Your Themes
                        </Typography>
                        <VirtuosoGrid
                            style={{
                                height:
                                    userThemes.length > 10 ? "10rem" : "5rem",
                                width: "100%",
                            }}
                            totalCount={userThemes.length}
                            overscan={4}
                            components={{
                                List: VirtuosoGridList,
                                Item: VirtuosoGridItem,
                            }}
                            itemContent={renderThemeColorBlob(
                                userThemes,
                                currentTheme,
                                currentType,
                                deleteTheme,
                                focusedTheme,
                                isDeleting,
                                setFocusedTheme,
                            )}
                        />
                    </Stack>
                )}
                <Stack direction="column" spacing={2.5}>
                    <Typography fontWeight="bold" level="body-sm">
                        Color Themes
                    </Typography>
                    <Stack direction="column" spacing={2.5} mb={2.5}>
                        <Typography level="body-xs" fontWeight="bold">
                            Normal
                        </Typography>
                        <VirtuosoGrid
                            style={{ height: "10rem", width: "100%" }}
                            totalCount={normalThemes.length}
                            overscan={4}
                            components={{
                                List: VirtuosoGridList,
                                Item: VirtuosoGridItem,
                            }}
                            itemContent={renderThemeColorBlob(
                                normalThemes,
                                currentTheme,
                                currentType,
                            )}
                        />
                    </Stack>
                    <Divider
                        lineColor="muted"
                        css={{
                            opacity: 0.25,
                        }}
                    />
                    <Stack direction="column" spacing={2.5}>
                        <Typography level="body-xs" fontWeight="bold">
                            Gradient
                        </Typography>
                        <VirtuosoGrid
                            style={{ height: "10rem", width: "100%" }}
                            totalCount={gradientThemes.length}
                            overscan={4}
                            components={{
                                List: VirtuosoGridList,
                                Item: VirtuosoGridItem,
                            }}
                            itemContent={renderThemeColorBlob(
                                gradientThemes,
                                currentTheme,
                                currentType,
                            )}
                        />
                    </Stack>
                </Stack>
            </Paper>
            {icons.size > 0 && (
                <Paper
                    variant="outlined"
                    borderRadius={10}
                    direction="column"
                    py={2}
                    px={4}
                    spacing={2.5}
                >
                    <Typography level="body-lg" fontWeight="bolder">
                        Icons
                    </Typography>
                    <Stack direction="column" spacing={2.5}>
                        <Typography level="body-sm" fontWeight="bold">
                            Default Icons
                        </Typography>
                        <VirtuosoGrid
                            style={{
                                height: "10rem",
                                width: "100%",
                            }}
                            totalCount={defaultIcons.length + 1}
                            overscan={4}
                            components={{
                                List: VirtuosoGridList,
                                Item: VirtuosoGridItem,
                            }}
                            itemContent={(index: number) => {
                                if (index === 0) {
                                    return (
                                        <Tooltip
                                            title={
                                                <TooltipWrapper
                                                    paperProps={{
                                                        borderRadius: 10,
                                                    }}
                                                    typographyProps={{
                                                        level: "body-sm",
                                                    }}
                                                >
                                                    Adapt with current theme
                                                </TooltipWrapper>
                                            }
                                            placement="top"
                                        >
                                            <Box
                                                position="relative"
                                                display="inline-flex"
                                                width="4rem"
                                                height="4rem"
                                            >
                                                <ImageBlob
                                                    current={
                                                        !app.themes.currentIcon
                                                    }
                                                    onClick={() => {
                                                        handleIconChange(null);
                                                    }}
                                                    src={
                                                        adaptiveIcon?.icon ??
                                                        undefined
                                                    }
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
                                                            currentTheme.colors
                                                                .primary,
                                                        pointerEvents: "none",
                                                    }}
                                                >
                                                    {!app.themes.currentIcon ? (
                                                        <FaCheck
                                                            color={
                                                                currentTheme
                                                                    .typography
                                                                    .colors
                                                                    .primary
                                                            }
                                                        />
                                                    ) : (
                                                        <FaRepeat
                                                            color={
                                                                currentTheme
                                                                    .typography
                                                                    .colors
                                                                    .primary
                                                            }
                                                        />
                                                    )}
                                                </Stack>
                                            </Box>
                                        </Tooltip>
                                    );
                                }
                                return renderIconBlob(
                                    defaultIcons,
                                    app.themes.currentIcon,
                                    currentTheme,
                                )(index - 1);
                            }}
                        />
                    </Stack>
                    {userIcons.length > 0 && (
                        <Stack direction="column" spacing={2.5}>
                            <Typography level="body-sm" fontWeight="bold">
                                Your Icons
                            </Typography>
                            <VirtuosoGrid
                                style={{
                                    height:
                                        userIcons.length > 10
                                            ? "10rem"
                                            : "5rem",
                                    width: "100%",
                                }}
                                totalCount={userIcons.length}
                                overscan={4}
                                components={{
                                    List: VirtuosoGridList,
                                    Item: VirtuosoGridItem,
                                }}
                                itemContent={renderIconBlob(
                                    userIcons,
                                    app.themes.currentIcon,
                                    currentTheme,
                                )}
                            />
                        </Stack>
                    )}
                </Paper>
            )}
        </Stack>
    );
});
