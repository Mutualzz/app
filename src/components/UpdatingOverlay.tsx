import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores";
import { Button, LinearProgress, Stack, Typography } from "@mutualzz/ui-web";
import { Paper } from "@components/Paper";
import { Logo } from "@components/Logo";
import { isTauri } from "@utils/index";
import { useEffect } from "react";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";

// TODO: Finish size locking on update overlay and automatic re-centering content after resize
export const UpdatingOverlay = observer(() => {
    const app = useAppStore();

    const stage = app.updater?.stage;

    const showDownloadOverlay =
        stage === "downloading" && !!app.updater?.showDownloadOverlay;

    const visible =
        stage === "installing" ||
        stage === "relaunching" ||
        showDownloadOverlay ||
        (app.updater?.forceUpdate && stage === "error");

    const updaterSize = new LogicalSize(420, 325);

    useEffect(() => {
        const appWindow = getCurrentWindow();
        if (!visible) {
            appWindow.setMaxSize(null);
            appWindow.setMinSize(null);
            appWindow.maximize();

            return;
        }

        appWindow.unmaximize();
        appWindow.setMinSize(updaterSize);
        appWindow.setMaxSize(updaterSize);
        appWindow.setSize(updaterSize);
        appWindow.center();
    }, [visible]);

    if (!visible) return null;

    const title =
        stage === "downloading"
            ? "Downloading update…"
            : stage === "installing"
              ? "Installing update…"
              : stage === "relaunching"
                ? "Restarting…"
                : "Update required";

    const progressPct = Math.round((app.updater?.progress ?? 0) * 100) || 0;

    return (
        <Stack
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={999999}
            alignItems="center"
            justifyContent="center"
            data-tauri-drag-region
        >
            <Paper
                alignItems="center"
                justifyContent="center"
                width="100%"
                maxWidth={updaterSize.width}
                padding={6}
                spacing={4}
                height={updaterSize.height}
                direction="column"
                elevation={app.settings?.preferEmbossed ? 2 : 1}
                data-tauri-drag-region
            >
                <Logo
                    css={{
                        width: 128,
                        height: 128,
                        userSelect: "none",
                        pointerEvents: "none",
                    }}
                />
                <Stack
                    direction="column"
                    spacing={1}
                    alignItems="center"
                    data-tauri-drag-region
                >
                    <Typography
                        level="title-lg"
                        css={{
                            userSelect: "none",
                        }}
                        data-tauri-drag-region
                    >
                        {title}
                    </Typography>
                    {stage !== "error" ? (
                        <Typography
                            level="body-md"
                            variant="plain"
                            color="danger"
                            css={{
                                userSelect: "none",
                            }}
                            data-tauri-drag-region
                        >
                            Don’t close the app.
                        </Typography>
                    ) : (
                        <Typography
                            level="body-md"
                            variant="plain"
                            color="danger"
                            css={{
                                userSelect: "none",
                            }}
                            data-tauri-drag-region
                        >
                            Update failed. Check your connection and retry.
                        </Typography>
                    )}
                </Stack>
                {stage === "downloading" && (
                    <LinearProgress
                        color="neutral"
                        value={progressPct}
                        determinate
                        data-tauri-drag-region
                    />
                )}
                {(stage === "installing" || stage === "relaunching") && (
                    <LinearProgress
                        color="success"
                        value={100}
                        determinate
                        data-tauri-drag-region
                    />
                )}
                {stage === "error" && (
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="soft"
                            color="primary"
                            onClick={() =>
                                app.updater?.checkForUpdates({
                                    isLaunchCheck: true,
                                    forceOnLaunch: true,
                                })
                            }
                        >
                            Retry
                        </Button>
                        {isTauri && (
                            <Button
                                variant="soft"
                                color="danger"
                                onClick={() => window.close()}
                            >
                                Quit
                            </Button>
                        )}
                    </Stack>
                )}

                <Typography
                    level="body-sm"
                    textColor="muted"
                    css={{ opacity: 0.7, marginTop: 10, userSelect: "none" }}
                    data-tauri-drag-region
                >
                    You can minimize this window.
                </Typography>
            </Paper>
        </Stack>
    );
});
