const getNavigator = () => {
    if (typeof window === "undefined") return null;
    return window.navigator ?? null;
};

async function getUAData() {
    const nav = getNavigator();
    if (!nav || !("userAgentData" in nav)) return null;

    try {
        return await (nav as any).userAgentData.getHighEntropyValues?.([
            "platform",
            "architecture",
            "platformVersion",
        ]);
    } catch {
        return null;
    }
}

export async function detectOS(): Promise<string> {
    const uaData = await getUAData();
    if (uaData) return uaData.platform ?? "Other";

    const nav = getNavigator();
    if (!nav) return "Other";

    const ua = nav.userAgent.toLowerCase();
    if (ua.includes("win")) return "Windows";
    if (ua.includes("mac")) return "macOS";
    if (ua.includes("linux")) return "Linux";
    return "Other";
}

export function detectMobileOS(): "iOS" | "Android" | "Other" {
    const nav = typeof window !== "undefined" ? window.navigator : null;
    if (!nav) return "Other";
    const ua = nav.userAgent || "";

    if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
    if (/android/i.test(ua)) return "Android";
    return "Other";
}

export function detectDownloadURL() {
    const mobileOs = detectMobileOS();
    switch (mobileOs) {
        case "iOS":
            return "https://testflight.apple.com/join/23FhnCyx";
    }

    const os = detectDesktopOS();
    const baseUrl = "https://proxy.mutualzz.com/releases/latest";

    switch (os) {
        case "osx":
            return `${baseUrl}/Mutualzz.dmg`;
        case "win":
            return `${baseUrl}/MutualzzSetup.exe`;
        case "linux-rpm":
            return `${baseUrl}/Mutualzz.rpm`;
        case "linux-deb":
            return `${baseUrl}/Mutualzz.deb`;
        case "linux-appimage":
            return `${baseUrl}/Mutualzz.AppImage`;
    }

    return undefined;
}

export function detectDesktopOS(): string {
    const ua = navigator.userAgent.toLowerCase();

    if (ua.includes("mac os x")) return "osx";
    if (ua.includes("win")) return "win";

    if (ua.includes("linux")) {
        const debDistros = [
            "debian",
            "ubuntu",
            "mint",
            "pop",
            "zorin",
            "elementary",
        ];
        const rpmDistros = ["fedora", "centos", "rhel", "opensuse"];

        if (debDistros.some((d) => ua.includes(d))) return "linux-deb";
        if (rpmDistros.some((d) => ua.includes(d))) return "linux-rpm";
        return "linux-appimage";
    }

    return "other";
}

export function detectBrowser(): string {
    const nav = getNavigator();
    if (!nav) return "Other";

    if ("userAgentData" in nav) {
        return (nav as any).userAgentData.brands?.[0]?.brand ?? "Other";
    }

    const ua = nav.userAgent;
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Edg/")) return "Edge";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
    return "Other";
}
