import {
  Modal,
  Option,
  Select,
  Stack,
  Switch,
  Typography
} from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores";
import { Paper } from "@components/Paper";
import { Button } from "@components/Button";
import {
  isScreenCaptureSource,
  openScreenCaptureSettings
} from "@utils/screenCapture.utils";
import { isElectron } from "@utils/index";
import {
  SCREEN_SHARE_QUALITY_OPTIONS,
  type ScreenShareQuality
} from "@utils/voiceSettings.utils";
import { useEffect, useState } from "react";
import { DesktopIcon, MonitorIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

export const ScreenSharePicker = observer(() => {
  const app = useAppStore();
  const voice = app.voice;
  const { t } = useTranslation("chat");
  const { t: tCommon } = useTranslation("common");
  const [tab, setTab] = useState<"screen" | "window">("screen");
  const [permissionAppName, setPermissionAppName] = useState("Electron");
  const [packaged, setPackaged] = useState(true);

  const sources = voice.screenSharePickerSources;
  const screens = sources.filter(isScreenCaptureSource);
  const windows = sources.filter((source) => !isScreenCaptureSource(source));
  const visible = tab === "screen" ? screens : windows;
  const selectedSource = sources.find(
    (source) => source.id === voice.screenSharePickerSelectedId
  );

  const usesDesktopPicker =
    isElectron && Boolean(window.api?.desktop?.listCaptureSources);
  const canGoLive =
    !usesDesktopPicker || Boolean(voice.screenSharePickerSelectedId);

  useEffect(() => {
    if (!voice.screenSharePickerOpen) return;

    void (async () => {
      const name = window.api?.app?.getName
        ? await window.api.app.getName()
        : "Electron";
      setPermissionAppName(name);
      setPackaged((await window.api?.app?.isPackaged?.()) ?? false);
    })();
  }, [voice.screenSharePickerOpen]);

  return (
    <Modal
      open={voice.screenSharePickerOpen}
      onClose={() => voice.cancelScreenSharePicker()}
    >
      <Paper
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        borderRadius={12}
        p={3}
        direction="row"
        spacing={3}
        width={860}
        maxWidth="95vw"
        css={{ maxHeight: "90vh" }}
      >
        <Stack flex={1} minWidth={0} direction="column" spacing={2.5}>
          <Typography level="h5" fontWeight="bold">
            {t("voice.screenShare.title")}
          </Typography>

          {usesDesktopPicker ? (
            <>
              <Stack direction="row" spacing={1.25}>
                <Button
                  variant={tab === "screen" ? "solid" : "soft"}
                  color="neutral"
                  onClick={() => setTab("screen")}
                >
                  {t("voice.screenShare.entireScreen", { count: screens.length })}
                </Button>
                <Button
                  variant={tab === "window" ? "solid" : "soft"}
                  color="neutral"
                  onClick={() => setTab("window")}
                >
                  {t("voice.screenShare.applicationWindow", {
                    count: windows.length
                  })}
                </Button>
              </Stack>

              {visible.length === 0 ? (
                <Stack
                  direction="column"
                  spacing={1.5}
                  alignItems="center"
                  py={4}
                  flex={1}
                  justifyContent="center"
                >
                  <MonitorIcon size={40} weight="fill" />
                  <Typography textColor="muted" textAlign="center">
                    {tab === "screen"
                      ? t("voice.screenShare.noScreens")
                      : t("voice.screenShare.noWindows")}
                  </Typography>
                  <Typography level="body-sm" textColor="muted" textAlign="center">
                    {t("voice.screenShare.permissionHint", {
                      appName: permissionAppName
                    })}
                    {!packaged && ` ${t("voice.screenShare.permissionDevHint")}`}
                  </Typography>
                  <Button
                    variant="soft"
                    color="neutral"
                    onClick={() => void openScreenCaptureSettings()}
                  >
                    {t("voice.screenShare.openSystemSettings")}
                  </Button>
                </Stack>
              ) : (
                <Paper
                  display="grid"
                  css={{
                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: 12,
                    maxHeight: 420,
                    overflowY: "auto"
                  }}
                >
                  {visible.map((source) => {
                    const selected =
                      voice.screenSharePickerSelectedId === source.id;

                    return (
                      <Paper
                        key={source.id}
                        variant={selected ? "solid" : "soft"}
                        color={selected ? "success" : "neutral"}
                        borderRadius={12}
                        p={1.5}
                        direction="column"
                        spacing={1.25}
                        css={{ cursor: "pointer" }}
                        onClick={() =>
                          voice.setScreenSharePickerSelectedId(source.id)
                        }
                      >
                        <Paper
                          borderRadius={8}
                          css={{
                            overflow: "hidden",
                            aspectRatio: "16 / 9",
                            backgroundColor: "#111"
                          }}
                        >
                          <img
                            src={source.thumbnail}
                            alt={source.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block"
                            }}
                          />
                        </Paper>
                        <Typography
                          level="body-sm"
                          css={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {source.name}
                        </Typography>
                      </Paper>
                    );
                  })}
                </Paper>
              )}
            </>
          ) : (
            <Stack
              direction="column"
              spacing={2}
              alignItems="center"
              justifyContent="center"
              py={6}
              flex={1}
            >
              <DesktopIcon size={48} weight="fill" />
              <Typography textAlign="center" textColor="muted">
                {t("voice.screenShare.browserPickerHint")}
              </Typography>
            </Stack>
          )}
        </Stack>

        <Paper
          width={260}
          minWidth={240}
          direction="column"
          spacing={2.5}
          p={2.5}
          variant="soft"
          borderRadius={12}
          justifyContent="space-between"
        >
          <Stack direction="column" spacing={2.5}>
            <Typography level="body-sm" fontWeight="bold">
              {t("voice.screenShare.streamSettings")}
            </Typography>

            {selectedSource && (
              <Paper
                borderRadius={8}
                css={{
                  overflow: "hidden",
                  aspectRatio: "16 / 9",
                  backgroundColor: "#111"
                }}
              >
                <img
                  src={selectedSource.thumbnail}
                  alt={selectedSource.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block"
                  }}
                />
              </Paper>
            )}

            <Stack direction="column" spacing={1}>
              <Typography level="body-xs" textColor="muted">
                {t("voice.screenShare.streamQuality")}
              </Typography>
              <Select
                value={voice.screenSharePickerQuality}
                color="neutral"
                onValueChange={(value) => {
                  if (typeof value !== "string") return;
                  voice.setScreenSharePickerQuality(value as ScreenShareQuality);
                }}
              >
                {SCREEN_SHARE_QUALITY_OPTIONS.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </Option>
                ))}
              </Select>
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Stack direction="column" spacing={0.5} flex={1}>
                <Typography level="body-sm" fontWeight="bold">
                  {t("voice.screenShare.shareAudio")}
                </Typography>
                <Typography level="body-xs" textColor="muted">
                  {t("voice.screenShare.shareAudioDescription")}
                </Typography>
              </Stack>
              <Switch
                checked={voice.screenSharePickerIncludeAudio}
                onChange={(event) =>
                  voice.setScreenSharePickerIncludeAudio(event.target.checked)
                }
              />
            </Stack>

            {!packaged && (
              <Typography level="body-xs" textColor="muted">
                {t("voice.screenShare.devBuildHint", {
                  appName: permissionAppName
                })}
              </Typography>
            )}
          </Stack>

          <Stack direction="column" spacing={1.25}>
            <Button
              color="success"
              disabled={!canGoLive}
              onClick={() => voice.confirmScreenSharePicker()}
            >
              {t("voice.screenShare.goLive")}
            </Button>
            <Button
              variant="soft"
              color="neutral"
              onClick={() => voice.cancelScreenSharePicker()}
            >
              {tCommon("cancel")}
            </Button>
          </Stack>
        </Paper>
      </Paper>
    </Modal>
  );
});
