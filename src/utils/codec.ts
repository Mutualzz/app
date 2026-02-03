import { isTauri } from ".";
import { JSONReplacer } from "./JSON";

export type Encoding = "json" | "etf";

export interface Codec {
    name: Encoding;
    encode(data: any): Uint8Array;
    decode(bytes: Uint8Array): any;
}

export async function createCodec(name: Encoding): Promise<Codec> {
    if (name === "etf" && !isTauri)
        return {
            name: "json",
            encode: (data) =>
                new TextEncoder().encode(JSON.stringify(data, JSONReplacer)),
            decode: (bytes) => JSON.parse(new TextDecoder().decode(bytes)),
        };

    return {
        name: "json",
        encode: (data) =>
            new TextEncoder().encode(JSON.stringify(data, JSONReplacer)),
        decode: (bytes) => JSON.parse(new TextDecoder().decode(bytes)),
    };
}
