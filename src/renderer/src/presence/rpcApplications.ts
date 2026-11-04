import type { APIPublicApplication } from "@mutualzz/types";
import { REST } from "@stores/REST.store";

const TTL_MS = 10 * 60 * 1000;

const cache = new Map<
  string,
  { application: APIPublicApplication | null; fetchedAt: number }
>();
const inflight = new Map<string, Promise<APIPublicApplication | null>>();

async function fetchApplication(id: string) {
  try {
    const res = await fetch(REST.makeAPIUrl(`/applications/${id}`));
    if (!res.ok) return null;
    return (await res.json()) as APIPublicApplication;
  } catch {
    return null;
  }
}

export async function resolveRpcApplication(
  id: string
): Promise<APIPublicApplication | null> {
  if (!/^\d{1,19}$/.test(id)) return null;

  const cached = cache.get(id);
  if (cached && Date.now() - cached.fetchedAt < TTL_MS)
    return cached.application;

  let pending = inflight.get(id);
  if (!pending) {
    pending = fetchApplication(id).then((application) => {
      cache.set(id, { application, fetchedAt: Date.now() });
      inflight.delete(id);
      return application;
    });
    inflight.set(id, pending);
  }

  return pending;
}
