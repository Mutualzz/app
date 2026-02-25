import { Logger } from "@mutualzz/logger";
import { type APIPrivateUser, type APISpacePartial, type APIUserSettings, type AppMode, } from "@mutualzz/types";
import { QueryClient } from "@tanstack/react-query";
import { isTauri } from "@utils/index";
import { safeLocalStorage } from "@utils/safeLocalStorage";
import { secureStorageAdapter } from "@utils/secureStorageAdapter";
import { makeAutoObservable } from "mobx";
import { makePersistable } from "mobx-persist-store";
import { AccountStore } from "./Account.store";
import { AccountSettingsStore } from "./AccountSettings.store";
import { ChannelStore } from "./Channel.store";
import { DraftStore } from "./Draft.store";
import { GatewayStore } from "./Gateway.store";
import { MessageQueue } from "./MessageQueue.store";
import { REST } from "./REST.store";
import { SpaceStore } from "./Space/Space.store";
import { ThemeStore } from "./Theme.store";
import { UpdaterStore } from "./Updater.store";
import { UserStore } from "./User.store";
import { ThemeCreatorStore } from "@stores/ThemeCreator.store";
import { NavigationStore } from "@stores/Navigation.store";
import { getTauriVersion, getVersion } from "@tauri-apps/api/app";
import { PresenceStore } from "@stores/Presence.store.ts";
import { CustomStatusStore } from "@stores/CustomStatus.store.ts";
import { VoiceStore } from "@stores/Voice.store.ts";

export class AppStore {
    isGatewayReady = false;
    isAppLoading = true;
    hideSwitcher = false;
    token: string | null = null;
    account: AccountStore | null = null;
    channels = new ChannelStore(this);
    gateway = new GatewayStore(this);
    drafts = new DraftStore();
    navigation = new NavigationStore(this);
    spaces = new SpaceStore(this);
    queue = new MessageQueue(this);
    themes = new ThemeStore(this);
    themeCreator = new ThemeCreatorStore();
    rest = new REST();
    users = new UserStore(this);
    updater: UpdaterStore | null = null;
    settings: AccountSettingsStore | null = null;
    mode: AppMode | null = null;
    joiningSpace?: APISpacePartial | null = null;
    joiningInviteCode?: string | null = null;
    presence = new PresenceStore();
    queryClient: QueryClient;
    memberListVisible = true;
    dontShowLinkWarning = false;

    customStatus = new CustomStatusStore();

    voice = new VoiceStore(this);

    versions: {
        app: string | null;
        tauri: string | null;
    } = {
        app: "4.0.1",
        tauri: null,
    };
    private readonly logger = new Logger({
        tag: "AppStore",
    });

    constructor() {
        if (isTauri) this.updater = new UpdaterStore();

        makeAutoObservable(this);

        this.queryClient = new QueryClient();

        makePersistable(this, {
            name: "AppStoreSecure",
            properties: ["token"],
            storage: secureStorageAdapter,
        });

        makePersistable(this, {
            name: "AppStore-Transient",
            properties: ["joiningSpace", "joiningInviteCode"],
            storage: safeLocalStorage,
            expireIn: 60 * 1000, // 1 minutes in milliseconds
            removeOnExpiration: true,
        });

        makePersistable(this, {
            name: "AppStore",
            properties: ["memberListVisible", "dontShowLinkWarning"],
            storage: safeLocalStorage,
        });
    }

    get targetMode(): AppMode {
        const preferredMode = this.settings?.preferredMode;

        if (this.mode === "feed") return "spaces";
        if (this.mode === "spaces") return "feed";
        return preferredMode ?? "spaces";
    }

    get isReady() {
        return !this.isAppLoading && this.isGatewayReady;
    }

    setDontShowLinkWarning(val: boolean) {
        this.dontShowLinkWarning = val;
    }

    setJoining(code?: string | null, space?: APISpacePartial | null) {
        this.joiningSpace = space;
        this.joiningInviteCode = code;
    }

    toggleMemberList() {
        this.memberListVisible = !this.memberListVisible;
    }

    setMode(mode: AppMode) {
        this.mode = mode;
    }

    resetMode() {
        this.mode = null;
    }

    setHideSwitcher(val: boolean) {
        this.hideSwitcher = val;
    }

    setUser(user: APIPrivateUser, settings?: APIUserSettings) {
        this.account = new AccountStore(user);
        if (settings) this.settings = new AccountSettingsStore(this, settings);
    }

    setGatewayReady(ready: boolean) {
        this.isGatewayReady = ready;
    }

    setAppLoading(loading: boolean) {
        this.isAppLoading = loading;
    }

    setToken(token: string) {
        this.token = token;
        this.logger.debug("Token saved to the storage");
    }

    loadToken() {
        if (this.token) {
            this.setToken(this.token);
            this.logger.debug("Token loaded from the storage");
        } else {
            this.logger.warn("No token found in the storage");
            this.setGatewayReady(true);
        }
    }

    logout() {
        this.token = null;
        this.isAppLoading = false;
        this.isGatewayReady = true;
        this.account = null;
        if (this.settings) this.settings.stopSyncing();
        this.settings = null;
        this.rest.setToken(null);
        this.themes.reset();

        void this.voice.leave();
        this.voice.reset();

        this.customStatus.clear();

        secureStorageAdapter.clear();
    }

    async loadSettings() {
        if (this.updater) await this.updater.startAutoChecker();
        if (this.settings) this.settings.startSyncing();
        this.loadToken();
        this.setAppLoading(false);

        if (isTauri) {
            this.versions = {
                app: await getVersion(),
                tauri: await getTauriVersion(),
            };
        }
    }
}
