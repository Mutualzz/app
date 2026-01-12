import { WINDOW_TITLEBAR_ZINDEX } from "@app-types/index.ts";
import { Paper } from "@components/Paper.tsx";
import { useDesktopShell } from "@contexts/DesktopShell.context.tsx";
import { useAppStore } from "@hooks/useStores.ts";
import {
    Box,
    Divider,
    IconButton,
    Stack,
    Typography,
    useTheme,
} from "@mutualzz/ui-web";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { isTauri } from "@utils/index.ts";
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

interface WindowTitleBarProps {
    onHeightChange?: (height: number) => void;
}

const WindowTitleBar = ({ onHeightChange }: WindowTitleBarProps) => {
    const appWindow = useMemo(() => (isTauri ? getCurrentWindow() : null), []);
    const { theme } = useTheme();
    const { os } = useDesktopShell();
    const app = useAppStore();
    const [closeDanger, setCloseDanger] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);

    const isMac = os.platform === "macos";

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
            py={isMac ? 2.5 : 1.5}
            variant={app.preferEmbossed ? "elevation" : "plain"}
            transparency={65}
            px={isMac ? 2 : 1.5}
            minHeight={isMac ? 44 : 32}
            width="100%"
            position="fixed"
            zIndex={WINDOW_TITLEBAR_ZINDEX}
            top={0}
            left={0}
            elevation={app.preferEmbossed ? 1 : 0}
            boxShadow="none !important"
        >
            <Box data-tauri-drag-region flex={1} />
            <Stack
                width="100%"
                spacing={1.25}
                direction="row"
                data-tauri-drag-region
                alignItems="center"
                justifyContent="center"
                flex={1}
            >
                {!app.mode && (
                    <>
                        <FaPeopleArrows />
                        <Typography fontWeight="bold">
                            Direct Messages
                        </Typography>
                    </>
                )}
                {app.mode === "spaces" && (
                    <>
                        <GiGalaxy />
                        <Typography fontWeight="bold">Spaces</Typography>
                    </>
                )}
                {app.mode === "feed" && (
                    <>
                        <ImFeed />
                        <Typography fontWeight="bold">Feed</Typography>
                    </>
                )}
            </Stack>
            <Stack
                flex={1}
                alignItems="center"
                px={isMac ? 1.25 : 0}
                justifyContent="flex-end"
                data-tauri-drag-region
            >
                {app.updater?.update && (
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
                                    filter: "opacity(0.25)",
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
                            }}
                            color={
                                closeDanger
                                    ? "danger"
                                    : theme.typography.colors.primary
                            }
                            onMouseEnter={() => setCloseDanger(true)}
                            onMouseLeave={() => setCloseDanger(false)}
                            variant={closeDanger ? "solid" : "plain"}
                            onClick={() => appWindow.close()}
                            size={18}
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
