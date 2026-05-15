import { ipcMain } from "electron";

let erlpack: any;

// Lazy load erlpack
async function getErlpack() {
    if (!erlpack) {
        try {
            erlpack = await import("erlpack");
        } catch (err) {
            console.error("Failed to load erlpack:", err);
            throw new Error("ETF codec unavailable");
        }
    }
    return erlpack;
}

export function setupCodecIPC(): void {
    ipcMain.handle("codec:etf-encode", async (_, payload: any) => {
        try {
            const pack = await getErlpack();
            const encoded = pack.pack(payload);

            return Array.from(encoded);
        } catch (err) {
            console.error("Failed to encode ETF:", err);
            throw err;
        }
    });

    ipcMain.handle("codec:etf-decode", async (_, payload: number[]) => {
        try {
            const pack = await getErlpack();
            const buffer = Buffer.from(payload);

            return pack.unpack(buffer);
        } catch (err) {
            console.error("Failed to decode ETF:", err);
            throw err;
        }
    });
}
