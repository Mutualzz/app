import { RNNoiseNode, rnnoise_loadAssets } from "simple-rnnoise-wasm";
import workletUrl from "simple-rnnoise-wasm/rnnoise.worklet.js?url";
import wasmUrl from "simple-rnnoise-wasm/rnnoise.wasm?url";

const RNNOISE_SAMPLE_RATE = 48000;
const RNNOISE_WET = 0.82;
const RNNOISE_DRY = 0.18;

export type MicProcessHandle = {
  processedTrack: MediaStreamTrack;
  micGainNode: GainNode;
  audioContext: AudioContext;
  dispose: () => void;
  usedRnnoise: boolean;
};

let assetsPromise: Promise<ReturnType<typeof rnnoise_loadAssets>> | null =
  null;
let loggedRegisterFailure = false;

async function loadRnnoiseAssets() {
  if (!assetsPromise) {
    assetsPromise = (async () => {
      const wasmResponse = await fetch(wasmUrl);
      if (!wasmResponse.ok) {
        throw new Error(`Failed to fetch RNNoise WASM (${wasmResponse.status})`);
      }
      const wasmBytes = await wasmResponse.arrayBuffer();
      return rnnoise_loadAssets({
        scriptSrc: workletUrl,
        moduleSrc: wasmBytes
      });
    })().catch((err) => {
      assetsPromise = null;
      throw err;
    });
  }
  return assetsPromise;
}

async function ensureRnnoiseRegistered(audioContext: AudioContext) {
  const assets = await loadRnnoiseAssets();
  await RNNoiseNode.register(audioContext, assets);
}

export function createMicAudioContext(): AudioContext {
  return new AudioContext({ sampleRate: RNNOISE_SAMPLE_RATE });
}

export async function createMicProcessedTrack(
  audioContext: AudioContext,
  rawTrack: MediaStreamTrack,
  options: { useRnnoise: boolean; gain: number }
): Promise<MicProcessHandle> {
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  const source = audioContext.createMediaStreamSource(
    new MediaStream([rawTrack])
  );
  const micGain = audioContext.createGain();
  micGain.gain.value = options.gain;
  const destination = audioContext.createMediaStreamDestination();

  let rnnoise: RNNoiseNode | null = null;
  let wetGain: GainNode | null = null;
  let dryGain: GainNode | null = null;
  let usedRnnoise = false;

  if (options.useRnnoise) {
    try {
      await ensureRnnoiseRegistered(audioContext);
      rnnoise = new RNNoiseNode(audioContext);
      wetGain = audioContext.createGain();
      dryGain = audioContext.createGain();
      wetGain.gain.value = RNNOISE_WET;
      dryGain.gain.value = RNNOISE_DRY;
      source.connect(rnnoise);
      rnnoise.connect(wetGain);
      wetGain.connect(micGain);
      source.connect(dryGain);
      dryGain.connect(micGain);
      usedRnnoise = true;
    } catch (err) {
      if (!loggedRegisterFailure) {
        loggedRegisterFailure = true;
        console.warn("[rnnoise] failed to initialize; using browser NS", err);
      }
      rnnoise = null;
      wetGain = null;
      dryGain = null;
      usedRnnoise = false;
      source.connect(micGain);
    }
  } else {
    source.connect(micGain);
  }

  micGain.connect(destination);

  const [processedTrack] = destination.stream.getAudioTracks();
  if (!processedTrack) {
    try {
      source.disconnect();
    } catch {}
    try {
      rnnoise?.disconnect();
    } catch {}
    try {
      wetGain?.disconnect();
    } catch {}
    try {
      dryGain?.disconnect();
    } catch {}
    try {
      micGain.disconnect();
    } catch {}
    throw new Error("Mic processing destination produced no audio track");
  }

  return {
    processedTrack,
    micGainNode: micGain,
    audioContext,
    usedRnnoise,
    dispose: () => {
      try {
        source.disconnect();
      } catch {}
      try {
        rnnoise?.disconnect();
      } catch {}
      try {
        wetGain?.disconnect();
      } catch {}
      try {
        dryGain?.disconnect();
      } catch {}
      try {
        micGain.disconnect();
      } catch {}
      try {
        processedTrack.stop();
      } catch {}
    }
  };
}

export async function createRnnoiseFilteredTrack(
  audioContext: AudioContext,
  rawTrack: MediaStreamTrack
): Promise<{
  processedTrack: MediaStreamTrack;
  dispose: () => void;
  usedRnnoise: boolean;
}> {
  try {
    const handle = await createMicProcessedTrack(audioContext, rawTrack, {
      useRnnoise: true,
      gain: 1
    });
    return {
      processedTrack: handle.processedTrack,
      usedRnnoise: handle.usedRnnoise,
      dispose: handle.dispose
    };
  } catch (err) {
    if (!loggedRegisterFailure) {
      loggedRegisterFailure = true;
      console.warn("[rnnoise] failed to initialize; using browser NS", err);
    }
    return {
      processedTrack: rawTrack,
      usedRnnoise: false,
      dispose: () => {}
    };
  }
}
