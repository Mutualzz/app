import mergeWith from "lodash-es/mergeWith";

export function mergeAppendAnything(
    ...objects: Record<string, string | string[]>[]
): Record<string, string[]> {
    return mergeWith({}, ...objects, (objValue: any, srcValue: any) => {
        const toArray = (val: string | string[]): string[] =>
            Array.isArray(val) ? val : [val];

        if (objValue !== undefined && srcValue !== undefined) {
            return Array.from(
                new Set(toArray(objValue).concat(toArray(srcValue))),
            );
        }

        return undefined;
    });
}

export function detectOS(): string {
    if ("userAgentData" in navigator) {
        return (navigator as any).userAgentData.platform ?? "Other";
    }

    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("win")) return "Windows";
    if (userAgent.includes("mac")) return "macOS";
    if (userAgent.includes("linux")) return "Linux";

    return "Other";
}

export function detectBrowser(): string {
    if ("userAgentData" in navigator) {
        return (navigator as any).userAgentData.brands?.[0]?.brand ?? "Other";
    }

    const ua = navigator.userAgent;
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Edg/")) return "Edge";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
    return "Other";
}
