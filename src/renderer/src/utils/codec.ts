import { JSONReplacer } from "./JSON";

export type Encoding = "json" | "etf";

export interface Codec {
    name: Encoding;
    encode(data: any): Uint8Array;
    decode(bytes: Uint8Array): any;
}

export async function createCodec(): Promise<Codec> {
    return {
        name: "json",
        encode: (data) =>
            new TextEncoder().encode(JSON.stringify(data, JSONReplacer)),
        decode: (bytes) => JSON.parse(new TextDecoder().decode(bytes))
    };
}
