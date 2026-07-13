import { execFile } from "child_process";
import { promisify } from "util";

export type ProcessInfo = {
  name: string;
  pid: number;
  title?: string;
  commandLine?: string;
  path?: string;
};

const execFileAsync = promisify(execFile);

const POLL_MS = 5_000;

let cache: ProcessInfo[] = [];
let pollTimer: ReturnType<typeof setInterval> | null = null;
let refreshing: Promise<void> | null = null;

function extractJsonPayload(stdout: string): string {
  const trimmed = stdout.replace(/^\uFEFF/, "").trim();
  if (!trimmed) return "";
  const arrayStart = trimmed.indexOf("[");
  const objectStart = trimmed.indexOf("{");
  if (arrayStart < 0 && objectStart < 0) return "";
  if (arrayStart < 0) return trimmed.slice(objectStart);
  if (objectStart < 0) return trimmed.slice(arrayStart);
  return trimmed.slice(Math.min(arrayStart, objectStart));
}

function parseJsonProcesses(
  stdout: string,
  opts?: { requireTitle?: boolean }
): ProcessInfo[] {
  const requireTitle = opts?.requireTitle ?? false;
  const payload = extractJsonPayload(stdout);
  if (!payload) return [];
  try {
    const parsed = JSON.parse(payload) as unknown;
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    const seen = new Map<string, ProcessInfo>();

    for (const row of rows) {
      if (!row || typeof row !== "object") continue;
      const item = row as Record<string, unknown>;
      const rawName = typeof item.name === "string" ? item.name.trim() : "";
      const name = rawName.toLowerCase().endsWith(".exe")
        ? rawName
        : rawName
          ? `${rawName}.exe`
          : "";
      if (!name) continue;

      const pid = Number(item.pid ?? 0);
      const title =
        typeof item.title === "string" ? item.title.trim() : undefined;
      const commandLine =
        typeof item.commandLine === "string"
          ? item.commandLine.trim()
          : undefined;
      const path =
        typeof item.path === "string" ? item.path.trim() : undefined;
      if (requireTitle && !title) continue;

      const key = `${name.toLowerCase()}:${Number.isFinite(pid) ? pid : 0}`;
      if (!seen.has(key)) {
        seen.set(key, {
          name,
          pid: Number.isFinite(pid) ? pid : 0,
          ...(title ? { title } : {}),
          ...(commandLine ? { commandLine } : {}),
          ...(path ? { path } : {})
        });
      }
    }

    return [...seen.values()];
  } catch {
    return [];
  }
}

function runEncodedPowerShell(script: string) {
  const encoded = Buffer.from(script, "utf16le").toString("base64");
  return execFileAsync(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-EncodedCommand", encoded],
    {
      encoding: "utf-8",
      windowsHide: true,
      maxBuffer: 20 * 1024 * 1024,
      timeout: 15_000
    }
  );
}

async function scanWindowsWindowedProcesses(): Promise<ProcessInfo[]> {
  const script = [
    "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8",
    "$OutputEncoding = [System.Text.Encoding]::UTF8",
    "$ErrorActionPreference = 'SilentlyContinue'",
    "$ProgressPreference = 'SilentlyContinue'",
    [
      "Get-Process",
      "| Where-Object { $_.MainWindowHandle -ne 0 -and -not [string]::IsNullOrWhiteSpace($_.MainWindowTitle) }",
      "| Select-Object @{n='name';e={$_.ProcessName + '.exe'}},@{n='pid';e={$_.Id}},@{n='title';e={$_.MainWindowTitle}},@{n='path';e={$_.Path}}",
      "| ConvertTo-Json -Compress"
    ].join(" ")
  ].join("; ");

  const { stdout } = await runEncodedPowerShell(script);
  return parseJsonProcesses(stdout, { requireTitle: true });
}

function pathFromCommandLine(commandLine?: string): string | undefined {
  if (!commandLine) return undefined;
  const quoted = commandLine.match(/^"([^"]+)"/);
  if (quoted?.[1]) return quoted[1];
  const bare = commandLine.match(/^([^\s]+)/);
  return bare?.[1] || undefined;
}

async function enrichWindowsProcessDetails(
  procs: ProcessInfo[]
): Promise<ProcessInfo[]> {
  const pids = [
    ...new Set(procs.map((p) => p.pid).filter((pid) => pid > 0))
  ];
  if (!pids.length) return procs;

  const filter = pids.map((pid) => `ProcessId=${pid}`).join(" OR ");
  const script = [
    "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8",
    "$OutputEncoding = [System.Text.Encoding]::UTF8",
    "$ErrorActionPreference = 'SilentlyContinue'",
    "$ProgressPreference = 'SilentlyContinue'",
    [
      `Get-CimInstance Win32_Process -Filter "${filter}"`,
      "| Select-Object @{n='name';e={$_.Name}},@{n='pid';e={$_.ProcessId}},@{n='commandLine';e={$_.CommandLine}},@{n='path';e={$_.ExecutablePath}}",
      "| ConvertTo-Json -Compress"
    ].join(" ")
  ].join("; ");

  try {
    const { stdout } = await runEncodedPowerShell(script);
    const details = parseJsonProcesses(stdout, { requireTitle: false });
    const byPid = new Map(details.map((row) => [row.pid, row]));

    return procs.map((proc) => {
      const detail = byPid.get(proc.pid);
      if (!detail) return proc;
      const path =
        detail.path ||
        pathFromCommandLine(detail.commandLine) ||
        pathFromCommandLine(proc.commandLine);
      return {
        ...proc,
        ...(detail.commandLine ? { commandLine: detail.commandLine } : {}),
        ...(path ? { path } : {})
      };
    });
  } catch (err) {
    console.error("Failed to enrich process details:", err);
    return procs;
  }
}

async function scanWindowsNamedProcesses(
  filterExes: string[]
): Promise<ProcessInfo[]> {
  const wanted = new Set(
    filterExes.map((exe) => {
      const base = exe.trim().toLowerCase();
      return base.endsWith(".exe") ? base : `${base}.exe`;
    })
  );
  if (!wanted.size) return [];

  const { stdout } = await execFileAsync(
    "tasklist.exe",
    ["/nh", "/fo", "csv"],
    {
      encoding: "utf-8",
      windowsHide: true,
      maxBuffer: 20 * 1024 * 1024,
      timeout: 10_000
    }
  );

  const seen = new Map<string, ProcessInfo>();
  for (const line of stdout.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const parts = line.split('","');
    const name = parts[0]?.replace(/^"/, "").replace(/"$/, "").trim() || "";
    const pid = parseInt(parts[1]?.replace(/"/g, "") || "0", 10);
    if (!name) continue;

    const key = name.toLowerCase();
    if (!wanted.has(key)) continue;

    const isJava = /^(java|javaw)\.exe$/i.test(key);
    const dedupeKey = isJava ? `${key}:${pid}` : key;
    if (seen.has(dedupeKey)) continue;

    seen.set(dedupeKey, {
      name,
      pid: Number.isFinite(pid) ? pid : 0
    });
  }

  return enrichWindowsProcessDetails([...seen.values()]);
}

async function scanUnixNamedProcesses(
  filterExes: string[]
): Promise<ProcessInfo[]> {
  const wanted = filterExes.map((e) => e.toLowerCase()).filter(Boolean);
  if (!wanted.length) return [];

  const all = await scanUnixProcesses();
  return all.filter((proc) => {
    const name = proc.name.toLowerCase();
    const base = name.split(/[/\\]/).pop() || name;
    const normalized = base.endsWith(".exe") ? base : `${base}.exe`;
    return wanted.some(
      (exe) =>
        base === exe ||
        base === exe.replace(/\.exe$/i, "") ||
        normalized === (exe.endsWith(".exe") ? exe : `${exe}.exe`) ||
        name.includes(exe)
    );
  });
}

async function scanUnixProcesses(): Promise<ProcessInfo[]> {
  const { stdout: output } = await execFileAsync("ps", ["-ax", "-o", "pid=,command="], {
    encoding: "utf-8",
    maxBuffer: 10 * 1024 * 1024
  });
  const lines = output.split("\n");

  return lines
    .map((line): ProcessInfo | null => {
      const trimmed = line.trim();
      if (!trimmed) return null;
      const match = trimmed.match(/^(\d+)\s+(.*)$/);
      if (!match) return null;
      const pid = parseInt(match[1] || "0", 10);
      const commandLine = match[2] || "";
      const name = commandLine.split(/\s+/)[0] || "";
      if (!name) return null;
      const path = name.startsWith("/") ? name : undefined;
      return {
        pid,
        name,
        commandLine,
        ...(path ? { path } : {})
      };
    })
    .filter((p): p is ProcessInfo => p != null);
}

async function scanProcesses(): Promise<ProcessInfo[]> {
  if (process.platform === "win32") {
    return scanWindowsWindowedProcesses();
  }

  return scanUnixProcesses();
}

export async function refreshProcessCache(): Promise<ProcessInfo[]> {
  if (refreshing) {
    await refreshing;
    return cache;
  }

  refreshing = (async () => {
    try {
      const next = await scanProcesses();
      if (next.length || !cache.length) {
        cache = next;
      }
    } catch (err) {
      console.error("Failed to refresh process cache:", err);
    } finally {
      refreshing = null;
    }
  })();

  await refreshing;
  return cache;
}

export function getCachedProcesses(filterExes?: string[]): ProcessInfo[] {
  const filters = Array.isArray(filterExes)
    ? filterExes.map((e) => e.toLowerCase()).filter(Boolean)
    : [];

  if (!filters.length) return cache;

  return cache.filter((p) =>
    filters.some((exe) => p.name.toLowerCase().includes(exe))
  );
}

export async function listProcessesCached(
  filterExes?: string[]
): Promise<ProcessInfo[]> {
  const filters = Array.isArray(filterExes)
    ? filterExes.map((e) => e.trim()).filter(Boolean)
    : [];

  if (!filters.length) {
    if (!cache.length) void refreshProcessCache();
    return getCachedProcesses();
  }

  try {
    if (process.platform === "win32") {
      return await scanWindowsNamedProcesses(filters);
    }
    return await scanUnixNamedProcesses(filters);
  } catch (err) {
    console.error("Failed to scan named processes:", err);
    return getCachedProcesses(filters);
  }
}

export function startProcessCache(intervalMs = POLL_MS) {
  if (pollTimer) return;
  void refreshProcessCache();
  pollTimer = setInterval(() => {
    void refreshProcessCache();
  }, intervalMs);
  if (typeof pollTimer === "object" && "unref" in pollTimer) {
    pollTimer.unref();
  }
}

export function stopProcessCache() {
  if (!pollTimer) return;
  clearInterval(pollTimer);
  pollTimer = null;
}
