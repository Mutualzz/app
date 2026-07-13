declare module "simple-rnnoise-wasm" {
  export class RNNoiseNode extends AudioWorkletNode {
    static register(
      context: BaseAudioContext,
      assets?: [string | URL, Promise<WebAssembly.Module>]
    ): Promise<void>;
    constructor(context: BaseAudioContext);
    update(keepalive?: boolean): void;
    onstatus: ((event: Event) => void) | null;
  }

  export function rnnoise_loadAssets(options?: {
    scriptSrc?: string | URL;
    moduleSrc?: string | BufferSource;
  }): [string | URL, Promise<WebAssembly.Module>];
}

declare module "simple-rnnoise-wasm/rnnoise.worklet.js?url" {
  const url: string;
  export default url;
}

declare module "simple-rnnoise-wasm/rnnoise.wasm?url" {
  const url: string;
  export default url;
}
