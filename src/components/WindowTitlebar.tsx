import { useAppStore } from "@hooks/useStores";
import { Box, Divider, IconButton, Paper, Stack, useTheme } from "@mutualzz/ui";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { detectOS } from "@utils/detect";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa";
import {
    VscChromeMaximize,
    VscChromeMinimize,
    VscClose,
} from "react-icons/vsc";

const WindowTitlebar = () => {
    const appWindow = getCurrentWindow();
    const { theme } = useTheme();
    const { updaterStore } = useAppStore();
    const [isMac, setIsMac] = useState(false);
    const [closeDanger, setCloseDanger] = useState(false);

    useEffect(() => {
        const checkMac = async () => {
            setIsMac((await detectOS()).toLowerCase() === "macos");
        };

        checkMac();

        return () => {
            setIsMac(false);
        };
    }, []);

    return (
        <Paper
            data-tauri-drag-region
            justifyContent="space-between"
            alignItems="center"
            elevation={3}
            py={isMac ? 10 : 0}
            width="100%"
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
                    <Stack px={isMac ? 15 : 0} alignItems="center">
                        <IconButton
                            onClick={() => updaterStore.installUpdate()}
                            size={16}
                            variant="plain"
                            color="success"
                        >
                            <FaDownload />
                        </IconButton>
                        {!isMac && (
                            <Divider
                                lineColor="neutral"
                                orientation="vertical"
                            />
                        )}
                    </Stack>
                )}
                {!isMac && (
                    <Stack direction="row" alignItems="center">
                        <IconButton
                            css={{
                                height: "100%",
                                borderRadius: 0,
                            }}
                            color={theme.typography.colors.primary}
                            size={16}
                            variant="plain"
                            onClick={() => appWindow.minimize()}
                        >
                            <VscChromeMinimize />
                        </IconButton>
                        <IconButton
                            css={{
                                height: "100%",
                                borderRadius: 0,
                            }}
                            color={theme.typography.colors.primary}
                            size={16}
                            variant="plain"
                            onClick={() => appWindow.toggleMaximize()}
                        >
                            <VscChromeMaximize />
                        </IconButton>
                        <IconButton
                            css={{
                                height: "100%",
                                borderRadius: 0,
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
                            size={16}
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
