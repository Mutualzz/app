export interface MutualzzAPI {
    app: {
        getVersion(): Promise<string>;
        getName(): Promise<string>;
        relaunch(): Promise<void>;
    };
    system: {
        getOsInfo(): Promise<{
            platform: string;
            type: string;
            arch: string;
            locale: string;
            family?: string;
        }>;
        listProcesses(
            filterExes: string[]
        ): Promise<Array<{ name: string; pid: number }>>;
    };
    shell: {
        openExternal(url: string): Promise<void>;
    };
    codec: {
        etfEncode(payload: any): Promise<number[]>;
        etfDecode(payload: number[]): Promise<any>;
    };
    clipboard: {
        write(text: string): Promise<void>;
        read(): Promise<string>;
    };
    desktop: {
        setAutostart(enabled: boolean): Promise<void>;
        getAutostart(): Promise<boolean>;
    };

    theme: {
        updateIcons(dataUrl: string): Promise<void>;
    };

    storage: {
        getToken(): Promise<string | null>;
        setToken(token: string): Promise<void>;
        deleteToken(): Promise<void>;
    };

    window: {
        minimize(): Promise<void>;
        maximize(): Promise<void>;
        close(): Promise<void>;
        isMaximized(): Promise<boolean>;
    };
    updater: {
        check(): Promise<void>;
        download(): Promise<void>;
        install(): Promise<void>;
        checkOnStartup(): Promise<void>;
    };
    events: {
        onDeepLink(callback: (url: string) => void): void;
        onUpdaterChecking(callback: () => void): void;
        onUpdaterAvailable(callback: (info: any) => void): void;
        onUpdaterError(callback: (error: string) => void): void;
        onUpdaterProgress(callback: (progress: any) => void): void;
        onUpdaterDownloaded(callback: () => void): void;
        onUpdaterNotAvailable(callback: () => void): void;
    };
}

declare global {
    interface Window {
        api: MutualzzAPI;
    }
}
