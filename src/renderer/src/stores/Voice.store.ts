import { makeAutoObservable, observable, runInAction } from "mobx";
import * as mediasoupClient from "mediasoup-client";
import {
  GatewayOpcodes,
  VoiceDispatchEvents,
  type VoiceOpcode,
  VoiceOpcodes
} from "@mutualzz/types";
import type { AppStore } from "@stores/App.store";
import type {
  VoiceServerUpdatePayload,
  VoiceStateSyncPayload,
  VoiceTarget
} from "@renderer/types";
import { makePersistable } from "mobx-persist-store";
import { Logger } from "@mutualzz/logger";
import { VoiceState } from "@stores/objects/VoiceState";
import {
  formatKeyCode,
  getScreenShareCodecOptions,
  isEditableTarget,
  sensitivityToThreshold,
  clampUserVolume,
  voiceVolumeToGain,
  type ScreenShareCaptureConfig,
  type ScreenShareQuality,
  type VoiceInputMode
} from "@utils/voiceSettings.utils";
import {
  acquireScreenCaptureStream,
  isScreenCaptureSource,
  openScreenCaptureSettings,
  type ScreenCaptureSource
} from "@utils/screenCapture.utils";
import {
  createMicAudioContext,
  createMicProcessedTrack
} from "@utils/rnnoiseFilter";
import i18n from "@renderer/i18n";
import { isElectron } from "@utils/index";

export type VoiceConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "failed";

type MediaKind = "camera" | "screen" | "audio" | "screen-audio";

type ProducerMediaKind = Exclude<MediaKind, "audio">;

interface StreamMetadata {
  stream: MediaStream;
  kind: MediaKind;
  element?: HTMLAudioElement | HTMLVideoElement;
}

interface SpeakingDetector {
  analyser: AnalyserNode;
  sourceNode: MediaStreamAudioSourceNode;
  data: Uint8Array;
  speaking: boolean;
  lastAbove: number;
  lastBelow: number;
}

const SPEAKING_ON_DELAY_MS = 50;
const SPEAKING_OFF_DELAY_MS = 250;
const SPEAKING_TICK_MS = 75;
const VOICE_JOIN_TIMEOUT_MS = 30_000;

type UserMix = { muted: boolean; volume: number };

function serializeVolumeMap(value: unknown) {
  if (!(value instanceof Map)) return {};
  return Object.fromEntries(value.entries());
}

function deserializeVolumeMap(value: unknown) {
  const entries =
    value && typeof value === "object"
      ? Object.entries(value as Record<string, number>)
      : [];
  return observable.map<string, number>(
    entries.map(([userId, volume]) => [userId, Number(volume)])
  );
}

function serializeMutedUsers(value: unknown) {
  if (!(value instanceof Map)) return [];
  return Array.from(value.entries())
    .filter(([, muted]) => muted)
    .map(([userId]) => userId);
}

function deserializeMutedUsers(value: unknown) {
  const userIds = Array.isArray(value) ? value.map(String) : [];
  return observable.map<string, boolean>(
    userIds.map((userId) => [userId, true])
  );
}

export type { VoiceInputMode };

function canSetSinkId(
  element: HTMLMediaElement
): element is HTMLMediaElement & { setSinkId: (id: string) => Promise<void> } {
  return typeof (element as any).setSinkId === "function";
}

async function safeSetSinkId(
  element: HTMLMediaElement,
  deviceId: string,
  logger: Logger,
  label: string
) {
  if (!canSetSinkId(element)) return;
  try {
    await element.setSinkId(deviceId);
  } catch (err) {
    logger.warn(`setSinkId failed for ${label}`, err);
  }
}

class MediasoupSession {
  private socket: WebSocket | null = null;

  private device: mediasoupClient.types.Device | null = null;
  private sendTransport: mediasoupClient.types.Transport | null = null;
  private receiverTransport: mediasoupClient.types.Transport | null = null;

  private micTrack: MediaStreamTrack | null = null;
  private rawMicTrack: MediaStreamTrack | null = null;
  private rnnoiseDispose: (() => void) | null = null;
  private micGainNode: GainNode | null = null;
  private micProcessContext: AudioContext | null = null;
  private masterOutputGain: GainNode | null = null;
  private cameraTrack: MediaStreamTrack | null = null;
  private screenTrack: MediaStreamTrack | null = null;
  private screenAudioTrack: MediaStreamTrack | null = null;
  private micProducer: mediasoupClient.types.Producer | null = null;
  private cameraProducer: mediasoupClient.types.Producer | null = null;
  private screenProducer: mediasoupClient.types.Producer | null = null;
  private screenAudioProducer: mediasoupClient.types.Producer | null = null;
  private audioContext: AudioContext | null = null;
  private audioSourceNodes = new Map<string, AudioNode>();
  private audioGainNodes = new Map<string, GainNode>();

  private consumersByProducerId = new Map<
    string,
    mediasoupClient.types.Consumer
  >();
  private streamMetadata = new Map<string, StreamMetadata>();

  private pendingRequests = new Map<
    string,
    {
      resolve: (v: any) => void;
      reject: (e: any) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  private pendingProducerIds = new Map<
    string,
    { userId: string; mediaKind: MediaKind }
  >();
  private producerUserMap = new Map<string, string>(); // producerId → userId
  private setupComplete = false;
  private consumeAbortSignal: AbortSignal | null = null;
  private isMuted = false;
  private isDeafened = false;
  private spaceMuted = false;
  private inputMode: VoiceInputMode = "voice_activity";
  private pushToTalkPressed = false;
  private getSpeakingThreshold: () => number = () => 0.05;
  private shouldReportSpeaking: (userId: string) => boolean = () => true;
  private currentInputDeviceId: string | null = null;
  private currentOutputDeviceId: string | null = null;
  private currentCameraDeviceId: string | null = null;
  private readonly logger = new Logger({ tag: "VoiceSession" });

  private speakingDetectors = new Map<string, SpeakingDetector>();
  private speakingTickTimer: number | null = null;
  private blockedAudioProducers = new Set<string>();

  constructor(
    private readonly app: AppStore,
    private readonly onVideoConsumed: (
      userId: string,
      producerId: string,
      mediaKind: Exclude<MediaKind, "audio">
    ) => void,
    private readonly onVideoClosed: (producerId: string) => void,
    private readonly onSocketClosed: (
      event?: CloseEvent | { code?: number; reason?: string }
    ) => void,
    private readonly onSpeakingChange: (
      userId: string,
      speaking: boolean
    ) => void,
    private readonly onScreenShareAvailable: (
      userId: string,
      producerId: string,
      mediaKind: "screen" | "screen-audio"
    ) => void,
    private readonly onAudioConsumed: (
      userId: string,
      producerId: string,
      kind: "audio" | "screen-audio"
    ) => void,
    private readonly onMicFailed: () => void,
    private readonly onAudioBlocked: (blocked: boolean) => void,
    private readonly getNoiseSuppression: () => boolean,
    private readonly getMicrophoneVolume: () => number,
    private readonly getSpeakerVolume: () => number,
    getSpeakingThreshold: () => number,
    shouldReportSpeaking: (userId: string) => boolean
  ) {
    this.getSpeakingThreshold = getSpeakingThreshold;
    this.shouldReportSpeaking = shouldReportSpeaking;
    makeAutoObservable(this, {}, { autoBind: true });

    window.addEventListener("pointerdown", this.onWindowGesture, {
      passive: true
    });
    window.addEventListener("keydown", this.onWindowGesture);
  }

  private onWindowGesture() {
    if (
      this.blockedAudioProducers.size === 0 &&
      this.audioContext?.state !== "suspended"
    )
      return;
    this.ensureAudioContextActive();
    void this.retryBlockedPlayback();
  }

  unlockAudio() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    this.ensureAudioContextActive();
  }

  unlockBlockedAudio() {
    this.unlockAudio();
    void this.retryBlockedPlayback();
  }

  private ensureAudioContextActive() {
    if (!this.audioContext || this.audioContext.state !== "suspended") return;
    void this.audioContext.resume().catch((err) => {
      this.logger.warn("AudioContext resume failed", err);
    });
  }

  private async retryBlockedPlayback() {
    if (this.blockedAudioProducers.size === 0) return;

    for (const producerId of Array.from(this.blockedAudioProducers)) {
      const meta = this.streamMetadata.get(producerId);
      if (!meta?.element) {
        this.blockedAudioProducers.delete(producerId);
        continue;
      }
      const played = await this.playElement(meta.element);
      if (played) this.blockedAudioProducers.delete(producerId);
    }

    this.onAudioBlocked(this.blockedAudioProducers.size > 0);
  }

  getLocalCameraStream() {
    return this.cameraTrack ? new MediaStream([this.cameraTrack]) : null;
  }

  getLocalScreenStream() {
    return this.screenTrack ? new MediaStream([this.screenTrack]) : null;
  }

  setInputDeviceId(id: string | null) {
    this.currentInputDeviceId = id;
  }

  setOutputDeviceId(id: string | null) {
    this.currentOutputDeviceId = id;
    void this.applyOutputSink();
    if (!id) return;
    for (const [, meta] of this.streamMetadata) {
      if (meta.kind !== "audio" && meta.kind !== "screen-audio" && meta.element)
        void safeSetSinkId(meta.element, id, this.logger, meta.kind);
    }
  }

  setCameraDeviceId(id: string | null) {
    this.currentCameraDeviceId = id;
  }

  setInputMode(mode: VoiceInputMode) {
    this.inputMode = mode;
    if (mode === "voice_activity") {
      this.pushToTalkPressed = false;
    }
    this.applyMicTransmission();
  }

  setSpaceMute(muted: boolean) {
    this.spaceMuted = muted;
    this.applyMicTransmission();
  }

  setPushToTalkPressed(pressed: boolean) {
    if (this.inputMode !== "push_to_talk") return;
    if (this.pushToTalkPressed === pressed) return;
    this.pushToTalkPressed = pressed;
    this.applyMicTransmission();
  }

  private applyMicTransmission() {
    const selfId = this.app.account?.id;

    // Voice-activity: always send when unmuted (Opus DTX covers silence). VAD is
    // UI-only. Gating RTP on VAD + zeroRtpOnPause broke web↔Electron hearability.
    const inputOpen =
      this.inputMode === "voice_activity" ? true : this.pushToTalkPressed;

    const shouldTransmit =
      !this.isMuted && !this.spaceMuted && !this.isDeafened && inputOpen;

    if (this.micProducer) {
      try {
        shouldTransmit ? this.micProducer.resume() : this.micProducer.pause();
      } catch {}
    }

    if (this.micTrack) {
      try {
        this.micTrack.enabled = shouldTransmit;
      } catch {}
    }

    if (!selfId || shouldTransmit) return;

    const detector = this.speakingDetectors.get(selfId);
    if (detector?.speaking) {
      detector.speaking = false;
      this.onSpeakingChange(selfId, false);
    }
  }

  setSelfMute(muted: boolean) {
    this.isMuted = muted;
    this.applyMicTransmission();
  }

  setSelfDeaf(deafened: boolean) {
    this.isDeafened = deafened;
    this.applyMicTransmission();
    this.applyMasterOutputRouting();
    if (!deafened) {
      for (const [, gainNode] of this.audioGainNodes) {
        this.connectAudioGain(gainNode);
      }
    }
    for (const [, meta] of this.streamMetadata) {
      if (
        meta.kind !== "audio" &&
        meta.kind !== "screen-audio" &&
        meta.element
      ) {
        try {
          meta.element.muted = deafened;
        } catch {}
      }
    }
  }

  setMicrophoneVolume(volume: number) {
    if (this.micGainNode) {
      this.micGainNode.gain.value = voiceVolumeToGain(volume);
    }
  }

  setSpeakerVolume(volume: number) {
    if (this.masterOutputGain) {
      this.masterOutputGain.gain.value = voiceVolumeToGain(volume);
    }
  }

  private ensureAudioGraph() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext({ sampleRate: 48000 });
      void this.applyOutputSink();
    }
    this.ensureAudioContextActive();
    if (!this.masterOutputGain) {
      this.masterOutputGain = this.audioContext.createGain();
      this.masterOutputGain.gain.value = voiceVolumeToGain(
        this.getSpeakerVolume()
      );
      this.applyMasterOutputRouting();
    }
    return this.audioContext;
  }

  private async applyOutputSink() {
    const ctx = this.audioContext as
      | (AudioContext & { setSinkId?: (id: string) => Promise<void> })
      | null;
    if (!ctx?.setSinkId || !this.currentOutputDeviceId) return;
    try {
      await ctx.setSinkId(this.currentOutputDeviceId);
    } catch (err) {
      this.logger.warn("AudioContext setSinkId failed", err);
    }
  }

  private applyMasterOutputRouting() {
    if (!this.audioContext || !this.masterOutputGain) return;
    try {
      this.masterOutputGain.disconnect();
    } catch {}
    if (!this.isDeafened) {
      try {
        this.masterOutputGain.connect(this.audioContext.destination);
      } catch {}
    }
  }

  applyAudioForUser(
    userId: string,
    kind: "audio" | "screen-audio",
    mix: UserMix
  ) {
    for (const [producerId, uid] of this.producerUserMap) {
      if (uid !== userId) continue;
      if (this.streamMetadata.get(producerId)?.kind !== kind) continue;
      this.applyAudioGain(producerId, mix.muted, mix.volume);
    }
  }

  private applyAudioGain(producerId: string, muted: boolean, volume: number) {
    const gain = this.audioGainNodes.get(producerId);
    if (!gain) return;
    gain.gain.value = muted ? 0 : Math.min(2, volume / 100);
  }

  private connectAudioGain(gainNode: GainNode) {
    this.ensureAudioGraph();
    if (!this.masterOutputGain || this.isDeafened) return;
    try {
      gainNode.disconnect();
    } catch {}
    try {
      gainNode.connect(this.masterOutputGain);
    } catch {}
  }

  getVideoStream(producerId: string): MediaStream | null {
    return this.streamMetadata.get(producerId)?.stream ?? null;
  }

  getVideoElement(producerId: string): HTMLVideoElement | null {
    const meta = this.streamMetadata.get(producerId);
    return meta?.kind === "audio"
      ? null
      : ((meta?.element as HTMLVideoElement) ?? null);
  }

  getProducerIds(kind?: MediaKind): string[] {
    if (!kind) return Array.from(this.streamMetadata.keys());
    return Array.from(this.streamMetadata.entries())
      .filter(([, m]) => m.kind === kind)
      .map(([id]) => id);
  }

  async startCamera(signal: AbortSignal) {
    if (!this.sendTransport) return;

    const media = await this.getUserMedia(
      {
        video: this.currentCameraDeviceId
          ? { deviceId: { exact: this.currentCameraDeviceId } }
          : true,
        audio: false
      },
      signal
    );
    if (signal.aborted) {
      media.getTracks().forEach((t) => t.stop());
      return;
    }

    const [videoTrack] = media.getVideoTracks();
    if (!videoTrack) return;

    await runInAction(async () => {
      this.cameraTrack = videoTrack;
      this.cameraProducer = await this.sendTransport!.produce({
        track: videoTrack,
        appData: { mediaKind: "camera" },
        codecOptions: {
          videoGoogleStartBitrate: 1000,
          videoGoogleMaxBitrate: 9000
        }
      });
    });
  }

  async startScreenShare(
    signal: AbortSignal,
    getStream: () => Promise<MediaStream>,
    config: ScreenShareCaptureConfig
  ): Promise<boolean> {
    if (!this.sendTransport) throw new Error("NO_SEND_TRANSPORT");

    const media = await getStream();

    if (signal.aborted) {
      media.getTracks().forEach((t) => t.stop());
      throw new DOMException("Aborted", "AbortError");
    }

    const [videoTrack] = media.getVideoTracks();
    if (!videoTrack) {
      media.getTracks().forEach((t) => t.stop());
      throw new Error("NO_VIDEO_TRACK");
    }

    try {
      videoTrack.addEventListener("ended", () => {
        void this.stopScreenShare();
      });

      this.screenTrack = videoTrack;
      const codecOptions = getScreenShareCodecOptions(config.quality);
      this.screenProducer = await this.sendTransport.produce({
        track: videoTrack,
        appData: { mediaKind: "screen" },
        codecOptions
      });

      const [audioTrack] = media.getAudioTracks();
      if (config.includeAudio && audioTrack) {
        this.screenAudioTrack = audioTrack;
        this.screenAudioProducer = await this.sendTransport.produce({
          track: audioTrack,
          appData: { mediaKind: "screen-audio" }
        });
        return true;
      }

      if (config.includeAudio) {
        this.logger.warn(
          "Screen share audio requested but no audio track was captured"
        );
      }
      for (const track of media.getAudioTracks()) {
        try {
          track.stop();
        } catch {}
      }
      return false;
    } catch (err) {
      media.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {}
      });
      this.screenTrack = null;
      this.screenProducer = null;
      this.screenAudioTrack = null;
      this.screenAudioProducer = null;
      throw err;
    }
  }

  setScreenShareAudioMuted(muted: boolean) {
    if (this.screenAudioProducer) {
      try {
        muted
          ? this.screenAudioProducer.pause()
          : this.screenAudioProducer.resume();
      } catch {}
    }
    if (this.screenAudioTrack) {
      try {
        this.screenAudioTrack.enabled = !muted;
      } catch {}
    }
  }

  async stopScreenShare() {
    const producerId = this.screenProducer?.id ?? null;
    const audioProducerId = this.screenAudioProducer?.id ?? null;

    try {
      this.screenAudioProducer?.close();
    } catch {}
    this.screenAudioProducer = null;

    if (this.screenAudioTrack) {
      try {
        this.screenAudioTrack.stop();
      } catch {}
      this.screenAudioTrack = null;
    }

    try {
      this.screenProducer?.close();
    } catch {}
    this.screenProducer = null;
    if (this.screenTrack) {
      try {
        this.screenTrack.stop();
      } catch {}
      this.screenTrack = null;
    }
    if (audioProducerId) {
      try {
        await this.rpc(VoiceOpcodes.VoiceCloseProducer, {
          producerId: audioProducerId
        });
      } catch {}
    }
    if (producerId) {
      try {
        await this.rpc(VoiceOpcodes.VoiceCloseProducer, { producerId });
      } catch {}
      this.onVideoClosed(producerId);
    }
  }

  async stopCamera() {
    const producerId = this.cameraProducer?.id ?? null;
    try {
      this.cameraProducer?.close();
    } catch {}
    this.cameraProducer = null;
    if (this.cameraTrack) {
      try {
        this.cameraTrack.stop();
      } catch {}
      this.cameraTrack = null;
    }
    if (producerId) {
      try {
        await this.rpc(VoiceOpcodes.VoiceCloseProducer, { producerId });
      } catch {}
      this.onVideoClosed(producerId);
    }
  }

  async restartMic(signal: AbortSignal) {
    this.disposeMicPipeline();
    if (!this.sendTransport) return;
    await this.startMic(signal);
  }

  async restartCamera(signal: AbortSignal) {
    await this.stopCamera();
    if (!this.sendTransport || signal.aborted) return;
    await this.startCamera(signal);
  }

  private disposeMicPipeline() {
    const producerId = this.micProducer?.id ?? null;
    try {
      this.micProducer?.close();
    } catch {}
    this.micProducer = null;
    if (producerId && this.socket) {
      void this.rpc(VoiceOpcodes.VoiceCloseProducer, { producerId }).catch(
        () => {}
      );
    }
    if (this.rnnoiseDispose) {
      try {
        this.rnnoiseDispose();
      } catch {}
      this.rnnoiseDispose = null;
    }
    this.micGainNode = null;
    if (this.micTrack) {
      try {
        this.micTrack.stop();
      } catch {}
      this.micTrack = null;
    }
    if (this.rawMicTrack) {
      try {
        this.rawMicTrack.stop();
      } catch {}
      this.rawMicTrack = null;
    }
    if (this.micProcessContext) {
      void this.micProcessContext.close().catch(() => {});
      this.micProcessContext = null;
    }
  }

  private ensureMicProcessContext() {
    if (
      !this.micProcessContext ||
      this.micProcessContext.state === "closed" ||
      this.micProcessContext.sampleRate !== 48000
    ) {
      if (this.micProcessContext && this.micProcessContext.state !== "closed") {
        void this.micProcessContext.close().catch(() => {});
      }
      this.micProcessContext = createMicAudioContext();
    }
    if (this.micProcessContext.state === "suspended") {
      void this.micProcessContext.resume().catch((err) => {
        this.logger.warn("Mic AudioContext resume failed", err);
      });
    }
    return this.micProcessContext;
  }

  async connect(endpoint: string, token: string, signal: AbortSignal) {
    this.setupComplete = false;
    this.consumeAbortSignal = signal;

    const url = new URL(endpoint);

    const socket = await this.openSocket(url.toString(), signal);
    if (signal.aborted) {
      socket.close(1000, "superseded");
      return;
    }

    this.socket = socket;
    await this.rpc(VoiceOpcodes.VoiceAuthenticate, { token });
    if (signal.aborted) return;

    const { rtpCapabilities } = await this.rpc(
      VoiceOpcodes.VoiceGetRTPCapabilities,
      {}
    );
    if (signal.aborted) return;

    const device = new mediasoupClient.Device();
    await device.load({ routerRtpCapabilities: rtpCapabilities });
    if (signal.aborted) return;
    this.device = device;

    // Receive transport
    const { transportOptions: recvOptions } = await this.rpc(
      VoiceOpcodes.VoiceCreateTransport,
      { direction: "receive" }
    );
    if (signal.aborted) return;

    const recvTransport = device.createRecvTransport(recvOptions);
    recvTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
      void this.rpc(VoiceOpcodes.VoiceConnectTransport, {
        transportId: recvTransport.id,
        dtlsParameters
      })
        .then(callback)
        .catch(errback);
    });
    this.receiverTransport = recvTransport;

    // Tell server our capabilities so it can start pushing existing producers
    await this.rpc(VoiceOpcodes.VoiceSetRTPCapabilities, {
      rtpCapabilities: device.recvRtpCapabilities
    });
    if (signal.aborted) return;

    // Send transport
    const { transportOptions: sendOptions } = await this.rpc(
      VoiceOpcodes.VoiceCreateTransport,
      { direction: "send" }
    );
    if (signal.aborted) return;

    const sendTransport = device.createSendTransport(sendOptions);

    sendTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
      void this.rpc(VoiceOpcodes.VoiceConnectTransport, {
        transportId: sendTransport.id,
        dtlsParameters
      })
        .then(callback)
        .catch(errback);
    });
    sendTransport.on(
      "produce",
      ({ kind, rtpParameters, appData }, callback, errback) => {
        void this.rpcWithRetry(
          VoiceOpcodes.VoiceProduce,
          {
            transportId: sendTransport.id,
            kind,
            rtpParameters,
            appData
          },
          signal
        )
          .then((data) => callback({ id: data.producerId }))
          .catch(errback);
      }
    );
    this.sendTransport = sendTransport;

    this.setupComplete = true;
    await this.flushPendingProducers(signal);
  }

  teardown() {
    this.setupComplete = false;
    this.consumeAbortSignal = null;
    this.pendingProducerIds.clear();
    this.producerUserMap.clear();
    this.stopAllSpeakingDetection();

    // Reject all in-flight RPCs immediately
    for (const [, pending] of this.pendingRequests) {
      clearTimeout(pending.timer);
      pending.reject(new Error("Voice disconnected"));
    }
    this.pendingRequests.clear();

    // Close transports
    try {
      this.sendTransport?.close();
    } catch {}
    try {
      this.receiverTransport?.close();
    } catch {}
    this.sendTransport = null;
    this.receiverTransport = null;
    this.device = null;

    // Close socket
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.onmessage = null;
      try {
        this.socket.close(1000, "teardown");
      } catch {}
      this.socket = null;
    }

    // Stop local tracks
    this.disposeMicPipeline();

    try {
      this.cameraProducer?.close();
    } catch {}
    this.cameraProducer = null;
    if (this.cameraTrack) {
      try {
        this.cameraTrack.stop();
      } catch {}
      this.cameraTrack = null;
    }

    try {
      this.screenAudioProducer?.close();
    } catch {}
    this.screenAudioProducer = null;
    if (this.screenAudioTrack) {
      try {
        this.screenAudioTrack.stop();
      } catch {}
      this.screenAudioTrack = null;
    }

    try {
      this.screenProducer?.close();
    } catch {}
    this.screenProducer = null;
    if (this.screenTrack) {
      try {
        this.screenTrack.stop();
      } catch {}
      this.screenTrack = null;
    }

    // Stop all remote streams and remove from DOM
    for (const [, consumer] of this.consumersByProducerId) {
      try {
        consumer.close();
      } catch {}
    }
    this.consumersByProducerId.clear();

    // Disconnect all AudioContext source nodes
    for (const [, sourceNode] of this.audioSourceNodes) {
      try {
        sourceNode.disconnect();
      } catch {}
    }
    this.audioSourceNodes.clear();

    for (const [, gainNode] of this.audioGainNodes) {
      try {
        gainNode.disconnect();
      } catch {}
    }
    this.audioGainNodes.clear();

    for (const [, meta] of this.streamMetadata) {
      if (meta.element) {
        try {
          meta.element.pause();
        } catch {}
        meta.element.srcObject = null;

        try {
          meta.element.remove();
        } catch {}
      }
      for (const track of meta.stream.getTracks()) {
        try {
          track.stop();
        } catch {}
      }
    }
    this.streamMetadata.clear();

    if (this.blockedAudioProducers.size > 0) {
      this.blockedAudioProducers.clear();
      this.onAudioBlocked(false);
    }

    this.masterOutputGain = null;
    if (this.audioContext) {
      void this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }

  async startMic(signal: AbortSignal) {
    if (!this.sendTransport) return;

    const wantRnnoise = this.getNoiseSuppression();
    const media = await this.acquireMicMedia(signal, wantRnnoise);
    if (!media) {
      this.logger.warn("Mic capture failed after exhausting device fallbacks");
      this.setSelfMute(true);
      this.onMicFailed();
      return;
    }

    if (signal.aborted) {
      media.getTracks().forEach((t) => t.stop());
      return;
    }

    const [audioTrack] = media.getAudioTracks();
    if (!audioTrack) {
      this.setSelfMute(true);
      this.onMicFailed();
      return;
    }

    this.rawMicTrack = audioTrack;
    const audioContext = this.ensureMicProcessContext();

    let processHandle: Awaited<ReturnType<typeof createMicProcessedTrack>>;
    try {
      processHandle = await createMicProcessedTrack(audioContext, audioTrack, {
        useRnnoise: wantRnnoise,
        gain: voiceVolumeToGain(this.getMicrophoneVolume())
      });
    } catch (err) {
      this.logger.warn("Mic processing graph failed", err);
      media.getTracks().forEach((t) => t.stop());
      this.rawMicTrack = null;
      this.setSelfMute(true);
      this.onMicFailed();
      return;
    }

    if (signal.aborted) {
      processHandle.dispose();
      media.getTracks().forEach((t) => t.stop());
      this.rawMicTrack = null;
      return;
    }

    if (wantRnnoise && !processHandle.usedRnnoise) {
      try {
        await audioTrack.applyConstraints({
          noiseSuppression: true,
          autoGainControl: true
        });
      } catch {}
    }

    this.micGainNode = processHandle.micGainNode;
    this.rnnoiseDispose = processHandle.dispose;
    const produceTrack = processHandle.processedTrack;

    this.micTrack = produceTrack;
    produceTrack.addEventListener(
      "ended",
      () => {
        if (signal.aborted || this.micTrack !== produceTrack) return;
        this.logger.warn("Mic track ended unexpectedly, restarting");
        void this.restartMic(signal).catch((err) => {
          this.logger.warn("restartMic after track ended failed", err);
        });
      },
      { once: true }
    );

    const userId = this.app.account?.id;
    if (userId) {
      const vadTrack = produceTrack.clone();
      const localStream = new MediaStream([vadTrack]);
      this.startSpeakingDetection(localStream, userId);
    }
    this.micProducer = await this.sendTransport.produce({
      track: produceTrack,
      appData: { mediaKind: "audio" },
      codecOptions: {
        opusStereo: false,
        opusDtx: !processHandle.usedRnnoise
      }
    });

    this.applyMicTransmission();
  }

  private async acquireMicMedia(
    signal: AbortSignal,
    useRnnoise: boolean
  ): Promise<MediaStream | null> {
    const audioBase: MediaTrackConstraints = {
      echoCancellation: true,
      noiseSuppression: !useRnnoise,
      autoGainControl: true,
      channelCount: 1
    };

    const attempts: MediaTrackConstraints[] = [];
    if (this.currentInputDeviceId) {
      attempts.push({
        ...audioBase,
        deviceId: { exact: this.currentInputDeviceId }
      });
      attempts.push({
        ...audioBase,
        deviceId: { ideal: this.currentInputDeviceId }
      });
    }
    attempts.push(audioBase);

    for (const audio of attempts) {
      try {
        return await this.getUserMedia({ audio, video: false }, signal);
      } catch (err) {
        if (signal.aborted) throw err;
      }
    }

    return null;
  }

  private startSpeakingDetection(stream: MediaStream, userId: string) {
    this.stopSpeakingDetectionForUser(userId);

    const AudioContextCtor =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextCtor) return;

    if (!this.audioContext) {
      this.audioContext = new AudioContextCtor();
    }
    this.ensureAudioContextActive();

    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 512;

    const sourceNode = this.audioContext.createMediaStreamSource(stream);
    sourceNode.connect(analyser);

    this.speakingDetectors.set(userId, {
      analyser,
      sourceNode,
      data: new Uint8Array(analyser.frequencyBinCount),
      speaking: false,
      lastAbove: 0,
      lastBelow: 0
    });

    this.ensureSpeakingTick();
  }

  private stopSpeakingDetectionForUser(userId: string) {
    const detector = this.speakingDetectors.get(userId);
    if (!detector) return;

    try {
      detector.sourceNode.disconnect();
    } catch {}

    try {
      detector.analyser.disconnect();
    } catch {}

    // Stop cloned VAD tracks (not the PeerConnection mic track).
    try {
      const stream = (detector.sourceNode as MediaStreamAudioSourceNode)
        .mediaStream;
      if (stream) {
        for (const track of stream.getAudioTracks()) {
          track.stop();
        }
      }
    } catch {}

    if (detector.speaking) {
      this.onSpeakingChange(userId, false);
    }

    this.speakingDetectors.delete(userId);

    if (this.speakingDetectors.size === 0) {
      this.stopSpeakingTick();
    }
  }

  private stopAllSpeakingDetection() {
    for (const userId of Array.from(this.speakingDetectors.keys())) {
      this.stopSpeakingDetectionForUser(userId);
    }
  }

  private ensureSpeakingTick() {
    if (this.speakingTickTimer != null) return;

    const tick = () => {
      if (this.speakingDetectors.size === 0) {
        this.speakingTickTimer = null;
        return;
      }

      this.ensureAudioContextActive();

      const now = performance.now();

      const threshold = this.getSpeakingThreshold();

      for (const [userId, detector] of this.speakingDetectors) {
        if (!this.shouldReportSpeaking(userId)) {
          if (detector.speaking) {
            detector.speaking = false;
            this.onSpeakingChange(userId, false);
          }
          continue;
        }

        detector.analyser.getByteTimeDomainData(
          detector.data as Uint8Array<ArrayBuffer>
        );

        let sum = 0;
        for (const v of detector.data) {
          const x = (v - 128) / 128;
          sum += x * x;
        }
        const rms = Math.sqrt(sum / detector.data.length);
        const above = rms > threshold;

        if (above) {
          detector.lastAbove = now;
          if (
            !detector.speaking &&
            now - detector.lastBelow > SPEAKING_ON_DELAY_MS
          ) {
            detector.speaking = true;
            this.onSpeakingChange(userId, true);
            if (userId === this.app.account?.id) {
              this.applyMicTransmission();
            }
          }
        } else {
          detector.lastBelow = now;
          if (
            detector.speaking &&
            now - detector.lastAbove > SPEAKING_OFF_DELAY_MS
          ) {
            detector.speaking = false;
            this.onSpeakingChange(userId, false);
            if (userId === this.app.account?.id) {
              this.applyMicTransmission();
            }
          }
        }
      }

      this.speakingTickTimer = window.setTimeout(tick, SPEAKING_TICK_MS);
    };

    tick();
  }

  private stopSpeakingTick() {
    if (this.speakingTickTimer != null) {
      clearTimeout(this.speakingTickTimer);
      this.speakingTickTimer = null;
    }
  }

  private cleanupProducersForUser(userId: string) {
    const producerIds = Array.from(this.producerUserMap.entries())
      .filter(([, uid]) => uid === userId)
      .map(([producerId]) => producerId);

    for (const producerId of producerIds) {
      this.cleanupProducer(producerId);
      this.onVideoClosed(producerId);
    }

    for (const [producerId, pending] of this.pendingProducerIds) {
      if (pending.userId === userId) {
        this.pendingProducerIds.delete(producerId);
      }
    }
  }

  private cleanupProducer(producerId: string) {
    const consumer = this.consumersByProducerId.get(producerId);
    if (consumer) {
      try {
        consumer.close();
      } catch {}
      this.consumersByProducerId.delete(producerId);
    }

    const sourceNode = this.audioSourceNodes.get(producerId);
    if (sourceNode) {
      try {
        sourceNode.disconnect();
      } catch {}
      this.audioSourceNodes.delete(producerId);
    }

    const gainNode = this.audioGainNodes.get(producerId);
    if (gainNode) {
      try {
        gainNode.disconnect();
      } catch {}
      this.audioGainNodes.delete(producerId);
    }

    const userId = this.producerUserMap.get(producerId);
    if (userId) {
      const hasOtherAudio = Array.from(this.streamMetadata.entries()).some(
        ([id, meta]) =>
          id !== producerId &&
          this.producerUserMap.get(id) === userId &&
          (meta.kind === "audio" || meta.kind === "screen-audio")
      );
      if (!hasOtherAudio) {
        this.stopSpeakingDetectionForUser(userId);
      }
      this.producerUserMap.delete(producerId);
    }

    if (
      this.blockedAudioProducers.delete(producerId) &&
      this.blockedAudioProducers.size === 0
    ) {
      this.onAudioBlocked(false);
    }

    const meta = this.streamMetadata.get(producerId);
    if (meta) {
      if (meta.element) {
        try {
          meta.element.pause();
        } catch {}
        meta.element.srcObject = null;
        try {
          meta.element.remove();
        } catch {}
      }
      for (const track of meta.stream.getTracks()) {
        try {
          track.stop();
        } catch {}
      }
      this.streamMetadata.delete(producerId);
    }
  }

  private async playElement(element: HTMLMediaElement): Promise<boolean> {
    try {
      await element.play();
      return true;
    } catch {
      if (this.audioContext?.state === "suspended") {
        try {
          await this.audioContext.resume();
        } catch {}
      }
      try {
        await element.play();
        return true;
      } catch (err) {
        this.logger.debug(
          `${element instanceof HTMLVideoElement ? "Video" : "Audio"} cannot be played`,
          err
        );
        return false;
      }
    }
  }

  private openSocket(url: string, signal: AbortSignal): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      if (signal.aborted) {
        reject(new Error("Voice disconnected"));
        return;
      }

      const ws = new WebSocket(url);
      ws.onmessage = (e) => this.onMessage(String(e.data));
      ws.onerror = () => reject(new Error("Voice socket failed to open"));
      ws.onclose = () => reject(new Error("Voice socket closed before open"));

      ws.onopen = () => {
        ws.onclose = (ev: CloseEvent) => {
          try {
            this.onSocketClosed?.(ev);
          } catch {}
        };
        resolve(ws);
      };

      signal.addEventListener(
        "abort",
        () => {
          ws.onclose = null;
          ws.onerror = null;
          try {
            ws.close(1000, "superseded");
          } catch {}
          reject(new Error("Voice disconnected"));
        },
        { once: true }
      );
    });
  }

  private async consumeProducer(
    producerId: string,
    userId: string,
    signal: AbortSignal,
    mediaKind: MediaKind = "audio"
  ) {
    if (!this.device || !this.receiverTransport) return;
    if (this.consumersByProducerId.has(producerId)) return;
    if (signal.aborted) return;

    const response = await this.rpcWithRetry(
      VoiceOpcodes.VoiceConsume,
      { producerId },
      signal
    );
    if (signal.aborted) return;

    const opts = response.consumerOptions;
    const consumer = await this.receiverTransport.consume({
      id: opts.id,
      producerId: opts.producerId,
      kind: opts.kind,
      rtpParameters: opts.rtpParameters
    });
    if (signal.aborted) {
      try {
        consumer.close();
      } catch {}
      return;
    }

    this.consumersByProducerId.set(producerId, consumer);
    this.producerUserMap.set(producerId, userId);

    const stream = new MediaStream([consumer.track]);
    const kind: MediaKind =
      consumer.kind === "video"
        ? mediaKind === "screen"
          ? "screen"
          : "camera"
        : mediaKind === "screen-audio"
          ? "screen-audio"
          : "audio";

    if (kind === "audio") this.startSpeakingDetection(stream, userId);

    if (consumer.kind === "video") {
      const video = document.createElement("video") as HTMLVideoElement;
      video.autoplay = true;
      video.playsInline = true;
      video.style.display = "none";
      document.body.appendChild(video);
      video.srcObject = stream;

      if (this.currentOutputDeviceId)
        void safeSetSinkId(
          video,
          this.currentOutputDeviceId,
          this.logger,
          "video"
        );

      this.streamMetadata.set(producerId, {
        stream,
        kind,
        element: video
      });

      this.onVideoConsumed(
        userId,
        producerId,
        kind === "screen" ? "screen" : "camera"
      );

      await this.rpc(VoiceOpcodes.VoiceResumeConsumer, {
        consumerId: consumer.id
      });

      await this.playElement(video);
    } else {
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }
      const audioCtx = this.audioContext;

      if (audioCtx.state === "suspended") {
        try {
          await audioCtx.resume();
        } catch (err) {
          this.logger.warn("AudioContext resume failed", err);
        }
      }

      const audio = document.createElement("audio") as HTMLAudioElement;
      audio.autoplay = true;
      audio.style.display = "none";
      document.body.appendChild(audio);
      audio.srcObject = stream;

      const sourceNode = audioCtx.createMediaElementSource(audio);
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = kind === "screen-audio" ? 0 : 1;

      sourceNode.connect(gainNode);
      this.connectAudioGain(gainNode);

      this.audioSourceNodes.set(producerId, sourceNode);
      this.audioGainNodes.set(producerId, gainNode);

      this.streamMetadata.set(producerId, {
        stream,
        kind,
        element: audio
      });

      if (kind === "screen-audio" || kind === "audio") {
        this.onAudioConsumed(userId, producerId, kind);
      }

      await this.rpc(VoiceOpcodes.VoiceResumeConsumer, {
        consumerId: consumer.id
      });

      const played = await this.playElement(audio);
      if (!played) {
        this.blockedAudioProducers.add(producerId);
        this.onAudioBlocked(true);
      }
    }
  }

  private async flushPendingProducers(signal: AbortSignal) {
    const queued = Array.from(this.pendingProducerIds.entries());
    this.pendingProducerIds.clear();
    for (const [producerId, { userId, mediaKind }] of queued) {
      if (signal.aborted) return;
      await this.handleNewProducer(producerId, userId, mediaKind, signal);
    }
  }

  private shouldDeferScreenConsume(userId: string, mediaKind: MediaKind) {
    return (
      (mediaKind === "screen" || mediaKind === "screen-audio") &&
      userId !== this.app.account?.id
    );
  }

  private async handleNewProducer(
    producerId: string,
    userId: string,
    mediaKind: MediaKind,
    signal: AbortSignal
  ) {
    if (this.shouldDeferScreenConsume(userId, mediaKind)) {
      this.onScreenShareAvailable(
        userId,
        producerId,
        mediaKind === "screen-audio" ? "screen-audio" : "screen"
      );
      return;
    }
    await this.consumeProducer(producerId, userId, signal, mediaKind);
  }

  async consumeRemoteProducer(
    producerId: string,
    userId: string,
    signal: AbortSignal,
    mediaKind: MediaKind
  ) {
    await this.consumeProducer(producerId, userId, signal, mediaKind);
  }

  releaseConsumer(producerId: string) {
    this.cleanupProducer(producerId);
  }

  private onMessage(raw: string) {
    let envelope: any;
    try {
      envelope = JSON.parse(raw);
    } catch {
      return;
    }

    if (envelope.id == null && envelope.op != null) {
      void this.onPush(envelope.op, envelope.data).catch((err) =>
        this.logger.debug("onPush failed", err)
      );
      return;
    }

    // RPC response

    const pending = this.pendingRequests.get(envelope.id ?? "");
    if (!pending) return;
    this.pendingRequests.delete(envelope.id);

    if (envelope.ok) pending.resolve(envelope.data ?? {});
    else
      pending.reject(new Error(envelope.error?.message ?? "Voice RPC error"));
  }

  private async onPush(op: string, data: any) {
    if (op === VoiceDispatchEvents.VoiceProducerClosed) {
      const { producerId } = data ?? {};
      if (!producerId) return;

      this.cleanupProducer(producerId);
      this.onVideoClosed(producerId);
      return;
    }

    if (op === VoiceDispatchEvents.VoicePeerLeft) {
      const userId = data?.userId;
      if (!userId) return;
      this.cleanupProducersForUser(String(userId));
      return;
    }

    if (op === VoiceDispatchEvents.VoicePeerJoined) {
      return;
    }

    if (op === VoiceDispatchEvents.VoiceNewProducer) {
      const { producerId, userId, mediaKind } = data ?? {};
      if (!producerId || !userId) return;

      const resolvedKind: MediaKind =
        mediaKind === "screen"
          ? "screen"
          : mediaKind === "screen-audio"
            ? "screen-audio"
            : mediaKind === "camera"
              ? "camera"
              : "audio";

      if (!this.setupComplete) {
        this.pendingProducerIds.set(producerId, {
          userId,
          mediaKind: resolvedKind
        });
        return;
      }

      const signal = this.consumeAbortSignal;
      if (!signal || signal.aborted) return;

      await this.handleNewProducer(producerId, userId, resolvedKind, signal);
    }
  }

  private rpc(op: VoiceOpcode, data?: any, timeoutMs = 8_000): Promise<any> {
    const socket = this.socket;
    if (!socket || socket.readyState !== WebSocket.OPEN)
      return Promise.reject(new Error("Voice socket not connected"));

    const id = crypto.randomUUID();

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Voice RPC timed out: ${op}`));
      }, timeoutMs);

      this.pendingRequests.set(id, {
        resolve: (v) => {
          clearTimeout(timer);
          resolve(v);
        },
        reject: (e) => {
          clearTimeout(timer);
          reject(e);
        },
        timer
      });

      try {
        socket.send(JSON.stringify({ id, op, data }));
      } catch (err) {
        clearTimeout(timer);
        this.pendingRequests.delete(id);
        reject(err);
      }
    });
  }

  private async rpcWithRetry(
    op: VoiceOpcode,
    data: any,
    signal: AbortSignal,
    retries = 4
  ): Promise<any> {
    let lastError: unknown;
    for (let i = 0; i <= retries; i++) {
      if (signal.aborted) throw new Error("Voice disconnected");
      try {
        return await this.rpc(op, data);
      } catch (err) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.includes("Voice state not found")) throw err;
        if (i < retries) await new Promise((r) => setTimeout(r, 100 * (i + 1)));
      }
    }
    throw lastError;
  }

  private async getUserMedia(
    constraints: MediaStreamConstraints,
    signal: AbortSignal
  ): Promise<MediaStream> {
    if (signal.aborted) throw new Error("Voice disconnected");
    return navigator.mediaDevices.getUserMedia(constraints);
  }
}

export class VoiceStore {
  connectionStatus: VoiceConnectionStatus = "idle";
  connectionError: string | null = null;

  currentVoiceTarget: VoiceTarget | null = null;
  disconnectedFrom: VoiceTarget | null = null;

  selfMute = false;
  selfDeaf = false;
  spaceMute = false;
  spaceDeaf = false;

  cameraEnabled = false;
  screenShareEnabled = false;
  pushToTalkActive = false;
  recordingPushToTalkKey = false;
  screenSharePickerOpen = false;
  screenSharePickerSources: ScreenCaptureSource[] = [];
  screenSharePickerSelectedId: string | null = null;
  screenSharePickerIncludeAudio = false;
  screenSharePickerQuality: ScreenShareQuality = "1080p30";
  screenShareAudioEnabled = false;
  screenShareSupportsAudio = false;

  inputs = observable.array<MediaDeviceInfo>([]);
  outputs = observable.array<MediaDeviceInfo>([]);
  cameras = observable.array<MediaDeviceInfo>([]);

  currentInputDeviceId: string | null = null;
  currentOutputDeviceId: string | null = null;
  currentCameraDeviceId: string | null = null;
  disconnectBanner: string | null = null;
  audioPlaybackBlocked = false;
  noiseSuppressionPending = false;
  private micTestIsolation: { mute: boolean; deaf: boolean } | null = null;
  currentSessionId: string | null = null;
  private cameraProducerByUser = new Map<string, string>();
  private screenProducerByUser = new Map<string, string>();
  availableScreenShares = observable.map<string, string>();
  availableScreenAudioShares = observable.map<string, string>();
  watchedScreenShares = observable.set<string>();
  screenStreamVolumeByUser = observable.map<string, number>();
  screenStreamMutedByUser = observable.map<string, boolean>();
  userVoiceVolumeByUser = observable.map<string, number>();
  userVoiceMutedByUser = observable.map<string, boolean>();
  private producerToUserMap = new Map<string, string>();
  private producerMediaKind = new Map<string, ProducerMediaKind>();
  private screenAudioProducerByUser = new Map<string, string>();
  private readonly session: MediasoupSession;
  private readonly logger = new Logger({ tag: "VoiceStore" });
  private keepAliveTimer: number | null = null;
  private abortController: AbortController | null = null;
  private connectionGeneration = 0;
  private pendingEndpoint: string | null = null;
  private pendingToken: string | null = null;
  private joinTimeoutTimer: number | null = null;
  private lastScreenShareConfig: ScreenShareCaptureConfig | null = null;
  private deviceChangeDebounceTimer: number | null = null;
  private channelSwitchInProgress = false;

  private speakingUsers = observable.map<string, boolean>();

  constructor(private readonly app: AppStore) {
    this.session = new MediasoupSession(
      app,
      (userId, producerId, mediaKind) => {
        runInAction(() => {
          this.producerToUserMap.set(producerId, userId);
          this.producerMediaKind.set(producerId, mediaKind);
          if (mediaKind === "screen") {
            this.screenProducerByUser.set(userId, producerId);
          } else {
            this.cameraProducerByUser.set(userId, producerId);
          }
        });
      },
      (producerId) => {
        const userId = this.producerToUserMap.get(producerId);
        const mediaKind = this.producerMediaKind.get(producerId);
        if (userId && mediaKind) {
          runInAction(() => {
            if (mediaKind === "screen") {
              this.availableScreenShares.delete(userId);
              this.availableScreenAudioShares.delete(userId);
              this.watchedScreenShares.delete(userId);
              if (this.screenProducerByUser.get(userId) === producerId) {
                this.screenProducerByUser.delete(userId);
              }
              const audioProducerId =
                this.screenAudioProducerByUser.get(userId);
              if (audioProducerId) {
                this.session.releaseConsumer(audioProducerId);
                this.screenAudioProducerByUser.delete(userId);
              }
              if (userId === this.app.account?.id) {
                this.screenShareEnabled = false;
              }
            } else if (mediaKind === "screen-audio") {
              this.availableScreenAudioShares.delete(userId);
              if (this.screenAudioProducerByUser.get(userId) === producerId) {
                this.screenAudioProducerByUser.delete(userId);
              }
            } else if (this.cameraProducerByUser.get(userId) === producerId) {
              this.cameraProducerByUser.delete(userId);
            }
            this.producerToUserMap.delete(producerId);
            this.producerMediaKind.delete(producerId);
          });
        }
      },
      (ev) => {
        let reason =
          ev?.reason ??
          (ev && ev.code
            ? `code ${ev.code}`
            : i18n.t("voice.errors.disconnected", { ns: "chat" }));

        if (
          this.channelSwitchInProgress &&
          (reason === "superseded" ||
            reason === "Superseded by Minecraft voice" ||
            reason === "Moved to another voice channel" ||
            reason === i18n.t("voice.errors.movedChannel", { ns: "chat" }) ||
            reason === "teardown")
        ) {
          return;
        }

        if (reason === "Moved to another voice channel") {
          runInAction(() => {
            this.channelSwitchInProgress = true;
            this.connectionStatus = "connecting";
            this.connectionError = null;
          });
          try {
            this.abortAndTeardown();
            this.stopKeepAlive();
          } catch {}
          return;
        }

        switch (reason) {
          case "superseded":
          case "Superseded by Minecraft voice": {
            reason = i18n.t("voice.errors.differentDevice", { ns: "chat" });
            break;
          }
        }

        const target = this.currentVoiceTarget;
        const reasonLower = String(reason).toLowerCase();
        const isSuperseded =
          reason === i18n.t("voice.errors.differentDevice", { ns: "chat" }) ||
          reasonLower.includes("superseded") ||
          reasonLower.includes("minecraft") ||
          ev?.code === 4000;
        // Never auto-rejoin when another client (esp. Minecraft) took the slot —
        // that fight steals the MC mediasoup peer and breaks /mzvoice.
        const canAutoRejoin =
          !isSuperseded &&
          this.connectionStatus === "connected" &&
          !!target &&
          this.app.isGatewayReady;

        runInAction(() => {
          this.connectionError = canAutoRejoin ? null : reason;
          this.cameraEnabled = false;
          this.screenShareEnabled = false;
          this.pushToTalkActive = false;

          if (canAutoRejoin) {
            this.disconnectBanner = null;
            return;
          }

          this.connectionStatus = "idle";
          this.disconnectBanner = i18n.t("voice.errors.disconnectedFrom", {
            ns: "chat",
            reason
          });
          this.disconnectedFrom = target;
          this.currentVoiceTarget = null;
        });

        try {
          this.abortAndTeardown();
          this.stopKeepAlive();
          this.speakingUsers.clear();
          this.availableScreenShares.clear();
          this.availableScreenAudioShares.clear();
          this.watchedScreenShares.clear();
          this.cameraProducerByUser.clear();
          this.screenProducerByUser.clear();
          this.screenAudioProducerByUser.clear();
          if (!canAutoRejoin) {
            this.clearLocalVoiceStateForMe();
          }
        } catch {}

        if (canAutoRejoin && target) {
          void this.reconnectVoice();
        }
      },
      (userId, speaking) => {
        runInAction(() => {
          if (userId === this.app.account?.id && this.effectiveSelfMute) {
            if (!speaking) this.setUserSpeaking(userId, false);
            return;
          }
          this.setUserSpeaking(userId, speaking);
        });
      },
      (userId, producerId, mediaKind) => {
        runInAction(() => {
          if (mediaKind === "screen-audio") {
            this.availableScreenAudioShares.set(userId, producerId);
          } else {
            this.availableScreenShares.set(userId, producerId);
          }
          this.producerToUserMap.set(producerId, userId);
          this.producerMediaKind.set(producerId, mediaKind);
        });

        if (
          mediaKind === "screen-audio" &&
          this.watchedScreenShares.has(userId)
        ) {
          void this.consumeDeferredScreenAudio(userId, producerId);
        }
      },
      (userId, producerId, kind) => {
        if (kind === "screen-audio") {
          runInAction(() => {
            this.screenAudioProducerByUser.set(userId, producerId);
            this.producerToUserMap.set(producerId, userId);
            this.producerMediaKind.set(producerId, "screen-audio");
          });
        }
        this.syncUserAudioMix(userId, kind);
      },
      () => {
        runInAction(() => {
          this.selfMute = true;
        });
        if (this.app.account?.id) {
          this.setUserSpeaking(this.app.account.id, false);
        }
        void this.sendVoiceStateUpdate();
      },
      (blocked) => {
        runInAction(() => {
          this.audioPlaybackBlocked = blocked;
        });
      },
      () => this.app.settings?.noiseSuppression !== false,
      () => this.app.settings?.microphoneVolume ?? 100,
      () => this.app.settings?.speakerVolume ?? 100,
      () => this.getSpeakingThreshold(),
      (userId) => this.shouldReportSpeakingForUser(userId)
    );

    makeAutoObservable(this, {}, { autoBind: true });

    window.addEventListener("keydown", this.onPttKeyDown);
    window.addEventListener("keyup", this.onPttKeyUp);
    window.addEventListener("blur", this.onPttBlur);
    navigator.mediaDevices?.addEventListener(
      "devicechange",
      this.onMediaDeviceChange
    );

    void makePersistable(this, {
      name: "VoiceStore",
      properties: [
        "currentInputDeviceId",
        "currentOutputDeviceId",
        "currentCameraDeviceId",
        {
          key: "screenStreamVolumeByUser",
          serialize: serializeVolumeMap,
          deserialize: deserializeVolumeMap
        },
        {
          key: "screenStreamMutedByUser",
          serialize: serializeMutedUsers,
          deserialize: deserializeMutedUsers
        },
        {
          key: "userVoiceVolumeByUser",
          serialize: serializeVolumeMap,
          deserialize: deserializeVolumeMap
        },
        {
          key: "userVoiceMutedByUser",
          serialize: serializeMutedUsers,
          deserialize: deserializeMutedUsers
        }
      ],
      storage: localStorage
    }).then(() => {
      void this.setupTracks();
    });
  }

  private onMediaDeviceChange = () => {
    if (this.deviceChangeDebounceTimer != null) {
      clearTimeout(this.deviceChangeDebounceTimer);
    }
    this.deviceChangeDebounceTimer = window.setTimeout(() => {
      this.deviceChangeDebounceTimer = null;
      void this.handleMediaDeviceChange();
    }, 300);
  };

  private async handleMediaDeviceChange() {
    const { inputChanged } = await this.setupTracks();
    const followsSystemDefault =
      !this.currentInputDeviceId || this.currentInputDeviceId === "default";

    if (
      (inputChanged || followsSystemDefault) &&
      this.connectionStatus === "connected" &&
      this.abortController
    ) {
      void this.session.restartMic(this.abortController.signal).catch((err) => {
        this.logger.warn("restartMic after device change failed", err);
      });
    }
  }

  get currentChannelId() {
    return this.currentVoiceTarget?.channelId ?? null;
  }

  get currentSpaceId() {
    return this.currentVoiceTarget?.spaceId ?? null;
  }

  get channel() {
    const channelId = this.currentChannelId;
    if (!channelId) return null;
    const space = this.currentSpaceId
      ? this.app.spaces.get(this.currentSpaceId)
      : null;
    if (space) return space.channels.find((ch) => ch.id === channelId) ?? null;
    return this.app.channels.get(channelId) ?? null;
  }

  get hasActiveVoiceTarget() {
    return !!this.currentVoiceTarget;
  }

  get canUseVadInCurrentChannel() {
    const channel = this.channel;
    if (!channel?.spaceId) return true;
    const space = this.app.spaces.get(channel.spaceId);
    return space?.members.me?.canUseVad(channel) ?? true;
  }

  get effectiveVoiceInputMode(): VoiceInputMode {
    if (!this.canUseVadInCurrentChannel) return "push_to_talk";
    return this.app.settings?.voiceInputMode ?? "voice_activity";
  }

  get isInSpaceVoice() {
    return !!this.currentSpaceId;
  }

  get currentInputDevice() {
    return this.inputs.find((d) => d.deviceId === this.currentInputDeviceId);
  }

  get currentOutputDevice() {
    return this.outputs.find((d) => d.deviceId === this.currentOutputDeviceId);
  }

  get currentCameraDevice() {
    return this.cameras.find((d) => d.deviceId === this.currentCameraDeviceId);
  }

  get voiceStates() {
    return this.app.voiceStates.getAllByChannel(
      this.currentVoiceTarget?.channelId
    );
  }

  get effectiveSelfDeaf() {
    return this.spaceDeaf || this.selfDeaf;
  }

  get effectiveSelfMute() {
    if (this.spaceMute || this.spaceDeaf) return true;
    if (this.selfDeaf) return true;
    return this.selfMute;
  }

  get pushToTalkKeyLabel() {
    return formatKeyCode(this.app.settings?.pushToTalkKey ?? "Space");
  }

  private getSpeakingThreshold() {
    const settings = this.app.settings;
    if (!settings) return 0.05;
    return sensitivityToThreshold(
      settings.voiceInputSensitivity,
      settings.voiceInputSensitivityAuto
    );
  }

  private shouldReportSpeakingForUser(userId: string) {
    const accountId = this.app.account?.id;
    if (userId !== accountId) return true;
    if (this.effectiveSelfMute) return false;
    if (this.effectiveVoiceInputMode === "push_to_talk") {
      return this.pushToTalkActive;
    }
    return true;
  }

  applyVoiceSettings() {
    const settings = this.app.settings;
    if (!settings) return;
    this.session.setInputMode(this.effectiveVoiceInputMode);
    this.session.setSpaceMute(this.spaceMute);
    this.session.setMicrophoneVolume(settings.microphoneVolume);
    this.session.setSpeakerVolume(settings.speakerVolume);
  }

  beginMicTestIsolation() {
    if (this.connectionStatus !== "connected") return;
    if (this.micTestIsolation) return;
    this.micTestIsolation = {
      mute: this.selfMute,
      deaf: this.selfDeaf
    };
    runInAction(() => {
      this.selfMute = true;
      this.selfDeaf = true;
    });
    this.session.setSelfMute(true);
    this.session.setSelfDeaf(true);
    if (this.app.account?.id) {
      this.setUserSpeaking(this.app.account.id, false);
    }
    void this.sendVoiceStateUpdate();
  }

  endMicTestIsolation() {
    if (!this.micTestIsolation) return;
    const { mute, deaf } = this.micTestIsolation;
    this.micTestIsolation = null;
    runInAction(() => {
      this.selfDeaf = deaf;
      this.selfMute = mute;
    });
    this.session.setSelfDeaf(deaf);
    this.session.setSelfMute(mute);
    void this.sendVoiceStateUpdate();
  }

  async setNoiseSuppression(enabled: boolean) {
    const settings = this.app.settings;
    if (settings && settings.noiseSuppression !== enabled) {
      settings.noiseSuppression = enabled;
    }
    if (
      this.connectionStatus !== "connected" ||
      !this.abortController ||
      this.noiseSuppressionPending
    ) {
      return;
    }
    runInAction(() => {
      this.noiseSuppressionPending = true;
    });
    try {
      await this.session.restartMic(this.abortController.signal);
    } catch (err) {
      this.logger.warn("restartMic after noise suppression toggle failed", err);
    } finally {
      runInAction(() => {
        this.noiseSuppressionPending = false;
      });
    }
  }

  startRecordingPushToTalkKey() {
    this.recordingPushToTalkKey = true;
  }

  stopRecordingPushToTalkKey() {
    this.recordingPushToTalkKey = false;
  }

  private onPttKeyDown = (event: KeyboardEvent) => {
    if (this.recordingPushToTalkKey) {
      event.preventDefault();
      this.app.settings?.setPushToTalkKey(event.code);
      this.recordingPushToTalkKey = false;
      return;
    }

    if (this.effectiveVoiceInputMode !== "push_to_talk") return;
    if (!this.hasActiveVoiceTarget) return;
    if (isEditableTarget(event.target)) return;
    if (event.code !== this.app.settings.pushToTalkKey) return;
    if (event.repeat) return;

    event.preventDefault();
    runInAction(() => {
      this.pushToTalkActive = true;
    });
    this.session.setPushToTalkPressed(true);
  };

  private onPttKeyUp = (event: KeyboardEvent) => {
    if (this.effectiveVoiceInputMode !== "push_to_talk") return;
    if (event.code !== this.app.settings?.pushToTalkKey) return;

    runInAction(() => {
      this.pushToTalkActive = false;
    });
    this.session.setPushToTalkPressed(false);
  };

  private onPttBlur = () => {
    if (!this.pushToTalkActive) return;
    runInAction(() => {
      this.pushToTalkActive = false;
    });
    this.session.setPushToTalkPressed(false);
  };

  isUserSpeaking(userId: string) {
    return this.speakingUsers.get(userId) ?? false;
  }

  setUserSpeaking(userId: string, speaking: boolean) {
    if (speaking) this.speakingUsers.set(userId, true);
    else this.speakingUsers.delete(userId);
  }

  onGatewayDisconnected() {
    this.stopKeepAlive();
  }

  onGatewayReconnected() {
    if (!this.currentVoiceTarget) return;

    // If Redis says we're on Minecraft voice, don't steal that session back.
    const selfId = this.app.account?.id;
    const selfState = selfId ? this.app.voiceStates.get(selfId) : null;
    if (selfState?.client === "minecraft" && selfState.channelId) {
      runInAction(() => {
        this.connectionStatus = "idle";
        this.currentVoiceTarget = null;
      });
      this.stopKeepAlive();
      return;
    }

    if (this.connectionStatus === "connected") {
      this.startKeepAlive();
      void this.sendVoiceStateUpdate();
      return;
    }

    void this.reconnectVoice();
  }

  private async reconnectVoice() {
    if (!this.currentVoiceTarget) return;

    this.session.unlockAudio();

    runInAction(() => {
      this.connectionStatus = "connecting";
      this.connectionError = null;
      this.disconnectBanner = null;
    });

    this.startJoinTimeout();

    if (this.pendingEndpoint?.trim() && this.pendingToken) {
      void this.startConnection();
    } else {
      await this.sendVoiceStateUpdate({ refreshRtc: true });
    }

    this.startKeepAlive();
  }

  clearDisconnectBanner() {
    this.disconnectBanner = null;
  }

  onVoiceServerUpdate(payload: VoiceServerUpdatePayload) {
    if (!payload.voiceEndpoint?.trim()) {
      this.failJoin(i18n.t("voice.errors.notConfigured", { ns: "chat" }));
      return;
    }

    this.pendingEndpoint = payload.voiceEndpoint;
    this.pendingToken = payload.voiceToken;

    runInAction(() => {
      this.channelSwitchInProgress = true;
      this.currentVoiceTarget = {
        spaceId: payload.spaceId ?? null,
        channelId: payload.channelId
      };
      this.currentSessionId = payload.sessionId;
    });

    // Abort any in-flight connection (leave, old channel, previous attempt)
    // and start fresh with the new credentials.
    void this.startConnection();
  }

  onVoiceStateSync(payload: VoiceStateSyncPayload) {
    for (const state of payload.states) {
      this.syncSelfFromState(new VoiceState(this.app, state));
      this.app.voiceStates.upsert(state);
    }

    const synced = new Set(payload.states.map((s) => s.userId));
    for (const existing of this.app.voiceStates.getAllByChannel(
      payload.channelId
    )) {
      if (!synced.has(existing.userId))
        this.app.voiceStates.remove(existing.userId);
    }
  }

  onVoiceStateUpdate(state: VoiceState) {
    this.syncSelfFromState(state);

    const channelId = state.channelId === "null" ? null : state.channelId;
    const accountId = this.app.account?.id;

    // Minecraft owns this user's SFU slot — drop any app RTC so we don't steal it back.
    if (
      accountId &&
      state.userId === accountId &&
      state.client === "minecraft" &&
      channelId
    ) {
      if (
        this.currentVoiceTarget ||
        this.connectionStatus === "connected" ||
        this.connectionStatus === "connecting"
      ) {
        try {
          this.abortAndTeardown();
          this.stopKeepAlive();
        } catch {
          // ignore
        }
        runInAction(() => {
          this.connectionStatus = "idle";
          this.connectionError = null;
          this.currentVoiceTarget = null;
          this.cameraEnabled = false;
          this.screenShareEnabled = false;
        });
      }
    }

    if (
      !channelId &&
      accountId &&
      state.userId === accountId &&
      this.connectionStatus === "connecting"
    ) {
      this.failJoin(i18n.t("voice.errors.unableToJoin", { ns: "chat" }), {
        notifyServer: false
      });
      return;
    }

    if (!channelId) {
      this.app.voiceStates.upsert({
        ...state,
        channelId: null,
        spaceId: state.spaceId ?? null,
        disconnectedAt: Date.now()
      });

      this.cameraProducerByUser.delete(state.userId);
      this.screenProducerByUser.delete(state.userId);
      this.screenAudioProducerByUser.delete(state.userId);
      this.availableScreenShares.delete(state.userId);
      this.availableScreenAudioShares.delete(state.userId);
      this.watchedScreenShares.delete(state.userId);
      this.speakingUsers.delete(state.userId);
      return;
    }

    this.app.voiceStates.upsert({
      ...state,
      channelId,
      spaceId: state.spaceId ?? null,
      disconnectedAt: null
    });
  }

  getLocalCameraStream() {
    return this.session.getLocalCameraStream();
  }

  getLocalScreenStream() {
    return this.session.getLocalScreenStream();
  }

  isUserScreenSharing(userId: string) {
    if (userId === this.app.account?.id) {
      return this.screenShareEnabled;
    }
    return (
      this.availableScreenShares.has(userId) ||
      this.screenProducerByUser.has(userId)
    );
  }

  isWatchingScreenShare(userId: string) {
    if (userId === this.app.account?.id) {
      return this.screenShareEnabled;
    }
    return this.watchedScreenShares.has(userId);
  }

  async watchScreenShare(userId: string) {
    if (userId === this.app.account?.id) return;
    if (this.watchedScreenShares.has(userId)) return;

    const producerId = this.availableScreenShares.get(userId);
    if (!producerId || !this.abortController) return;

    const signal = this.abortController.signal;

    await this.session.consumeRemoteProducer(
      producerId,
      userId,
      signal,
      "screen"
    );

    const audioProducerId = this.availableScreenAudioShares.get(userId);
    if (audioProducerId) {
      await this.session.consumeRemoteProducer(
        audioProducerId,
        userId,
        signal,
        "screen-audio"
      );
    }

    runInAction(() => {
      this.watchedScreenShares.add(userId);
      this.screenProducerByUser.set(userId, producerId);
    });

    this.syncUserAudioMix(userId, "screen-audio");
  }

  stopWatchingScreenShare(userId: string) {
    if (userId === this.app.account?.id) return;

    const producerId = this.screenProducerByUser.get(userId);
    const audioProducerId = this.screenAudioProducerByUser.get(userId);
    if (!producerId) return;

    this.session.releaseConsumer(producerId);
    if (audioProducerId) {
      this.session.releaseConsumer(audioProducerId);
    }

    runInAction(() => {
      this.watchedScreenShares.delete(userId);
      this.screenProducerByUser.delete(userId);
      this.screenAudioProducerByUser.delete(userId);
    });
  }

  getScreenStreamVolume(userId: string) {
    return this.screenStreamVolumeByUser.get(userId) ?? 100;
  }

  setScreenStreamVolume(userId: string, volume: number) {
    const clamped = clampUserVolume(volume);
    runInAction(() => {
      if (clamped === 100) {
        this.screenStreamVolumeByUser.delete(userId);
      } else {
        this.screenStreamVolumeByUser.set(userId, clamped);
      }
    });
    this.syncUserAudioMix(userId, "screen-audio");
  }

  isScreenStreamMuted(userId: string) {
    return this.screenStreamMutedByUser.get(userId) ?? false;
  }

  setScreenStreamMuted(userId: string, muted: boolean) {
    runInAction(() => {
      if (muted) {
        this.screenStreamMutedByUser.set(userId, true);
      } else {
        this.screenStreamMutedByUser.delete(userId);
      }
    });
    this.syncUserAudioMix(userId, "screen-audio");
  }

  toggleScreenStreamMuted(userId: string) {
    this.setScreenStreamMuted(userId, !this.isScreenStreamMuted(userId));
  }

  getUserVoiceVolume(userId: string) {
    return this.userVoiceVolumeByUser.get(userId) ?? 100;
  }

  setUserVoiceVolume(userId: string, volume: number) {
    const clamped = clampUserVolume(volume);
    runInAction(() => {
      if (clamped === 100) {
        this.userVoiceVolumeByUser.delete(userId);
      } else {
        this.userVoiceVolumeByUser.set(userId, clamped);
      }
    });
    this.syncUserAudioMix(userId, "audio");
  }

  isUserVoiceMuted(userId: string) {
    return this.userVoiceMutedByUser.get(userId) ?? false;
  }

  setUserVoiceMuted(userId: string, muted: boolean) {
    runInAction(() => {
      if (muted) {
        this.userVoiceMutedByUser.set(userId, true);
      } else {
        this.userVoiceMutedByUser.delete(userId);
      }
    });
    this.syncUserAudioMix(userId, "audio");
  }

  toggleUserVoiceMuted(userId: string) {
    this.setUserVoiceMuted(userId, !this.isUserVoiceMuted(userId));
  }

  private syncUserAudioMix(userId: string, kind: "audio" | "screen-audio") {
    if (kind === "screen-audio") {
      this.session.applyAudioForUser(userId, kind, {
        muted: this.isScreenStreamMuted(userId),
        volume: this.getScreenStreamVolume(userId)
      });
      return;
    }

    this.session.applyAudioForUser(userId, kind, {
      muted: this.isUserVoiceMuted(userId),
      volume: this.getUserVoiceVolume(userId)
    });
  }

  private async consumeDeferredScreenAudio(userId: string, producerId: string) {
    if (!this.abortController || this.screenAudioProducerByUser.has(userId)) {
      return;
    }

    await this.session.consumeRemoteProducer(
      producerId,
      userId,
      this.abortController.signal,
      "screen-audio"
    );
  }

  async join(target: VoiceTarget) {
    const isSame =
      this.currentVoiceTarget?.spaceId === (target.spaceId ?? null) &&
      this.currentVoiceTarget?.channelId === target.channelId;
    if (isSame && this.connectionStatus !== "failed") return;

    if (this.currentVoiceTarget && !isSame) {
      this.clearJoinTimeout();
      this.abortAndTeardown();
      this.stopKeepAlive();
      this.speakingUsers.clear();
      this.availableScreenShares.clear();
      this.availableScreenAudioShares.clear();
      this.watchedScreenShares.clear();
      runInAction(() => {
        this.cameraEnabled = false;
        this.screenShareEnabled = false;
        this.screenShareAudioEnabled = false;
        this.pushToTalkActive = false;
      });
    }

    this.session.unlockAudio();
    await this.setupTracks(true);

    const preferredSelfMute = this.app.settings?.preferredSelfMute ?? false;
    const preferredSelfDeaf = this.app.settings?.preferredSelfDeaf ?? false;
    const selfDeaf = preferredSelfDeaf;
    const selfMute = preferredSelfMute || preferredSelfDeaf;

    runInAction(() => {
      this.disconnectBanner = null;
      this.currentVoiceTarget = target;
      this.connectionStatus = "connecting";
      this.connectionError = null;
      this.selfMute = selfMute;
      this.selfDeaf = selfDeaf;
    });

    this.session.setInputDeviceId(this.currentInputDeviceId);
    this.session.setOutputDeviceId(this.currentOutputDeviceId);

    this.session.setSelfMute(selfMute);
    this.session.setSelfDeaf(selfDeaf);
    this.applyVoiceSettings();

    this.startJoinTimeout();
    await this.sendVoiceStateUpdate();
    this.startKeepAlive();
  }

  retryBlockedAudio() {
    this.session.unlockBlockedAudio();
  }

  async leave() {
    this.clearJoinTimeout();
    this.abortAndTeardown();

    this.pendingEndpoint = null;
    this.pendingToken = null;
    this.stopKeepAlive();

    runInAction(() => {
      this.disconnectBanner = null;
      this.currentVoiceTarget = null;
      this.currentSessionId = null;
      this.connectionStatus = "idle";
      this.connectionError = null;
      this.channelSwitchInProgress = false;
      this.cameraEnabled = false;
      this.screenShareEnabled = false;
      this.pushToTalkActive = false;
    });

    this.clearLocalVoiceStateForMe();
    this.speakingUsers.clear();
    this.availableScreenShares.clear();
    this.availableScreenAudioShares.clear();
    this.watchedScreenShares.clear();

    await this.sendVoiceStateUpdate();
  }

  reset() {
    this.clearJoinTimeout();
    this.abortAndTeardown();

    this.pendingEndpoint = null;
    this.pendingToken = null;
    this.stopKeepAlive();

    runInAction(() => {
      this.currentVoiceTarget = null;
      this.connectionStatus = "idle";
      this.connectionError = null;
      this.disconnectBanner = null;
      this.currentSessionId = null;
      this.channelSwitchInProgress = false;
      this.cameraEnabled = false;
      this.screenShareEnabled = false;
      this.pushToTalkActive = false;
      this.selfMute = false;
      this.selfDeaf = false;
      this.spaceMute = false;
      this.spaceDeaf = false;
    });

    this.speakingUsers.clear();
    this.availableScreenShares.clear();
    this.availableScreenAudioShares.clear();
    this.watchedScreenShares.clear();
    this.clearLocalVoiceStateForMe();
  }

  setMute(value: boolean) {
    if (this.spaceMute || this.spaceDeaf) return;

    if (this.selfDeaf && !value) {
      runInAction(() => {
        this.selfDeaf = false;
        this.selfMute = false;
      });
      this.app.settings?.setPreferredSelfDeaf(false);
      this.app.settings?.setPreferredSelfMute(false);
      void this.sendVoiceStateUpdate();
      this.session.setSelfDeaf(false);
      this.session.setSelfMute(false);
      return;
    }

    runInAction(() => {
      this.selfMute = value;
    });

    if (value && this.app.account?.id) {
      this.setUserSpeaking(this.app.account.id, false);
    }

    this.app.settings?.setPreferredSelfMute(value);
    void this.sendVoiceStateUpdate();
    this.session.setSelfMute(value);
  }

  setDeaf(value: boolean) {
    if (this.spaceDeaf) return;

    runInAction(() => {
      this.selfDeaf = value;
      if (value) {
        this.selfMute = true;
      }
    });

    this.app.settings?.setPreferredSelfDeaf(value);
    if (value) this.app.settings?.setPreferredSelfMute(true);

    void this.sendVoiceStateUpdate();
    this.session.setSelfDeaf(this.selfDeaf);
    this.session.setSelfMute(this.selfMute);
  }

  toggleScreenShare() {
    if (this.screenShareEnabled) {
      this.stopActiveScreenShare();
      return;
    }
    void this.openScreenSharePicker();
  }

  async openScreenSharePicker() {
    if (this.connectionStatus !== "connected") return;

    const settings = this.app.settings;
    const includeAudio = settings?.screenShareIncludeAudio ?? false;
    const quality = settings?.screenShareQuality ?? "1080p30";

    let sources: ScreenCaptureSource[] = [];
    if (window.api?.desktop?.listCaptureSources) {
      try {
        sources = await window.api.desktop.listCaptureSources();
      } catch (err) {
        this.logger.warn("listCaptureSources failed", err);
      }
    }

    const screens = sources.filter(isScreenCaptureSource);

    runInAction(() => {
      this.screenSharePickerSources = sources;
      this.screenSharePickerSelectedId =
        screens[0]?.id ?? sources[0]?.id ?? null;
      this.screenSharePickerIncludeAudio = includeAudio;
      this.screenSharePickerQuality = quality;
      this.screenSharePickerOpen = true;
    });
  }

  setScreenSharePickerSelectedId(sourceId: string) {
    this.screenSharePickerSelectedId = sourceId;
  }

  setScreenSharePickerIncludeAudio(value: boolean) {
    this.screenSharePickerIncludeAudio = value;
  }

  setScreenSharePickerQuality(value: ScreenShareQuality) {
    this.screenSharePickerQuality = value;
  }

  confirmScreenSharePicker() {
    const isDesktopPicker = Boolean(window.api?.desktop?.listCaptureSources);
    if (isDesktopPicker && !this.screenSharePickerSelectedId) return;

    const config: ScreenShareCaptureConfig = {
      sourceId: this.screenSharePickerSelectedId,
      includeAudio: this.screenSharePickerIncludeAudio,
      quality: this.screenSharePickerQuality
    };

    this.app.settings?.setScreenShareIncludeAudio(config.includeAudio);
    this.app.settings?.setScreenShareQuality(config.quality);

    runInAction(() => {
      this.screenSharePickerOpen = false;
      this.screenSharePickerSources = [];
      this.screenSharePickerSelectedId = null;
    });

    void this.startScreenShareWithConfig(config);
  }

  cancelScreenSharePicker() {
    runInAction(() => {
      this.screenSharePickerOpen = false;
      this.screenSharePickerSources = [];
      this.screenSharePickerSelectedId = null;
    });
  }

  toggleScreenShareAudio() {
    if (!this.screenShareEnabled) return;
    const next = !this.screenShareAudioEnabled;
    runInAction(() => {
      this.screenShareAudioEnabled = next;
    });
    this.session.setScreenShareAudioMuted(!next);
  }

  private stopActiveScreenShare() {
    runInAction(() => {
      this.screenShareEnabled = false;
      this.screenShareAudioEnabled = false;
      this.screenShareSupportsAudio = false;
    });
    void this.session.stopScreenShare().catch((err) => {
      this.logger.warn("stopScreenShare failed", err);
    });
  }

  private async startScreenShareWithConfig(config: ScreenShareCaptureConfig) {
    if (this.connectionStatus !== "connected" || !this.abortController) return;

    this.lastScreenShareConfig = config;
    const signal = this.abortController.signal;

    runInAction(() => {
      this.screenShareEnabled = true;
      this.screenShareAudioEnabled = config.includeAudio;
      this.screenShareSupportsAudio = config.includeAudio;
    });

    try {
      const hasAudio = await this.session.startScreenShare(
        signal,
        () => acquireScreenCaptureStream(config, signal),
        config
      );
      runInAction(() => {
        this.screenShareAudioEnabled = hasAudio;
        this.screenShareSupportsAudio = hasAudio;
      });
      if (!hasAudio) {
        this.session.setScreenShareAudioMuted(true);
      }
    } catch (err) {
      this.logger.warn("startScreenShare failed", err);
      void this.session.stopScreenShare().catch(() => {});
      runInAction(() => {
        this.screenShareEnabled = false;
        this.screenShareAudioEnabled = false;
        this.screenShareSupportsAudio = false;
      });
      const message = err instanceof Error ? err.message : String(err);
      if (message === "SCREEN_CAPTURE_DENIED") {
        void openScreenCaptureSettings();
      }
    }
  }

  toggleCamera() {
    this.cameraEnabled = !this.cameraEnabled;

    if (this.cameraEnabled) {
      if (!this.currentCameraDeviceId) {
        const fallback =
          this.cameras.find((d) => d.deviceId === "default") ??
          this.cameras[0] ??
          null;
        if (fallback)
          runInAction(() => {
            this.currentCameraDeviceId = fallback.deviceId;
          });
      }
      if (this.connectionStatus === "connected" && this.abortController) {
        void this.session
          .startCamera(this.abortController.signal)
          .catch((err) => {
            this.logger.warn("startCamera failed", err);
            runInAction(() => {
              this.cameraEnabled = false;
            });
          });
      }
    } else {
      void this.session.stopCamera().catch((err) => {
        this.logger.warn("stopCamera failed", err);
      });
    }
  }

  setInputDeviceId(deviceId: string) {
    const changed = this.currentInputDeviceId !== deviceId;
    runInAction(() => {
      this.currentInputDeviceId = deviceId;
    });
    this.session.setInputDeviceId(deviceId);
    if (
      changed &&
      this.connectionStatus === "connected" &&
      this.abortController
    ) {
      void this.session.restartMic(this.abortController.signal).catch((err) => {
        this.logger.warn("restartMic failed", err);
      });
    }
  }

  setOutputDeviceId(deviceId: string) {
    runInAction(() => {
      this.currentOutputDeviceId = deviceId;
    });
    this.session.setOutputDeviceId(deviceId);
  }

  setCameraDeviceId(deviceId: string) {
    const changed = this.currentCameraDeviceId !== deviceId;
    runInAction(() => {
      this.currentCameraDeviceId = deviceId;
    });
    this.session.setCameraDeviceId(deviceId);
    if (
      changed &&
      this.cameraEnabled &&
      this.connectionStatus === "connected" &&
      this.abortController
    ) {
      void this.session
        .restartCamera(this.abortController.signal)
        .catch((err) => {
          this.logger.warn("restartCamera failed", err);
          runInAction(() => {
            this.cameraEnabled = false;
          });
        });
    }
  }

  async setupTracks(
    requestPermissions = false
  ): Promise<{ inputChanged: boolean }> {
    const previousInputDeviceId = this.currentInputDeviceId;

    try {
      let devices = (await navigator.mediaDevices.enumerateDevices()).filter(
        (d) => d.deviceId !== ""
      );

      if (requestPermissions && !devices.some((d) => !!d.label)) {
        try {
          const tmp = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
          });
          tmp.getTracks().forEach((t) => {
            try {
              t.stop();
            } catch {}
          });
        } catch {
          // Camera unavailable or denied — still unlock audio device labels
          try {
            const tmp = await navigator.mediaDevices.getUserMedia({
              audio: true
            });
            tmp.getTracks().forEach((t) => {
              try {
                t.stop();
              } catch {}
            });
          } catch {}
        }
        devices = (await navigator.mediaDevices.enumerateDevices()).filter(
          (d) => d.deviceId !== ""
        );
      }

      const inputIds = new Set(
        devices.filter((d) => d.kind === "audioinput").map((d) => d.deviceId)
      );
      const outputIds = new Set(
        devices.filter((d) => d.kind === "audiooutput").map((d) => d.deviceId)
      );
      const cameraIds = new Set(
        devices.filter((d) => d.kind === "videoinput").map((d) => d.deviceId)
      );

      runInAction(() => {
        this.inputs = observable.array(
          devices.filter((d) => d.kind === "audioinput")
        );
        this.outputs = observable.array(
          devices.filter((d) => d.kind === "audiooutput")
        );
        this.cameras = observable.array(
          devices.filter((d) => d.kind === "videoinput")
        );

        if (
          !this.currentInputDeviceId ||
          !inputIds.has(this.currentInputDeviceId)
        )
          this.currentInputDeviceId =
            devices.find(
              (d) => d.kind === "audioinput" && d.deviceId === "default"
            )?.deviceId ??
            devices.find((d) => d.kind === "audioinput")?.deviceId ??
            null;

        if (
          !this.currentOutputDeviceId ||
          !outputIds.has(this.currentOutputDeviceId)
        )
          this.currentOutputDeviceId =
            devices.find(
              (d) => d.kind === "audiooutput" && d.deviceId === "default"
            )?.deviceId ??
            devices.find((d) => d.kind === "audiooutput")?.deviceId ??
            null;

        if (this.cameraEnabled) {
          if (
            !this.currentCameraDeviceId ||
            !cameraIds.has(this.currentCameraDeviceId)
          )
            this.currentCameraDeviceId =
              devices.find(
                (d) => d.kind === "videoinput" && d.deviceId === "default"
              )?.deviceId ??
              devices.find((d) => d.kind === "videoinput")?.deviceId ??
              null;
        } else if (
          this.currentCameraDeviceId &&
          !cameraIds.has(this.currentCameraDeviceId)
        ) {
          this.currentCameraDeviceId = null;
        }
      });

      this.session.setInputDeviceId(this.currentInputDeviceId);
      this.session.setOutputDeviceId(this.currentOutputDeviceId);
      this.session.setCameraDeviceId(
        this.cameraEnabled ? this.currentCameraDeviceId : null
      );

      return {
        inputChanged: previousInputDeviceId !== this.currentInputDeviceId
      };
    } catch (err) {
      this.logger.warn("setupTracks failed", err);
      return { inputChanged: false };
    }
  }

  getVideoStreamForUser(userId: string) {
    const screenId = this.screenProducerByUser.get(userId);
    if (screenId) return this.session.getVideoStream(screenId);

    const cameraId = this.cameraProducerByUser.get(userId);
    if (cameraId) return this.session.getVideoStream(cameraId);

    return null;
  }

  getScreenStreamForUser(userId: string) {
    if (
      userId !== this.app.account?.id &&
      !this.watchedScreenShares.has(userId)
    ) {
      return null;
    }

    const screenId = this.screenProducerByUser.get(userId);
    return screenId ? this.session.getVideoStream(screenId) : null;
  }

  getCameraStreamForUser(userId: string) {
    const cameraId = this.cameraProducerByUser.get(userId);
    return cameraId ? this.session.getVideoStream(cameraId) : null;
  }

  getVideoElementForUser(userId: string) {
    const screenId = this.screenProducerByUser.get(userId);
    if (screenId) return this.session.getVideoElement(screenId);

    const cameraId = this.cameraProducerByUser.get(userId);
    if (!cameraId) return null;
    return this.session.getVideoElement(cameraId);
  }

  setVoiceStateProducerId(
    userId: string,
    producerId: string,
    mediaKind: Exclude<MediaKind, "audio"> = "camera"
  ) {
    this.producerToUserMap.set(producerId, userId);
    this.producerMediaKind.set(producerId, mediaKind);
    if (mediaKind === "screen") {
      this.screenProducerByUser.set(userId, producerId);
    } else {
      this.cameraProducerByUser.set(userId, producerId);
    }
  }

  private async startConnection() {
    const endpoint = this.pendingEndpoint;
    const token = this.pendingToken;

    if (!endpoint || !token) {
      this.logger.warn("startConnection called with no pending credentials");
      this.failJoin(
        i18n.t("voice.errors.credentialsMissing", { ns: "chat" })
      );
      return;
    }

    this.abortAndTeardown();
    const generation = this.connectionGeneration;

    const controller = new AbortController();
    this.abortController = controller;
    const { signal } = controller;

    runInAction(() => {
      this.connectionStatus = "connecting";
      this.connectionError = null;
    });

    try {
      await this.setupTracks(true);
      if (generation !== this.connectionGeneration || signal.aborted) return;

      this.session.setInputDeviceId(this.currentInputDeviceId);
      this.session.setOutputDeviceId(this.currentOutputDeviceId);
      this.session.setCameraDeviceId(
        this.cameraEnabled ? this.currentCameraDeviceId : null
      );
      this.session.setSelfMute(this.selfMute);
      this.session.setSelfDeaf(this.selfDeaf);
      this.applyVoiceSettings();

      await this.session.connect(endpoint, token, signal);

      if (generation !== this.connectionGeneration || signal.aborted) return;

      try {
        await this.session.startMic(signal);
      } catch (err) {
        this.logger.warn("startMic after connect failed", err);
      }

      if (generation !== this.connectionGeneration || signal.aborted) return;

      if (this.cameraEnabled) {
        try {
          await this.session.startCamera(signal);
        } catch (err) {
          this.logger.warn("startCamera after connect failed", err);
          runInAction(() => {
            this.cameraEnabled = false;
          });
        }
      }

      if (generation !== this.connectionGeneration || signal.aborted) return;

      if (this.screenShareEnabled && this.lastScreenShareConfig) {
        try {
          const config = this.lastScreenShareConfig;
          const hasAudio = await this.session.startScreenShare(
            signal,
            () => acquireScreenCaptureStream(config, signal),
            config
          );
          runInAction(() => {
            this.screenShareAudioEnabled = hasAudio;
            this.screenShareSupportsAudio = hasAudio;
          });
          if (!hasAudio) {
            this.session.setScreenShareAudioMuted(true);
          }
        } catch (err) {
          this.logger.warn("startScreenShare after connect failed", err);
          runInAction(() => {
            this.screenShareEnabled = false;
            this.screenShareAudioEnabled = false;
          });
        }
      }

      if (generation !== this.connectionGeneration || signal.aborted) return;

      runInAction(() => {
        this.connectionStatus = "connected";
        this.channelSwitchInProgress = false;
      });
      this.clearJoinTimeout();
      this.startKeepAlive();
      this.logger.debug("Voice connected");
    } catch (err) {
      if (generation !== this.connectionGeneration || signal.aborted) return;

      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn("Voice connection failed", { message });

      runInAction(() => {
        this.connectionStatus = "failed";
        this.connectionError = message;
        this.channelSwitchInProgress = false;
      });
      this.clearJoinTimeout();
    }
  }

  private failJoin(message: string, options: { notifyServer?: boolean } = {}) {
    this.clearJoinTimeout();
    this.abortAndTeardown();
    this.stopKeepAlive();

    runInAction(() => {
      this.connectionStatus = "failed";
      this.connectionError = message;
      this.currentVoiceTarget = null;
      this.currentSessionId = null;
      this.channelSwitchInProgress = false;
      this.cameraEnabled = false;
      this.screenShareEnabled = false;
    });

    this.clearLocalVoiceStateForMe();
    this.speakingUsers.clear();

    if (options.notifyServer !== false) {
      void this.sendVoiceStateUpdate();
    }
  }

  private startJoinTimeout() {
    this.clearJoinTimeout();
    this.joinTimeoutTimer = window.setTimeout(() => {
      if (this.connectionStatus === "connecting") {
        this.failJoin(i18n.t("voice.errors.timedOut", { ns: "chat" }));
      }
    }, VOICE_JOIN_TIMEOUT_MS);
  }

  private clearJoinTimeout() {
    if (this.joinTimeoutTimer != null) {
      clearTimeout(this.joinTimeoutTimer);
      this.joinTimeoutTimer = null;
    }
  }

  private abortAndTeardown() {
    this.connectionGeneration++;
    this.endMicTestIsolation();
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.session.teardown();
  }

  private clearLocalVoiceStateForMe() {
    const id = this.app.account?.id;
    if (!id) return;
    this.app.voiceStates.remove(id);
    this.cameraProducerByUser.delete(id);
    this.screenProducerByUser.delete(id);
    this.screenAudioProducerByUser.delete(id);
    this.availableScreenShares.delete(id);
    this.availableScreenAudioShares.delete(id);
    this.watchedScreenShares.delete(id);
  }

  private syncSelfFromState(state: VoiceState) {
    const accountId = this.app.account?.id;
    if (!accountId || state.userId !== accountId) return;

    const forcedMute = state.spaceMute ?? false;
    const forcedDeaf = state.spaceDeaf ?? false;
    const inVoice = state.channelId != null;

    runInAction(() => {
      this.spaceMute = forcedMute;
      this.spaceDeaf = forcedDeaf;

      if (inVoice) {
        this.selfMute = this.spaceMute || state.selfMute;
        this.selfDeaf = this.spaceDeaf || state.selfDeaf;
      } else {
        this.selfMute = this.spaceMute
          ? true
          : (this.app.settings?.preferredSelfMute ?? false);

        this.selfDeaf = this.spaceDeaf
          ? true
          : (this.app.settings?.preferredSelfDeaf ?? false);

        if (this.selfDeaf) this.selfMute = true;
      }
    });

    this.session.setSelfMute(this.selfMute);
    this.session.setSelfDeaf(this.selfDeaf);
    this.session.setSpaceMute(this.spaceMute);
  }

  private async sendVoiceStateUpdate(options?: { refreshRtc?: boolean }) {
    const spaceId = this.currentVoiceTarget?.spaceId ?? null;
    const channelId = this.currentVoiceTarget?.channelId ?? null;

    await this.app.gateway.send({
      op: GatewayOpcodes.VoiceStateUpdate,
      d: {
        spaceId,
        channelId,
        selfMute: this.spaceMute ? true : this.selfMute,
        selfDeaf: this.spaceDeaf ? true : this.selfDeaf,
        client: isElectron ? "desktop" : "web",
        ...(options?.refreshRtc ? { refreshRtc: true } : {}),
      }
    });
  }

  private startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveTimer = window.setInterval(() => {
      void this.sendVoiceStateUpdate();
    }, 15_000);
  }

  private stopKeepAlive() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }
}
