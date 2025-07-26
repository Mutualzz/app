import { GatewayEvents, GatewayOpcodes } from "@mutualzz/types";
import { makeAutoObservable } from "mobx";
import { Logger } from "../Logger";
import type { AppStore } from "./App.store";

const logger = new Logger({
    tag: "GatewayStore",
    level: "debug",
});

const ignoredEvents = new Set(["ACK", "READY", "RESUME"]);

// TODO: You left off at trying to debug if all the events are being sent correctly
// and if the session is being resumed correctly.
export class GatewayStore {
    private ws?: WebSocket;
    app: AppStore;

    connected = false;
    sessionId: string | null = null;
    seq = 0;
    heartbeatInterval?: NodeJS.Timeout;
    lastHeartbeatAck = true;
    token: string | null = null;

    events: { t: string; d: any; s: number }[] = [];

    constructor(app: AppStore) {
        makeAutoObservable(this, { app: false });
        this.app = app;

        if (typeof window !== "undefined") {
            this.sessionId = localStorage.getItem("gatewaySessionId");
            this.seq = parseInt(localStorage.getItem("gatewaySeq") ?? "0");
        }
    }

    connect(token?: string) {
        this.token = token ?? this.token;
        this.ws = new WebSocket(import.meta.env.VITE_WS_URL);

        this.ws.onopen = () => {
            this.connected = true;
            logger.debug("Gateway connected");
        };

        this.ws.onmessage = (event) => {
            const { op, t, s, d } = JSON.parse(event.data);

            switch (op) {
                case GatewayOpcodes.Hello: {
                    logger.info("[HELLO] Starting heartbeat");
                    this.startHeartbeat(d.heartbeatInterval);
                    if (this.token) {
                        if (this.sessionId) this.resume();
                        else this.identify();
                        return;
                    }
                    break;
                }

                case GatewayOpcodes.HeartbeatAck:
                    logger.debug("[HEARTBEAT_ACK] Heartbeat acknowledged");
                    this.lastHeartbeatAck = true;
                    break;

                case GatewayOpcodes.Dispatch: {
                    if (s) {
                        this.seq = s;
                        localStorage.setItem("gatewaySeq", s.toString());
                    }

                    if (t === GatewayEvents.Ready) {
                        this.sessionId = d.sessionId;
                        localStorage.setItem("gatewaySessionId", d.sessionId);

                        logger.info(`[READY] Session: ${d.sessionId}`);
                    }

                    if (t === GatewayEvents.Resume)
                        logger.info(`[RESUME] Session: ${d.sessionId}`);

                    if (!ignoredEvents.has(t)) {
                        this.events.push({ t, d, s: this.seq });
                        this.handleDispatch(t, d);
                    }

                    break;
                }

                case GatewayOpcodes.InvalidSession: {
                    logger.error("[INVALID_SESSION]", d.reason);
                    this.sessionId = null;
                    this.seq = 0;
                    localStorage.removeItem("gatewaySessionId");
                    localStorage.removeItem("gatewaySeq");
                    if (this.token) this.identify();
                    break;
                }
            }
        };

        this.ws.onclose = () => {
            this.connected = false;
            clearInterval(this.heartbeatInterval);
            logger.warn(
                "Gateway disconnected, attempting to reconnect in 3s...",
            );
            setTimeout(() => {
                this.connect(this.token ?? undefined);
            }, 3000);
        };
    }

    startHeartbeat(interval: number) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = setInterval(() => {
            if (!this.lastHeartbeatAck) {
                logger.warn("Missed heartbeat, closing connection");
                this.ws?.close(4000, "Missed heartbeat");
                return;
            }

            this.lastHeartbeatAck = false;
            logger.debug("Sending heartbeat");
            this.send("Heartbeat", { s: this.seq });
        }, interval);
    }

    identify() {
        if (!this.token) return;
        logger.info("[IDENTIFY] Identifying user");
        this.send("Identify", { token: this.token });
    }

    resume() {
        if (!this.token || !this.sessionId) return;
        logger.info(
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

    send(op: keyof typeof GatewayOpcodes, d: any = {}) {
        this.ws?.send(
            JSON.stringify({
                op: GatewayOpcodes[op],
                d,
            }),
        );
    }

    handleDispatch(t: string, d: any) {
        logger.debug(`[DISPATCH] Event: ${t}`, d);
        switch (t) {
            default:
                logger.warn(`[DISPATCH] Unhandled event type: ${t}`);
        }
    }
}
