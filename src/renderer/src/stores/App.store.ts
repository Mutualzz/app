import { Logger } from "@mutualzz/logger";
import {
    type APIPrivateUser,
    type APISpacePartial,
    type APIUserSettings,
    type AppMode
} from "@mutualzz/types";
import { QueryClient } from "@tanstack/react-query";
import { isElectron } from "@utils/index";
import { makeAutoObservable, runInAction } from "mobx";
import { makePersistable } from "mobx-persist-store";
import { AccountStore } from "./Account.store";
import { AccountSettingsStore } from "./AccountSettings.store";
import { ChannelStore } from "./Channel.store";
import { DraftStore } from "./Draft.store";
import { GatewayStore } from "./Gateway.store";
import { MessageQueue } from "./MessageQueue.store";
import { REST } from "./REST.store";
import { SpaceStore } from "./Space.store";
import { ThemeStore } from "./Theme.store";
import { UpdaterStore } from "./Updater.store";
import { UserStore } from "./User.store";
import { ThemeCreatorStore } from "@stores/ThemeCreator.store";
import { NavigationStore } from "@stores/Navigation.store";
import { PresenceStore } from "@stores/Presence.store";
import { CustomStatusStore } from "@stores/CustomStatus.store";
import { VoiceStore } from "@stores/Voice.store";
import { VoiceStatesStore } from "@stores/VoiceStates.store";
import { ExpressionsStore } from "@stores/Expressions.store";
import { webTokenStorage } from "@storages/webTokenStorage";
import type { TokenStorage } from "@renderer/types";
import { electronTokenStorage } from "@storages/electronTokenStorage";
import { RelationshipStore } from "@stores/Relationship.store";

export class AppStore {
    isGatewayReady = false;
    isAppLoading = true;
    hideSwitcher = false;
    token: string | null = null;
    account: AccountStore | null = null;
    channels = new ChannelStore(this);
    gateway = new GatewayStore(this);
    expressions = new ExpressionsStore(this);
    drafts = new DraftStore();
    navigation = new NavigationStore(this);
    spaces = new SpaceStore(this);
    relationships = new RelationshipStore(this);
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
    voiceChatVisible = false;
    dontShowLinkWarning = false;

    channelListWidth = 320;
    dmChannelListWidth = 320;
    voiceChatWidth = 500;

    customStatus = new CustomStatusStore();

    voice = new VoiceStore(this);
    voiceStates = new VoiceStatesStore(this);

    versions: {
        app: string | null;
    } = {
        app: "6.1.0"
    };

    readonly tokenStorage: TokenStorage;
    composerCount = 0;
    private readonly logger = new Logger({
        tag: "AppStore"
    });

    constructor() {
        if (isElectron && !import.meta.env.DEV)
            this.updater = new UpdaterStore(this);

        makeAutoObservable(this);

        this.queryClient = new QueryClient();

        makePersistable(this, {
            name: "AppStoreTransient",
            properties: ["joiningSpace", "joiningInviteCode"],
            storage: localStorage,
            expireIn: 60 * 1000, // 1 minute in milliseconds
            removeOnExpiration: true
        });

        makePersistable(this, {
            name: "AppStore",
            properties: [
                "memberListVisible",
                "dontShowLinkWarning",
                "channelListWidth",
                "voiceChatWidth"
            ],
            storage: localStorage
        });

        this.tokenStorage = isElectron ? electronTokenStorage : webTokenStorage;
    }

    get composerVisible() {
        return this.composerCount > 0;
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

    popComposer() {
        this.composerCount = Math.max(0, this.composerCount - 1);
    }

    pushComposer() {
        this.composerCount = Math.max(0, this.composerCount) + 1;
    }

    setDmChannelListWidth(value: number) {
        this.dmChannelListWidth = Math.min(480, Math.max(320, value));
    }

    setVoiceChatVisible(visible: boolean) {
        this.voiceChatVisible = visible;
    }

    setVoiceChatWidth(width: number) {
        this.voiceChatWidth = Math.min(1000, Math.max(380, width));
    }

    setChannelListWidth(width: number) {
        this.channelListWidth = Math.min(480, Math.max(320, width));
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
        this.account = new AccountStore(this, user);
        if (settings) this.settings = new AccountSettingsStore(this, settings);
    }

    setGatewayReady(ready: boolean) {
        this.isGatewayReady = ready;
    }

    setAppLoading(loading: boolean) {
        this.isAppLoading = loading;
    }

    async setToken(token: string) {
        try {
            await this.tokenStorage.set(token);
            runInAction(() => {
                this.token = token;
            });
            this.rest.setToken(token);
        } catch (err) {
            this.logger.error("Failed to persist token", err);
        }
    }

    async loadToken() {
        try {
            const token = await this.tokenStorage.get();

            if (token) {
                runInAction(() => {
                    this.token = token;
                });
                this.rest.setToken(token);
                this.logger.debug("Token loaded from storage");
            } else {
                this.logger.warn("No token found in storage");
            }
        } catch (err) {
            this.logger.error("Failed to load token", err);
        } finally {
            this.setGatewayReady(true);
        }
    }

    async logout() {
        await this.tokenStorage.delete();

        runInAction(() => {
            this.token = null;
        });
        this.isAppLoading = false;
        this.isGatewayReady = true;
        this.account = null;

        if (this.settings) this.settings.stopSyncing();
        this.settings = null;

        this.rest.setToken(null);
        this.themes.reset();

        await this.voice.leave();
        this.voice.reset();
        await this.gateway.disconnect();

        this.customStatus.clear();

        this.channels.clear();
        this.expressions.clear();
        this.drafts.clear();
        this.navigation.clear();
        this.spaces.clear();
        this.relationships.clear();
        this.queue.clear();
        this.themes.clear();
        this.themeCreator.resetValues();
        this.users.clear();
        this.mode = null;
        this.presence.clear();
        await this.queryClient.cancelQueries();
        this.queryClient.clear();
        this.queryClient.removeQueries();
        this.queryClient.getMutationCache().clear();
        this.spaces.unsetActive();
        this.spaces.setMostRecentSpace(null);
        this.channels.unsetActive?.();

        localStorage.removeItem("AppStore");
        localStorage.removeItem("AppStoreTransient");
        localStorage.removeItem("SpaceStore");
        localStorage.removeItem("PresenceStore");
        localStorage.removeItem("NavigationStore");
    }

    async loadSettings() {
        if (this.updater) await this.updater.startAutoChecker();
        if (this.settings) this.settings.startSyncing();
        await this.loadToken();

        const isForcedUpdateBlocking =
            this.updater?.forceUpdate &&
            (this.updater.stage === "downloading" ||
                this.updater.stage === "installing" ||
                this.updater.stage === "relaunching");

        if (!isForcedUpdateBlocking) this.setAppLoading(false);

        if (window.api) {
            try {
                this.versions = {
                    app: await window.api.app.getVersion()
                };
            } catch (err) {
                this.logger.error("Failed to load version", err);
            }
        }
    }
}
