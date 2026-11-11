import { spawn } from "child_process";
import { shell } from "electron";

const INHERITED_BROWSER_VARIABLES = /^(CHROME_|ELECTRON_|GOOGLE_)/i;

export function isWebUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function browserLaunchEnvironment() {
  return Object.fromEntries(
    Object.entries(process.env).filter(
      ([variableName]) => !INHERITED_BROWSER_VARIABLES.test(variableName)
    )
  );
}

export async function openExternalUrl(url: string) {
  const parsed = new URL(url);

  if (process.platform === "win32") {
    spawn("rundll32.exe", ["url.dll,FileProtocolHandler", parsed.toString()], {
      env: browserLaunchEnvironment(),
      detached: true,
      stdio: "ignore",
      windowsHide: true
    }).unref();
    return;
  }

  await shell.openExternal(parsed.toString());
}
