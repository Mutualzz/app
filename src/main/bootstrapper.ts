import { BrowserWindow, ipcMain } from "electron";
import { connect } from "net";
import { createInterface } from "readline";
import { Logger } from "@mutualzz/logger";
import { setCloseBlocked } from "./windows";

const logger = new Logger({ tag: "Bootstrapper" });

const SOCKET_PATH =
  process.platform === "win32"
    ? "\\\\.\\pipe\\mutualzz-updater"
    : "/tmp/mutualzz-updater.sock";

// Mirrors OutboundMsg in Rust
type OutboundMsg =
  | { type: "UPDATE_AVAILABLE"; version: string }
  | {
      type: "DOWNLOAD_PROGRESS";
      percent: number;
      bytes_per_second: number;
      transferred: number;
      total: number;
    }
  | { type: "UPDATE_READY"; version: string }
  | { type: "UPDATE_ERROR"; message: string }
  | { type: "NO_UPDATE" };

type InboundMsg = { type: "APPLY_UPDATE" } | { type: "CHECK_UPDATE" };

let mainWindow: BrowserWindow | null = null;
let socketWriter: ((msg: InboundMsg) => void) | null = null;
let connected = false;

export function initBootstrapper(window: BrowserWindow): void {
  mainWindow = window;
  // Give the IPC server time to start after the update check completes
  setTimeout(() => attemptConnect(), 1000);
  setupIPC();
}

function setupIPC(): void {
  ipcMain.handle("updater:check", async () => {
    send({ type: "CHECK_UPDATE" });
  });

  // download is handled automatically by the bootstrapper
  ipcMain.handle("updater:download", async () => {});

  ipcMain.handle("updater:install", async () => {
    setCloseBlocked(false);
    send({ type: "APPLY_UPDATE" });
  });

  ipcMain.handle("updater:check-on-startup", async () => {
    send({ type: "CHECK_UPDATE" });
  });
}

// 20 retries × 1500ms = 30 seconds total
function attemptConnect(retries = 20, delayMs = 1500): void {
  if (retries <= 0) {
    logger.warn("Bootstrapper IPC: gave up connecting after all retries");
    return;
  }

  const sock = connect(SOCKET_PATH, () => {
    logger.info("Connected to bootstrapper IPC");
    connected = true;

    socketWriter = (msg: InboundMsg) => {
      sock.write(JSON.stringify(msg) + "\n");
    };

    const rl = createInterface({ input: sock });
    rl.on("line", (line) => {
      try {
        const msg: OutboundMsg = JSON.parse(line);
        handleMessage(msg);
      } catch (e) {
        logger.error("Failed to parse bootstrapper message:", e);
      }
    });
  });

  sock.on("error", (err) => {
    if (!connected) {
      logger.debug(
        `Bootstrapper IPC not ready yet (${err.message}), retrying in ${delayMs}ms...`
      );
      setTimeout(() => attemptConnect(retries - 1, delayMs), delayMs);
    } else {
      logger.error("Bootstrapper IPC socket error:", err);
    }
  });

  sock.on("close", () => {
    connected = false;
    socketWriter = null;
    logger.warn("Bootstrapper IPC connection closed");
  });
}

function send(msg: InboundMsg): void {
  if (socketWriter) {
    socketWriter(msg);
  } else {
    logger.warn("Bootstrapper IPC not connected, dropping message:", msg.type);
  }
}

function handleMessage(msg: OutboundMsg): void {
  const win = mainWindow;
  if (!win || win.isDestroyed()) return;

  switch (msg.type) {
    case "UPDATE_AVAILABLE":
      logger.info("Update available:", msg.version);
      win.webContents.send("updater:update-available", {
        version: msg.version,
        releaseDate: "",
        releaseNotes: ""
      });
      win.webContents.send("updater:downloading");
      break;

    case "DOWNLOAD_PROGRESS":
      win.webContents.send("updater:download-progress", {
        percent: msg.percent,
        bytesPerSecond: msg.bytes_per_second,
        transferred: msg.transferred,
        total: msg.total
      });
      break;

    case "UPDATE_READY":
      logger.info("Update ready:", msg.version);
      win.webContents.send("updater:update-downloaded");
      setCloseBlocked(true);
      break;

    case "UPDATE_ERROR":
      logger.error("Update error:", msg.message);
      win.webContents.send("updater:error", msg.message);
      setCloseBlocked(false);
      break;

    case "NO_UPDATE":
      logger.info("No update available");
      win.webContents.send("updater:no-update");
      setCloseBlocked(false);
      break;
  }
}
