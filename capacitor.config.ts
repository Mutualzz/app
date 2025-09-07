import type { CapacitorConfig } from "@capacitor/cli";

const isDev = process.env.NODE_ENV === "development";

const config: CapacitorConfig = {
    appId: "com.mutualzz.app",
    appName: "Mutualzz",
    webDir: "dist",
    server: {
        ...(isDev && {
            cleartext: true,
            url: "http://localhost:1420",
        }),
        androidScheme: "https",
        iosScheme: "https",
    },
    plugins: {
        StatusBar: {
            overlaysWebView: false,
        },
    },
};

export default config;
