import { useAppStore } from "@hooks/useStores";
import {
    Box,
    Divider,
    IconButton,
    Paper,
    Stack,
    useTheme,
} from "@mutualzz/ui-web";
import { Image } from "@tauri-apps/api/image";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { detectOS } from "@utils/detect";
import { observer } from "mobx-react";
import { useEffect, useRef, useState } from "react";
import { FaDownload } from "react-icons/fa";
import {
    VscChromeMaximize,
    VscChromeMinimize,
    VscClose,
} from "react-icons/vsc";

interface WindowTitlebarProps {
    onHeightChange?: (height: number) => void;
}

const WindowTitlebar = ({ onHeightChange }: WindowTitlebarProps) => {
    const appWindow = getCurrentWindow();
    const { theme } = useTheme();
    const { updaterStore } = useAppStore();
    const [isMac, setIsMac] = useState(false);
    const [closeDanger, setCloseDanger] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const checkMac = async () => {
            setIsMac((await detectOS()).toLowerCase() === "macos");
        };

        checkMac();

        return () => {
            setIsMac(false);
        };
    }, []);

    useEffect(() => {
        const iconUrl =
            theme.type === "light" ? "/icon-light.png" : "/icon.png";

        (async () => {
            try {
                const bytes = await fetch(iconUrl).then((res) =>
                    res.arrayBuffer(),
                );
                const icon = await Image.fromBytes(bytes);

                await appWindow.setIcon(icon);
            } catch (e) {
                console.error("Failed to load window icon:", e);
            }
        })();
    }, [theme]);

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
            elevation={2}
            py={isMac ? 10 : 4}
            px={isMac ? 8 : 6}
            minHeight={isMac ? 44 : 32}
            width="100%"
            position="fixed"
            zIndex={99999999}
            top={0}
            left={0}
            css={{ backdropFilter: "saturate(120%) blur(6px)" }}
        >
            <Box data-tauri-drag-region flex={1} />
            <Box data-tauri-drag-region flex={1} />
            <Stack
                flex={1}
                alignItems="center"
                px={isMac ? 5 : 0}
                justifyContent="flex-end"
                data-tauri-drag-region
            >
                {updaterStore?.update && (
                    <Stack px={isMac ? 15 : 0} alignItems="center" spacing={8}>
                        <IconButton
                            onClick={() => updaterStore.installUpdate()}
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
                                lineColor="primary"
                                orientation="vertical"
                            />
                        )}
                    </Stack>
                )}
                {!isMac && (
                    <Stack direction="row" alignItems="center" css={{ gap: 6 }}>
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

export default observer(WindowTitlebar);
