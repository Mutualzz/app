import {
    type IObservableArray,
    makeAutoObservable,
    observable,
    runInAction,
} from "mobx";
import * as mediasoupClient from "mediasoup-client";
import {
    GatewayOpcodes,
    VoiceDispatchEvents,
    type VoiceOpcode,
    VoiceOpcodes,
} from "@mutualzz/types";
import type { AppStore } from "@stores/App.store.ts";
import type {
    VoiceServerUpdatePayload,
    VoiceStateSyncPayload,
    VoiceTarget,
} from "@app-types/index.ts";
import { isSSR } from "@utils/index.ts";
import { makePersistable } from "mobx-persist-store";
import { safeLocalStorage } from "@storages/safeLocalStorage";
import { Logger } from "@mutualzz/logger";
import { VoiceState } from "@stores/objects/VoiceState.ts";

export type VoiceConnectionStatus =
    | "idle"
    | "signaling"
    | "connecting"
    | "connected"
    | "failed"
    | "reconnecting";

class MediasoupSession {
    private socket: WebSocket | null = null;

    private currentInputDeviceId: string | null = null;
    private currentOutputDeviceId: string | null = null;
    private currentCameraDeviceId: string | null = null;

    private pending = new Map<
        string,
        { resolve: (v: any) => void; reject: (e: any) => void }
    >();

    private readonly logger = new Logger({
        tag: "VoiceSession",
    });

    private suppressOnDisconnected = 0;

    private connectAttemptId = 0;

    private device: mediasoupClient.types.Device | null = null;
    private sendTransport: mediasoupClient.types.Transport | null = null;
    private receiverTransport: mediasoupClient.types.Transport | null = null;

    private micTrack: MediaStreamTrack | null = null;
    private cameraTrack: MediaStreamTrack | null = null;
    private lastToken: string | null = null;

    private micProducer: mediasoupClient.types.Producer | null = null;
    private cameraProducer: mediasoupClient.types.Producer | null = null;

    private consumersByProducerId = new Map<
        string,
        mediasoupClient.types.Consumer
    >();
    private audioByProducerId = new Map<string, HTMLAudioElement>();
    private cameraByProducerId = new Map<string, HTMLVideoElement>();

    private isDeafened = false;
    private isMuted = false;

    constructor(private readonly onDisconnected: () => void) {
        makeAutoObservable(this);
    }

    setInputDeviceId(deviceId: string | null) {
        this.currentInputDeviceId = deviceId;
    }

    setOutputDeviceId(deviceId: string | null) {
        this.currentOutputDeviceId = deviceId;

        if (deviceId) {
            for (const [, audio] of this.audioByProducerId) {
                void audio
                    .setSinkId(deviceId)
                    .catch((err) => this.logger.warn("setSinkId failed", err));
            }
        }
    }

    setCameraDeviceId(deviceId: string | null) {
        this.currentCameraDeviceId = deviceId;

        if (deviceId) {
            for (const [, video] of this.cameraByProducerId) {
                void video
                    .setSinkId(deviceId)
                    .catch((err) => this.logger.warn("setSinkId failed", err));
            }
        }
    }

    setSelfMute(isMuted: boolean) {
        this.isMuted = isMuted;

        if (this.micProducer) {
            try {
                if (isMuted) this.micProducer.pause();
                else this.micProducer.resume();
            } catch {}
            return;
        }

        if (this.micTrack) {
            try {
                this.micTrack.enabled = !isMuted;
            } catch {}
        }
    }

    // Restart mic to apply a new input device
    async restartDevices() {
        try {
            this.micProducer?.close();
        } catch {}
        this.micProducer = null;

        try {
            this.cameraProducer?.close();
        } catch {}
        this.cameraProducer = null;

        if (this.micTrack) {
            try {
                this.micTrack.stop();
            } catch {}
            this.micTrack = null;
        }

        if (this.cameraTrack) {
            try {
                this.cameraTrack.stop();
            } catch {}
            this.cameraTrack = null;
        }

        if (!this.sendTransport) return;

        const attemptId = this.connectAttemptId;
        await this.startDevices(attemptId);
    }

    setSelfDeaf(isDeafened: boolean) {
        this.isDeafened = isDeafened;

        for (const [, audio] of this.audioByProducerId) {
            try {
                audio.muted = isDeafened;
            } catch {}
        }
    }

    async connect(options: { endpoint: string; token: string }) {
        const { endpoint, token } = options;

        if (
            this.lastToken === token &&
            this.socket?.readyState === WebSocket.OPEN
        )
            return;

        const attemptId = ++this.connectAttemptId;

        await this.withSuppressedDisconnectCallback(() =>
            this.disconnectInternal({ bumpAttempt: false }),
        );

        if (attemptId !== this.connectAttemptId) return;

        this.lastToken = token;

        const url = new URL(endpoint);
        url.searchParams.set("token", token);

        const socket = new WebSocket(url.toString());
        this.socket = socket;

        socket.onmessage = (event) => this.onMessage(String(event.data));

        socket.onclose = () => {
            if (this.socket === socket) this.cleanup();
        };

        await new Promise<void>((resolve, reject) => {
            socket.onopen = () => resolve();
            socket.onerror = () => {
                reject(new Error("Voice socket failed"));
            };
        });

        await this.setup(attemptId);
    }

    async disconnect() {
        await this.withSuppressedDisconnectCallback(() =>
            this.disconnectInternal({ bumpAttempt: true }),
        );
    }

    async withSuppressedDisconnectCallback<T>(
        fn: () => Promise<T>,
    ): Promise<T> {
        this.suppressOnDisconnected++;
        return fn().finally(() => {
            this.suppressOnDisconnected--;
        });
    }

    private async requestWithRetry(
        op: VoiceOpcode,
        data: any,
        retries = 4,
        delayMs = 100,
    ) {
        let lastError: unknown;

        for (let i = 0; i <= retries; i++) {
            try {
                return await this.request(op, data);
            } catch (error) {
                lastError = error;
                const message =
                    error instanceof Error ? error.message : String(error);

                if (!message.includes("Voice state not found")) throw error;

                if (i < retries) {
                    await new Promise((resolve) =>
                        setTimeout(resolve, delayMs * (i + 1)),
                    );
                }
            }
        }

        throw lastError;
    }

    private async setup(attemptId: number) {
        const capabilities = await this.request(
            VoiceOpcodes.VoiceGetRTPCapabilities,
            {},
        );

        if (attemptId !== this.connectAttemptId) throw this.cancelledError();

        const device = new mediasoupClient.Device();

        await device.load({
            routerRtpCapabilities: capabilities.rtpCapabilities,
        });

        this.device = device;

        const receiverTransportInfo = await this.request(
            VoiceOpcodes.VoiceCreateTransport,
            { direction: "receive" },
        );

        const receiverTransport = device.createRecvTransport(
            receiverTransportInfo.transportOptions,
        );

        receiverTransport.on(
            "connect",
            ({ dtlsParameters }, callback, errback) => {
                void this.request(VoiceOpcodes.VoiceConnectTransport, {
                    transportId: receiverTransport.id,
                    dtlsParameters,
                })
                    .then(() => callback())
                    .catch((err) => errback(err));
            },
        );

        this.receiverTransport = receiverTransport;

        await this.request(VoiceOpcodes.VoiceSetRTPCapabilities, {
            rtpCapabilities: device.recvRtpCapabilities,
        });

        const sendTransportInfo = await this.request(
            VoiceOpcodes.VoiceCreateTransport,
            { direction: "send" },
        );

        const sendTransport = device.createSendTransport(
            sendTransportInfo.transportOptions,
        );

        sendTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
            void this.request(VoiceOpcodes.VoiceConnectTransport, {
                transportId: sendTransport.id,
                dtlsParameters,
            })
                .then(() => callback())
                .catch((err) => errback(err));
        });

        sendTransport.on(
            "produce",
            ({ kind, rtpParameters }, callback, errback) => {
                void this.request(VoiceOpcodes.VoiceProduce, {
                    transportId: sendTransport.id,
                    kind,
                    rtpParameters,
                })
                    .then((data) => callback({ id: data.producerId }))
                    .catch((err) => errback(err));
            },
        );

        this.sendTransport = sendTransport;

        await this.startDevices(attemptId);
    }

    private cancelledError() {
        return new Error("Voice disconnected");
    }

    private async disconnectInternal(options: { bumpAttempt: boolean }) {
        if (options.bumpAttempt) this.connectAttemptId++;

        const socket = this.socket;
        this.socket = null;

        this.device = null;
        this.sendTransport = null;
        this.receiverTransport = null;

        if (socket && socket.readyState === WebSocket.OPEN) {
            try {
                socket.close(1000, "disconnect");
            } catch {}
        }

        this.cleanup();
    }

    private cleanup() {
        for (const [, p] of this.pending) {
            p.reject(this.cancelledError());
        }
        this.pending.clear();

        if (this.sendTransport) {
            try {
                this.sendTransport.close();
            } catch {}
            this.sendTransport = null;
        }

        if (this.receiverTransport) {
            try {
                this.receiverTransport.close();
            } catch {}
            this.receiverTransport = null;
        }

        for (const [, consumer] of this.consumersByProducerId) {
            try {
                consumer.close();
            } catch {}
        }
        this.consumersByProducerId.clear();

        for (const [, audio] of this.audioByProducerId) {
            try {
                audio.pause();
            } catch {}
            audio.srcObject = null;
        }
        this.audioByProducerId.clear();

        for (const [, camera] of this.cameraByProducerId) {
            try {
                camera.pause();
            } catch {}
            camera.srcObject = null;
        }
        this.cameraByProducerId.clear();

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

        if (this.suppressOnDisconnected === 0) {
            try {
                this.onDisconnected();
            } catch {}
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

        const id = envelope.id ?? "";
        if (!id) return;

        const pending = this.pending.get(id);
        if (!pending) return;

        this.pending.delete(id);

        if (envelope.ok) pending.resolve(envelope.data);
        else pending.reject(envelope.error);
    }

    private request(op: VoiceOpcode, data?: any): Promise<any> {
        const socket = this.socket;
        if (!socket || socket.readyState !== WebSocket.OPEN)
            return Promise.reject(new Error("Voice socket not connected"));

        const id = crypto.randomUUID();

        const envelope = {
            id,
            op,
            data,
        };

        socket.send(JSON.stringify(envelope));

        return new Promise((resolve, reject) => {
            this.pending.set(id, { resolve, reject });
        });
    }

    private async onPush(op: string, data: any) {
        if (op === VoiceDispatchEvents.VoiceProducerClosed) {
            const producerId = data?.producerId ?? "";
            if (!producerId) return;

            const consumer = this.consumersByProducerId.get(producerId);
            if (consumer) {
                try {
                    consumer.close();
                } catch {}
                this.consumersByProducerId.delete(producerId);
            }

            const audio = this.audioByProducerId.get(producerId);
            if (audio) {
                try {
                    audio.pause();
                } catch {}
                audio.srcObject = null;
                this.audioByProducerId.delete(producerId);
            }

            const camera = this.cameraByProducerId.get(producerId);
            if (camera) {
                try {
                    camera.pause();
                } catch {}
                camera.srcObject = null;
                this.cameraByProducerId.delete(producerId);
            }

            return;
        }

        if (op !== VoiceDispatchEvents.VoiceNewProducer) return;

        const producerId = data?.producerId ?? "";
        if (!producerId) return;

        if (!this.device || !this.receiverTransport) return;

        const response = await this.requestWithRetry(
            VoiceOpcodes.VoiceConsume,
            {
                producerId,
            },
        );

        const options = response.consumerOptions;

        const consumer = await this.receiverTransport.consume({
            id: options.id,
            producerId: options.producerId,
            kind: options.kind,
            rtpParameters: options.rtpParameters,
        });

        this.consumersByProducerId.set(producerId, consumer);

        const stream = new MediaStream([consumer.track]);

        // Handle video consumers
        if (consumer.kind === "video") {
            const video = document.createElement("video");
            video.srcObject = stream;
            video.autoplay = true;
            video.playsInline = true;

            if (this.currentOutputDeviceId) {
                await video
                    .setSinkId(this.currentOutputDeviceId)
                    .catch((err) =>
                        this.logger.warn("setSinkId failed for video", err),
                    );
            }

            this.cameraByProducerId.set(producerId, video);

            try {
                await video.play();
            } catch (err) {
                this.logger.warn("Voice video.play() blocked or failed", err);
            }
        } else {
            // Handle audio consumers
            const audio = new Audio();
            audio.srcObject = stream;
            audio.autoplay = true;
            audio.muted = this.isDeafened;

            if (this.currentOutputDeviceId)
                await audio.setSinkId(this.currentOutputDeviceId);

            this.audioByProducerId.set(producerId, audio);

            try {
                await audio.play();
            } catch (err) {
                this.logger.warn("Voice audio.play() blocked or failed", err);
            }
        }

        await this.request(VoiceOpcodes.VoiceResumeConsumer, {
            consumerId: consumer.id,
        });
    }

    private async startDevices(attemptId: number) {
        if (!this.sendTransport) return;
        if (attemptId !== this.connectAttemptId) throw this.cancelledError();

        const media = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                deviceId: this.currentInputDeviceId ?? undefined,
            },
            video: this.currentCameraDeviceId
                ? { deviceId: this.currentCameraDeviceId }
                : false,
        });

        if (attemptId !== this.connectAttemptId) {
            for (const track of media.getTracks()) track.stop();
            throw this.cancelledError();
        }

        const audioTracks = media.getAudioTracks();
        if (!audioTracks.length) {
            this.setSelfMute(true);
            return;
        }

        this.micTrack = audioTracks[0];

        this.micProducer = await this.sendTransport.produce({
            track: this.micTrack,
            codecOptions: { opusStereo: true, opusDtx: true },
        });

        this.setSelfMute(this.isMuted);

        if (!this.currentCameraDeviceId) return;

        const videoTracks = media.getVideoTracks();
        if (!videoTracks.length) return;

        this.cameraTrack = videoTracks[0];
        this.cameraProducer = await this.sendTransport.produce({
            track: this.cameraTrack,
            codecOptions: {
                videoGoogleStartBitrate: 1000,
                videoGoogleMaxBitrate: 9000,
            },
        });
    }
}

export class VoiceStore {
    voiceEndpoint: string | null = null;
    voiceToken: string | null = null;
    currentVoiceTarget: VoiceTarget | null = null;
    selfMute = false;
    selfDeaf = false;
    spaceMute = false;
    spaceDeaf = false;
    preferredSelfMute = false;
    preferredSelfDeaf = false;
    cameraEnabled = false;
    connectionStatus: VoiceConnectionStatus = "idle";
    connectionError: string | null = null;
    inputs: IObservableArray<MediaDeviceInfo> =
        observable.array<MediaDeviceInfo>([]);
    outputs: IObservableArray<MediaDeviceInfo> =
        observable.array<MediaDeviceInfo>([]);
    cameras: IObservableArray<MediaDeviceInfo> =
        observable.array<MediaDeviceInfo>([]);
    currentInputDeviceId?: string | null = null;
    currentOutputDeviceId?: string | null = null;
    currentCameraDeviceId?: string | null = null;
    private connectPromise: Promise<void> | null = null;
    private connectGeneration = 0;
    private connectingToken: string | null = null;
    private readonly session: MediasoupSession;
    private keepAliveTimer: number | null = null;

    constructor(private readonly app: AppStore) {
        this.session = new MediasoupSession(() => {
            if (this.currentChannelId) {
                runInAction(() => {
                    this.connectionStatus = "reconnecting";
                    this.connectionError = null;
                });

                queueMicrotask(() => {
                    void this.maybeConnectSession();
                });
            } else {
                this.clearLocalVoiceStateForMe();
                runInAction(() => {
                    this.connectionStatus = "idle";
                });
            }
        });

        makeAutoObservable(this, {}, { autoBind: true });

        makePersistable(this, {
            name: "VoiceStore",
            properties: [
                "currentInputDeviceId",
                "currentOutputDeviceId",
                "currentCameraDeviceId",
                "cameraEnabled",
            ],
            storage: safeLocalStorage,
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

        const spaceId = this.currentSpaceId;
        const space = spaceId ? this.app.spaces.get(spaceId) : null;

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
            (dev) => dev.deviceId === this.currentInputDeviceId,
        );
    }

    get currentOutputDevice() {
        return this.outputs.find(
            (dev) => dev.deviceId === this.currentOutputDeviceId,
        );
    }

    get currentCameraDevice() {
        return this.cameras.find(
            (dev) => dev.deviceId === this.currentCameraDeviceId,
        );
    }

    get voiceStates() {
        return this.app.voiceStates.getAllByChannel(
            this.currentVoiceTarget?.channelId,
        );
    }

    onVoiceServerUpdate(payload: VoiceServerUpdatePayload) {
        this.voiceEndpoint = payload.voiceEndpoint;
        this.voiceToken = payload.voiceToken;

        if (
            this.connectionStatus === "signaling" ||
            this.connectionStatus === "reconnecting"
        ) {
            void this.maybeConnectSession();
            return;
        }

        // Already connected but received a new token — user moved channels.
        // Reconnect to the new room immediately.
        if (this.connectionStatus === "connected" && payload.roomId) {
            runInAction(() => {
                this.currentVoiceTarget = {
                    spaceId: payload.spaceId ?? null,
                    channelId: payload.channelId,
                };
                this.connectionStatus = "signaling";
                this.connectionError = null;
            });

            void this.maybeConnectSession();
            return;
        }

        if (this.connectionStatus === "idle" && payload.roomId) {
            runInAction(() => {
                this.currentVoiceTarget = {
                    spaceId: payload.spaceId ?? null,
                    channelId: payload.channelId,
                };
                this.connectionStatus = "signaling";
                this.connectionError = null;
            });

            this.startKeepAlive();
            void this.maybeConnectSession();
        }
    }

    async join(target: VoiceTarget) {
        const isSameTarget =
            this.currentVoiceTarget?.spaceId === (target.spaceId ?? null) &&
            this.currentVoiceTarget?.channelId === target.channelId;

        if (isSameTarget) return;

        runInAction(() => {
            this.currentVoiceTarget = target;
            this.connectionStatus = "signaling";
            this.connectionError = null;
        });

        this.session.setInputDeviceId(this.currentInputDeviceId ?? null);
        this.session.setOutputDeviceId(this.currentOutputDeviceId ?? null);
        this.session.setCameraDeviceId(this.currentCameraDeviceId ?? null);

        this.session.setSelfMute(this.selfMute);
        this.session.setSelfDeaf(this.selfDeaf);

        await this.sendVoiceStateUpdate();
        await this.waitForVoiceServerUpdate();
        this.startKeepAlive();
    }

    setInputDeviceId(deviceId: string) {
        this.currentInputDeviceId = deviceId;
        this.session.setInputDeviceId(deviceId);

        if (this.connectionStatus === "connected")
            void this.session.restartDevices();
    }

    setOutputDeviceId(deviceId: string) {
        this.currentOutputDeviceId = deviceId;
        this.session.setOutputDeviceId(deviceId);
    }

    setCameraDeviceId(deviceId: string) {
        this.currentCameraDeviceId = deviceId;

        if (!this.cameraEnabled) {
            this.cameraEnabled = true;
        }

        this.session.setCameraDeviceId(deviceId);

        if (this.connectionStatus === "connected")
            void this.session.restartDevices();
    }

    toggleCamera() {
        runInAction(() => {
            this.cameraEnabled = !this.cameraEnabled;

            if (this.cameraEnabled && !this.currentCameraDeviceId) {
                const defaultCamera =
                    this.cameras.find(
                        (device) => device.deviceId === "default",
                    ) ?? this.cameras[0];

                if (defaultCamera) {
                    this.currentCameraDeviceId = defaultCamera.deviceId;
                }
            }

            if (this.cameraEnabled) {
                this.session.setCameraDeviceId(
                    this.currentCameraDeviceId ?? null,
                );
            } else {
                this.session.setCameraDeviceId(null);
            }

            // Restart devices if connected
            if (this.connectionStatus === "connected") {
                void this.session.restartDevices();
            }
        });
    }

    async leave() {
        this.session.setSelfDeaf(false);
        this.session.setSelfMute(false);

        runInAction(() => {
            this.currentVoiceTarget = null;
            this.connectionStatus = "idle";
            this.connectionError = null;
            this.cameraEnabled = false;
        });

        this.clearLocalVoiceStateForMe();

        await this.sendVoiceStateUpdate();

        void this.session.disconnect();
    }

    reset() {
        this.session.setSelfDeaf(false);
        this.session.setSelfMute(false);

        this.clearLocalVoiceStateForMe();

        runInAction(() => {
            this.currentVoiceTarget = null;
            this.voiceEndpoint = null;
            this.voiceToken = null;

            this.selfMute = false;
            this.selfDeaf = false;

            this.spaceMute = false;
            this.spaceDeaf = false;

            this.preferredSelfMute = false;
            this.preferredSelfDeaf = false;

            this.cameraEnabled = false;
        });

        void this.session.disconnect();
        this.stopKeepAlive();
    }

    setMute(value: boolean) {
        runInAction(() => {
            if (this.spaceMute || this.spaceDeaf) return;

            if (!this.currentSpaceId || !this.currentChannelId) {
                this.selfMute = value;
                this.preferredSelfMute = value;
                this.session.setSelfMute(this.selfMute);
                return;
            }

            if (this.selfDeaf && !value) {
                this.selfDeaf = false;
                this.selfMute = false;

                this.preferredSelfDeaf = false;
                this.preferredSelfMute = false;

                this.sendVoiceStateUpdate();

                this.session.setSelfDeaf(this.selfDeaf);
                this.session.setSelfMute(this.selfMute);
                return;
            }

            this.selfMute = value;
            this.preferredSelfMute = value;

            this.sendVoiceStateUpdate();
            this.session.setSelfMute(this.selfMute);
        });
    }

    setDeaf(value: boolean) {
        runInAction(() => {
            if (this.spaceMute || this.spaceDeaf) return;

            if (!this.currentSpaceId || !this.currentChannelId) {
                this.selfDeaf = value;
                this.preferredSelfDeaf = value;

                if (value) {
                    this.selfMute = true;
                    this.preferredSelfMute = true;
                }

                this.session.setSelfDeaf(this.selfDeaf);
                this.session.setSelfMute(this.selfMute);
                return;
            }

            if (value) {
                this.selfDeaf = true;
                this.preferredSelfDeaf = true;

                this.selfMute = true;
                this.preferredSelfMute = true;

                this.sendVoiceStateUpdate();

                this.session.setSelfDeaf(this.selfDeaf);
                this.session.setSelfMute(this.selfMute);
                return;
            }

            this.selfDeaf = false;
            this.preferredSelfDeaf = false;

            this.selfMute = this.preferredSelfMute;

            this.sendVoiceStateUpdate();

            this.session.setSelfDeaf(this.selfDeaf);
            this.session.setSelfMute(this.selfMute);
        });
    }

    maybeConnectSession(): Promise<void> {
        const endpoint = this.voiceEndpoint;
        const token = this.voiceToken;

        if (!endpoint || !token) return Promise.resolve();
        if (!this.currentVoiceTarget) return Promise.resolve();

        // If a connection is already in-flight for the SAME token, reuse it.
        // If the token has changed (user moved channels), drop the old promise
        // so we reconnect with the new token.
        if (this.connectPromise) {
            if (this.connectingToken === token) return this.connectPromise;
            // Token changed mid-connect: let the old attempt finish/cancel via
            // the generation counter, then fall through to start a new one.
            this.connectPromise = null;
        }

        this.connectingToken = token;

        const generation = ++this.connectGeneration;

        this.connectPromise = this.session.withSuppressedDisconnectCallback(
            async () => {
                runInAction(() => {
                    this.connectionStatus = "connecting";
                    this.connectionError = null;
                });

                try {
                    this.session.setInputDeviceId(
                        this.currentInputDeviceId ?? null,
                    );
                    this.session.setOutputDeviceId(
                        this.currentOutputDeviceId ?? null,
                    );
                    this.session.setCameraDeviceId(
                        this.currentCameraDeviceId ?? null,
                    );

                    await this.session.connect({ endpoint, token });

                    if (generation !== this.connectGeneration) return;

                    this.session.setSelfMute(this.selfMute);
                    this.session.setSelfDeaf(this.selfDeaf);

                    runInAction(() => {
                        this.connectionStatus = "connected";
                    });
                } catch (error) {
                    if (generation !== this.connectGeneration) return;

                    runInAction(() => {
                        this.connectionStatus = "failed";
                        this.connectionError =
                            error instanceof Error
                                ? error.message
                                : String(error);
                    });
                    throw error;
                } finally {
                    if (generation === this.connectGeneration) {
                        this.connectPromise = null;
                    }
                }
            },
        );

        return this.connectPromise;
    }

    async setupTracks() {
        if (isSSR) return;

        const mediaDeviceInfos = (
            await navigator.mediaDevices.enumerateDevices()
        ).filter((info) => info.deviceId !== "");

        runInAction(() => {
            this.inputs = observable.array<MediaDeviceInfo>(
                mediaDeviceInfos.filter((info) => info.kind === "audioinput"),
            );
            this.outputs = observable.array<MediaDeviceInfo>(
                mediaDeviceInfos.filter((info) => info.kind === "audiooutput"),
            );
            this.cameras = observable.array<MediaDeviceInfo>(
                mediaDeviceInfos.filter((info) => info.kind === "videoinput"),
            );

            if (!this.currentInputDeviceId)
                this.currentInputDeviceId = mediaDeviceInfos.find(
                    (device) =>
                        device.kind === "audioinput" &&
                        device.deviceId === "default",
                )?.deviceId;

            if (!this.currentOutputDeviceId)
                this.currentOutputDeviceId = mediaDeviceInfos.find(
                    (device) =>
                        device.kind === "audiooutput" &&
                        device.deviceId === "default",
                )?.deviceId;

            if (this.cameraEnabled && !this.currentCameraDeviceId) {
                this.currentCameraDeviceId = mediaDeviceInfos.find(
                    (device) =>
                        device.kind === "videoinput" &&
                        device.deviceId === "default",
                )?.deviceId;
            }
        });

        this.session.setInputDeviceId(this.currentInputDeviceId ?? null);
        this.session.setOutputDeviceId(this.currentOutputDeviceId ?? null);
        this.session.setCameraDeviceId(
            this.cameraEnabled ? (this.currentCameraDeviceId ?? null) : null,
        );
    }

    onVoiceStateSync(payload: VoiceStateSyncPayload) {
        const channelId = payload.channelId;

        for (const state of payload.states) {
            this.syncSelfFromState(new VoiceState(this.app, state));
            this.app.voiceStates.upsert(state);
        }

        const syncedUserIds = new Set(
            payload.states.map((state) => state.userId),
        );

        for (const existing of this.app.voiceStates.getAllByChannel(
            channelId,
        )) {
            if (!syncedUserIds.has(existing.userId)) {
                this.app.voiceStates.remove(existing.userId);
            }
        }
    }

    onVoiceStateUpdate(state: VoiceState) {
        this.syncSelfFromState(state);

        const normalizedChannelId =
            state.channelId === "null" ? null : state.channelId;

        if (!normalizedChannelId) {
            this.app.voiceStates.remove(state.userId);
            return;
        }

        this.app.voiceStates.upsert({
            ...state,
            channelId: normalizedChannelId,
            spaceId: state.spaceId ?? null,
        });
    }

    private waitForVoiceServerUpdate() {
        if (this.voiceEndpoint && this.voiceToken)
            return this.maybeConnectSession();

        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const timeoutMs = 10_000;

            const intervalId = window.setInterval(() => {
                const timedOut = Date.now() - startTime > timeoutMs;
                if (timedOut) {
                    clearInterval(intervalId);
                    runInAction(() => {
                        this.connectionStatus = "failed";
                        this.connectionError =
                            "Timed out waiting for voice server info";
                    });
                    reject(
                        new Error("Timed out waiting for voice server info"),
                    );
                    return;
                }

                if (this.voiceEndpoint && this.voiceToken) {
                    clearInterval(intervalId);
                    void this.maybeConnectSession().then(resolve).catch(reject);
                }
            }, 50);
        });
    }

    private syncSelfFromState(state: VoiceState) {
        const accountId = this.app.account?.id;
        if (!accountId) return;
        if (state.userId !== accountId) return;

        const forcedMute = state.spaceMute ?? false;
        const forcedDeaf = state.spaceDeaf ?? false;

        const inVoice = state.channelId != null;

        runInAction(() => {
            this.spaceMute = forcedMute;
            this.spaceDeaf = forcedDeaf;

            if (inVoice) {
                this.selfMute = this.spaceMute || state.selfMute;
                this.selfDeaf = this.spaceDeaf || state.selfDeaf;

                if (!forcedMute) this.preferredSelfMute = state.selfMute;
                if (!forcedDeaf) this.preferredSelfDeaf = state.selfDeaf;
            } else {
                this.selfDeaf = this.spaceDeaf || this.preferredSelfDeaf;
                this.selfMute =
                    this.spaceDeaf || this.spaceMute
                        ? true
                        : this.preferredSelfMute;

                if (this.selfDeaf) this.selfMute = true;
            }
        });

        this.session.setSelfMute(this.selfMute);
        this.session.setSelfDeaf(this.selfDeaf);
    }

    private clearLocalVoiceStateForMe() {
        const accountId = this.app.account?.id;
        if (!accountId) return;

        this.app.voiceStates.remove(accountId);
    }

    private async sendVoiceStateUpdate() {
        const forcedMute = this.spaceMute;
        const forcedDeaf = this.spaceDeaf;

        const outgoingSelfDeaf = forcedDeaf ? true : this.preferredSelfDeaf;
        const outgoingSelfMute =
            forcedDeaf || forcedMute ? true : this.preferredSelfMute;

        const spaceId = this.currentVoiceTarget?.spaceId ?? null;
        const channelId = this.currentVoiceTarget?.channelId ?? null;

        await this.app.gateway.send({
            op: GatewayOpcodes.VoiceStateUpdate,
            d: {
                spaceId,
                channelId,
                selfMute: outgoingSelfMute,
                selfDeaf: outgoingSelfDeaf,
            },
        });
    }

    private startKeepAlive() {
        this.stopKeepAlive();

        this.keepAliveTimer = window.setInterval(() => {
            this.sendVoiceStateUpdate();
        }, 15_000);
    }

    private stopKeepAlive() {
        if (this.keepAliveTimer) {
            clearInterval(this.keepAliveTimer);
            this.keepAliveTimer = null;
        }
    }
}
