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

export type VoiceConnectionStatus =
    | "idle"
    | "connecting"
    | "connected"
    | "failed";

type MediaKind = "camera" | "screen" | "audio";

interface StreamMetadata {
    stream: MediaStream;
    kind: MediaKind;
    element?: HTMLAudioElement | HTMLVideoElement;
}

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
    private cameraTrack: MediaStreamTrack | null = null;
    private micProducer: mediasoupClient.types.Producer | null = null;
    private cameraProducer: mediasoupClient.types.Producer | null = null;
    private audioContext: AudioContext | null = null;
    private audioSourceNodes = new Map<string, AudioNode>(); // producerId → source node

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
    private pendingProducerIds = new Map<string, string>(); // producerId → userId
    private setupComplete = false;
    private isMuted = false;
    private isDeafened = false;
    private currentInputDeviceId: string | null = null;
    private currentOutputDeviceId: string | null = null;
    private currentCameraDeviceId: string | null = null;
    private readonly logger = new Logger({ tag: "VoiceSession" });

    private speakingAnalyser: AnalyserNode | null = null;
    private speakingSourceNode: MediaStreamAudioSourceNode | null = null;
    private speakingTimer: number | null = null;
    private speakingState = false;
    private speakingUserId: string | null = null;

    constructor(
        private readonly app: AppStore,
        private readonly onVideoConsumed: (
            userId: string,
            producerId: string
        ) => void,
        private readonly onVideoClosed: (producerId: string) => void,
        private readonly onSocketClosed: (
            event?: CloseEvent | { code?: number; reason?: string }
        ) => void,
        private readonly onSpeakingChange: (
            userId: string,
            speaking: boolean
        ) => void
    ) {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    unlockAudio() {
        if (!this.audioContext) {
            this.audioContext = new AudioContext();
        }
        // Always attempt resume - Electron may suspend it even after creation
        if (this.audioContext.state === "suspended") {
            void this.audioContext.resume();
        }
    }

    getLocalCameraStream() {
        return this.cameraTrack ? new MediaStream([this.cameraTrack]) : null;
    }

    setInputDeviceId(id: string | null) {
        this.currentInputDeviceId = id;
    }

    setOutputDeviceId(id: string | null) {
        this.currentOutputDeviceId = id;
        if (!id) return;
        for (const [, meta] of this.streamMetadata) {
            // Audio is routed through AudioContext - only video elements use setSinkId
            if (meta.kind !== "audio" && meta.element)
                void safeSetSinkId(meta.element, id, this.logger, meta.kind);
        }
    }

    setCameraDeviceId(id: string | null) {
        this.currentCameraDeviceId = id;
    }

    setSelfMute(muted: boolean) {
        this.isMuted = muted;
        if (this.micProducer) {
            try {
                muted ? this.micProducer.pause() : this.micProducer.resume();
            } catch {}
        } else if (this.micTrack) {
            try {
                this.micTrack.enabled = !muted;
            } catch {}
        }
    }

    setSelfDeaf(deafened: boolean) {
        this.isDeafened = deafened;
        // Audio streams are routed through AudioContext nodes, not HTMLAudioElement.
        // Deafen = disconnect from destination; undeafen = reconnect.
        if (this.audioContext) {
            for (const [producerId, sourceNode] of this.audioSourceNodes) {
                const meta = this.streamMetadata.get(producerId);
                if (!meta || meta.kind !== "audio") continue;
                try {
                    if (deafened) {
                        (sourceNode as AudioNode).disconnect();
                    } else {
                        (sourceNode as AudioNode).connect(
                            this.audioContext.destination
                        );
                    }
                } catch {
                    // disconnect() throws if not connected - safe to ignore
                }
            }
        }
        // Still mute video elements if any
        for (const [, meta] of this.streamMetadata) {
            if (meta.kind !== "audio" && meta.element) {
                try {
                    meta.element.muted = deafened;
                } catch {}
            }
        }
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
                codecOptions: {
                    videoGoogleStartBitrate: 1000,
                    videoGoogleMaxBitrate: 9000
                }
            });
        });
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
        try {
            this.micProducer?.close();
        } catch {}
        this.micProducer = null;
        if (this.micTrack) {
            try {
                this.micTrack.stop();
            } catch {}
            this.micTrack = null;
        }
        if (!this.sendTransport) return;
        await this.startMic(signal);
    }

    async connect(endpoint: string, token: string, signal: AbortSignal) {
        this.setupComplete = false;

        const url = new URL(endpoint);
        url.searchParams.set("token", token);

        const socket = await this.openSocket(url.toString(), signal);
        if (signal.aborted) {
            socket.close(1000, "superseded");
            return;
        }

        this.socket = socket;
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
            ({ kind, rtpParameters }, callback, errback) => {
                void this.rpc(VoiceOpcodes.VoiceProduce, {
                    transportId: sendTransport.id,
                    kind,
                    rtpParameters
                })
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
        this.pendingProducerIds.clear();

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
        try {
            this.micProducer?.close();
        } catch {}
        this.micProducer = null;
        if (this.micTrack) {
            try {
                this.micTrack.stop();
            } catch {}
            this.micTrack = null;
        }

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
    }

    async startMic(signal: AbortSignal) {
        if (!this.sendTransport) return;

        let media: MediaStream;
        try {
            media = await this.getUserMedia(
                {
                    audio: this.currentInputDeviceId
                        ? {
                              echoCancellation: true,
                              noiseSuppression: true,
                              autoGainControl: true,
                              deviceId: { exact: this.currentInputDeviceId }
                          }
                        : {
                              echoCancellation: true,
                              noiseSuppression: true,
                              autoGainControl: true
                          },
                    video: false
                },
                signal
            );
        } catch {
            // Mic permission denied - continue without mic, just muted
            this.setSelfMute(true);
            return;
        }

        if (signal.aborted) {
            media.getTracks().forEach((t) => t.stop());
            return;
        }

        const [audioTrack] = media.getAudioTracks();
        if (!audioTrack) {
            this.setSelfMute(true);
            return;
        }

        this.micTrack = audioTrack;
        const userId = this.app.account?.id;
        if (userId) {
            const localStream = new MediaStream([audioTrack]);
            this.startSpeakingDetection(localStream, userId);
        }
        this.micProducer = await this.sendTransport.produce({
            track: audioTrack,
            codecOptions: { opusStereo: true, opusDtx: true }
        });

        this.setSelfMute(this.isMuted);
    }

    private startSpeakingDetection(stream: MediaStream, userId: string) {
        this.stopSpeakingDetection();

        const AudioContextCtor =
            window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextCtor) return;

        if (!this.audioContext) {
            this.audioContext = new AudioContextCtor();
        }

        this.speakingUserId = userId;
        this.speakingAnalyser = this.audioContext.createAnalyser();
        this.speakingAnalyser.fftSize = 512;

        this.speakingSourceNode =
            this.audioContext.createMediaStreamSource(stream);
        this.speakingSourceNode.connect(this.speakingAnalyser);

        const data = new Uint8Array(this.speakingAnalyser.frequencyBinCount);
        const threshold = 0.2; // Update this when we add settings for sensitivity
        const onDelay = 120;
        const offDelay = 180;

        let lastAbove = 0;
        let lastBelow = 0;

        const tick = () => {
            if (!this.speakingAnalyser || !this.speakingUserId) return;

            this.speakingAnalyser.getByteTimeDomainData(data);

            let sum = 0;
            for (const v of data) {
                const x = (v - 128) / 128;
                sum += x * x;
            }
            const rms = Math.sqrt(sum / data.length);
            const now = performance.now();
            const above = rms > threshold;

            if (above) {
                lastAbove = now;
                if (!this.speakingState && now - lastBelow > offDelay) {
                    this.speakingState = true;
                    this.onSpeakingChange(this.speakingUserId, true);
                }
            } else {
                lastBelow = now;
                if (this.speakingState && now - lastAbove > onDelay) {
                    this.speakingState = false;
                    this.onSpeakingChange(this.speakingUserId, false);
                }
            }

            this.speakingTimer = window.setTimeout(tick, 50);
        };

        tick();
    }

    private stopSpeakingDetection() {
        if (this.speakingTimer != null) {
            clearTimeout(this.speakingTimer);
            this.speakingTimer = null;
        }

        try {
            this.speakingSourceNode?.disconnect();
        } catch {}

        try {
            this.speakingAnalyser?.disconnect();
        } catch {}

        this.speakingSourceNode = null;
        this.speakingAnalyser = null;
        this.speakingState = false;

        if (this.speakingUserId) {
            this.onSpeakingChange(this.speakingUserId, false);
            this.speakingUserId = null;
        }
    }

    private async playElement(element: HTMLMediaElement) {
        try {
            await element.play();
        } catch {
            if (this.audioContext?.state === "suspended") {
                await this.audioContext.resume();
            }
            try {
                await element.play();
            } catch (err) {
                this.logger.debug(
                    `${element instanceof HTMLVideoElement ? "Video" : "Audio"} cannot be played`,
                    err
                );
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
            ws.onclose = () =>
                reject(new Error("Voice socket closed before open"));

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
        signal: AbortSignal
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

        const stream = new MediaStream([consumer.track]);
        const kind: MediaKind = consumer.kind === "video" ? "camera" : "audio";

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

            this.onVideoConsumed(userId, producerId);

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

            const sourceNode = audioCtx.createMediaStreamSource(stream);

            if (!this.isDeafened) {
                sourceNode.connect(audioCtx.destination);
            }

            this.audioSourceNodes.set(producerId, sourceNode);

            this.streamMetadata.set(producerId, {
                stream,
                kind,
                element: undefined
            });

            await this.rpc(VoiceOpcodes.VoiceResumeConsumer, {
                consumerId: consumer.id
            });
        }
    }

    private async flushPendingProducers(signal: AbortSignal) {
        const queued = Array.from(this.pendingProducerIds.entries());
        this.pendingProducerIds.clear();
        for (const [producerId, userId] of queued) {
            if (signal.aborted) return;
            await this.consumeProducer(producerId, userId, signal);
        }
    }

    private onMessage(raw: string) {
        let envelope: any;
        try {
            envelope = JSON.parse(raw);
        } catch {
            return;
        }

        if (envelope.id == null && envelope.op != null) {
            void this.onPush(envelope.op, envelope.data);
            return;
        }

        // RPC response

        const pending = this.pendingRequests.get(envelope.id ?? "");
        if (!pending) return;
        this.pendingRequests.delete(envelope.id);

        if (envelope.ok) pending.resolve(envelope.data ?? {});
        else
            pending.reject(
                new Error(envelope.error?.message ?? "Voice RPC error")
            );
    }

    private async onPush(op: string, data: any) {
        if (op === VoiceDispatchEvents.VoiceProducerClosed) {
            const { producerId } = data ?? {};
            if (!producerId) return;

            const consumer = this.consumersByProducerId.get(producerId);
            if (consumer) {
                try {
                    consumer.close();
                } catch {}
                this.consumersByProducerId.delete(producerId);
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

            this.onVideoClosed(producerId);
            return;
        }

        if (op === VoiceDispatchEvents.VoiceNewProducer) {
            const { producerId, userId } = data ?? {};
            if (!producerId || !userId) return;

            if (!this.setupComplete) {
                this.pendingProducerIds.set(producerId, userId);
                return;
            }

            await this.consumeProducer(
                producerId,
                userId,
                new AbortController().signal
            );
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
                if (i < retries)
                    await new Promise((r) => setTimeout(r, 100 * (i + 1)));
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

    inputs = observable.array<MediaDeviceInfo>([]);
    outputs = observable.array<MediaDeviceInfo>([]);
    cameras = observable.array<MediaDeviceInfo>([]);

    currentInputDeviceId: string | null = null;
    currentOutputDeviceId: string | null = null;
    currentCameraDeviceId: string | null = null;
    disconnectBanner: string | null = null;
    currentSessionId: string | null = null;
    private voiceStateProducerMap = new Map<string, string>();
    private producerToUserMap = new Map<string, string>();
    private readonly session: MediasoupSession;
    private readonly logger = new Logger({ tag: "VoiceStore" });
    private keepAliveTimer: number | null = null;
    private abortController: AbortController | null = null;
    private pendingEndpoint: string | null = null;
    private pendingToken: string | null = null;

    private speakingUsers = observable.map<string, boolean>();

    constructor(private readonly app: AppStore) {
        this.session = new MediasoupSession(
            app,
            (userId, producerId) => {
                runInAction(() => {
                    this.voiceStateProducerMap.set(userId, producerId);
                    this.producerToUserMap.set(producerId, userId);
                });
            },
            (producerId) => {
                const userId = this.producerToUserMap.get(producerId);
                if (userId) {
                    runInAction(() => {
                        this.voiceStateProducerMap.delete(userId);
                        this.producerToUserMap.delete(producerId);
                    });
                }
            },
            (ev) => {
                let reason =
                    ev?.reason ??
                    (ev && ev.code ? `code ${ev.code}` : "Disconnected");

                switch (reason) {
                    case "superseded": {
                        reason = "Connected from a different device";
                        break;
                    }
                }

                runInAction(() => {
                    this.disconnectBanner = `Disconnected from voice: ${reason}`;
                    this.disconnectedFrom = this.currentVoiceTarget;
                    this.connectionStatus = "idle";
                    this.connectionError = reason;
                    this.currentVoiceTarget = null;
                    this.cameraEnabled = false;
                });
                try {
                    this.abortAndTeardown();
                    this.clearLocalVoiceStateForMe();
                    this.stopKeepAlive();
                } catch {}
            },
            (userId, speaking) => {
                runInAction(() => {
                    this.setUserSpeaking(userId, speaking);
                });
            }
        );

        makeAutoObservable(this, {}, { autoBind: true });

        makePersistable(this, {
            name: "VoiceStore",
            properties: [
                "currentInputDeviceId",
                "currentOutputDeviceId",
                "currentCameraDeviceId"
            ],
            storage: localStorage
        });
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
        if (space)
            return space.channels.find((ch) => ch.id === channelId) ?? null;
        return this.app.channels.get(channelId) ?? null;
    }

    get hasActiveVoiceTarget() {
        return !!this.currentVoiceTarget;
    }

    get isInSpaceVoice() {
        return !!this.currentSpaceId;
    }

    get currentInputDevice() {
        return this.inputs.find(
            (d) => d.deviceId === this.currentInputDeviceId
        );
    }

    get currentOutputDevice() {
        return this.outputs.find(
            (d) => d.deviceId === this.currentOutputDeviceId
        );
    }

    get currentCameraDevice() {
        return this.cameras.find(
            (d) => d.deviceId === this.currentCameraDeviceId
        );
    }

    get voiceStates() {
        return this.app.voiceStates.getAllByChannel(
            this.currentVoiceTarget?.channelId
        );
    }

    get effectiveSelfDeaf() {
        return (
            this.spaceDeaf || (this.app.settings?.preferredSelfDeaf ?? false)
        );
    }

    get effectiveSelfMute() {
        if (this.spaceDeaf || this.spaceMute) return true;
        if (this.effectiveSelfDeaf) return true;
        return this.app.settings?.preferredSelfMute ?? false;
    }

    isUserSpeaking(userId: string) {
        return this.speakingUsers.get(userId) ?? false;
    }

    setUserSpeaking(userId: string, speaking: boolean) {
        if (speaking) this.speakingUsers.set(userId, true);
        else this.speakingUsers.delete(userId);
    }

    clearDisconnectBanner() {
        this.disconnectBanner = null;
    }

    onVoiceServerUpdate(payload: VoiceServerUpdatePayload) {
        this.pendingEndpoint = payload.voiceEndpoint;
        this.pendingToken = payload.voiceToken;

        runInAction(() => {
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

        if (!channelId) {
            this.app.voiceStates.upsert({
                ...state,
                channelId: null,
                spaceId: state.spaceId ?? null,
                disconnectedAt: Date.now()
            });

            this.voiceStateProducerMap.delete(state.userId);
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

    async join(target: VoiceTarget) {
        const isSame =
            this.currentVoiceTarget?.spaceId === (target.spaceId ?? null) &&
            this.currentVoiceTarget?.channelId === target.channelId;
        if (isSame) return;

        this.session.unlockAudio();

        runInAction(() => {
            this.disconnectBanner = null;
            this.currentVoiceTarget = target;
            this.connectionStatus = "connecting";
            this.connectionError = null;
        });

        this.session.setInputDeviceId(this.currentInputDeviceId);
        this.session.setOutputDeviceId(this.currentOutputDeviceId);

        const preferredSelfMute = this.app.settings?.preferredSelfMute ?? false;
        const preferredSelfDeaf = this.app.settings?.preferredSelfDeaf ?? false;

        this.session.setSelfMute(preferredSelfMute);
        this.session.setSelfDeaf(preferredSelfDeaf);

        await this.sendVoiceStateUpdate();
        this.startKeepAlive();
    }

    async leave() {
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
            this.cameraEnabled = false;
        });

        this.clearLocalVoiceStateForMe();
        this.speakingUsers.clear();

        await this.sendVoiceStateUpdate();
    }

    reset() {
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
            this.cameraEnabled = false;
            this.selfMute = false;
            this.selfDeaf = false;
            this.spaceMute = false;
            this.spaceDeaf = false;
        });

        this.speakingUsers.clear();
        this.clearLocalVoiceStateForMe();
    }

    setMute(value: boolean) {
        if (this.spaceDeaf) return;

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
            void this.session
                .restartMic(this.abortController.signal)
                .catch((err) => {
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
        runInAction(() => {
            this.currentCameraDeviceId = deviceId;
            if (!this.cameraEnabled) this.cameraEnabled = true;
        });
        this.session.setCameraDeviceId(deviceId);
    }

    async setupTracks() {
        try {
            let devices = (
                await navigator.mediaDevices.enumerateDevices()
            ).filter((d) => d.deviceId !== "");

            if (!devices.some((d) => !!d.label)) {
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
                } catch {}
                devices = (
                    await navigator.mediaDevices.enumerateDevices()
                ).filter((d) => d.deviceId !== "");
            }

            const inputIds = new Set(
                devices
                    .filter((d) => d.kind === "audioinput")
                    .map((d) => d.deviceId)
            );
            const outputIds = new Set(
                devices
                    .filter((d) => d.kind === "audiooutput")
                    .map((d) => d.deviceId)
            );
            const cameraIds = new Set(
                devices
                    .filter((d) => d.kind === "videoinput")
                    .map((d) => d.deviceId)
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
                            (d) =>
                                d.kind === "audioinput" &&
                                d.deviceId === "default"
                        )?.deviceId ??
                        devices.find((d) => d.kind === "audioinput")
                            ?.deviceId ??
                        null;

                if (
                    !this.currentOutputDeviceId ||
                    !outputIds.has(this.currentOutputDeviceId)
                )
                    this.currentOutputDeviceId =
                        devices.find(
                            (d) =>
                                d.kind === "audiooutput" &&
                                d.deviceId === "default"
                        )?.deviceId ??
                        devices.find((d) => d.kind === "audiooutput")
                            ?.deviceId ??
                        null;

                if (this.cameraEnabled) {
                    if (
                        !this.currentCameraDeviceId ||
                        !cameraIds.has(this.currentCameraDeviceId)
                    )
                        this.currentCameraDeviceId =
                            devices.find(
                                (d) =>
                                    d.kind === "videoinput" &&
                                    d.deviceId === "default"
                            )?.deviceId ??
                            devices.find((d) => d.kind === "videoinput")
                                ?.deviceId ??
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
        } catch (err) {
            this.logger.warn("setupTracks failed", err);
        }
    }

    getVideoStreamForUser(userId: string) {
        const producerId = this.voiceStateProducerMap.get(userId);
        if (!producerId) return null;
        return this.session.getVideoStream(producerId);
    }

    getVideoElementForUser(userId: string) {
        const producerId = this.voiceStateProducerMap.get(userId);
        if (!producerId) return null;
        return this.session.getVideoElement(producerId);
    }

    getProducerIdsOfKind(kind: MediaKind) {
        return this.session.getProducerIds(kind);
    }

    setVoiceStateProducerId(userId: string, producerId: string) {
        this.voiceStateProducerMap.set(userId, producerId);
    }

    private async startConnection() {
        const endpoint = this.pendingEndpoint;
        const token = this.pendingToken;

        if (!endpoint || !token) {
            this.logger.warn(
                "startConnection called with no pending credentials"
            );
            return;
        }

        this.abortAndTeardown();

        const controller = new AbortController();
        this.abortController = controller;
        const { signal } = controller;

        runInAction(() => {
            this.connectionStatus = "connecting";
            this.connectionError = null;
        });

        try {
            this.session.setInputDeviceId(this.currentInputDeviceId);
            this.session.setOutputDeviceId(this.currentOutputDeviceId);
            this.session.setCameraDeviceId(
                this.cameraEnabled ? this.currentCameraDeviceId : null
            );
            this.session.setSelfMute(this.selfMute);
            this.session.setSelfDeaf(this.selfDeaf);

            await this.session.connect(endpoint, token, signal);

            if (signal.aborted) return; // superseded by leave/channel-switch

            try {
                await this.session.startMic(signal);
            } catch (err) {
                this.logger.warn("startMic after connect failed", err);
            }

            if (signal.aborted) return;

            // Start camera if enabled
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

            if (signal.aborted) return;

            runInAction(() => {
                this.connectionStatus = "connected";
            });
            this.logger.debug("Voice connected");
        } catch (err) {
            if (signal.aborted) return; // not an error. we were told to stop

            const message = err instanceof Error ? err.message : String(err);
            this.logger.warn("Voice connection failed", { message });

            runInAction(() => {
                this.connectionStatus = "failed";
                this.connectionError = message;
            });
        }
    }

    private abortAndTeardown() {
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
        this.voiceStateProducerMap.delete(id);
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
    }

    private async sendVoiceStateUpdate() {
        const spaceId = this.currentVoiceTarget?.spaceId ?? null;
        const channelId = this.currentVoiceTarget?.channelId ?? null;

        const preferredSelfMute = this.app.settings?.preferredSelfMute ?? false;
        const preferredSelfDeaf = this.app.settings?.preferredSelfDeaf ?? false;

        const outgoingSelfDeaf = this.spaceDeaf ? true : preferredSelfDeaf;

        await this.app.gateway.send({
            op: GatewayOpcodes.VoiceStateUpdate,
            d: {
                spaceId,
                channelId,
                selfMute: preferredSelfMute,
                selfDeaf: outgoingSelfDeaf
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
