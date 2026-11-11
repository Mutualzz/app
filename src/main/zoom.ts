import { app, type BrowserWindow, type Input } from "electron";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ZOOM_STEP = 0.5;
const MIN_ZOOM_LEVEL = -3;
const MAX_ZOOM_LEVEL = 5;

type ZoomAction = "in" | "out" | "reset";

function getZoomFilePath() {
  return join(app.getPath("userData"), "zoom.json");
}

function clampZoomLevel(level: number) {
  return Math.min(MAX_ZOOM_LEVEL, Math.max(MIN_ZOOM_LEVEL, level));
}

function readSavedZoomLevel() {
  try {
    const saved = JSON.parse(readFileSync(getZoomFilePath(), "utf8"));
    return typeof saved?.level === "number" ? clampZoomLevel(saved.level) : 0;
  } catch {
    return 0;
  }
}

function saveZoomLevel(level: number) {
  try {
    writeFileSync(getZoomFilePath(), JSON.stringify({ level }));
  } catch (error) {
    console.error("Failed to save zoom level:", error);
  }
}

function getZoomAction(input: Input): ZoomAction | null {
  if (input.type !== "keyDown") return null;
  if (!(input.control || input.meta) || input.alt) return null;

  if (
    input.key === "+" ||
    input.key === "=" ||
    input.code === "Equal" ||
    input.code === "NumpadAdd"
  )
    return "in";

  if (
    input.key === "-" ||
    input.code === "Minus" ||
    input.code === "NumpadSubtract"
  )
    return "out";

  if (input.key === "0" || input.code === "Digit0" || input.code === "Numpad0")
    return "reset";

  return null;
}

export function setupZoom(browserWindow: BrowserWindow) {
  const { webContents } = browserWindow;

  const applyZoom = (action: ZoomAction) => {
    const nextLevel =
      action === "reset"
        ? 0
        : clampZoomLevel(
            webContents.getZoomLevel() +
              (action === "in" ? ZOOM_STEP : -ZOOM_STEP)
          );

    webContents.setZoomLevel(nextLevel);
    saveZoomLevel(nextLevel);
  };

  webContents.on("did-finish-load", () => {
    webContents.setZoomLevel(readSavedZoomLevel());
  });

  webContents.on("before-input-event", (event, input) => {
    const action = getZoomAction(input);
    if (!action) return;

    event.preventDefault();
    applyZoom(action);
  });

  webContents.on("zoom-changed", (_event, zoomDirection) => {
    applyZoom(zoomDirection);
  });
}
