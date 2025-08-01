import { GatewayEvents, GatewayOpcodes } from "@mutualzz/types";
import { makeAutoObservable } from "mobx";
import { Logger } from "../Logger";
import type { AppStore } from "./App.store";

export class GatewayStore {
    private ws: WebSocket | null = null;
    private readonly logger = new Logger({
        tag: "GatewayStore",
        level: "debug",
    });
    private readonly ignoredEvents = new Set(["ACK", "READY", "RESUME"]);

    private readonly app: AppStore;

    private token: string | null = null;

    public status: number = WebSocket.CLOSED;
    private sessionId: string | null = null;
    private seq = 0;

    private heartbeatInterval: NodeJS.Timeout | null = null;
    private lastHeartbeatAck = true;

    public events: { t: string; d: any; s: number }[] = [];

    constructor(app: AppStore) {
        makeAutoObservable(this);
        this.app = app;

        if (typeof window !== "undefined") {
            this.sessionId = localStorage.getItem("_sessionId");
            this.seq = parseInt(localStorage.getItem("_seq") ?? "0");
        }
    }

    private onOpen = () => {
        this.status = WebSocket.OPEN;
        this.logger.debug("Gateway connected");
    };

    private onClose = () => {
        this.status = WebSocket.CLOSED;
        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
        this.logger.warn(
            "Gateway disconnected, attempting to reconnect in 3s...",
        );
        setTimeout(() => {
            this.connect(this.token ?? undefined);
        }, 3000);
    };

    private onMessage = (event: MessageEvent) => {
        const { op, t, s, d } = JSON.parse(event.data);

        switch (op) {
            case GatewayOpcodes.Hello: {
                this.logger.info("[HELLO] Starting heartbeat");
                this.startHeartbeat(d.heartbeatInterval);
                if (this.token) {
                    if (this.sessionId) this.resume();
                    else this.identify();
                    return;
                }
                break;
            }

            case GatewayOpcodes.HeartbeatAck:
                this.logger.debug("[HEARTBEAT_ACK] Heartbeat acknowledged");
                this.lastHeartbeatAck = true;
                break;

            case GatewayOpcodes.Dispatch: {
                if (s) {
                    this.seq = s;
                    localStorage.setItem("_seq", s.toString());
                }

                if (t === GatewayEvents.Ready) {
                    this.sessionId = d.sessionId;
                    localStorage.setItem("_sessionId", d.sessionId);

                    this.logger.info(`[READY] Session: ${d.sessionId}`);
                }

                if (t === GatewayEvents.Resume)
                    this.logger.info(`[RESUME] Session: ${d.sessionId}`);

                if (!this.ignoredEvents.has(t)) {
                    this.events.push({ t, d, s: this.seq });
                    this.handleDispatch(t, d);
                }

                break;
            }

            case GatewayOpcodes.InvalidSession: {
                this.logger.error("[INVALID_SESSION]", d.reason);
                this.sessionId = null;
                this.seq = 0;
                localStorage.removeItem("_sessionId");
                localStorage.removeItem("_seq");
                if (this.token) this.identify();
                break;
            }
        }
    };

    connect(token?: string) {
        this.token = token ?? this.app.token ?? null;
        this.ws = new WebSocket(import.meta.env.VITE_WS_URL);

        this.ws.onopen = this.onOpen;
        this.ws.onmessage = this.onMessage;
        this.ws.onclose = this.onClose;
    }

    private startHeartbeat(interval: number) {
        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = setInterval(() => {
            if (!this.lastHeartbeatAck) {
                this.logger.warn("Missed heartbeat, closing connection");
                this.ws?.close(4000, "Missed heartbeat");
                return;
            }

            this.lastHeartbeatAck = false;
            this.logger.debug("Sending heartbeat");
            this.send("Heartbeat", { s: this.seq });
        }, interval);
    }

    private identify() {
        if (!this.token) return;
        this.logger.info("[IDENTIFY] Identifying user");
        this.send("Identify", { token: this.token });
    }

    private resume() {
        if (!this.token || !this.sessionId) return;
        this.logger.info(
            "[RESUME] Resuming session",
            this.sessionId,
            "seq:",
            this.seq,
        );
        this.send("Resume", {
            sessionId: this.sessionId,
            seq: this.seq,
        });
    }

    private send(op: keyof typeof GatewayOpcodes, d: any = {}) {
        this.ws?.send(
            JSON.stringify({
                op: GatewayOpcodes[op],
                d,
            }),
        );
    }

    private handleDispatch(t: string, d: any) {
        this.logger.debug(`[DISPATCH] Event: ${t}`, d);
        switch (t) {
            default:
                this.logger.warn(`[DISPATCH] Unhandled event type: ${t}`);
        }
    }
}
