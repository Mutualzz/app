export function formatRestError(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === "string" && error.length > 0) return error;
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    if (typeof record.message === "string" && record.message.length > 0) {
      return record.message;
    }
    if (typeof record.error === "string" && record.error.length > 0) {
      return record.error;
    }
    const errors = record.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      const first = errors[0];
      if (typeof first === "string" && first.length > 0) return first;
      if (first && typeof first === "object") {
        const msg = (first as Record<string, unknown>).message;
        if (typeof msg === "string" && msg.length > 0) return msg;
      }
    }
  }
  return fallback;
}

export function parseXhrJson(responseText: string): unknown {
  if (!responseText) return null;
  try {
    return JSON.parse(responseText);
  } catch {
    return { message: responseText.slice(0, 200) };
  }
}
