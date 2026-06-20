import { desktopCapturer, session, systemPreferences } from "electron";

export function setupDisplayMedia() {
  session.defaultSession.setDisplayMediaRequestHandler(
    async (request, callback) => {
      try {
        const sources = await desktopCapturer.getSources({
          types: ["screen", "window"],
          thumbnailSize: { width: 0, height: 0 }
        });

        const screen =
          sources.find((source) => source.id.startsWith("screen:")) ??
          sources[0];

        if (!screen) {
          callback({});
          return;
        }

        callback({
          video: screen,
          ...(request.audioRequested ? { audio: "loopback" } : {})
        });
      } catch {
        callback({});
      }
    },
    { useSystemPicker: true }
  );
}

export async function listDesktopCaptureSources() {
  const sources = await desktopCapturer.getSources({
    types: ["screen", "window"],
    thumbnailSize: { width: 320, height: 180 },
    fetchWindowIcons: true
  });

  return sources.map((source) => ({
    id: source.id,
    name: source.name,
    thumbnail: source.thumbnail.toDataURL(),
    appIcon:
      source.appIcon && !source.appIcon.isEmpty()
        ? source.appIcon.toDataURL()
        : null
  }));
}

export function getScreenCaptureAccessStatus() {
  if (process.platform !== "darwin") return "granted";
  return systemPreferences.getMediaAccessStatus("screen");
}
