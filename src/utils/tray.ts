import type { Theme } from "@emotion/react";
import { Menu } from "@tauri-apps/api/menu";
import { resolveResource } from "@tauri-apps/api/path";
import { TrayIcon, type TrayIconOptions } from "@tauri-apps/api/tray";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { platform } from "@tauri-apps/plugin-os";
import { isSSR } from ".";
import { getAdaptiveIcon } from "./icons";

const TRAY_ID = "mz-tray";

let tray: TrayIcon | null = null;
let createLock: Promise<TrayIcon> | null = null;
let iconOpVersion = 0;
let iconUpdateRunning = false;

const isAdaptive = (theme: Theme) =>
    theme.id !== "baseDark" && theme.id !== "baseLight";

function pickMacAsset(theme: Theme, dpr: number) {
    const size = dpr >= 2 ? 44 : 22;
    return `icons/${theme.type}${isAdaptive(theme) ? "-adaptive" : ""}/${size}x${size}.png`;
}
function pickLinuxAsset(theme: Theme, dpr: number) {
    const size = dpr >= 1.5 ? 48 : 24;
    return `icons/${theme.type}${isAdaptive(theme) ? "-adaptive" : ""}/${size}x${size}.png`;
}
function pickWindowsAsset(theme: Theme) {
    return `icons/${theme.type}${isAdaptive(theme) ? "-adaptive" : ""}/icon.ico`;
}

async function resolveIconPath(theme: Theme) {
    const plat = platform();
    const dpr = window?.devicePixelRatio ?? 1;
    switch (plat) {
        case "macos":
            return resolveResource(pickMacAsset(theme, dpr));
        case "windows":
            return resolveResource(pickWindowsAsset(theme));
        default:
            return resolveResource(pickLinuxAsset(theme, dpr));
    }
}

async function leftClickAction() {
    const appWindow = getCurrentWindow();

    await appWindow.show();
    await appWindow.unminimize();
    await appWindow.setFocus();
}

async function dedupeTrays() {
    if (typeof (TrayIcon as any).getAll === "function") {
        const all: TrayIcon[] = await (TrayIcon as any).getAll();
        const dups = all.filter((t) => (t as any).id === TRAY_ID);

        // Keep the first, destroy the rest
        for (let i = 1; i < dups.length; i++) {
            try {
                await dups[i].close();
            } catch {}
        }
    }
}

async function onTrayMenuClick(itemId: string) {
    const appWindow = getCurrentWindow();

    switch (itemId) {
        case "quit": {
            await appWindow.close();
            await appWindow.destroy();
            break;
        }
    }
}

async function ensureTrayBase(extraOpts?: TrayIconOptions) {
    if (tray) return tray;

    if (!createLock) {
        createLock = (async () => {
            await dedupeTrays();

            const opts: TrayIconOptions = {
                id: TRAY_ID,
                tooltip: "Mutualzz",
                title: "Mutualzz",
                action: (e) => {
                    switch (e.type) {
                        case "Click": {
                            if (e.button === "Left" && e.buttonState === "Down")
                                leftClickAction();
                        }
                    }
                },
                showMenuOnLeftClick: false,
                ...extraOpts,
            };

            const existing = await TrayIcon.getById(TRAY_ID);
            let tr = existing ?? (await TrayIcon.new(opts));

            try {
                if ("setAction" in tr && typeof tr.setAction === "function") {
                    await tr.setAction(opts.action);
                } else if (existing) {
                    try {
                        await tr.close();
                    } catch {}
                    tr = await TrayIcon.new(opts);
                }
            } catch {
                try {
                    await tr.close();
                } catch {}
                tr = await TrayIcon.new(opts);
            }

            tray = tr;
            return tr;
        })().finally(() => {
            createLock = null;
        });
    }

    return createLock;
}

export async function updateTrayProperties(theme: Theme) {
    const myVersion = ++iconOpVersion;

    while (iconUpdateRunning) await new Promise((r) => setTimeout(r, 10));
    iconUpdateRunning = true;
    try {
        const t = await ensureTrayBase();

        if (myVersion !== iconOpVersion) return;

        const iconUrl = await resolveIconPath(theme);
        if (myVersion !== iconOpVersion) return;

        const icon = await getAdaptiveIcon(theme, "automatic", iconUrl);
        if (myVersion !== iconOpVersion) return;

        const menu = await Menu.new({
            id: "mz-tray-menu",
            items: [
                {
                    id: "brand",
                    text: "Mutualzz",
                    enabled: false,
                    icon,
                },
                {
                    item: "Separator",
                },
                {
                    id: "quit",
                    text: "Quit",
                    action: onTrayMenuClick,
                    item: "Quit",
                },
            ],
        });

        await t.setMenu(menu);
        await t.setIcon(icon);
    } catch {
    } finally {
        iconUpdateRunning = false;
    }
}

export async function getTray(
    theme: Theme,
    extraOpts?: TrayIconOptions,
): Promise<TrayIcon> {
    const t = await ensureTrayBase(extraOpts);
    await updateTrayProperties(theme);
    return t;
}

if (import.meta.hot) {
    import.meta.hot.dispose(async () => {
        iconOpVersion++;
        try {
            if (tray) await tray.close();
        } catch {}
        tray = null;
    });
}

if (!isSSR) {
    window.addEventListener("beforeunload", () => {
        iconOpVersion++;
    });
}
