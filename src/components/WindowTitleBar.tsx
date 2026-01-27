import { WINDOW_TITLEBAR_ZINDEX } from "@app-types/index";
import { Paper } from "@components/Paper.tsx";
import { useDesktopShell } from "@contexts/DesktopShell.context.tsx";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import {
    Button,
    Divider,
    IconButton,
    Stack,
    Typography,
    useTheme,
} from "@mutualzz/ui-web";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { isTauri } from "@utils/index";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaDownload, FaPeopleArrows } from "react-icons/fa";
import { GiGalaxy } from "react-icons/gi";
import { ImFeed } from "react-icons/im";
import {
    VscChromeMaximize,
    VscChromeMinimize,
    VscClose,
} from "react-icons/vsc";
import { ThemeCreatorModal } from "./ThemeCreator/ThemeCreatorModal";

interface WindowTitleBarProps {
    onHeightChange?: (height: number) => void;
}

const WindowTitleBar = ({ onHeightChange }: WindowTitleBarProps) => {
    const appWindow = useMemo(() => (isTauri ? getCurrentWindow() : null), []);
    const app = useAppStore();
    const { inPreview, stopPreview, values } = app.themeCreator;
    const { openModal } = useModal();
    const { theme, changeTheme } = useTheme();
    const { os } = useDesktopShell();

    const [closeDanger, setCloseDanger] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);

    const isMac = os.platform === "macos";

    const stage = app.updater?.stage;

    const isUpdating = stage === "installing" || stage === "relaunching";

    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;

        const setHeight = () => {
            const height = Math.ceil(el.getBoundingClientRect().height);
            onHeightChange?.(height);
        };

        setHeight();

        const ro = new ResizeObserver(setHeight);
        ro.observe(el);
        return () => {
            ro.disconnect();
            onHeightChange?.(0);
        };
    }, [isMac]);

    return (
        <Paper
            ref={rootRef}
            data-tauri-drag-region
            justifyContent="space-between"
            alignItems="center"
            p={1.5}
            variant={app.preferEmbossed ? "elevation" : "plain"}
            transparency={65}
            minHeight={44}
            width="100%"
            position="fixed"
            zIndex={WINDOW_TITLEBAR_ZINDEX}
            top={0}
            left={0}
            elevation={app.preferEmbossed ? 1 : 0}
            boxShadow="none !important"
        >
            <Stack alignItems="center" data-tauri-drag-region flex={1}>
                {inPreview && (
                    <Stack pl={20} spacing={5} alignItems="center">
                        <Typography fontWeight="bold" ml={2}>
                            Currently previewing a theme
                            {values.name ? `: ${values.name}` : ""}
                        </Typography>
                        <Button
                            onClick={() => {
                                openModal(
                                    "theme-creator",
                                    <ThemeCreatorModal />,
                                );
                                stopPreview(changeTheme);
                            }}
                            variant="solid"
                            color="danger"
                        >
                            Stop preview
                        </Button>
                    </Stack>
                )}
            </Stack>
            <Stack
                width="100%"
                spacing={1.25}
                direction="row"
                data-tauri-drag-region
                alignItems="center"
                justifyContent="center"
                flex={1}
            >
                {app.mode === "@me" && (
                    <>
                        <FaPeopleArrows data-tauri-drag-region />
                        <Typography data-tauri-drag-region fontWeight="bold">
                            Direct Messages
                        </Typography>
                    </>
                )}
                {app.mode === "spaces" && (
                    <>
                        <GiGalaxy data-tauri-drag-region />
                        <Typography data-tauri-drag-region fontWeight="bold">
                            Spaces
                        </Typography>
                    </>
                )}
                {app.mode === "feed" && (
                    <>
                        <ImFeed data-tauri-drag-region />
                        <Typography data-tauri-drag-region fontWeight="bold">
                            Feed
                        </Typography>
                    </>
                )}
            </Stack>
            <Stack
                flex={1}
                alignItems="center"
                justifyContent="flex-end"
                data-tauri-drag-region
            >
                {appWindow && app.updater?.update && (
                    <Stack
                        px={isMac ? 3.75 : 0}
                        alignItems="center"
                        spacing={2}
                    >
                        <IconButton
                            onClick={() => app.updater?.installUpdate()}
                            size={18}
                            variant="plain"
                            color="success"
                            css={{
                                height: 32,
                                width: 32,
                                padding: 4,
                                borderRadius: 6,
                                transition: "background .12s, color .12s",
                            }}
                        >
                            <FaDownload />
                        </IconButton>
                        {!isMac && (
                            <Divider
                                lineColor="neutral"
                                orientation="vertical"
                                css={{
                                    marginRight: 8,
                                    opacity: 0.25,
                                }}
                            />
                        )}
                    </Stack>
                )}
                {!isMac && appWindow && isTauri && (
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <IconButton
                            css={{
                                height: 32,
                                width: 32,
                                borderRadius: 0,
                                padding: 4,
                            }}
                            color={theme.typography.colors.primary}
                            size={18}
                            variant="plain"
                            onClick={() => appWindow.minimize()}
                        >
                            <VscChromeMinimize />
                        </IconButton>
                        <IconButton
                            css={{
                                height: 32,
                                width: 32,
                                borderRadius: 0,
                                padding: 4,
                            }}
                            color={theme.typography.colors.primary}
                            size={18}
                            variant="plain"
                            onClick={() => appWindow.toggleMaximize()}
                        >
                            <VscChromeMaximize />
                        </IconButton>
                        <IconButton
                            css={{
                                height: 32,
                                width: 32,
                                borderRadius: 0,
                                padding: 4,
                                transition: "background .12s, color .12s",
                                opacity: isUpdating ? 0.45 : 1,
                                pointerEvents: isUpdating ? "none" : "auto",
                            }}
                            color={
                                closeDanger
                                    ? "danger"
                                    : theme.typography.colors.primary
                            }
                            onMouseEnter={() =>
                                !isUpdating && setCloseDanger(true)
                            }
                            onMouseLeave={() => setCloseDanger(false)}
                            variant={closeDanger ? "solid" : "plain"}
                            onClick={() => appWindow.close()}
                            size={18}
                            title={
                                isUpdating ? "Updating… please wait" : "Close"
                            }
                        >
                            <VscClose />
                        </IconButton>
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
};

export default observer(WindowTitleBar);
