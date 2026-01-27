import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores";
import { Button, LinearProgress, Stack, Typography } from "@mutualzz/ui-web";
import { Paper } from "@components/Paper.tsx";
import { Logo } from "@components/Logo.tsx";
import { isTauri } from "@utils/index";

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
            css={{
                pointerEvents: "auto",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
            }}
        >
            <Paper
                alignItems="center"
                justifyContent="center"
                width={420}
                maxWidth="calc(100vw - 32px)"
                padding={6}
                borderRadius={16}
                spacing={4}
                direction="column"
                elevation={app.preferEmbossed ? 2 : 1}
            >
                <Logo
                    css={{
                        width: 128,
                        height: 128,
                    }}
                />

                <Stack direction="column" spacing={1} alignItems="center">
                    <Typography level="title-lg">{title}</Typography>
                    {stage !== "error" ? (
                        <Typography
                            level="body-md"
                            variant="plain"
                            color="danger"
                        >
                            Don’t close the app.
                        </Typography>
                    ) : (
                        <Typography
                            level="body-md"
                            variant="plain"
                            color="danger"
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
                    />
                )}
                {(stage === "installing" || stage === "relaunching") && (
                    <LinearProgress color="success" value={100} determinate />
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
                    css={{ opacity: 0.7, marginTop: 10 }}
                >
                    You can minimize this window.
                </Typography>
            </Paper>
        </Stack>
    );
});
