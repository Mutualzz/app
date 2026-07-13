import fs from "fs";
import net from "net";

export type RpcActivity = {
  type: "playing" | "listening";
  name: string;
  applicationId?: string;
  details?: string;
  state?: string;
  url?: string;
  timestamps?: { start?: number; end?: number };
  assets?: {
    largeImageUrl?: string;
    largeText?: string;
    smallImageUrl?: string;
    smallText?: string;
  };
};

const OPCODE_HANDSHAKE = 0;
const OPCODE_FRAME = 1;
const OPCODE_CLOSE = 2;
const OPCODE_PING = 3;
const OPCODE_PONG = 4;

const MAX_SLOTS = 10;
const MAX_STR = 128;
const MAX_PAYLOAD = 64 * 1024;

type ConnectionState = {
  id: string;
  socket: net.Socket;
  buffer: Buffer;
  handshaked: boolean;
  clientId: string | null;
  pid: number | null;
  activity: RpcActivity | null;
};

let server: net.Server | null = null;
let boundPath: string | null = null;
const connections = new Map<string, ConnectionState>();
let nextConnId = 1;
let onUpdated: (() => void) | null = null;

export function setRpcUpdatedListener(listener: (() => void) | null) {
  onUpdated = listener;
}

function clampStr(value: unknown, max = MAX_STR): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  if (!text) return undefined;
  return text.length > max ? text.slice(0, max) : text;
}

function pipePath(slot: number) {
  if (process.platform === "win32") {
    return `\\\\.\\pipe\\mutualzz-ipc-${slot}`;
  }
  return `/tmp/mutualzz-ipc-${slot}`;
}

function encodeFrame(opcode: number, payload: object | string): Buffer {
  const json = typeof payload === "string" ? payload : JSON.stringify(payload);
  const body = Buffer.from(json, "utf8");
  const header = Buffer.alloc(8);
  header.writeUInt32LE(opcode, 0);
  header.writeUInt32LE(body.length, 4);
  return Buffer.concat([header, body]);
}

function writeFrame(socket: net.Socket, opcode: number, payload: object) {
  if (socket.destroyed) return;
  try {
    socket.write(encodeFrame(opcode, payload));
  } catch (err) {
    console.error("Failed to write RPC frame:", err);
  }
}

function notifyRpcUpdated() {
  try {
    onUpdated?.();
  } catch (err) {
    console.error("Failed to notify RPC update:", err);
  }
}

function mapActivityType(raw: unknown): "playing" | "listening" {
  if (raw === "listening") return "listening";
  return "playing";
}

function sanitizeActivity(
  raw: unknown,
  clientId: string | null
): RpcActivity | null {
  if (!raw || typeof raw !== "object") return null;

  const activity = raw as Record<string, unknown>;
  const timestampsRaw =
    activity.timestamps && typeof activity.timestamps === "object"
      ? (activity.timestamps as Record<string, unknown>)
      : null;

  const applicationId =
    clampStr(activity.applicationId ?? clientId, 64) ?? undefined;
  const name = clampStr(activity.name, MAX_STR);
  if (!name && !applicationId) return null;

  const details = clampStr(activity.details);
  const state = clampStr(activity.state);

  let timestamps: { start?: number; end?: number } | undefined;
  if (timestampsRaw) {
    const start =
      typeof timestampsRaw.start === "number" ? timestampsRaw.start : undefined;
    const end =
      typeof timestampsRaw.end === "number" ? timestampsRaw.end : undefined;
    if (start !== undefined || end !== undefined) {
      timestamps = {
        ...(start !== undefined ? { start } : {}),
        ...(end !== undefined ? { end } : {})
      };
    }
  }

  const assetsRaw =
    activity.assets && typeof activity.assets === "object"
      ? (activity.assets as Record<string, unknown>)
      : null;
  let assets:
    | {
        largeImageUrl?: string;
        largeText?: string;
        smallImageUrl?: string;
        smallText?: string;
      }
    | undefined;
  if (assetsRaw) {
    const largeImageUrl = clampStr(assetsRaw.largeImageUrl, 512);
    const smallImageUrl = clampStr(assetsRaw.smallImageUrl, 512);
    const largeText = clampStr(assetsRaw.largeText);
    const smallText = clampStr(assetsRaw.smallText);
    if (largeImageUrl || smallImageUrl || largeText || smallText) {
      assets = {
        ...(largeImageUrl ? { largeImageUrl } : {}),
        ...(smallImageUrl ? { smallImageUrl } : {}),
        ...(largeText ? { largeText } : {}),
        ...(smallText ? { smallText } : {})
      };
    }
  }

  const url = clampStr(activity.url, 512);

  return {
    type: mapActivityType(activity.type),
    name: name ?? "Unknown Game",
    ...(applicationId ? { applicationId } : {}),
    ...(details ? { details } : {}),
    ...(state ? { state } : {}),
    ...(url ? { url } : {}),
    ...(timestamps ? { timestamps } : {}),
    ...(assets ? { assets } : {})
  };
}

function handleCommand(conn: ConnectionState, message: unknown) {
  if (!message || typeof message !== "object") return;

  const frame = message as Record<string, unknown>;
  const cmd = typeof frame.cmd === "string" ? frame.cmd : "";
  const nonce = typeof frame.nonce === "string" ? frame.nonce : undefined;
  const args =
    frame.args && typeof frame.args === "object"
      ? (frame.args as Record<string, unknown>)
      : {};

  if (cmd === "SET_ACTIVITY") {
    if (typeof args.pid === "number" && Number.isFinite(args.pid)) {
      conn.pid = args.pid;
    }

    conn.activity =
      args.activity == null
        ? null
        : sanitizeActivity(args.activity, conn.clientId);

    writeFrame(conn.socket, OPCODE_FRAME, {
      cmd: "SET_ACTIVITY",
      data: conn.activity,
      ...(nonce ? { nonce } : {})
    });
    notifyRpcUpdated();
    return;
  }

  writeFrame(conn.socket, OPCODE_FRAME, {
    cmd,
    data: null,
    ...(nonce ? { nonce } : {})
  });
}

function handlePayload(conn: ConnectionState, opcode: number, raw: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return;
  }

  if (opcode === OPCODE_HANDSHAKE) {
    if (conn.handshaked) return;

    const payload =
      parsed && typeof parsed === "object"
        ? (parsed as Record<string, unknown>)
        : null;
    const clientId = clampStr(payload?.clientId, 64);
    if (!clientId) {
      conn.socket.destroy();
      return;
    }

    conn.handshaked = true;
    conn.clientId = clientId;
    writeFrame(conn.socket, OPCODE_FRAME, {
      cmd: "READY"
    });
    return;
  }

  if (opcode === OPCODE_PING) {
    writeFrame(
      conn.socket,
      OPCODE_PONG,
      parsed && typeof parsed === "object" ? (parsed as object) : {}
    );
    return;
  }

  if (opcode === OPCODE_CLOSE) {
    conn.socket.end();
    return;
  }

  if (opcode === OPCODE_FRAME) {
    if (!conn.handshaked) {
      conn.socket.destroy();
      return;
    }
    handleCommand(conn, parsed);
  }
}

function consumeBuffer(conn: ConnectionState) {
  while (conn.buffer.length >= 8) {
    const opcode = conn.buffer.readUInt32LE(0);
    const length = conn.buffer.readUInt32LE(4);
    if (length > MAX_PAYLOAD) {
      conn.socket.destroy();
      return;
    }
    if (conn.buffer.length < 8 + length) return;

    const payload = conn.buffer.subarray(8, 8 + length).toString("utf8");
    conn.buffer = conn.buffer.subarray(8 + length);
    handlePayload(conn, opcode, payload);
  }
}

function attachSocket(socket: net.Socket) {
  const id = `rpc-${nextConnId++}`;
  const conn: ConnectionState = {
    id,
    socket,
    buffer: Buffer.alloc(0),
    handshaked: false,
    clientId: null,
    pid: null,
    activity: null
  };
  connections.set(id, conn);

  socket.on("data", (chunk: Buffer) => {
    conn.buffer = Buffer.concat([conn.buffer, chunk]);
    consumeBuffer(conn);
  });

  const cleanup = () => {
    const hadActivity = !!conn.activity;
    connections.delete(id);
    if (hadActivity) notifyRpcUpdated();
  };

  socket.on("close", cleanup);
  socket.on("error", cleanup);
}

function tryListen(slot: number): Promise<string> {
  const path = pipePath(slot);

  return new Promise((resolve, reject) => {
    const next = net.createServer((socket) => attachSocket(socket));
    const onError = (err: NodeJS.ErrnoException) => {
      next.close();
      reject(err);
    };

    next.once("error", onError);
    next.listen(path, () => {
      next.off("error", onError);
      server = next;
      boundPath = path;
      resolve(path);
    });
  });
}

export async function startRpc() {
  if (server) return boundPath;

  if (process.platform !== "win32") {
    for (let slot = 0; slot < MAX_SLOTS; slot++) {
      const path = pipePath(slot);
      try {
        if (fs.existsSync(path)) fs.unlinkSync(path);
      } catch {
        continue;
      }
    }
  }

  let lastError: unknown = null;
  for (let slot = 0; slot < MAX_SLOTS; slot++) {
    try {
      const path = await tryListen(slot);
      console.log(`Mutualzz RPC listening on ${path}`);
      return path;
    } catch (err) {
      lastError = err;
    }
  }

  console.error("Failed to start Mutualzz RPC:", lastError);
  return null;
}

export function stopRpc() {
  for (const conn of connections.values()) {
    try {
      conn.socket.destroy();
    } catch {
      continue;
    }
  }
  connections.clear();

  if (server) {
    try {
      server.close();
    } catch {}
    server = null;
  }

  if (boundPath && process.platform !== "win32") {
    try {
      if (fs.existsSync(boundPath)) fs.unlinkSync(boundPath);
    } catch {}
  }

  boundPath = null;
}

export function getRpcActivities(): RpcActivity[] {
  const byKey = new Map<string, RpcActivity>();

  for (const conn of connections.values()) {
    if (!conn.activity) continue;
    const key =
      conn.activity.applicationId?.toLowerCase() ||
      conn.activity.name.toLowerCase() ||
      conn.id;
    byKey.set(key, conn.activity);
  }

  return [...byKey.values()];
}

export function getRpcBoundPath() {
  return boundPath;
}
