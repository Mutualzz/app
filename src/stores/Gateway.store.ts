import { Logger } from "@mutualzz/logger";
import type {
    APIMessage,
    APIRole,
    GatewayReadyPayload,
    PresenceActivity,
} from "@mutualzz/types";
import {
    type APIChannel,
    type APIInvite,
    type APIPrivateUser,
    type APISpace,
    type APIUser,
    type APIUserSettings,
    GatewayCloseCodes,
    GatewayDispatchEvents,
    GatewayOpcodes,
} from "@mutualzz/types";
import { invoke } from "@tauri-apps/api/core";
import { type Codec, createCodec, type Encoding } from "@utils/codec";
import {
    type Compression,
    type Compressor,
    createCompressor,
} from "@utils/compressor";
import { isTauri } from "@utils/index";
import { makeAutoObservable } from "mobx";
import type { AppStore } from "./App.store";
import {
    buildDesktopPresenceFromProcesses,
    type PresenceUpdateDraft,
} from "../presence/gamePresence.ts";

// We have to create our own GatewayStatus "enum" to avoid issues with SSR
// since WebSocket is not available in the server environment.
// If someone has a better solution, please let me know. lol
export const GatewayStatus = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
} as const;

export type GatewayStatus = (typeof GatewayStatus)[keyof typeof GatewayStatus];

const RECONNECT_TIMEOUT = 5000;

function mergeActivities(opts: {
    processActivities: PresenceActivity[];
    customActivity: PresenceActivity | null;
}): PresenceActivity[] {
    const out: PresenceActivity[] = [];

    for (const act of opts.processActivities ?? []) out.push(act);

    if (opts.customActivity) out.push(opts.customActivity);

    return out.slice(0, 5);
}

function stableStringify(value: unknown) {
    try {
        return JSON.stringify(value);
    } catch {
        return "";
    }
}

export class GatewayStore {
    socket: WebSocket | null = null;
    public readyState: GatewayStatus = GatewayStatus.CLOSED;
    public events: { t: string; d: any; s: number }[] = [];
    private readonly logger = new Logger({
        tag: "GatewayStore",
    });
    private sessionId: string | null = null;
    private sequence = 0;
    private heartbeatInterval: number | null = null;
    private heartbeat: NodeJS.Timeout | null = null;
    private initialHeartbeatTimeout: NodeJS.Timeout | null = null;
    private heartbeatAck = true;
    private url?: string;
    private encoding: Encoding = isTauri ? "etf" : "json";
    private compress: Compression =
        import.meta.env.DEV && !isTauri ? "none" : "zlib-stream";
    private codec!: Codec;
    private compressor!: Compressor;
    private connectionStartTime?: number;
    private identifyStartTime?: number;
    private reconnectTimeout = 0;
    private reconnecting = false;
    private readonly dispatchHandlers = new Map<
        string,
        (...args: any[]) => any
    >();

    private presenceLoopInterval: number | null = null;
    private lastPresenceHash: string | null = null;

    private lazyRequestChannels = new Map<string, string[]>(); // spaceId -> channelIds

    constructor(private readonly app: AppStore) {
        makeAutoObservable(this);
    }

    async connect(url: string = import.meta.env.VITE_WS_URL) {
        if (!this.url) {
            const newUrl = new URL(url);
            newUrl.searchParams.set("encoding", this.encoding);
            newUrl.searchParams.set("compress", this.compress);
            this.url = newUrl.href;
        }

        this.logger.debug(`[Connect] Gateway URL ${this.url}`);
        this.connectionStartTime = Date.now();
        this.socket = new WebSocket(this.url);
        this.socket.binaryType = "arraybuffer";
        this.readyState = GatewayStatus.CONNECTING;

        this.codec = await createCodec(this.encoding);
        this.compressor = await createCompressor(this.compress);

        this.setupListeners();
        this.setupDispatchHandlers();
    }

    async disconnect(code?: number, reason?: string) {
        if (!this.socket) return;

        this.readyState = GatewayStatus.CLOSING;
        this.logger.debug(`[Disconnect] ${this.url}`);
        this.socket.close(code, reason);
    }

    startReconnect() {
        if (this.reconnecting) return;

        this.reconnecting = true;
        setTimeout(() => {
            this.reconnecting = false;
            this.logger.debug(`[Reconnect] ${this.url}`);
            this.connect(this.url);
        }, this.reconnectTimeout);
    }

    onChannelOpen = (spaceId: string, channelId: string) => {
        const prev = this.lazyRequestChannels.get(spaceId) ?? [];
        if (prev.includes(channelId)) return;

        const payload = {
            spaceId,
            channels: {
                [channelId]: [[0, 99]],
            },
        };

        this.lazyRequestChannels.set(spaceId, [...prev, channelId]);

        this.send({
            op: GatewayOpcodes.LazyRequest,
            d: payload,
        });
    };

    sendPresenceUpdate(presence: PresenceUpdateDraft) {
        this.send({
            op: GatewayOpcodes.PresenceUpdate,
            d: {
                presence,
            },
        });
    }

    setStatus(status: "online" | "idle" | "dnd" | "invisible") {
        const userId = this.app.account?.id;
        if (!userId) return;

        const prev = this.app.presence.get(userId);
        this.app.presence.upsert(userId, {
            ...(prev ?? { activities: [] }),
            status,
            device: isTauri ? "desktop" : "web",
            updatedAt: Date.now(),
        });

        this.sendPresenceUpdate({
            status,
            device: isTauri ? "desktop" : "web",
            activities: prev?.activities ?? [],
        });
    }

    setCustomStatus(text: string) {
        this.app.customStatus.set(text);

        const customActivity = this.app.customStatus.activity;
        const draft: PresenceUpdateDraft = {
            status: "online",
            device: isTauri ? "desktop" : "web",
            activities: customActivity ? [customActivity] : [],
        };

        this.sendPresenceUpdate(draft);
    }

    private setupListeners() {
        this.socket!.onopen = this.onOpen;
        this.socket!.onmessage = this.onMessage;
        this.socket!.onerror = this.onError;
        this.socket!.onclose = this.onClose;
    }

    private setupDispatchHandlers() {
        // Connection
        this.dispatchHandlers.set(GatewayDispatchEvents.Ready, this.onReady);
        this.dispatchHandlers.set(GatewayDispatchEvents.Resume, this.onResume);

        // Presence
        this.dispatchHandlers.set(
            GatewayDispatchEvents.PresenceUpdate,
            this.onPresenceUpdate,
        );

        // User
        this.dispatchHandlers.set(
            GatewayDispatchEvents.UserUpdate,
            this.onUserUpdate,
        );
        this.dispatchHandlers.set(
            GatewayDispatchEvents.UserSettingsUpdate,
            this.onUserSettingsUpdate,
        );

        // Spaces
        this.dispatchHandlers.set(
            GatewayDispatchEvents.SpaceCreate,
            this.onSpaceCreate,
        );
        this.dispatchHandlers.set(
            GatewayDispatchEvents.SpaceDelete,
            this.onSpaceDelete,
        );

        // Channels
        this.dispatchHandlers.set(
            GatewayDispatchEvents.ChannelCreate,
            this.onChannelCreate,
        );
        this.dispatchHandlers.set(
            GatewayDispatchEvents.ChannelUpdate,
            this.onChannelUpdate,
        );
        this.dispatchHandlers.set(
            GatewayDispatchEvents.BulkChannelUpdate,
            this.onBulkChannelUpdate,
        );
        this.dispatchHandlers.set(
            GatewayDispatchEvents.BulkChannelDelete,
            this.onBulkChannelDelete,
        );
        this.dispatchHandlers.set(
            GatewayDispatchEvents.ChannelDelete,
            this.onChannelDelete,
        );

        // Messages
        this.dispatchHandlers.set(
            GatewayDispatchEvents.MessageCreate,
            this.onMessageCreate,
        );
        this.dispatchHandlers.set(
            GatewayDispatchEvents.MessageUpdate,
            this.onMessageUpdate,
        );
        this.dispatchHandlers.set(
            GatewayDispatchEvents.MessageDelete,
            this.onMessageDelete,
        );
        this.dispatchHandlers.set(
            GatewayDispatchEvents.MessageDeleteBulk,
            this.onMessageDeleteBulk,
        );

        // Invites
        this.dispatchHandlers.set(
            GatewayDispatchEvents.InviteCreate,
            this.onInviteCreate,
        );
        this.dispatchHandlers.set(
            GatewayDispatchEvents.InviteDelete,
            this.onInviteDelete,
        );
        this.dispatchHandlers.set(
            GatewayDispatchEvents.InviteUpdate,
            this.onInviteUpdate,
        );

        // Members
        this.dispatchHandlers.set(
            GatewayDispatchEvents.SpaceMemberAdd,
            this.onSpaceMemberAdd,
        );
        this.dispatchHandlers.set(
            GatewayDispatchEvents.SpaceMemberRemove,
            this.onSpaceMemberRemove,
        );
        this.dispatchHandlers.set(
            GatewayDispatchEvents.SpaceMemberListUpdate,
            this.onSpaceMemberListUpdate,
        );

        // Roles
        this.dispatchHandlers.set(
            GatewayDispatchEvents.RoleCreate,
            this.onRoleCreate,
        );
        this.dispatchHandlers.set(
            GatewayDispatchEvents.RoleUpdate,
            this.onRoleUpdate,
        );
        this.dispatchHandlers.set(
            GatewayDispatchEvents.RoleDelete,
            this.onRoleDelete,
        );

        // Role assignments
        this.dispatchHandlers.set(
            GatewayDispatchEvents.SpaceMemberRoleAdd,
            this.onMemberRoleAdd,
        );
        this.dispatchHandlers.set(
            GatewayDispatchEvents.SpaceMemberRoleRemove,
            this.onMemberRoleRemove,
        );
    }

    private onOpen = () => {
        this.logger.debug(
            `[Connected] ${this.url} (took ${Date.now() - this.connectionStartTime!}ms)`,
        );
        this.readyState = GatewayStatus.OPEN;
        this.reconnectTimeout = 0;

        if (this.sessionId) {
            this.logger.debug("[Gateway] Resuming session");
            this.handleResume();
        } else {
            this.logger.debug("[Gateway] Identifying");
            this.handleIdentify();
        }
    };

    private onMessage = async (e: MessageEvent) => {
        try {
            let rawBytes: Uint8Array;

            if (typeof e.data === "string") {
                rawBytes = new TextEncoder().encode(e.data);
            } else if (e.data instanceof ArrayBuffer) {
                rawBytes = new Uint8Array(e.data);
            } else if (e.data instanceof Blob) {
                rawBytes = new Uint8Array(await e.data.arrayBuffer());
            } else {
                this.logger.error("Unknown message data type");
                return;
            }

            const bytes =
                this.compress !== "none"
                    ? this.compressor.decompress(rawBytes)
                    : rawBytes;

            const payload =
                this.encoding === "etf"
                    ? await invoke("gateway_decode", {
                          payload: Array.from(bytes),
                          encoding: this.encoding,
                      })
                    : this.codec.decode(bytes);

            this.handlePayload(payload);
        } catch (err) {
            this.logger.error("Failed to decode gateway message", err);
        }
    };

    private handlePayload = (payload: any) => {
        if (payload.op !== GatewayOpcodes.Dispatch) {
            this.logger.debug(`[Gateway] -> ${payload.op}`);
        }

        switch (payload.op) {
            case GatewayOpcodes.Dispatch:
                this.handleDispatch(payload);
                break;
            case GatewayOpcodes.Heartbeat:
                this.sendHeartbeat();
                break;
            case GatewayOpcodes.Reconnect:
                this.handleReconnect();
                break;
            case GatewayOpcodes.InvalidSession:
                this.handleInvalidSession(payload.d);
                break;
            case GatewayOpcodes.Hello:
                this.handleHello(payload.d);
                break;
            case GatewayOpcodes.HeartbeatAck:
                this.handleHeartbeatAck();
                break;
            default:
                this.logger.debug("Received unknown opcode");
                break;
        }
    };

    private onError = (e: Event) => {
        this.logger.error(`[Socket Error]`, e);
    };

    private onClose = (e: CloseEvent) => {
        this.readyState = GatewayStatus.CLOSED;
        this.stopPresenceLoop();
        this.handleClose(e.code);
    };

    private send = async (payload: any) => {
        if (!this.socket) {
            this.logger.error("Socket is not open");
            return;
        }
        if (this.socket.readyState !== WebSocket.OPEN) {
            this.logger.error(
                `Socket is not open; readyState: ${this.socket.readyState}`,
            );
            return;
        }

        try {
            const rawBytes: Uint8Array =
                this.encoding === "etf"
                    ? Uint8Array.from(
                          await invoke("gateway_encode", {
                              payload,
                              encoding: this.encoding,
                          }),
                      )
                    : this.codec.encode(payload);

            const outBytes =
                this.compress !== "none"
                    ? this.compressor.compress(rawBytes)
                    : rawBytes;

            if (this.compress !== "none") {
                this.socket.send(outBytes);
            } else {
                this.socket.send(new TextDecoder().decode(rawBytes));
            }

            this.logger.debug(`[Gateway] <- ${payload.op}`);
        } catch (err) {
            this.logger.error("Failed to send message", err);
        }
    };

    private handleIdentify() {
        if (!this.app.token) {
            this.logger.error("Cannot identify, token is not set");
            return;
        }

        this.identifyStartTime = Date.now();

        const payload = {
            op: GatewayOpcodes.Identify,
            d: {
                token: this.app.token,
            },
        };

        this.send(payload);
    }

    private handleInvalidSession = (resumable: boolean) => {
        this.cleanup();

        this.logger.debug(`Received invalid session; Can Resume: ${resumable}`);
        if (!resumable) {
            this.handleIdentify();
            return;
        }

        this.handleResume();
    };

    private handleReconnect() {
        this.cleanup();

        this.logger.debug(`[Gateway] -> Reconnect`);
        this.startReconnect();
    }

    private handleResume() {
        if (!this.app.token || !this.sessionId) {
            this.logger.error("Cannot resume, token or sessionId is not set");
            this.reset();
            this.app.logout();
            return;
        }

        this.send({
            op: GatewayOpcodes.Resume,
            d: {
                token: this.app.token,
                sessionId: this.sessionId,
                seq: this.sequence,
            },
        });

        this.logger.debug(`[Gateway] -> ${GatewayOpcodes.Resume}`, {
            sessionId: this.sessionId,
            seq: this.sequence,
        });
    }

    private handleHello(data: any) {
        this.heartbeatInterval = data.heartbeatInterval;
        this.reconnectTimeout = this.heartbeatInterval!;
        this.logger.info(
            `[Hello] heartbeat interval: ${data.heartbeatInterval} (took ${Date.now() - this.connectionStartTime!}ms)`,
        );
        this.startHeartbeat();
    }

    private handleClose = (code?: number) => {
        this.cleanup();

        if (code === GatewayCloseCodes.NotAuthenticated) return;

        if (this.reconnectTimeout === 0)
            this.reconnectTimeout = RECONNECT_TIMEOUT;
        else this.reconnectTimeout += RECONNECT_TIMEOUT;

        this.logger.debug(
            `Websocket closed with code ${code}; Will reconnect in ${(
                this.reconnectTimeout / 1000
            ).toFixed(2)} seconds.`,
        );

        this.startReconnect();
    };

    private reset = () => {
        this.sessionId = null;
        this.sequence = 0;
        this.readyState = GatewayStatus.CLOSED;
    };

    private startHeartbeat = () => {
        if (this.heartbeat) {
            clearInterval(this.heartbeat);
            this.heartbeat = null;
        }

        const heartbeatFn = () => {
            if (this.heartbeatAck) {
                this.heartbeatAck = false;
                this.sendHeartbeat();
            } else {
                this.handleHeartbeatTimeout();
            }
        };

        this.initialHeartbeatTimeout = setTimeout(
            () => {
                this.initialHeartbeatTimeout = null;
                this.heartbeat = setInterval(
                    heartbeatFn,
                    this.heartbeatInterval!,
                );
                heartbeatFn();
            },
            Math.floor(Math.random() * this.heartbeatInterval!),
        );
    };

    private stopHeartbeat = () => {
        if (this.heartbeat) {
            clearInterval(this.heartbeat);
            this.heartbeat = null;
        }

        if (this.initialHeartbeatTimeout) {
            clearTimeout(this.initialHeartbeatTimeout);
            this.initialHeartbeatTimeout = null;
        }
    };

    private handleHeartbeatTimeout = () => {
        this.logger.warn(
            `[Heartbeat ACK Timeout] should reconnect in ${(RECONNECT_TIMEOUT / 1000).toFixed(2)} seconds`,
        );

        this.socket?.close(4009);

        this.cleanup();
        this.reset();

        this.startReconnect();
    };

    private sendHeartbeat = () => {
        const payload = {
            op: GatewayOpcodes.Heartbeat,
            d: this.sequence,
        };
        this.logger.debug("Sending heartbeat");
        this.send(payload);
    };

    private cleanup = () => {
        this.logger.debug("Cleaning up");
        this.stopHeartbeat();
        this.socket = null;
        this.sessionId = null;
    };

    private handleHeartbeatAck = () => {
        this.logger.debug("Received heartbeat ack");
        this.heartbeatAck = true;
    };

    private handleDispatch = (data: any) => {
        const { d, t, s } = data;
        this.logger.debug(`[Gateway] -> ${t}`);
        this.sequence = s;

        const handler = this.dispatchHandlers.get(t);
        if (!handler) {
            this.logger.debug(`No handler for dispatch event ${t}`);
            return;
        }

        handler(d);
    };

    private onResume = () => {
        this.logger.debug("[Resume] Session");
    };

    private onReady = async (payload: GatewayReadyPayload) => {
        this.logger.info(
            `[Ready] took ${Date.now() - (this.identifyStartTime ?? 0)}ms`,
        );

        const { sessionId, user, themes, spaces, settings } = payload;

        this.sessionId = sessionId;

        this.app.setUser(user, settings);
        this.app.users.add(user);
        this.app.themes.addAll(themes);
        this.app.spaces.addAll(spaces);

        this.reconnectTimeout = 0;
        this.app.setGatewayReady(true);

        const space =
            this.app.spaces.mostRecentSpace || this.app.spaces.positioned[0];

        if (space) this.app.spaces.setActive(space.id);

        this.app.channels.setPreferredActive();

        this.startPresenceLoop();
    };

    // NOTE: Dispatcher Handlers start here

    // Presence
    private onPresenceUpdate = (payload: any) => {
        if (payload?.userId && payload?.presence) {
            this.app.presence.upsert(payload.userId, payload.presence);
            return;
        }

        const list = payload?.presences;
        if (Array.isArray(list)) {
            for (const p of list) {
                if (!p?.userId || !p?.presence) continue;
                this.app.presence.upsert(p.userId, p.presence);
            }
            return;
        }

        this.logger.debug("[Presence] unknown payload shape", payload);
    };

    private startPresenceLoop() {
        if (this.presenceLoopInterval) return;

        const intervalMs = 15_000;

        const tick = async () => {
            if (!this.socket || this.readyState !== GatewayStatus.OPEN) return;
            if (!this.app.account?.id) return;

            if (isTauri) {
                const baseDraft = await buildDesktopPresenceFromProcesses();

                const mergedDraft: PresenceUpdateDraft = {
                    ...baseDraft,
                    device: "desktop",
                    activities: mergeActivities({
                        processActivities: baseDraft.activities ?? [],
                        customActivity: this.app.customStatus.activity,
                    }),
                    status: "online",
                };

                const draftHash = stableStringify(mergedDraft);
                if (this.lastPresenceHash === draftHash) return;
                this.lastPresenceHash = draftHash;

                this.sendPresenceUpdate(mergedDraft);
                return;
            }

            const webDraft: PresenceUpdateDraft = {
                status: "online",
                device: "web",
                activities: this.app.customStatus.activity
                    ? [this.app.customStatus.activity]
                    : [],
            };

            const draftHash = stableStringify(webDraft);
            if (this.lastPresenceHash === draftHash) return;
            this.lastPresenceHash = draftHash;

            this.sendPresenceUpdate(webDraft);
        };

        tick();
        this.presenceLoopInterval = window.setInterval(tick, intervalMs);
    }

    private stopPresenceLoop() {
        if (this.presenceLoopInterval) {
            window.clearInterval(this.presenceLoopInterval);
            this.presenceLoopInterval = null;
        }
        this.lastPresenceHash = null;
    }

    // Space
    private onSpaceCreate = (payload: APISpace) => {
        const space = this.app.spaces.add(payload);
        space.members.addAll(payload.members ?? []);
        for (const channel of payload.channels ?? []) {
            space.addChannel(channel);
        }

        this.app.spaces.setActive(space.id);
        this.app.channels.setPreferredActive();
    };

    private onSpaceDelete = (payload: APISpace) => {
        const space = this.app.spaces.get(payload.id);
        if (!space) return;

        for (const channel of space.channels) {
            channel.messages.clear();
            space.removeChannel(channel.id);
        }

        this.app.spaces.remove(payload.id);
        this.lazyRequestChannels.delete(space.id);
        this.app.spaces.setPreferredActive();
        this.app.channels.setPreferredActive();
    };

    private onChannelCreate = (payload: APIChannel) => {
        if (!payload.spaceId) return;
        const space = this.app.spaces.get(payload.spaceId);
        if (!space) return;

        const channel = space.addChannel(payload);
        if (!channel) {
            this.logger.error("Failed to add channel to space");
            return;
        }
    };

    private onChannelUpdate = (payload: APIChannel) => {
        if (!payload.spaceId) return;
        const space = this.app.spaces.get(payload.spaceId);
        if (!space) return;

        space.updateChannel(payload);
    };

    private onBulkChannelUpdate = (payload: APIChannel[]) => {
        for (const channel of payload) {
            if (!channel.spaceId) continue;
            const space = this.app.spaces.get(channel.spaceId);
            if (!space) continue;
            space.updateChannel(channel);
        }
    };

    private onChannelDelete = (payload: APIChannel) => {
        if (!payload.spaceId) return;
        const space = this.app.spaces.get(payload.spaceId);
        if (!space) return;

        space.removeChannel(payload.id);
        this.app.channels.setPreferredActive();
    };

    private onBulkChannelDelete = (payload: APIChannel[]) => {
        for (const channel of payload) {
            if (!channel.spaceId) continue;
            const space = this.app.spaces.get(channel.spaceId);
            if (!space) continue;
            space.removeChannel(channel.id);
        }

        this.app.channels.setPreferredActive();
    };

    private onMessageCreate = (payload: APIMessage) => {
        const channel = this.app.channels.get(payload.channelId);
        if (!channel) return;

        channel.messages.add(payload);
        this.app.queue.handleIncomingMessage(payload);
    };

    private onMessageUpdate = (payload: APIMessage) => {
        const channel = this.app.channels.get(payload.channelId);
        if (!channel) return;

        channel.messages.update(payload);
    };

    private onMessageDeleteBulk = (payload: APIMessage[]) => {
        const sortMessagesByChannel = payload.reduce(
            (acc, message) => {
                if (!acc[message.channelId]) acc[message.channelId] = [];
                acc[message.channelId].push(message.id);
                return acc;
            },
            {} as Record<string, string[]>,
        );

        for (const channelId in sortMessagesByChannel) {
            const channel = this.app.channels.get(channelId);
            if (!channel) continue;

            const messageIds = sortMessagesByChannel[channelId];
            channel.messages.removeBulk(messageIds);
        }
    };

    private onMessageDelete = (payload: APIMessage) => {
        const channel = this.app.channels.get(payload.channelId);
        if (!channel) return;

        channel.messages.remove(payload.id);
    };

    private onUserUpdate = (payload: APIUser | APIPrivateUser) => {
        this.app.users.update(payload as APIUser);

        if (payload.id === this.app.account?.id) {
            this.app.setUser(payload as APIPrivateUser);
        }
    };

    private onUserSettingsUpdate = (payload: APIUserSettings) => {
        this.app.settings?.update(payload);
    };

    private onInviteCreate = (payload: APIInvite) => {
        if (!payload.spaceId || !payload.channelId) return;

        const space = this.app.spaces.get(payload.spaceId);
        if (!space) return;

        space.addInvite(payload);
    };

    private onInviteUpdate = (payload: APIInvite) => {
        if (!payload.spaceId || !payload.channelId) return;

        const space = this.app.spaces.get(payload.spaceId);
        if (!space) return;

        space.updateInvite(payload);
    };

    private onInviteDelete = (payload: {
        spaceId: string;
        channelId: string;
        code: string;
    }) => {
        const space = this.app.spaces.get(payload.spaceId);
        if (!space) return;

        space.removeInvite(payload.code);
    };

    private onSpaceMemberAdd = (payload: any) => {
        const space = this.app.spaces.get(payload.spaceId);
        if (!space) return;

        space.members.add(payload);
    };

    private onSpaceMemberRemove = (payload: {
        spaceId: string;
        userId: string;
    }) => {
        const space = this.app.spaces.get(payload.spaceId);
        if (!space) return;

        space.members.remove(payload.userId);
    };

    // TODO: Add a type later
    private onSpaceMemberListUpdate = (data: any) => {
        const { spaceId } = data;
        const space = this.app.spaces.get(spaceId);

        if (!space) return;

        space.updateMemberList(data);
    };

    private onRoleCreate = (role: APIRole) => {
        const space = this.app.spaces.get(role.spaceId);
        if (!space) return;

        space.roles.add(role);
        space.members.all.forEach((member) => {
            member.invalidateChannelPermCache();
        });
    };

    private onRoleUpdate = (role: APIRole) => {
        const space = this.app.spaces.get(role.spaceId);
        if (!space) return;

        space.roles.update(role);
        space.members.all.forEach((member) => {
            member.invalidateChannelPermCache();
        });
    };

    private onRoleDelete = (role: APIRole) => {
        const space = this.app.spaces.get(role.spaceId);
        if (!space) return;

        space.roles.remove(role.id);

        space.members.all.forEach((member) => {
            member.invalidateChannelPermCache();
        });
    };

    private onMemberRoleAdd = (payload: any) => {
        const space = this.app.spaces.get(payload.spaceId);
        if (!space) return;

        const member = space.members.get(payload.userId);
        if (!member) return;

        member.roles.add(payload.roleId);
        member.invalidateChannelPermCache();
    };

    private onMemberRoleRemove = (payload: any) => {
        const space = this.app.spaces.get(payload.spaceId);
        if (!space) return;

        const member = space.members.get(payload.userId);
        if (!member) return;

        member.roles.delete(payload.roleId);
        member.invalidateChannelPermCache();
    };
}
