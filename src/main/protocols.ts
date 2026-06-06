import { app, BrowserWindow } from "electron";

export function setupProtocols(mainWindow: BrowserWindow): void {
  // Handle deep links
  app.on("open-url", (event, url) => {
    event.preventDefault();
    mainWindow.webContents.send("deep-link", url);
  });
}
