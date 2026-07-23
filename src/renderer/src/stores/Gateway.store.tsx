import { Logger } from "@mutualzz/logger";
import { BitField, userFlags } from "@mutualzz/bitfield";
import {
  type APIChannel,
  APIExpression,
  type APIInvite,
  APIMemberRole,
  APIMessage,
  type APIMessageReactionEvent,
  type APIMessageReactionRemoveAllEvent,
  type APIMessageReactionRemoveEmojiEvent,
  type APIMessageReactionRemoveEvent,
  type APIPost,
  type APIPostComment,
  type APIPrivateUser,
  APIRelationship,
  APIRole,
  type APISpace,
  APISpaceBan,
  APISpaceMember,
  type APIUser,
  type APIUserProfile,
  type APIUserSettings,
  type APIReadState,
  type APISpaceNotificationSettings,
  ChannelType,
  GatewayCloseCodes,
  GatewayDispatchEvents,
  GatewayOpcodes,
  GatewayReadyPayload,
  PresenceActivity,
  CustomStatusSchedule,
  PresenceActivityEmoji,
  PresenceSchedule,
  PresenceStatus,
  Snowflake,
  APICall,
  type VoiceState as APIVoiceState
} from "@mutualzz/types";
import { type Codec, createCodec, type Encoding } from "@mutualzz/client";
import {
  type Compression,
  type Compressor,
  createCompressor
} from "@mutualzz/client";
import { makeAutoObservable } from "mobx";
import type { AppStore } from "./App.store";
import {
  buildDesktopPresenceFromProcesses,
  ensureRemoteGameCatalog,
  type PresenceUpdateDraft
} from "../presence/gamePresence";
import { normalizeRpcActivities } from "../presence/rpcActivities";
import { loadSpotifyActivity } from "../presence/spotifyPresence";
import { normalizeJSON } from "@mutualzz/client";
import { isElectron } from "@utils/index";
import { toast } from "react-toastify";
import { MessageToast } from "@renderer/components/Toast/MessageToast"; // We have to create our own GatewayStatus "enum" to avoid issues with SSR
import i18n from "@renderer/i18n";
import { Channel } from "./objects/Channel";

// We have to create our own GatewayStatus "enum" to avoid issues with SSR
// since WebSocket is not available in the server environment.
export const GatewayStatus = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
} as const;

export type GatewayStatus = (typeof GatewayStatus)[keyof typeof GatewayStatus];

const RECONNECT_TIMEOUT = 5000;
const RECONNECT_MAX_TIMEOUT = 30_000;
const RESUME_STORAGE_KEY = "mutualzz:gateway:resume";
const RESUME_MAX_AGE_MS = 110_000;
const FOREGROUND_DEBOUNCE_MS = 1000;

function mergeActivities(opts: {
  processActivities: PresenceActivity[];
  rpcActivities: PresenceActivity[];
  spotifyActivity: PresenceActivity | null;
  customActivity: PresenceActivity | null;
  previousActivities: PresenceActivity[];
}): PresenceActivity[] {
  const previousByKey = new Map<string, PresenceActivity>();
  for (const activity of opts.previousActivities) {
    if (activity.type === "custom") continue;
    const key = activity.applicationId
      ? `id:${activity.applicationId.toLowerCase()}`
      : `name:${(activity.name ?? "").toLowerCase()}`;
    previousByKey.set(key, activity);
  }

  const games = new Map<string, PresenceActivity>();

  const upsert = (act: PresenceActivity) => {
    const key = act.applicationId
      ? `id:${act.applicationId.toLowerCase()}`
      : `name:${(act.name ?? "").toLowerCase()}`;
    const prev = previousByKey.get(key) ?? games.get(key);
    games.set(key, {
      ...act,
      applicationId: act.applicationId ?? prev?.applicationId,
      url: act.url ?? prev?.url,
      assets: act.assets ?? prev?.assets,
      timestamps: act.timestamps ?? prev?.timestamps ?? { start: Date.now() }
    });
  };

  for (const act of opts.processActivities) upsert(act);
  for (const act of opts.rpcActivities) upsert(act);
  if (opts.spotifyActivity) upsert(opts.spotifyActivity);

  const sortedGames = [...games.values()].sort(
    (a, b) => (b.timestamps?.start ?? 0) - (a.timestamps?.start ?? 0)
  );

  const out: PresenceActivity[] = [];
  if (opts.customActivity) out.push(opts.customActivity);
  out.push(...sortedGames);
  return out.slice(0, 5);
}

async function loadRpcActivities(): Promise<PresenceActivity[]> {
  if (!window.api?.presence?.getRpcActivities) return [];
  try {
    const raw = await window.api.presence.getRpcActivities();
    return normalizeRpcActivities(raw ?? []);
  } catch {
    return [];
  }
}

function stableStringify(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

export class GatewayStore {
  public readyState: GatewayStatus = GatewayStatus.CLOSED;
  public events: { t: string; d: any; s: number }[] = [];
  private socket: WebSocket | null = null;
  private readonly logger = new Logger({ tag: "GatewayStore" });
  private sessionId: string | null = null;
  private sequence = 0;
  private heartbeatInterval: number | null = null;
  private heartbeat: ReturnType<typeof setInterval> | null = null;
  private initialHeartbeatTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatAck = true;
  private url?: string;
  private encoding: Encoding =
    isElectron && !import.meta.env.DEV ? "etf" : "json";
  private compress: Compression = import.meta.env.DEV ? "none" : "zlib-stream";
  private codec!: Codec;
  private compressor!: Compressor;
  private connectionStartTime?: number;
  private identifyStartTime?: number;
  private reconnectTimeout = 0;
  private reconnecting = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly dispatchHandlers = new Map<
    string,
    (...args: any[]) => any
  >();
  private presenceLoopInterval: number | null = null;
  private rpcUpdatedUnsub: (() => void) | null = null;
  private lastPresenceHash: string | null = null;
  private lazyRequestChannels = new Map<string, string[]>(); // spaceId -> channelIds

  // key: `${spaceId}:${channelId}` -> list of [start, end] ranges we have
  private memberListRanges = new Map<string, [number, number][]>();
  private memberListFetching = new Set<string>(); // Keys we are fetching
  private manualDisconnect = false;
  private subscribedUserIds = new Set<string>();
  private subscribedUserRefCounts = new Map<string, number>();
  private resolvingChannels = new Map<
    Snowflake,
    Promise<Channel | undefined>
  >();
  private visibilityHandler: (() => void) | null = null;
  private focusHandler: (() => void) | null = null;
  private foregroundProbeTimer: ReturnType<typeof setTimeout> | null = null;
  private foregroundProbeResolve: ((acked: boolean) => void) | null = null;
  private foregroundHandling = false;
  private lastForegroundAt = 0;
  private connectionGeneration = 0;
  private backgroundPresenceStatus: PresenceStatus | null = null;
  private sendChain: Promise<void> = Promise.resolve();

  constructor(private readonly app: AppStore) {
    makeAutoObservable(this, {}, { autoBind: true });
    this.app.presence.onScheduledStatusExpire =
      this.handleScheduledStatusExpired;
    this.app.customStatus.onScheduledCustomStatusExpire =
      this.handleScheduledCustomStatusExpired;
    this.restoreResumeState();
    this.bindLifecycleHandlers();
  }

  private restoreResumeState() {
    try {
      const raw = localStorage.getItem(RESUME_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        sessionId?: string;
        sequence?: number;
        savedAt?: number;
      };
      if (
        !parsed.sessionId ||
        typeof parsed.sequence !== "number" ||
        typeof parsed.savedAt !== "number"
      ) {
        localStorage.removeItem(RESUME_STORAGE_KEY);
        return;
      }
      if (Date.now() - parsed.savedAt > RESUME_MAX_AGE_MS) {
        localStorage.removeItem(RESUME_STORAGE_KEY);
        return;
      }
      this.sessionId = parsed.sessionId;
      this.sequence = parsed.sequence;
    } catch {
      localStorage.removeItem(RESUME_STORAGE_KEY);
    }
  }

  private persistResumeState() {
    if (!this.sessionId) {
      localStorage.removeItem(RESUME_STORAGE_KEY);
      return;
    }
    try {
      localStorage.setItem(
        RESUME_STORAGE_KEY,
        JSON.stringify({
          sessionId: this.sessionId,
          sequence: this.sequence,
          savedAt: Date.now()
        })
      );
    } catch {}
  }

  private clearResumeState() {
    localStorage.removeItem(RESUME_STORAGE_KEY);
  }

  private bindLifecycleHandlers() {
    if (typeof document === "undefined") return;

    this.visibilityHandler = () => {
      if (document.visibilityState === "hidden") {
        this.persistResumeState();
        const userId = this.app.account?.id;
        if (
          userId &&
          this.readyState === GatewayStatus.OPEN &&
          !this.backgroundPresenceStatus
        ) {
          const current = this.app.presence.get(userId)?.status ?? "online";
          if (
            current !== "idle" &&
            current !== "offline" &&
            current !== "invisible" &&
            current !== "dnd"
          ) {
            this.backgroundPresenceStatus = current;
            this.setStatus("idle");
          }
        }
        return;
      }

      if (document.visibilityState === "visible") {
        if (this.backgroundPresenceStatus) {
          this.setStatus(this.backgroundPresenceStatus);
          this.backgroundPresenceStatus = null;
        }
        void this.handleForeground();
      }
    };

    this.focusHandler = () => {
      void this.handleForeground();
    };

    document.addEventListener("visibilitychange", this.visibilityHandler);
    window.addEventListener("focus", this.focusHandler);
  }

  private clearForegroundProbe() {
    if (this.foregroundProbeTimer) {
      clearTimeout(this.foregroundProbeTimer);
      this.foregroundProbeTimer = null;
    }
    const done = this.foregroundProbeResolve;
    this.foregroundProbeResolve = null;
    done?.(false);
  }

  private teardownSocket() {
    this.stopHeartbeat();
    this.clearForegroundProbe();

    if (!this.socket) {
      this.readyState = GatewayStatus.CLOSED;
      return;
    }

    const socket = this.socket;
    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;

    try {
      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close(4000, "reconnect");
      }
    } catch {}

    this.socket = null;
    this.readyState = GatewayStatus.CLOSED;
  }

  private clearReconnect = () => {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnecting = false;
  };

  private forceReconnect() {
    if (!this.app.token) return;

    this.logger.debug("[Foreground] Forcing gateway reconnect");
    this.markGatewayUnavailable();
    this.clearReconnect();
    this.reconnectTimeout = RECONNECT_TIMEOUT;
    this.teardownSocket();
    void this.connect(this.url).catch((error) => {
      this.logger.error("Foreground reconnect failed", error);
      this.readyState = GatewayStatus.CLOSED;
      this.startReconnect();
    });
  }

  private probeConnection(timeoutMs: number) {
    return new Promise<boolean>((resolve) => {
      if (
        !this.socket ||
        this.socket.readyState !== WebSocket.OPEN ||
        this.readyState !== GatewayStatus.OPEN
      ) {
        resolve(false);
        return;
      }

      this.clearForegroundProbe();
      this.foregroundProbeResolve = resolve;
      this.heartbeatAck = false;
      this.sendHeartbeat();

      this.foregroundProbeTimer = setTimeout(() => {
        this.foregroundProbeTimer = null;
        const done = this.foregroundProbeResolve;
        this.foregroundProbeResolve = null;
        done?.(this.heartbeatAck);
      }, timeoutMs);
    });
  }

  private async handleForeground() {
    if (!this.app.token) return;
    if (this.foregroundHandling) return;

    const now = Date.now();
    if (now - this.lastForegroundAt < FOREGROUND_DEBOUNCE_MS) return;
    this.lastForegroundAt = now;

    this.foregroundHandling = true;
    try {
      const socketOpen =
        !!this.socket &&
        this.socket.readyState === WebSocket.OPEN &&
        this.readyState === GatewayStatus.OPEN;

      if (!socketOpen) {
        this.forceReconnect();
        return;
      }

      this.stopHeartbeat();
      const probeTimeout = Math.min(this.heartbeatInterval ?? 30_000, 10_000);
      const acked = await this.probeConnection(probeTimeout);

      if (!acked) {
        this.forceReconnect();
        return;
      }

      this.heartbeatAck = true;
      this.startHeartbeat();
    } finally {
      this.foregroundHandling = false;
    }
  }

  refreshMemberList(spaceId: string, channelId: string) {
    if (!spaceId || !channelId) return;

    const key = `${spaceId}:${channelId}`;
    this.memberListRanges.delete(key);
    this.memberListFetching.delete(key);

    const space = this.app.spaces.get(spaceId);
    const channel = this.app.channels.get(channelId);
    if (space && channel) {
      space.memberLists.delete(channel.listId);
    }

    const initialRange: [number, number] = [0, 99];
    this.memberListRanges.set(key, [initialRange]);

    this.send({
      op: GatewayOpcodes.LazyRequest,
      d: {
        spaceId,
        channels: {
          [channelId]: [initialRange]
        }
      }
    });
  }

  requestMemberListRange(spaceId: string, channelId: string, pageSize = 50) {
    if (!spaceId || !channelId) return;

    const key = `${spaceId}:${channelId}`;
    if (this.memberListFetching.has(key)) return;

    let loadedCount: number;
    try {
      const space = this.app.spaces.get(spaceId);
      const channel = this.app.channels.get(channelId);
      const listStore =
        space && channel ? space.memberLists.get(channel.listId) : null;

      if (listStore)
        loadedCount = listStore.list.reduce(
          (acc: number, g) => acc + (g.items?.length ?? 0),
          0
        );
      else {
        const prevRanges = this.memberListRanges.get(key) ?? [];
        loadedCount = prevRanges.reduce((acc, r) => acc + (r[1] - r[0] + 1), 0);
      }
    } catch {
      loadedCount = 0;
    }

    const nextStart = loadedCount;
    const nextEnd = Math.max(nextStart, nextStart + pageSize - 1);

    // Avoid requesting zero-length page
    if (nextEnd < nextStart) return;

    const prev = this.memberListRanges.get(key) ?? [];

    // if any existing range already covers nextStart, skip
    for (const r of prev) {
      if (r[0] <= nextStart && r[1] >= nextStart) return;
    }

    const newRanges = [...prev, [nextStart, nextEnd]];
    this.memberListRanges.set(key, newRanges as [number, number][]);

    this.memberListFetching.add(key);

    const payload = {
      spaceId,
      channels: {
        [channelId]: newRanges
      }
    };

    try {
      this.send({
        op: GatewayOpcodes.LazyRequest,
        d: payload
      });
    } finally {
      setTimeout(() => this.memberListFetching.delete(key), 250);
    }
  }

  async connect(url: string = import.meta.env.VITE_WS_URL) {
    if (!this.url) {
      const newUrl = new URL(url);
      newUrl.searchParams.set("encoding", this.encoding);
      newUrl.searchParams.set("compress", this.compress);
      this.url = newUrl.href;
    }

    const connectionId = ++this.connectionGeneration;
    this.logger.debug(`[Connect] Gateway URL ${this.url}`);
    this.connectionStartTime = Date.now();
    this.manualDisconnect = false;
    this.readyState = GatewayStatus.CONNECTING;

    const [codec, compressor] = await Promise.all([
      createCodec(this.encoding),
      createCompressor(this.compress)
    ]);

    if (connectionId !== this.connectionGeneration) return;

    this.codec = codec;
    this.compressor = compressor;
    this.teardownSocket();
    this.socket = new WebSocket(this.url);
    this.socket.binaryType = "arraybuffer";
    this.readyState = GatewayStatus.CONNECTING;
    this.setupListeners();
    this.setupDispatchHandlers();
  }

  async disconnect(code?: number, reason?: string) {
    this.clearReconnect();
    this.clearForegroundProbe();

    if (!this.socket) return;

    if (this.app.voice.hasActiveVoiceTarget) {
      await this.app.voice.leave();
    } else {
      this.app.voice.reset();
    }

    this.readyState = GatewayStatus.CLOSING;
    this.logger.debug(`[Disconnect] ${this.url}`);
    this.manualDisconnect = true;
    this.clearResumeState();
    this.socket.close(code, reason);
  }

  startReconnect() {
    if (this.reconnecting) return;

    this.reconnecting = true;
    const delay = this.reconnectTimeout || RECONNECT_TIMEOUT;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnecting = false;
      this.logger.debug(`[Reconnect] ${this.url}`);
      void this.connect(this.url).catch((error) => {
        this.logger.error("Reconnect failed", error);
        this.readyState = GatewayStatus.CLOSED;
        this.reconnectTimeout = Math.min(
          RECONNECT_MAX_TIMEOUT,
          (this.reconnectTimeout || RECONNECT_TIMEOUT) * 2
        );
        this.startReconnect();
      });
    }, delay);
  }

  onChannelOpen = (spaceId: string, channelId: string) => {
    const prev = this.lazyRequestChannels.get(spaceId) ?? [];
    if (prev.includes(channelId)) return;

    const key = `${spaceId}:${channelId}`;
    const initialRange: [number, number] = [0, 99];
    this.memberListRanges.set(key, [initialRange]);

    const payload = {
      spaceId,
      channels: {
        [channelId]: [initialRange]
      }
    };

    this.lazyRequestChannels.set(spaceId, [...prev, channelId]);

    this.send({
      op: GatewayOpcodes.LazyRequest,
      d: payload
    });
  };

  private resubscribeLazyChannels() {
    for (const [spaceId, channelIds] of this.lazyRequestChannels) {
      for (const channelId of channelIds) {
        const key = `${spaceId}:${channelId}`;
        const ranges = this.memberListRanges.get(key) ?? [[0, 99]];
        this.send({
          op: GatewayOpcodes.LazyRequest,
          d: {
            spaceId,
            channels: {
              [channelId]: ranges
            }
          }
        });
      }
    }
  }

  sendPresenceUpdate(
    presence: PresenceUpdateDraft,
    opts?: { persist?: boolean }
  ) {
    this.send({
      op: GatewayOpcodes.PresenceUpdate,
      d: { presence, persist: !!opts?.persist }
    });
  }

  setStatus(status: PresenceStatus, opts?: { persist?: boolean }) {
    const userId = this.app.account?.id;
    if (!userId) return;

    const prev = this.app.presence.get(userId);

    this.app.presence.upsert(userId, {
      ...(prev ?? { activities: [] }),
      status,
      device: isElectron ? "desktop" : "web",
      updatedAt: Date.now()
    });

    this.sendPresenceUpdate(
      {
        status,
        device: isElectron ? "desktop" : "web",
        activities: isElectron
          ? (prev?.activities ?? [])
          : (prev?.activities?.filter((a) => a.type === "custom") ?? [])
      },
      { persist: Boolean(opts?.persist) }
    );
  }

  setCustomStatus(
    text: string,
    opts?: { persist?: boolean; emoji?: PresenceActivityEmoji | null }
  ) {
    this.app.customStatus.set(text, opts?.emoji);

    const userId = this.app.account?.id;
    if (!userId) return;

    this.pushCustomStatusPresenceUpdate({ persist: Boolean(opts?.persist) });
  }

  clearCustomStatus() {
    this.app.customStatus.clear();
    this.pushCustomStatusPresenceUpdate();
  }

  scheduleCustomStatus(opts: {
    text: string;
    emoji?: PresenceActivityEmoji | null;
    durationMs: number;
  }) {
    this.send({
      op: GatewayOpcodes.CustomStatusScheduleSet,
      d: {
        text: opts.text,
        emoji: opts.emoji ?? null,
        durationMs: opts.durationMs
      }
    });
  }

  clearScheduledCustomStatus() {
    this.send({
      op: GatewayOpcodes.CustomStatusScheduleClear,
      d: {}
    });
  }

  private pushCustomStatusPresenceUpdate(opts?: { persist?: boolean }) {
    const userId = this.app.account?.id;
    if (!userId) return;

    if (!isElectron) {
      this.refreshPresenceActivities();
      return;
    }

    const customActivity = this.app.customStatus.activity;
    const status = this.getEffectiveStatus();
    const prev = this.app.presence.get(userId);
    const shareActivity = this.app.settings?.shareActivity !== false;

    const activities = customActivity
      ? [
          customActivity,
          ...(shareActivity
            ? (prev?.activities?.filter((a) => a.type !== "custom") ?? [])
            : [])
        ]
      : shareActivity
        ? (prev?.activities?.filter((a) => a.type !== "custom") ?? [])
        : [];

    const draft: PresenceUpdateDraft = {
      status,
      device: "desktop",
      activities
    };

    this.lastPresenceHash = null;
    this.sendPresenceUpdate(draft, opts);
  }

  private handleScheduledCustomStatusExpired = (
    schedule: CustomStatusSchedule
  ) => {
    const userId = this.app.account?.id;
    if (!userId) return;

    const revertTo = schedule.revertTo;
    if (revertTo) this.app.customStatus.setSnapshot(revertTo);
    else this.app.customStatus.clear();

    this.lastPresenceHash = null;
    this.clearScheduledCustomStatus();

    if (!this.socket || this.readyState !== GatewayStatus.OPEN) return;

    this.pushCustomStatusPresenceUpdate();
  };

  scheduleStatus(opts: { status: PresenceStatus; durationMs: number }) {
    this.send({
      op: GatewayOpcodes.PresenceScheduleSet,
      d: {
        status: opts.status,
        durationMs: opts.durationMs
      }
    });
  }

  clearScheduledStatus() {
    this.send({
      op: GatewayOpcodes.PresenceScheduleClear,
      d: {}
    });
  }

  refreshPresenceActivities() {
    this.lastPresenceHash = null;
    if (!this.socket || this.readyState !== GatewayStatus.OPEN) return;
    if (!this.app.account?.id) return;

    void (async () => {
      const shareActivity = this.app.settings?.shareActivity !== false;
      const previousActivities =
        this.app.presence.get(this.app.account!.id)?.activities ?? [];

      if (isElectron) {
        const [baseDraft, rpcActivities, spotifyActivity] = await Promise.all([
          buildDesktopPresenceFromProcesses(),
          loadRpcActivities(),
          shareActivity
            ? loadSpotifyActivity(this.app.rest)
            : Promise.resolve(null)
        ]);
        const draft: PresenceUpdateDraft = {
          ...baseDraft,
          device: "desktop",
          activities: mergeActivities({
            processActivities: shareActivity
              ? (baseDraft.activities ?? [])
              : [],
            rpcActivities: shareActivity ? rpcActivities : [],
            spotifyActivity: shareActivity ? spotifyActivity : null,
            customActivity: this.app.customStatus.activity,
            previousActivities: shareActivity ? previousActivities : []
          }),
          status: this.getEffectiveStatus()
        };
        this.lastPresenceHash = stableStringify(draft);
        this.sendPresenceUpdate(draft);
        return;
      }

      const spotifyActivity = shareActivity
        ? await loadSpotifyActivity(this.app.rest)
        : null;
      const draft: PresenceUpdateDraft = {
        status: this.getEffectiveStatus(),
        device: "web",
        activities: mergeActivities({
          processActivities: [],
          rpcActivities: [],
          spotifyActivity,
          customActivity: this.app.customStatus.activity,
          previousActivities: shareActivity ? previousActivities : []
        })
      };
      this.lastPresenceHash = stableStringify(draft);
      this.sendPresenceUpdate(draft);
    })();
  }

  private handleScheduledStatusExpired = (schedule: PresenceSchedule) => {
    const userId = this.app.account?.id;
    if (!userId) return;

    const revertTo = schedule.revertTo ?? "online";
    const prev = this.app.presence.get(userId);

    this.app.presence.upsert(userId, {
      ...(prev ?? { activities: [] }),
      status: revertTo,
      device: isElectron ? "desktop" : "web",
      updatedAt: Date.now()
    });

    this.lastPresenceHash = null;
    this.clearScheduledStatus();

    if (!this.socket || this.readyState !== GatewayStatus.OPEN) return;

    this.sendPresenceUpdate({
      status: revertTo,
      device: isElectron ? "desktop" : "web",
      activities: isElectron
        ? (prev?.activities ?? [])
        : (prev?.activities?.filter((a) => a.type === "custom") ?? [])
    });
  };

  subscribeUser(userId: string) {
    const next = (this.subscribedUserRefCounts.get(userId) ?? 0) + 1;
    this.subscribedUserRefCounts.set(userId, next);
    this.subscribedUserIds.add(userId);
    if (next > 1) return;
    if (this.readyState !== GatewayStatus.OPEN) return;

    this.send({
      op: GatewayOpcodes.SubscribeUser,
      d: { userId }
    });
  }

  unsubscribeUser(userId: string) {
    const current = this.subscribedUserRefCounts.get(userId) ?? 0;
    if (current <= 1) {
      this.subscribedUserRefCounts.delete(userId);
      this.subscribedUserIds.delete(userId);
      if (this.readyState !== GatewayStatus.OPEN) return;
      this.send({
        op: GatewayOpcodes.UnsubscribeUser,
        d: { userId }
      });
      return;
    }

    this.subscribedUserRefCounts.set(userId, current - 1);
  }

  private resubscribeUsers() {
    for (const userId of this.subscribedUserIds) {
      this.send({
        op: GatewayOpcodes.SubscribeUser,
        d: { userId }
      });
    }
  }

  send = (payload: any) => {
    this.sendChain = this.sendChain
      .then(() => this.sendImmediate(payload))
      .catch((error) => {
        this.logger.error("Failed to send message", error);
      });
    return this.sendChain;
  };

  private sendImmediate = async (payload: any) => {
    if (!this.socket) {
      this.logger.error("Socket is not open");
      return;
    }
    if (this.socket.readyState !== WebSocket.OPEN) {
      this.logger.error(
        `Socket is not open; readyState: ${this.socket.readyState}`
      );
      return;
    }

    try {
      let encodedBytes: any;

      if (this.encoding === "etf") {
        if (!window.api) {
          this.logger.error("[send] window.api is not available");
          return;
        }
        if (!window.api.codec) {
          this.logger.error("[send] window.api.codec is not available");
          return;
        }

        const encoded = await window.api.codec.etfEncode(payload);

        encodedBytes = Uint8Array.from(encoded);
      } else {
        encodedBytes = this.codec.encode(payload);
      }

      const finalBytes =
        this.compress === "none"
          ? encodedBytes
          : this.compressor.compress(encodedBytes);

      this.socket.send(finalBytes);
      this.logger.debug(`[Gateway] <- ${payload.op}`);
    } catch (error) {
      this.logger.error("Failed to send message", error);
    }
  };

  private getEffectiveStatus(): PresenceStatus {
    const userId = this.app.account?.id;
    if (!userId) return "online";

    const scheduled = this.app.presence.scheduledStatus;
    if (scheduled && scheduled.until > Date.now()) return scheduled.status;

    const status = this.app.presence.get(userId)?.status ?? "online";
    if (status === "offline") return "online";
    return status;
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
      this.onPresenceUpdate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.PresenceScheduleUpdate,
      this.onPresenceScheduleUpdate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.CustomStatusScheduleUpdate,
      this.onCustomStatusScheduleUpdate
    );

    // User
    this.dispatchHandlers.set(
      GatewayDispatchEvents.UserUpdate,
      this.onUserUpdate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.UserSettingsUpdate,
      this.onUserSettingsUpdate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.UserProfileUpdate,
      this.onUserProfileUpdate
    );

    // Spaces
    this.dispatchHandlers.set(
      GatewayDispatchEvents.SpaceCreate,
      this.onSpaceCreate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.SpaceDelete,
      this.onSpaceDelete
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.SpaceUpdate,
      this.onSpaceUpdate
    );

    // Channels
    this.dispatchHandlers.set(
      GatewayDispatchEvents.ChannelCreate,
      this.onChannelCreate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.ChannelUpdate,
      this.onChannelUpdate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.ChannelUpdateBulk,
      this.onChannelUpdateBulk
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.ChannelDeleteBulk,
      this.onChannelDeleteBulk
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.ChannelDelete,
      this.onChannelDelete
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.ChannelRecipientAdd,
      this.onChannelRecipientAdd
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.ChannelRecipientRemove,
      this.onChannelRecipientRemove
    );

    // Messages
    this.dispatchHandlers.set(
      GatewayDispatchEvents.MessageAck,
      this.onMessageAck
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.MessageAckBulk,
      this.onMessageAckBulk
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.ReadStateUpdate,
      this.onReadStateUpdate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.SpaceNotificationSettingsUpdate,
      this.onSpaceNotificationSettingsUpdate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.MessageCreate,
      this.onMessageCreate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.MessageUpdate,
      this.onMessageUpdate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.MessageDelete,
      this.onMessageDelete
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.MessageDeleteBulk,
      this.onMessageDeleteBulk
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.MessageReactionAdd,
      this.onMessageReactionAdd
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.MessageReactionRemove,
      this.onMessageReactionRemove
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.MessageReactionRemoveAll,
      this.onMessageReactionRemoveAll
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.MessageReactionRemoveEmoji,
      this.onMessageReactionRemoveEmoji
    );

    // Invites
    this.dispatchHandlers.set(
      GatewayDispatchEvents.InviteCreate,
      this.onInviteCreate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.InviteDelete,
      this.onInviteDelete
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.InviteUpdate,
      this.onInviteUpdate
    );

    // Members
    this.dispatchHandlers.set(
      GatewayDispatchEvents.SpaceMemberAdd,
      this.onSpaceMemberAdd
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.SpaceMemberRemove,
      this.onSpaceMemberRemove
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.SpaceMemberListUpdate,
      this.onSpaceMemberListUpdate
    );

    // Roles
    this.dispatchHandlers.set(
      GatewayDispatchEvents.RoleCreate,
      this.onRoleCreate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.RoleUpdate,
      this.onRoleUpdate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.RoleDelete,
      this.onRoleDelete
    );

    // Role assignments
    this.dispatchHandlers.set(
      GatewayDispatchEvents.SpaceMemberRoleAdd,
      this.onMemberRoleAdd
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.SpaceMemberRoleRemove,
      this.onMemberRoleRemove
    );

    // Voice
    this.dispatchHandlers.set(
      GatewayDispatchEvents.VoiceServerUpdate,
      this.app.voice.onVoiceServerUpdate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.VoiceStateSync,
      this.app.voice.onVoiceStateSync
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.VoiceStateUpdate,
      this.app.voice.onVoiceStateUpdate
    );

    this.dispatchHandlers.set(
      GatewayDispatchEvents.CallCreate,
      this.onCallCreate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.CallUpdate,
      this.onCallUpdate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.CallDelete,
      this.onCallDelete
    );

    // Expression
    this.dispatchHandlers.set(
      GatewayDispatchEvents.ExpressionCreate,
      this.onExpressionCreate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.ExpressionDelete,
      this.onExpressionDelete
    );

    // Relationships
    this.dispatchHandlers.set(
      GatewayDispatchEvents.RelationshipCreate,
      this.onRelationshipCreate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.RelationshipUpdate,
      this.onRelationshipUpdate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.RelationshipDelete,
      this.onRelationshipDelete
    );

    // Minecraft bridge
    this.dispatchHandlers.set(
      GatewayDispatchEvents.MinecraftLinkUpdate,
      this.onMinecraftLinkUpdate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.BridgeChat,
      this.onBridgeChat
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.BridgeJoin,
      this.onBridgeJoin
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.BridgeLeave,
      this.onBridgeLeave
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.BridgeVoiceJoin,
      this.onBridgeVoiceJoin
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.BridgeVoiceLeave,
      this.onBridgeVoiceLeave
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.BridgePresence,
      this.onBridgePresence
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.BridgeMemberAdd,
      this.onBridgeMemberAdd
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.BridgeMemberRemove,
      this.onBridgeMemberRemove
    );

    // Space Bans
    this.dispatchHandlers.set(
      GatewayDispatchEvents.SpaceBanAdd,
      this.onSpaceBanAdd
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.SpaceBanRemove,
      this.onSpaceBanRemove
    );

    // Typing
    this.dispatchHandlers.set(
      GatewayDispatchEvents.TypingStart,
      this.onTypingStart
    );

    // Posts
    this.dispatchHandlers.set(
      GatewayDispatchEvents.PostCreate,
      this.onPostCreate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.PostUpdate,
      this.onPostUpdate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.PostDelete,
      this.onPostDelete
    );

    // Post Comments
    this.dispatchHandlers.set(
      GatewayDispatchEvents.PostCommentCreate,
      this.onPostCommentCreate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.PostCommentUpdate,
      this.onPostCommentUpdate
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.PostCommentDelete,
      this.onPostCommentDelete
    );

    // Post Engagement
    this.dispatchHandlers.set(
      GatewayDispatchEvents.PostLikeAdd,
      this.onPostLikeAdd
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.PostLikeRemove,
      this.onPostLikeRemove
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.PostShareAdd,
      this.onPostShareAdd
    );
    this.dispatchHandlers.set(
      GatewayDispatchEvents.PostShareRemove,
      this.onPostShareRemove
    );
  }

  private resolveChannel(channelId: Snowflake): Promise<Channel | undefined> {
    const existing = this.app.channels.get(channelId);
    if (existing) return Promise.resolve(existing);

    if (this.resolvingChannels.has(channelId))
      return this.resolvingChannels.get(channelId)!;

    const promise = this.app.channels
      .resolve(channelId)
      .finally(() => this.resolvingChannels.delete(channelId));

    this.resolvingChannels.set(channelId, promise);
    return promise;
  }

  private onOpen = () => {
    this.logger.info(
      `[Connected] ${this.url} (took ${Date.now() - this.connectionStartTime!}ms)`
    );
    this.readyState = GatewayStatus.OPEN;
    this.reconnectTimeout = 0;
    this.clearReconnect();

    if (this.sessionId && this.app.account) {
      this.logger.info("[Gateway] Resuming session");
      this.handleResume();
    } else {
      if (this.sessionId && !this.app.account) {
        this.logger.info(
          "[Gateway] Resume state without local data; identifying"
        );
        this.sessionId = null;
        this.sequence = 0;
        this.clearResumeState();
      }
      this.logger.info("[Gateway] Identifying");
      this.handleIdentify();
    }
  };

  private handleIdentify() {
    this.logger.debug(
      `[Identify] Socket state: ${this.socket?.readyState}, token: ${this.app.token ? "set" : "not set"}`
    );

    if (!this.app.token) {
      this.logger.error("Cannot identify, token is not set");
      return;
    }

    this.identifyStartTime = Date.now();

    this.send({
      op: GatewayOpcodes.Identify,
      d: { token: this.app.token }
    });
  }

  private onMessage = async (event: MessageEvent) => {
    try {
      let rawBytes: Uint8Array;

      if (typeof event.data === "string") {
        rawBytes = new TextEncoder().encode(event.data);
      } else if (event.data instanceof ArrayBuffer) {
        rawBytes = new Uint8Array(event.data);
      } else if (event.data instanceof Blob) {
        rawBytes = new Uint8Array(await event.data.arrayBuffer());
      } else {
        this.logger.error("Unknown message data type");
        return;
      }

      const bytes =
        this.compress === "none"
          ? rawBytes
          : this.compressor.decompress(rawBytes);

      let payload: any;

      try {
        // Try the configured encoding first
        if (this.encoding === "etf") {
          payload = await window.api!.codec.etfDecode(Array.from(bytes));
        } else {
          payload = this.codec.decode(bytes);
        }
      } catch (etfError) {
        // If ETF fails, try JSON as fallback
        this.logger.warn(
          `[onMessage] ${this.encoding} decode failed, trying JSON fallback:`,
          etfError
        );
        try {
          payload = JSON.parse(new TextDecoder().decode(bytes));
        } catch (jsonError) {
          this.logger.error(
            `[onMessage] Both ${this.encoding} and JSON decode failed`
          );
          throw jsonError;
        }
      }

      this.handlePayload(payload);
    } catch (error) {
      this.logger.error("Failed to decode gateway message", error);
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
      case GatewayOpcodes.System:
        this.handleSystem(payload.d);
        break;
      default:
        this.logger.debug("Received unknown opcode");
        break;
    }
  };

  private handleSystem = (data: { message?: string } | null) => {
    const message = data?.message?.trim();
    if (!message) return;

    const voice = this.app.voice;
    if (
      voice.connectionStatus === "connecting" ||
      voice.connectionStatus === "failed"
    ) {
      voice.failJoinFromSystem(message);
    }
  };

  private onError = (event: Event) => {
    this.logger.error(`[Socket Error]`, event);
  };

  private onClose = (event: CloseEvent) => {
    this.readyState = GatewayStatus.CLOSED;
    this.stopPresenceLoop();
    this.handleClose(event.code);
  };

  private markGatewayUnavailable() {
    this.app.setGatewayReady(false);
  }

  private handleInvalidSession = (resumable: boolean) => {
    this.stopHeartbeat();
    this.markGatewayUnavailable();

    this.logger.debug(`Received invalid session; Can Resume: ${resumable}`);
    this.reconnectTimeout = 0;
    if (!resumable) {
      this.reset();
      this.clearResumeState();
      return;
    }

    this.handleResume();
  };

  private handleReconnect() {
    this.markGatewayUnavailable();
    this.logger.debug(`[Gateway] -> Reconnect`);
    this.teardownSocket();
    this.startReconnect();
  }

  private handleResume() {
    if (!this.app.token) {
      this.logger.error("Cannot resume, token is not set");
      this.reset();
      this.app.logout();
      return;
    }

    if (!this.sessionId) {
      this.logger.warn("Cannot resume without sessionId; identifying");
      this.handleIdentify();
      return;
    }

    this.send({
      op: GatewayOpcodes.Resume,
      d: {
        token: this.app.token,
        sessionId: this.sessionId,
        seq: this.sequence
      }
    });

    this.logger.debug(`[Gateway] -> ${GatewayOpcodes.Resume}`, {
      sessionId: this.sessionId,
      seq: this.sequence
    });
  }

  private handleHello(data: any) {
    this.heartbeatInterval = data.heartbeatInterval;
    this.logger.info(
      `[Hello] heartbeat interval: ${data.heartbeatInterval} (took ${Date.now() - this.connectionStartTime!}ms)`
    );
    this.startHeartbeat();
  }

  private handleClose = (code?: number) => {
    if (this.manualDisconnect) {
      this.manualDisconnect = false;
      this.cleanup();
      this.reset();
      this.markGatewayUnavailable();
      return;
    }

    this.app.voice.onGatewayDisconnected();
    this.stopHeartbeat();
    this.socket = null;
    this.readyState = GatewayStatus.CLOSED;
    this.markGatewayUnavailable();

    if (code === GatewayCloseCodes.ForceLogout) {
      this.reset();
      void this.app.logout();
      return;
    }

    if (code === GatewayCloseCodes.NotAuthenticated) return;

    if (this.reconnectTimeout <= 0) this.reconnectTimeout = RECONNECT_TIMEOUT;
    else
      this.reconnectTimeout = Math.min(
        RECONNECT_MAX_TIMEOUT,
        this.reconnectTimeout * 2
      );

    this.logger.debug(
      `Websocket closed with code ${code}; Will reconnect in ${(
        this.reconnectTimeout / 1000
      ).toFixed(2)} seconds.`
    );

    this.startReconnect();
  };

  private reset = () => {
    this.sessionId = null;
    this.sequence = 0;
    this.readyState = GatewayStatus.CLOSED;
    this.lazyRequestChannels.clear();
    this.memberListRanges.clear();
    this.memberListFetching.clear();
    this.subscribedUserIds.clear();
    this.subscribedUserRefCounts.clear();
    this.clearResumeState();
  };

  private startHeartbeat = () => {
    this.stopHeartbeat();
    this.heartbeatAck = true;

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
        this.heartbeat = setInterval(heartbeatFn, this.heartbeatInterval!);
        heartbeatFn();
      },
      Math.floor(Math.random() * this.heartbeatInterval!)
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
      `[Heartbeat ACK Timeout] should reconnect in ${(RECONNECT_TIMEOUT / 1000).toFixed(2)} seconds`
    );

    this.reconnectTimeout = RECONNECT_TIMEOUT;
    this.markGatewayUnavailable();
    this.teardownSocket();
    this.startReconnect();
  };

  private sendHeartbeat = () => {
    const payload = {
      op: GatewayOpcodes.Heartbeat,
      d: this.sequence
    };
    this.logger.debug("Sending heartbeat");
    this.send(payload);
  };

  private cleanup = () => {
    this.logger.debug("Cleaning up");
    this.stopHeartbeat();
    this.socket = null;
    this.readyState = GatewayStatus.CLOSED;
  };

  private handleHeartbeatAck = () => {
    this.logger.debug("Received heartbeat ack");
    this.heartbeatAck = true;
    const probe = this.foregroundProbeResolve;
    if (probe) {
      this.clearForegroundProbe();
      probe(true);
    }
  };

  private handleDispatch = (data: any) => {
    const { d, t, s } = data;
    this.logger.debug(`[Gateway] -> ${t}`);
    if (typeof s === "number") {
      this.sequence = s;
      this.persistResumeState();
    }

    const handler = this.dispatchHandlers.get(t);
    if (!handler) {
      this.logger.debug(`No handler for dispatch event ${t}`);
      return;
    }

    const parsedData = normalizeJSON(d);

    handler(parsedData);
  };

  private onResume = (payload?: {
    calls?: APICall[];
    voiceStates?: APIVoiceState[];
  }) => {
    this.logger.debug("[Resume] Session");

    if (!this.app.account) {
      this.logger.warn(
        "[Resume] No local session data; falling back to Identify"
      );
      this.sessionId = null;
      this.sequence = 0;
      this.clearResumeState();
      this.handleIdentify();
      return;
    }

    if (payload?.calls) {
      this.app.calls.hydrate(payload.calls);
    }

    if (Array.isArray(payload?.voiceStates)) {
      this.app.voiceStates.replace(payload.voiceStates);
    }

    this.resubscribeUsers();
    this.resubscribeLazyChannels();
    this.app.setGatewayReady(true);
    this.startPresenceLoop();
    this.app.voice.onGatewayReconnected();
  };

  // NOTE: Dispatcher Handlers start here
  private onReady = async (payload: GatewayReadyPayload) => {
    this.logger.info(
      `[Ready] took ${Date.now() - (this.identifyStartTime ?? 0)}ms`
    );

    const {
      sessionId,
      user,
      themes,
      spaces,
      channels,
      relationships,
      settings,
      expressions,
      readStates,
      spaceNotificationSettings,
      mergedPresences,
      profile,
      presenceSchedule,
      customStatusSchedule,
      calls,
      voiceStates,
      users,
      minecraftLink
    } = payload;

    this.sessionId = sessionId;
    this.persistResumeState();

    this.app.setUser(user, settings);
    this.app.users.add(user);
    if (users?.length) this.app.users.addAll(users);
    this.app.themes.addAll(themes);
    this.app.spaces.addAll(spaces);
    this.app.channels.addAll(channels);
    this.app.relationships.addAll(relationships);
    this.app.readStates.addAll(readStates);
    if (spaceNotificationSettings?.length) {
      this.app.spaceNotifications.addAll(spaceNotificationSettings);
    }
    this.app.expressions.addAll(expressions);
    this.app.calls.hydrate(calls);
    if (Array.isArray(voiceStates)) {
      this.app.voiceStates.replace(voiceStates);
    }
    this.app.queryClient.setQueryData(
      ["me", "bridges", "link"],
      minecraftLink ?? null
    );

    if (profile) {
      this.app.profiles.add(profile);
    }

    if (mergedPresences) {
      for (const [userId, presence] of Object.entries(mergedPresences)) {
        this.app.presence.upsert(userId, presence);
      }
    }

    this.app.presence.setScheduledStatus(presenceSchedule ?? null);
    this.app.customStatus.setScheduledCustomStatus(
      customStatusSchedule ?? null
    );
    this.app.presence.rearmScheduledStatusTimer();
    this.app.customStatus.rearmScheduledCustomStatusTimer();

    this.reconnectTimeout = 0;
    this.clearReconnect();
    this.resubscribeUsers();
    this.app.setGatewayReady(true);
    this.app.startBadgeWatch();

    if (isElectron) {
      void ensureRemoteGameCatalog(() =>
        this.app.rest.get("/games/catalog")
      ).then(() => {
        this.refreshPresenceActivities();
      });
    } else {
      this.refreshPresenceActivities();
    }

    this.startPresenceLoop();
    this.app.voice.onGatewayReconnected();
  };

  private onCallCreate = (payload: APICall) => {
    this.app.calls.onCallCreate(payload);
    const channelId = String(payload.channelId);
    if (!this.app.channels.get(channelId)) {
      void this.resolveChannel(channelId);
    }
  };

  private onCallUpdate = (payload: APICall) => {
    this.app.calls.onCallUpdate(payload);
  };

  private onCallDelete = (payload: APICall & { reason?: string }) => {
    this.app.calls.onCallDelete(payload);
  };

  // Presence
  private trackableActivityFingerprint(
    presence?: { activities?: PresenceActivity[] } | null
  ) {
    return (presence?.activities ?? [])
      .filter((a) => a.type === "playing" || a.type === "listening")
      .map((a) => `${a.type}|${a.applicationId ?? ""}|${a.name}`)
      .sort()
      .join("\0");
  }

  private scheduleRecentActivitiesRefresh(userId: string) {
    window.setTimeout(() => {
      void this.app.queryClient.invalidateQueries({
        queryKey: ["user-recent-activities", String(userId)]
      });
    }, 800);
  }

  private onPresenceUpdate = (payload: any) => {
    if (payload?.userId && payload?.presence) {
      const prevFingerprint = this.trackableActivityFingerprint(
        this.app.presence.get(payload.userId)
      );
      this.app.presence.upsert(payload.userId, payload.presence);

      const selfId = this.app.account?.id;
      if (selfId && String(payload.userId) === String(selfId)) {
        const custom =
          payload.presence.activities?.find(
            (a: PresenceActivity) => a.type === "custom"
          ) ?? null;
        this.app.customStatus.syncFromPresenceActivity(custom);
      }

      const nextFingerprint = this.trackableActivityFingerprint(
        payload.presence
      );
      if (prevFingerprint !== nextFingerprint) {
        this.scheduleRecentActivitiesRefresh(payload.userId);
      }
      return;
    }

    const list = payload?.presences;
    if (Array.isArray(list)) {
      for (const item of list) {
        if (!item?.userId || !item?.presence) continue;
        const prevFingerprint = this.trackableActivityFingerprint(
          this.app.presence.get(item.userId)
        );
        this.app.presence.upsert(item.userId, item.presence);
        const nextFingerprint = this.trackableActivityFingerprint(
          item.presence
        );
        if (prevFingerprint !== nextFingerprint) {
          this.scheduleRecentActivitiesRefresh(item.userId);
        }
      }
      return;
    }

    this.logger.debug("[Presence] unknown payload shape", payload);
  };

  private onPresenceScheduleUpdate = (payload: any) => {
    const userId = payload?.userId;
    const schedule: PresenceSchedule | null = payload?.schedule ?? null;

    const selfId = this.app.account?.id;
    if (!selfId || !userId) return;

    if (String(userId) === String(selfId)) {
      this.app.presence.setScheduledStatus(schedule);
    }
  };

  private onCustomStatusScheduleUpdate = (payload: any) => {
    const userId = payload?.userId;
    const schedule: CustomStatusSchedule | null = payload?.schedule ?? null;

    const selfId = this.app.account?.id;
    if (!selfId || !userId) return;

    if (String(userId) !== String(selfId)) return;

    this.app.customStatus.setScheduledCustomStatus(schedule);
    this.lastPresenceHash = null;

    if (!schedule) this.pushCustomStatusPresenceUpdate();
  };

  private startPresenceLoop() {
    if (this.presenceLoopInterval) return;

    const intervalMs = isElectron ? 5_000 : 15_000;

    const tick = async () => {
      if (!this.socket || this.readyState !== GatewayStatus.OPEN) return;
      if (!this.app.account?.id) return;

      const shareActivity = this.app.settings?.shareActivity !== false;
      const previousActivities =
        this.app.presence.get(this.app.account.id)?.activities ?? [];

      if (isElectron) {
        const [baseDraft, rpcActivities, spotifyActivity] = await Promise.all([
          buildDesktopPresenceFromProcesses(),
          loadRpcActivities(),
          shareActivity
            ? loadSpotifyActivity(this.app.rest)
            : Promise.resolve(null)
        ]);

        const mergedDraft: PresenceUpdateDraft = {
          ...baseDraft,
          device: "desktop",
          activities: mergeActivities({
            processActivities: shareActivity
              ? (baseDraft.activities ?? [])
              : [],
            rpcActivities: shareActivity ? rpcActivities : [],
            spotifyActivity: shareActivity ? spotifyActivity : null,
            customActivity: this.app.customStatus.activity,
            previousActivities: shareActivity ? previousActivities : []
          }),
          status: this.getEffectiveStatus()
        };

        const draftHash = stableStringify(mergedDraft);
        if (this.lastPresenceHash === draftHash) return;
        this.lastPresenceHash = draftHash;

        this.sendPresenceUpdate(mergedDraft);
        return;
      }

      const spotifyActivity = shareActivity
        ? await loadSpotifyActivity(this.app.rest)
        : null;

      const webDraft: PresenceUpdateDraft = {
        status: this.getEffectiveStatus(),
        device: "web",
        activities: mergeActivities({
          processActivities: [],
          rpcActivities: [],
          spotifyActivity,
          customActivity: this.app.customStatus.activity,
          previousActivities: shareActivity ? previousActivities : []
        })
      };

      const draftHash = stableStringify(webDraft);
      if (this.lastPresenceHash === draftHash) return;
      this.lastPresenceHash = draftHash;

      this.sendPresenceUpdate(webDraft);
    };

    tick();
    this.presenceLoopInterval = window.setInterval(tick, intervalMs);

    if (
      isElectron &&
      window.api?.presence?.onRpcUpdated &&
      !this.rpcUpdatedUnsub
    ) {
      this.rpcUpdatedUnsub = window.api.presence.onRpcUpdated(() => {
        this.refreshPresenceActivities();
      });
    }
  }

  private stopPresenceLoop() {
    if (this.presenceLoopInterval) {
      window.clearInterval(this.presenceLoopInterval);
      this.presenceLoopInterval = null;
    }
    if (this.rpcUpdatedUnsub) {
      this.rpcUpdatedUnsub();
      this.rpcUpdatedUnsub = null;
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

  private onSpaceDelete = (
    payload: Pick<APISpace, "id"> & { reason?: string }
  ) => {
    const space = this.app.spaces.get(payload.id);
    if (!space) return;

    if (this.app.voice.currentSpaceId === space.id) {
      void this.app.voice.leave();
    }

    this.app.spaces.remove(space.id);
    this.lazyRequestChannels.delete(space.id);
    this.app.spaces.setPreferredActive();
    this.app.channels.setPreferredActive();

    if (payload.reason === "banned" || payload.reason === "kicked")
      toast.warn(
        payload.reason === "banned"
          ? i18n.t("moderation.youWereBanned", {
              ns: "space",
              name: space.name
            })
          : i18n.t("moderation.youWereKicked", {
              ns: "space",
              name: space.name
            })
      );
  };

  private onSpaceUpdate = (payload: APISpace) => {
    const space = this.app.spaces.get(payload.id);
    if (space) {
      space.update(payload);
      return;
    }

    this.app.spaces.add(payload);
  };

  private isCallShapedPayload(payload: unknown): boolean {
    return (
      !!payload &&
      typeof payload === "object" &&
      ("initiatorId" in payload ||
        "ringing" in payload ||
        "accepted" in payload ||
        "soloTimeoutMs" in payload)
    );
  }

  private onChannelCreate = (payload: APIChannel) => {
    if (this.isCallShapedPayload(payload)) return;

    if (!payload.spaceId) {
      if (
        payload.type !== ChannelType.DM &&
        payload.type !== ChannelType.GroupDM
      ) {
        return;
      }
      this.app.channels.add(payload);
      return;
    }
    const space = this.app.spaces.get(payload.spaceId);
    if (!space) return;

    const channel = space.addChannel(payload);
    if (!channel) {
      this.logger.error("Failed to add channel to space");
      return;
    }
  };

  private onChannelUpdate = (payload: APIChannel) => {
    if (this.isCallShapedPayload(payload)) return;

    const isDM =
      payload.type === ChannelType.DM || payload.type === ChannelType.GroupDM;

    if (isDM) {
      const existing = this.app.channels.get(payload.id);
      if (existing) existing.update(payload);
      else this.app.channels.add(payload);

      return;
    }

    if (payload.spaceId == null) {
      const existing = this.app.channels.get(payload.id);
      if (
        existing &&
        (existing.type === ChannelType.DM ||
          existing.type === ChannelType.GroupDM)
      ) {
        existing.update(payload);
      }
      return;
    }

    const space = this.app.spaces.get(payload.spaceId);
    if (!space) return;

    space.updateChannel(payload);
  };

  private onChannelUpdateBulk = (payload: APIChannel[]) => {
    for (const channel of payload) {
      if (this.isCallShapedPayload(channel)) continue;

      const isDM =
        channel.type === ChannelType.DM || channel.type === ChannelType.GroupDM;

      if (isDM) {
        const existing = this.app.channels.get(channel.id);
        if (existing) existing.update(channel);
        else this.app.channels.add(channel);
        continue;
      }

      if (channel.spaceId == null) {
        const existing = this.app.channels.get(channel.id);
        if (
          existing &&
          (existing.type === ChannelType.DM ||
            existing.type === ChannelType.GroupDM)
        ) {
          existing.update(channel);
        }
        continue;
      }

      const space = this.app.spaces.get(channel.spaceId);
      if (!space) continue;
      space.updateChannel(channel);
    }
  };

  private onChannelDelete = (payload: Pick<APIChannel, "id" | "spaceId">) => {
    if (this.isCallShapedPayload(payload)) {
      return;
    }

    if (this.app.voice.currentChannelId === payload.id) {
      void this.app.voice.leave();
    }

    if (!payload.spaceId) {
      const existing = this.app.channels.get(payload.id);
      if (
        existing &&
        (existing.type === ChannelType.DM ||
          existing.type === ChannelType.GroupDM)
      ) {
        this.app.channels.remove(payload.id);
      }
      return;
    }

    const space = this.app.spaces.get(payload.spaceId);
    if (!space) return;

    space.removeChannel(payload.id);
    this.app.channels.setPreferredActive();
  };

  private onChannelRecipientAdd = (payload: {
    channelId: Snowflake;
    userId: Snowflake;
    user: APIUser | null;
  }) => {
    const channel = this.app.channels.get(payload.channelId);
    if (!channel) return;

    const user = payload.user
      ? this.app.users.add(payload.user)
      : this.app.users.get(payload.userId);

    if (!user) return;

    channel.addRecipient(user);
  };

  private onChannelRecipientRemove = (payload: {
    channelId: Snowflake;
    userId: Snowflake;
  }) => {
    const channel = this.app.channels.get(payload.channelId);
    if (!channel) return;

    channel.removeRecipient(payload.userId);

    if (payload.userId === this.app.account?.id) {
      this.app.channels.remove(payload.channelId);
      if (this.app.channels.activeId === payload.channelId)
        this.app.channels.setPreferredActive();
    }
  };

  private onChannelDeleteBulk = (
    payload: Pick<APIChannel, "id" | "spaceId">[]
  ) => {
    if (
      payload.some((channel) => channel.id === this.app.voice.currentChannelId)
    ) {
      void this.app.voice.leave();
    }

    for (const channel of payload) {
      if (!channel.spaceId) continue;
      const space = this.app.spaces.get(channel.spaceId);
      if (!space) continue;
      space.removeChannel(channel.id);
    }

    this.app.channels.setPreferredActive();
  };

  private onMessageAck = (payload: {
    channelId: Snowflake;
    lastMessageId: Snowflake;
    lastAckedId?: Snowflake;
    mentionCount: number;
  }) => {
    const readState = this.app.readStates.get(payload.channelId);
    if (readState) {
      readState.update({
        lastMessageId: payload.lastMessageId,
        lastAckedId: payload.lastAckedId ?? payload.lastMessageId,
        mentionCount: payload.mentionCount ?? 0
      });
    } else {
      this.app.readStates.updateLocal(payload.channelId, payload.lastMessageId);
    }
  };

  private onReadStateUpdate = (payload: APIReadState) => {
    const existing = this.app.readStates.get(payload.id);
    if (existing) existing.mergeFromServer(payload);
    else this.app.readStates.addAll([payload]);
  };

  private onSpaceNotificationSettingsUpdate = (
    payload: APISpaceNotificationSettings
  ) => {
    this.app.spaceNotifications.upsert(payload);
  };

  private onMessageAckBulk = (
    payload: Array<{
      channelId: Snowflake;
      lastMessageId: Snowflake;
      lastAckedId?: Snowflake;
      mentionCount: number;
    } | null>
  ) => {
    for (const state of payload) {
      if (!state) continue;
      const readState = this.app.readStates.get(state.channelId);
      if (readState) {
        readState.update({
          lastMessageId: state.lastMessageId,
          lastAckedId: state.lastAckedId ?? state.lastMessageId,
          mentionCount: state.mentionCount ?? 0
        });
      } else {
        this.app.readStates.updateLocal(state.channelId, state.lastMessageId);
      }
    }
  };

  private onTypingStart = (payload: {
    channelId: Snowflake;
    userId: Snowflake;
  }) => {
    const channel = this.app.channels.get(payload.channelId);
    if (!channel) return;

    const user = this.app.users.get(payload.userId);
    if (!user) return;

    this.app.typing.startedTyping(payload.channelId, payload.userId);
  };

  private onMessageCreate = async (payload: APIMessage) => {
    let channel = this.app.channels.get(payload.channelId);

    if (!channel) {
      channel = (await this.resolveChannel(payload.channelId)) ?? undefined;
      if (!channel) return;
    }

    const message = channel.messages.add(payload);
    channel.updateLastMessage(message);
    this.app.queue.handleIncomingMessage(payload);
    this.app.typing.stoppedTyping(payload.channelId, payload.authorId);

    // Your own message (echoed back, or sent from another session) is
    // implicitly read by you - advance your read cursor instead of
    // leaving the channel looking unread to yourself.
    if (payload.authorId === this.app.account?.id) {
      void this.app.readStates.ack(payload.channelId, payload.id);
      return;
    }

    if (this.app.channels.activeId === payload.channelId) {
      void this.app.readStates.ack(payload.channelId, payload.id);
      return;
    }

    const isDM =
      channel.type === ChannelType.DM || channel.type === ChannelType.GroupDM;

    const isMentioned = payload.mentions?.some((m) => {
      if (m.type === "user") return m.id === this.app.account?.id;
      if (m.type === "role") {
        const space = this.app.spaces.get(channel.spaceId ?? "");
        const member = space?.members.get(this.app.account!.id);
        return member?.roles?.has(m.id) ?? false;
      }
      return m.type === "everyone" || m.type === "here";
    });

    const myStatus = this.app.account
      ? (this.app.presence.get(this.app.account.id)?.status ?? "online")
      : "online";
    const isDnd = myStatus === "dnd";

    // Every DM/GroupDM message is notification-worthy, same as an explicit mention in a space
    if (isDM || isMentioned) {
      const readState = this.app.readStates.get(payload.channelId);
      if (readState) {
        readState.incrementMentionCount();
        if (isMentioned) channel.setLastMentionMessage(message);
        if (!isDnd) {
          this.app.sounds.play("message");
          toast(
            (toastProps) => <MessageToast {...toastProps} data={message} />,
            {
              closeOnClick: true,
              style: {
                maxWidth: "520px",
                width: "100%",
                height: "auto"
              },
              position: "top-right"
            }
          );
        }
      }
    }
  };

  private onMessageUpdate = (payload: APIMessage) => {
    const channel = this.app.channels.get(payload.channelId);
    if (!channel) return;

    channel.messages.update(payload);
  };

  private onMessageDeleteBulk = (
    payload: Pick<APIMessage, "id" | "channelId">[]
  ) => {
    const sortMessagesByChannel = payload.reduce(
      (acc, message) => {
        if (!acc[message.channelId]) acc[message.channelId] = [];
        acc[message.channelId].push(message.id);
        return acc;
      },
      {} as Record<string, string[]>
    );

    for (const channelId in sortMessagesByChannel) {
      const channel = this.app.channels.get(channelId);
      if (!channel) continue;

      const messageIds = sortMessagesByChannel[channelId];
      channel.messages.removeBulk(messageIds);
    }
  };

  private onMessageDelete = (payload: Pick<APIMessage, "id" | "channelId">) => {
    const channel = this.app.channels.get(payload.channelId);
    if (!channel) return;

    channel.messages.remove(payload.id);
  };

  private onMessageReactionAdd = (payload: APIMessageReactionEvent) => {
    if (payload.userId === this.app.account?.id) return;

    const channel = this.app.channels.get(payload.channelId);
    channel?.messages.get(payload.messageId)?.handleReactionAdd(payload);
  };

  private onMessageReactionRemove = (
    payload: APIMessageReactionRemoveEvent
  ) => {
    if (payload.userId === this.app.account?.id) return;

    const channel = this.app.channels.get(payload.channelId);
    channel?.messages.get(payload.messageId)?.handleReactionRemove(payload);
  };

  private onMessageReactionRemoveAll = (
    payload: APIMessageReactionRemoveAllEvent
  ) => {
    const channel = this.app.channels.get(payload.channelId);
    channel?.messages.get(payload.messageId)?.handleReactionRemoveAll(payload);
  };

  private onMessageReactionRemoveEmoji = (
    payload: APIMessageReactionRemoveEmojiEvent
  ) => {
    const channel = this.app.channels.get(payload.channelId);
    channel?.messages
      .get(payload.messageId)
      ?.handleReactionRemoveEmoji(payload);
  };

  private onUserUpdate = (payload: APIUser | APIPrivateUser) => {
    this.app.users.update(payload as APIUser);

    if (payload.id === this.app.account?.id) {
      const flags = BitField.fromString(userFlags, payload.flags.toString());

      if (flags.has("Disabled") || flags.has("Deleted")) {
        void this.app.logout();
        return;
      }

      this.app.setUser(payload as APIPrivateUser);
    }
  };

  private onUserSettingsUpdate = (payload: APIUserSettings) => {
    this.app.settings?.update(payload);
  };

  private onUserProfileUpdate = (payload: APIUserProfile) => {
    this.app.profiles.update(payload);
    void this.app.queryClient.invalidateQueries({
      queryKey: ["profile", payload.userId]
    });
    void this.app.queryClient.invalidateQueries({
      queryKey: ["profile-popout", payload.userId]
    });
    void this.app.queryClient.invalidateQueries({
      queryKey: ["profile", payload.userId, "edit"]
    });
  };

  private onInviteCreate = (payload: APIInvite) => {
    // NOTE: since we dont have friend invites yet we just return early
    if (!payload.spaceId || !payload.channelId) return;

    const space = this.app.spaces.get(payload.spaceId);
    if (!space) return;

    space.addInvite(payload);
  };

  private onInviteUpdate = (payload: APIInvite) => {
    // NOTE: since we dont have friend invites yet we just return early
    if (!payload.spaceId || !payload.channelId) return;

    const space = this.app.spaces.get(payload.spaceId);
    if (!space) return;

    space.updateInvite(payload);
  };

  private onInviteDelete = (payload: Pick<APIInvite, "spaceId" | "code">) => {
    // NOTE: since we dont have friend invites yet we just return early
    if (!payload.spaceId) return;
    const space = this.app.spaces.get(payload.spaceId);
    if (!space) return;

    space.removeInvite(payload.code);
  };

  private onSpaceMemberAdd = (payload: APISpaceMember) => {
    const space = this.app.spaces.get(payload.spaceId);
    if (!space) return;

    space.members.add(payload);
  };

  private onSpaceMemberRemove = (
    payload: Pick<APISpaceMember, "spaceId" | "userId"> & {
      reason?: string | null;
    }
  ) => {
    const space = this.app.spaces.get(payload.spaceId);
    if (!space) return;

    space.members.remove(payload.userId);
  };

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
    space.members.all.forEach((member) => member.invalidateChannelPermCache());
  };

  private onRoleUpdate = (role: APIRole) => {
    const space = this.app.spaces.get(role.spaceId);
    if (!space) return;

    space.roles.update(role);
    space.members.all.forEach((member) => member.invalidateChannelPermCache());
  };

  private onRoleDelete = (role: Pick<APIRole, "id" | "spaceId">) => {
    const space = this.app.spaces.get(role.spaceId);
    if (!space) return;

    space.roles.remove(role.id);
    space.members.all.forEach((member) => member.invalidateChannelPermCache());
  };

  private onMemberRoleAdd = (
    payload: Pick<APIMemberRole, "spaceId" | "userId" | "roleId">
  ) => {
    const space = this.app.spaces.get(payload.spaceId);
    if (!space) return;

    const member = space.members.get(payload.userId);
    if (!member) return;

    member.roles.add(payload.roleId);
    member.invalidateChannelPermCache();
  };

  private onMemberRoleRemove = (
    payload: Pick<APIMemberRole, "spaceId" | "userId" | "roleId">
  ) => {
    const space = this.app.spaces.get(payload.spaceId);
    if (!space) return;

    const member = space.members.get(payload.userId);
    if (!member) return;

    member.roles.delete(payload.roleId);
    member.invalidateChannelPermCache();
  };

  private onExpressionCreate = (payload: APIExpression) => {
    if (payload.spaceId) {
      const space = this.app.spaces.get(payload.spaceId);
      if (!space) return;

      space.addExpression(payload);

      return;
    }

    this.app.expressions.add(payload);
  };

  private onExpressionDelete = (
    payload: Pick<APIExpression, "id" | "spaceId">
  ) => {
    if (payload.spaceId) {
      const space = this.app.spaces.get(payload.spaceId);
      if (!space) return;

      space.removeExpression(payload.id);

      return;
    }

    this.app.expressions.remove(payload.id);
  };

  private onRelationshipCreate = (payload: APIRelationship) => {
    this.app.relationships.add(payload);
  };

  private onRelationshipUpdate = (payload: APIRelationship) => {
    this.app.relationships.update(payload);
  };

  private onRelationshipDelete = (
    payload: Pick<APIRelationship, "userId" | "otherUserId">
  ) => {
    this.app.relationships.remove(payload.userId, payload.otherUserId);
  };

  private onMinecraftLinkUpdate = (
    payload: {
      minecraftUuid: string;
      minecraftName: string;
      discordId: string | null;
      createdAt: string | Date;
    } | null
  ) => {
    this.app.queryClient.setQueryData(["me", "bridges", "link"], payload);
  };

  private onBridgeMemberAdd = (payload: {
    bridgeId: string;
    name?: string;
    role?: "owner" | "member";
  }) => {
    void this.app.queryClient.invalidateQueries({
      queryKey: ["me", "bridges"]
    });
    if (payload.name) {
      toast.info(
        i18n.t("minecraftBridge.joinedToast", {
          ns: "settings",
          name: payload.name
        })
      );
    }
  };

  private onBridgeMemberRemove = (payload: { bridgeId: string }) => {
    this.app.queryClient.setQueryData<Array<{ id: string }>>(
      ["me", "bridges"],
      (prev) => (prev ?? []).filter((b) => b.id !== payload.bridgeId)
    );
    this.app.queryClient.removeQueries({
      queryKey: ["me", "bridges", payload.bridgeId]
    });
    this.app.bridgeChat.clear(payload.bridgeId);
    void this.app.queryClient.invalidateQueries({
      queryKey: ["me", "bridges"]
    });
  };

  private markBridgeHubConnected = (bridgeId: string, connected: boolean) => {
    this.app.queryClient.setQueryData(
      ["me", "bridges", bridgeId],
      (old: { hubConnected?: boolean } | undefined) =>
        old ? { ...old, hubConnected: connected } : old
    );
    this.app.queryClient.setQueryData(
      ["me", "bridges"],
      (
        old:
          | { id: string; hubConnected?: boolean; onlineCount?: number }[]
          | undefined
      ) =>
        old?.map((b) =>
          b.id === bridgeId ? { ...b, hubConnected: connected } : b
        )
    );
  };

  private onBridgeChat = (payload: {
    id: string;
    bridgeId: string;
    serverId: string;
    source: "minecraft" | "discord" | "app";
    name: string;
    content: string;
    uuid?: string;
    userId?: string;
    avatarUrl?: string;
    at: string;
  }) => {
    this.markBridgeHubConnected(payload.bridgeId, true);
    this.app.bridgeChat.add({ ...payload, kind: "chat" });
  };

  private onBridgeJoin = (payload: {
    id: string;
    bridgeId: string;
    serverId: string;
    source: "minecraft" | "discord" | "app";
    name: string;
    uuid?: string;
    userId?: string;
    at: string;
  }) => {
    this.markBridgeHubConnected(payload.bridgeId, true);
    this.app.bridgeChat.add({ ...payload, kind: "join" });
  };

  private onBridgeLeave = (payload: {
    id: string;
    bridgeId: string;
    serverId: string;
    source: "minecraft" | "discord" | "app";
    name: string;
    uuid?: string;
    userId?: string;
    at: string;
  }) => {
    this.markBridgeHubConnected(payload.bridgeId, true);
    this.app.bridgeChat.add({ ...payload, kind: "leave" });
  };

  private onBridgeVoiceJoin = (payload: {
    id: string;
    bridgeId: string;
    serverId: string;
    source: "minecraft" | "discord" | "app";
    name: string;
    uuid?: string;
    userId?: string;
    channelName?: string;
    at: string;
  }) => {
    this.markBridgeHubConnected(payload.bridgeId, true);
    this.app.bridgeChat.add({
      ...payload,
      kind: "voice_join",
      content: payload.channelName
    });
  };

  private onBridgeVoiceLeave = (payload: {
    id: string;
    bridgeId: string;
    serverId: string;
    source: "minecraft" | "discord" | "app";
    name: string;
    uuid?: string;
    userId?: string;
    channelName?: string;
    at: string;
  }) => {
    this.markBridgeHubConnected(payload.bridgeId, true);
    this.app.bridgeChat.add({
      ...payload,
      kind: "voice_leave",
      content: payload.channelName
    });
  };

  private onBridgePresence = (payload: {
    bridgeId: string;
    players: { uuid: string; name: string; serverId: string }[];
  }) => {
    this.app.bridgeChat.setPlayers(payload.bridgeId, payload.players);
    this.app.queryClient.setQueryData(
      ["me", "bridges"],
      (
        old:
          | { id: string; hubConnected?: boolean; onlineCount?: number }[]
          | undefined
      ) =>
        old?.map((b) =>
          b.id === payload.bridgeId
            ? { ...b, onlineCount: payload.players.length }
            : b
        )
    );
  };

  private onSpaceBanAdd = (payload: APISpaceBan) => {
    const space = this.app.spaces.get(payload.spaceId);
    if (!space) return;

    space.addBan(payload);
  };

  private onSpaceBanRemove = (
    payload: Pick<APISpaceBan, "spaceId" | "userId">
  ) => {
    const space = this.app.spaces.get(payload.spaceId);
    if (!space) return;

    space.removeBan(payload.userId);
  };

  private onPostCreate = (payload: APIPost) => {
    this.app.posts.add(payload);
  };

  private onPostUpdate = (payload: APIPost) => {
    this.app.posts.update(payload);
  };

  private onPostDelete = (payload: Pick<APIPost, "id">) => {
    this.app.posts.remove(payload.id);
  };

  private onPostCommentCreate = (payload: APIPostComment) => {
    const post = this.app.posts.get(payload.postId);
    if (!post) return;

    const alreadyHave = post.comments.has(payload.id);
    post.comments.add(payload);
    if (!alreadyHave) post.bumpCommentCount(1);
  };

  private onPostCommentUpdate = (payload: APIPostComment) => {
    const post = this.app.posts.get(payload.postId);
    if (!post) return;

    post.comments.update(payload);
  };

  private onPostCommentDelete = (
    payload: Pick<APIPostComment, "id" | "postId">
  ) => {
    const post = this.app.posts.get(payload.postId);
    if (!post) return;

    if (post.comments.has(payload.id)) post.bumpCommentCount(-1);
    post.comments.remove(payload.id);
  };

  private onPostLikeAdd = (payload: { postId: string; userId: string }) => {
    if (payload.userId === this.app.account?.id) return;

    const post = this.app.posts.get(payload.postId);
    if (!post) return;

    post.bumpLikeCount(1);
  };

  private onPostLikeRemove = (payload: { postId: string; userId: string }) => {
    if (payload.userId === this.app.account?.id) return;

    const post = this.app.posts.get(payload.postId);
    if (!post) return;

    post.bumpLikeCount(-1);
  };

  private onPostShareAdd = (payload: { postId: string; userId: string }) => {
    if (payload.userId === this.app.account?.id) return;

    const post = this.app.posts.get(payload.postId);
    if (!post) return;

    post.bumpShareCount(1);
  };

  private onPostShareRemove = (payload: { postId: string; userId: string }) => {
    if (payload.userId === this.app.account?.id) return;

    const post = this.app.posts.get(payload.postId);
    if (!post) return;

    post.bumpShareCount(-1);
  };
}
