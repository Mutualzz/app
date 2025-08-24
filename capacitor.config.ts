import type { CapacitorConfig } from "@capacitor/cli";

const isDev = process.env.NODE_ENV === "development";

const config: CapacitorConfig = {
    appId: "com.mutualzz.app",
    appName: "Mutualzz",
    webDir: "dist",
    ...(isDev && {
        server: { cleartext: true, url: "http://137.150.244.173:1420" },
    }),
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
