import { app } from "electron";
import { existsSync } from "fs";
import path from "path";

const AUTOSTART_NAME = "Mutualzz";

function windowsBootstrapperPath(): string | null {
  const localAppData = process.env.LOCALAPPDATA;
  if (!localAppData) return null;

  const updateExe = path.join(localAppData, "Mutualzz", "Update.exe");
  return existsSync(updateExe) ? updateExe : null;
}

function autostartExecutablePath(): string {
  if (process.platform === "win32") {
    const bootstrapper = windowsBootstrapperPath();
    if (bootstrapper) return bootstrapper;
  }

  return process.execPath;
}

export function setAutostart(enabled: boolean): void {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    path: autostartExecutablePath(),
    name: AUTOSTART_NAME
  });
}

export function getAutostart(): boolean {
  const expected = autostartExecutablePath();
  const settings = app.getLoginItemSettings({
    path: expected
  });

  return settings.openAtLogin;
}
