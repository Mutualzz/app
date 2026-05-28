import { app, BrowserWindow, Menu, nativeImage, Tray } from "electron";
import { EventEmitter } from "events";
import iconPng from "../../resources/icons/base/icon.png?asset";
import { setQuitting } from "./windows";
import NativeImage = Electron.NativeImage;

class TrayManager extends EventEmitter {
    private tray: Tray | null = null;
    private mainWindow: BrowserWindow | null = null;

    constructor() {
        super();
    }

    updateMenu(icon: NativeImage) {
        try {
            const contextMenu = Menu.buildFromTemplate([
                {
                    label: "Mutualzz",
                    icon,
                    enabled: false
                },
                { type: "separator" },
                {
                    label: "Quit",
                    click: () => {
                        setQuitting(true);
                        app.quit();
                    }
                }
            ]);

            if (this.tray) {
                this.tray.setContextMenu(contextMenu);
                this.tray.setToolTip("Mutualzz");
            }
        } catch (err) {
            console.error("Failed to update tray menu:", err);
        }
    }

    initialize(mainWindow: BrowserWindow): void {
        this.mainWindow = mainWindow;
        this.createTray();
    }

    updateIcon(dataUrl: string): void {
        if (!this.tray) return;

        try {
            const icon = nativeImage
                .createFromDataURL(dataUrl)
                .resize({ width: 16, height: 16 });

            this.tray.setImage(icon);
            this.updateMenu(icon);

            this.emit("icon-updated");
        } catch (err) {
            console.error("Failed to update tray icon:", err);
        }
    }

    /**
     * Set window icon from data URL
     */
    setWindowIcon(mainWindow: BrowserWindow, dataUrl: string): void {
        if (!mainWindow) return;

        try {
            const icon = nativeImage.createFromDataURL(dataUrl);
            mainWindow.setIcon(icon);
            this.emit("window-icon-updated");
        } catch (err) {
            console.error("Failed to set window icon:", err);
        }
    }

    destroy(): void {
        if (this.tray) {
            this.tray.destroy();
            this.tray = null;
        }
    }

    private createTray(): void {
        try {
            const icon = nativeImage.createFromPath(iconPng);

            this.tray = new Tray(icon.resize({ width: 16, height: 16 }));

            const contextMenu = Menu.buildFromTemplate([
                {
                    label: "Mutualzz",
                    icon: icon.resize({ width: 16, height: 16 }),
                    enabled: false
                },
                { type: "separator" },
                {
                    label: "Quit",
                    click: () => {
                        setQuitting(true);
                        app.quit();
                    }
                }
            ]);

            this.tray.setContextMenu(contextMenu);
            this.tray.setToolTip("Mutualzz");

            this.tray.on("click", () => {
                if (this.mainWindow) {
                    if (this.mainWindow.isVisible()) {
                        this.mainWindow.hide();
                    } else {
                        this.mainWindow.show();
                        this.mainWindow.focus();
                    }
                }
            });
        } catch (err) {
            console.error("Failed to create tray:", err);
        }
    }
}

export const trayManager = new TrayManager();
