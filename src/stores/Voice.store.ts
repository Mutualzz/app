import {
    makeAutoObservable,
    observable,
    type ObservableMap,
    runInAction,
} from "mobx";
import * as mediasoupClient from "mediasoup-client";
import {
    GatewayOpcodes,
    type Snowflake,
    VoiceDispatchEvents,
    type VoiceOpcode,
    VoiceOpcodes,
    type VoiceState,
} from "@mutualzz/types";
import type { AppStore } from "@stores/App.store.ts";
import type {
    VoiceServerUpdatePayload,
    VoiceStateSyncPayload,
} from "@app-types/index.ts";

export type VoiceConnectionStatus =
    | "idle"
    | "signaling"
    | "connecting"
    | "connected"
    | "failed"
    | "reconnecting";

// TODO: After implementing new opcodes, audio still doesnt work and payloads dont seem to send properly
class MediasoupSession {
    private socket: WebSocket | null = null;

    private pending = new Map<
        string,
        { resolve: (v: any) => void; reject: (e: any) => void }
    >();

    private suppressOnDisconnected = 0;

    private connectAttemptId = 0;

    private device: mediasoupClient.types.Device | null = null;
    private sendTransport: mediasoupClient.types.Transport | null = null;
    private receiverTransport: mediasoupClient.types.Transport | null = null;

    private micTrack: MediaStreamTrack | null = null;
    private lastToken: string | null = null;

    private micProducer: mediasoupClient.types.Producer | null = null;

    private consumersByProducerId = new Map<
        string,
        mediasoupClient.types.Consumer
    >();
    private audioByProducerId = new Map<string, HTMLAudioElement>();

    private isDeafened = false;
    private isMuted = false;

    constructor(private readonly onDisconnected: () => void) {}

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

        socket.onerror = () => {
            if (this.socket === socket) this.cleanup();
        };

        await new Promise<void>((resolve, reject) => {
            socket.onopen = () => resolve();
            socket.onerror = () => reject(new Error("Voice socket failed"));
        });

        await this.setup(attemptId);
    }

    async disconnect() {
        await this.withSuppressedDisconnectCallback(() =>
            this.disconnectInternal({ bumpAttempt: true }),
        );
    }

    private async withSuppressedDisconnectCallback<T>(
        fn: () => Promise<T>,
    ): Promise<T> {
        this.suppressOnDisconnected++;
        return fn().finally(() => {
            this.suppressOnDisconnected--;
        });
    }

    private async setup(attemptId: number) {
        const capabilities = await this.request(
            VoiceOpcodes.VoiceGetRTPCapabilities,
            {},
        );

        if (attemptId !== this.connectAttemptId) throw this.cancelledError();
        // TODO: COntinuje here later
        const device = new mediasoupClient.Device();

        await device.load({
            routerRtpCapabilities: capabilities.rtpCapabilities,
        });

        if (attemptId !== this.connectAttemptId) throw this.cancelledError();

        this.device = device;

        await this.request(VoiceOpcodes.VoiceSetRTPCapabilities, {
            rtpCapabilities: device.rtpCapabilities,
        });

        const sendTransportInfo = await this.request(
            VoiceOpcodes.VoiceCreateTransport,
            {
                direction: "send",
            },
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

        const receiverTransportInfo = await this.request(
            VoiceOpcodes.VoiceCreateTransport,
            {
                direction: "receive",
            },
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

        await this.startMic(attemptId);
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
            console.log("Received push", envelope.op, envelope.data);
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

            return;
        }

        if (op !== VoiceDispatchEvents.VoiceNewProducer) return;

        const producerId = data?.producerId ?? "";
        if (!producerId) return;

        if (!this.device || !this.receiverTransport) return;

        const response = await this.request(VoiceOpcodes.VoiceConsume, {
            producerId,
        });

        const options = response.consumerOptions;

        const consumer = await this.receiverTransport.consume({
            id: options.id,
            producerId: options.producerId,
            kind: options.kind,
            rtpParameters: options.rtpParameters,
        });

        this.consumersByProducerId.set(producerId, consumer);

        const stream = new MediaStream([consumer.track]);
        const audio = new Audio();
        audio.srcObject = stream;
        audio.autoplay = true;
        audio.muted = this.isDeafened;

        this.audioByProducerId.set(producerId, audio);

        console.log(audio);

        // Force play to work around autoplay policies. We'll pause it again if the user is deafened, but this ensures the audio will play immediately when they undeafen.
        try {
            await audio.play();
        } catch (err) {
            console.warn("Voice audio.play() blocked or failed", err);
        }

        await this.request(VoiceOpcodes.VoiceResumeConsumer, {
            consumerId: consumer.id,
        });
    }

    private async startMic(attemptId: number) {
        if (!this.sendTransport) return;
        if (attemptId !== this.connectAttemptId) throw this.cancelledError();

        const media = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
            },
            video: false,
        });

        if (attemptId !== this.connectAttemptId) {
            for (const track of media.getTracks()) track.stop();
            throw this.cancelledError();
        }

        const track = media.getAudioTracks()[0];
        if (!track) return;

        this.micTrack = track;

        this.micProducer = await this.sendTransport.produce({
            track,
            codecOptions: { opusStereo: true, opusDtx: true },
        });

        this.setSelfMute(this.isMuted);
    }
}

export class VoiceStore {
    voiceEndpoint: string | null = null;
    voiceToken: string | null = null;

    currentSpaceId: Snowflake | null = null;
    currentChannelId: Snowflake | null = null;

    selfMute = false;
    selfDeaf = false;

    spaceMute = false;
    spaceDeaf = false;

    preferredSelfMute = false;
    preferredSelfDeaf = false;
    channelStates = observable.map<
        Snowflake,
        ObservableMap<Snowflake, VoiceState>
    >();
    connectionStatus: VoiceConnectionStatus = "idle";
    connectionError: string | null = null;
    private connectPromise: Promise<void> | null = null;
    private connectGeneration = 0;
    private readonly session: MediasoupSession;
    private keepAliveTimer: number | null = null;

    constructor(private readonly app: AppStore) {
        this.session = new MediasoupSession(() => {
            if (this.currentSpaceId && this.currentChannelId) {
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
    }

    get channel() {
        if (!this.currentSpaceId || !this.currentChannelId) return null;
        const space = this.app.spaces.get(this.currentSpaceId);
        if (!space) return null;
        return (
            space.channels.find((ch) => ch.id === this.currentChannelId) ?? null
        );
    }

    onVoiceServerUpdate(payload: VoiceServerUpdatePayload) {
        this.voiceEndpoint = payload.voiceEndpoint;
        this.voiceToken = payload.voiceToken;

        if (
            this.connectionStatus === "signaling" ||
            this.connectionStatus === "reconnecting"
        )
            void this.maybeConnectSession();
    }

    onVoiceStateSync(payload: VoiceStateSyncPayload) {
        const statesByUserId = observable.map<Snowflake, VoiceState>();

        const currentSpace =
            this.currentSpaceId != null
                ? this.app.spaces.get(this.currentSpaceId)
                : null;

        const syncedChannel =
            currentSpace && payload.channelId
                ? (currentSpace.channels.find(
                      (channelItem) => channelItem.id === payload.channelId,
                  ) ?? null)
                : null;

        if (syncedChannel) syncedChannel.voiceStates.clear();

        for (const state of payload.states) {
            statesByUserId.set(state.userId, state);

            this.syncSelfFromState(state);

            const stateSpace = this.app.spaces.get(state.spaceId);
            if (!stateSpace) continue;

            const member = stateSpace.members.get(state.userId);
            if (member) member.setVoiceState(state);

            if (syncedChannel && state.channelId === payload.channelId) {
                syncedChannel.voiceStates.set(state.userId, state);
            }
        }

        this.channelStates.set(payload.channelId, statesByUserId);
    }

    onVoiceStateUpdate(state: VoiceState) {
        this.syncSelfFromState(state);

        const space = this.app.spaces.get(state.spaceId);

        const normalizedChannelId =
            state.channelId === "null" ? null : state.channelId;

        const member = space?.members.get(state.userId) ?? null;

        // Leaving voice entirely
        if (!normalizedChannelId) {
            // Remove from all store maps
            for (const [, userMap] of this.channelStates) {
                userMap.delete(state.userId);
            }

            // Remove from all channel objects
            if (space) {
                for (const channelItem of space.channels) {
                    channelItem.voiceStates.delete(state.userId);
                }
            }

            if (member) member.setVoiceState(null);
            return;
        }

        // Moving / updating: remove from any other channel first
        for (const [existingChannelId, userMap] of this.channelStates) {
            if (existingChannelId !== normalizedChannelId)
                userMap.delete(state.userId);
        }

        if (space) {
            for (const channelItem of space.channels) {
                if (channelItem.id !== normalizedChannelId) {
                    channelItem.voiceStates.delete(state.userId);
                }
            }
        }

        let userStatesForChannel = this.channelStates.get(normalizedChannelId);
        if (!userStatesForChannel) {
            userStatesForChannel = observable.map<Snowflake, VoiceState>();
            this.channelStates.set(normalizedChannelId, userStatesForChannel);
        }
        userStatesForChannel.set(state.userId, state);

        const channel =
            space?.channels.find(
                (channelItem) => channelItem.id === normalizedChannelId,
            ) ?? null;

        if (channel) channel.voiceStates.set(state.userId, state);
        if (member) member.setVoiceState(state);
    }

    async join(spaceId: Snowflake, channelId: Snowflake) {
        if (
            this.currentSpaceId === spaceId &&
            this.currentChannelId === channelId
        )
            return;

        await this.leave();

        runInAction(() => {
            this.currentSpaceId = spaceId;
            this.currentChannelId = channelId;
            this.connectionStatus = "signaling";
            this.connectionError = null;
        });

        this.sendVoiceStateUpdate();
        this.startKeepAlive();

        await this.waitForVoiceServerUpdate();

        // waitForVoiceServerUpdate() triggers maybeConnectSession(), which owns the connection lifecycle.
        this.session.setSelfMute(this.selfMute);
        this.session.setSelfDeaf(this.selfDeaf);
    }

    async leave() {
        if (!this.currentSpaceId || !this.currentChannelId) return;

        this.session.setSelfDeaf(false);
        this.session.setSelfMute(false);

        this.clearLocalVoiceStateForMe();

        runInAction(() => {
            this.currentChannelId = null;

            this.selfDeaf = this.spaceDeaf || this.preferredSelfDeaf;
            this.selfMute =
                this.spaceDeaf || this.spaceMute
                    ? true
                    : this.preferredSelfMute;

            if (this.selfDeaf) this.selfMute = true;
        });

        this.sendVoiceStateUpdate();
        await this.session.disconnect();
    }

    reset() {
        this.session.setSelfDeaf(false);
        this.session.setSelfMute(false);

        this.clearLocalVoiceStateForMe();

        runInAction(() => {
            this.currentSpaceId = null;
            this.currentChannelId = null;
            this.voiceEndpoint = null;
            this.voiceToken = null;

            this.selfMute = false;
            this.selfDeaf = false;

            this.spaceMute = false;
            this.spaceDeaf = false;

            this.preferredSelfMute = false;
            this.preferredSelfDeaf = false;

            this.channelStates.clear();
        });

        void this.session.disconnect();
        this.stopKeepAlive();
    }

    setMute(value: boolean) {
        runInAction(() => {
            if (this.spaceMute || this.spaceDeaf) return;

            // Not in a voice channel yet: treat as preference for the next join
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

            // Not in a voice channel yet: treat as preference for the next join
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

    private maybeConnectSession(): Promise<void> {
        const endpoint = this.voiceEndpoint;
        const token = this.voiceToken;

        if (!endpoint || !token) return Promise.resolve();
        if (!this.currentSpaceId || !this.currentChannelId)
            return Promise.resolve();

        // If a connection is already running, reuse it
        if (this.connectPromise) return this.connectPromise;

        const generation = ++this.connectGeneration;

        this.connectPromise = (async () => {
            runInAction(() => {
                this.connectionStatus = "connecting";
                this.connectionError = null;
            });

            try {
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
                        error instanceof Error ? error.message : String(error);
                });
                throw error;
            } finally {
                if (generation === this.connectGeneration) {
                    this.connectPromise = null;
                }
            }
        })();

        return this.connectPromise;
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

        const inVoice = state.channelId !== "null" && state.channelId != null;

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
        const spaceId = this.currentSpaceId;
        const accountId = this.app.account?.id;
        if (!spaceId || !accountId) return;

        const space = this.app.spaces.get(spaceId);
        if (!space) return;

        const me = space.members.get(accountId) ?? space.members.me;
        if (me) me.setVoiceState(null);

        for (const channelItem of space.channels) {
            channelItem.voiceStates.delete(accountId);
        }

        for (const [, userMap] of this.channelStates) {
            userMap.delete(accountId);
        }
    }

    private sendVoiceStateUpdate() {
        const spaceId = this.currentSpaceId;
        if (!spaceId) return;

        const forcedMute = this.spaceMute;
        const forcedDeaf = this.spaceDeaf;

        const outgoingSelfDeaf = forcedDeaf ? true : this.preferredSelfDeaf;
        const outgoingSelfMute =
            forcedDeaf || forcedMute ? true : this.preferredSelfMute;

        this.app.gateway.send({
            op: GatewayOpcodes.VoiceStateUpdate,
            d: {
                spaceId,
                channelId: this.currentChannelId,
                selfMute: outgoingSelfMute,
                selfDeaf: outgoingSelfDeaf,
            },
        });
    }

    private startKeepAlive() {
        this.stopKeepAlive();

        this.keepAliveTimer = window.setInterval(() => {
            this.sendVoiceStateUpdate();
        }, 30_000);
    }

    private stopKeepAlive() {
        if (this.keepAliveTimer) {
            clearInterval(this.keepAliveTimer);
            this.keepAliveTimer = null;
        }
    }
}
