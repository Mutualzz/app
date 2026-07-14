import { app } from "electron";
import { setPendingDeepLink } from "./ipc";
import { getMainWindow } from "./windows";

export function setupProtocols(): void {
  app.on("open-url", (event, url) => {
    event.preventDefault();
    const win = getMainWindow();
    if (!win || win.isDestroyed()) {
      setPendingDeepLink(url);
      return;
    }
    win.webContents.send("deep-link", url);
  });
}
