import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
    appId: "com.mutualzz.app",
    appName: "Mutualzz",
    webDir: "dist",
    server: { cleartext: true, url: "http://137.150.244.173:1420" },
    plugins: {
        StatusBar: {
            overlaysWebView: false,
        },
        CapacitorHttp: {
            enabled: true,
        },
    },
};

export default config;
