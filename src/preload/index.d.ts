export interface MutualzzAPI {
  app: {
    getVersion(): Promise<string>;
    getName(): Promise<string>;
    isPackaged(): Promise<boolean>;
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
  badge: {
    set(count: number): void;
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
    listCaptureSources(): Promise<
      Array<{
        id: string;
        name: string;
        thumbnail: string;
        appIcon: string | null;
      }>
    >;
    getScreenCaptureAccess(): Promise<
      "not-determined" | "granted" | "denied" | "restricted" | "unknown"
    >;
    openScreenCaptureSettings(): Promise<void>;
  };
  theme: {
    updateIcons(dataUrl: string): Promise<void>;
    readIcon(relativePath: string): Promise<string | null>;
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
    getVersion(): Promise<string>;
    getPlatform(): Promise<string>;
    getSavePath(version: string): Promise<string>;
    download(url: string, savePath: string): Promise<{ path: string }>;
    apply(updatePath: string, version: string): Promise<void>;
  };
  events: {
    onDeepLink(callback: (url: string) => void): () => void;
    onUpdaterChecking(callback: () => void): () => void;
    onUpdaterAvailable(callback: (info: any) => void): () => void;
    onUpdaterDownloading(callback: () => void): () => void;
    onUpdaterProgress(callback: (progress: any) => void): () => void;
    onUpdaterDownloaded(callback: () => void): () => void;
    onUpdaterNotAvailable(callback: () => void): () => void;
    onUpdaterError(callback: (error: string) => void): () => void;
    onUpdaterDownloadProgress(callback: (data: {
      percent: number;
      downloaded: number;
      total: number;
    }) => void): () => void;
  };
}

declare global {
  interface Window {
    api: MutualzzAPI;
  }
}
