import { ipcMain } from "electron";

let erlpack: any;

// Lazy load erlpack
async function getErlpack() {
  if (!erlpack) {
    try {
      erlpack = await import("harmony-erlpack");
      console.log("[Codec] Erlpack loaded successfully");
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

      let arr: number[];

      if (encoded instanceof ArrayBuffer) {
        arr = Array.from(new Uint8Array(encoded));
      } else if (encoded instanceof Uint8Array || encoded instanceof Buffer) {
        arr = Array.from(encoded);
      } else if (Array.isArray(encoded)) {
        arr = encoded;
      } else {
        arr = Array.from(Buffer.from(encoded));
      }

      return arr;
    } catch (err) {
      console.error("Failed to encode ETF:", err);
      throw err;
    }
  });

  ipcMain.handle(
    "codec:etf-decode",
    async (_, payload: number[] | ArrayBuffer | Uint8Array) => {
      try {
        const pack = await getErlpack();

        let arrayBuffer: SharedArrayBuffer | ArrayBuffer;

        if (payload instanceof ArrayBuffer) {
          arrayBuffer = payload;
        } else if (payload instanceof Uint8Array) {
          arrayBuffer = payload.buffer.slice(
            payload.byteOffset,
            payload.byteOffset + payload.byteLength
          );
        } else {
          arrayBuffer = Uint8Array.from(payload).buffer;
        }

        return pack.unpack(arrayBuffer);
      } catch (err) {
        console.error("Failed to decode ETF:", err);
        throw err;
      }
    }
  );
}
