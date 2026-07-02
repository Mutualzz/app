import type { APIUserSettings, AppMode, Snowflake } from "@mutualzz/types";
import { ObservableOrderedSet } from "@utils/ObservableOrderedSet";
import { isElectron } from "@utils/index";
import { makeAutoObservable, observable, reaction } from "mobx";
import type { AppStore } from "./App.store";
import { makePersistable } from "mobx-persist-store";
import {
  DEFAULT_PUSH_TO_TALK_KEY,
  DEFAULT_SCREEN_SHARE_QUALITY,
  DEFAULT_VOICE_INPUT_SENSITIVITY,
  type ScreenShareQuality,
  type VoiceInputMode
} from "@utils/voiceSettings.utils";

type SettingsPatch = Omit<APIUserSettings, "updatedAt">;

export class AccountSettingsStore {
  currentTheme?: string | null = "baseDark";
  currentIcon?: string | null;
  preferredMode: AppMode;
  preferEmbossed: boolean = true;
  spellcheckEnabled: boolean = true;
  spacePositions: ObservableOrderedSet<string>;

  preferredSelfMute = false;
  preferredSelfDeaf = false;

  voiceInputMode: VoiceInputMode = "voice_activity";
  voiceInputSensitivity = DEFAULT_VOICE_INPUT_SENSITIVITY;
  voiceInputSensitivityAuto = true;
  pushToTalkKey = DEFAULT_PUSH_TO_TALK_KEY;
  screenShareIncludeAudio = false;
  screenShareQuality: ScreenShareQuality = DEFAULT_SCREEN_SHARE_QUALITY;

  favoriteEmojis = observable.array<string>([]);
  favoriteGifs = observable.array<string>([]);
  favoriteStickers = observable.array<string>([]);

  idleThresholdMs: number = 5 * 60_000;

  updatedAt: Date;

  private lastSyncedHash: string;
  private syncIntervalId?: ReturnType<typeof setInterval>;

  constructor(
    private readonly app: AppStore,
    settings: APIUserSettings
  ) {
    this.currentTheme = settings.currentTheme ?? "baseDark";
    this.currentIcon = settings.currentIcon;
    this.preferredMode = settings.preferredMode;
    this.spacePositions = new ObservableOrderedSet(
      settings.spacePositions.map(String)
    );
    this.preferEmbossed = settings.preferEmbossed;
    this.updatedAt = new Date(settings.updatedAt);

    this.preferredSelfMute = settings.preferredSelfMute;
    this.preferredSelfDeaf = settings.preferredSelfDeaf;

    this.favoriteEmojis = observable.array(settings.favoriteEmojis ?? []);
    this.favoriteGifs = observable.array(settings.favoriteGifs ?? []);
    this.favoriteStickers = observable.array(settings.favoriteStickers ?? []);

    this.lastSyncedHash = this.computeHash(this.getSyncPayload());

    makeAutoObservable(this, {}, { autoBind: true });

    makePersistable(this, {
      name: "AccountSettingsStore",
      properties: [
        "currentTheme",
        "currentIcon",
        "preferredMode",
        "preferEmbossed",
        "spellcheckEnabled",
        "preferredSelfMute",
        "preferredSelfDeaf",
        "voiceInputMode",
        "voiceInputSensitivity",
        "voiceInputSensitivityAuto",
        "pushToTalkKey",
        "screenShareIncludeAudio",
        "screenShareQuality",
        "idleThresholdMs",
        {
          key: "favoriteEmojis",
          serialize: (v: unknown) => (Array.isArray(v) ? [...v] : []),
          deserialize: (v: unknown) =>
            observable.array(Array.isArray(v) ? v : [])
        },
        {
          key: "favoriteGifs",
          serialize: (v: unknown) => (Array.isArray(v) ? [...v] : []),
          deserialize: (v: unknown) =>
            observable.array(Array.isArray(v) ? v : [])
        },
        {
          key: "favoriteStickers",
          serialize: (v: unknown) => (Array.isArray(v) ? [...v] : []),
          deserialize: (v: unknown) =>
            observable.array(Array.isArray(v) ? v : [])
        },
        {
          key: "spacePositions",
          serialize: (v: unknown) => {
            if (v instanceof ObservableOrderedSet) return v.toArray();
            if (Array.isArray(v)) return v.map(String);
            if (v && typeof v === "object" && "toArray" in (v as any))
              return (v as any).toArray().map(String);
            return [];
          },
          deserialize: (v: unknown) =>
            new ObservableOrderedSet<string>(
              Array.isArray(v) ? v.map(String) : []
            )
        },
        {
          key: "updatedAt",
          serialize: (d: unknown) => (d instanceof Date ? d.toISOString() : d),
          deserialize: (v: unknown) => new Date(v as any)
        }
      ],
      storage: localStorage
    });

    if (isElectron) {
      reaction(
        () => this.spellcheckEnabled,
        (enabled) => window.api.spellcheck.setEnabled(enabled),
        { fireImmediately: true }
      );
    }
  }

  private get isDirty(): boolean {
    return this.computeHash(this.getSyncPayload()) !== this.lastSyncedHash;
  }

  setPreferEmbossed(prefer: boolean) {
    this.preferEmbossed = prefer;
  }

  togglePreferEmbossed() {
    this.preferEmbossed = !this.preferEmbossed;
  }

  setSpellcheckEnabled(enabled: boolean) {
    this.spellcheckEnabled = enabled;
  }

  toggleSpellcheckEnabled() {
    this.spellcheckEnabled = !this.spellcheckEnabled;
  }

  setCurrentTheme(theme: string | null) {
    this.currentTheme = theme;
  }

  toggleFavoriteEmoji(unified: string, skinTone: string | null = null) {
    const key = unified.startsWith("custom:")
      ? unified
      : `${unified}:${skinTone ?? ""}`;
    const idx = this.favoriteEmojis.indexOf(key);
    if (idx === -1) {
      this.favoriteEmojis.push(key);
    } else this.favoriteEmojis.splice(idx, 1);
  }

  isFavoriteEmoji(unified: string, skinTone: string | null = null) {
    const key = unified.startsWith("custom:")
      ? unified
      : `${unified}:${skinTone ?? ""}`;
    return this.favoriteEmojis.includes(key);
  }

  toggleFavoriteGif(entry: string) {
    const url = entry.split("|")[0];
    const idx = this.favoriteGifs.findIndex((f) => f.split("|")[0] === url);
    if (idx === -1) {
      this.favoriteGifs.push(entry);
    } else {
      this.favoriteGifs.splice(idx, 1);
    }
  }

  isFavoriteGif(url: string) {
    const bare = url.split("|")[0];
    return this.favoriteGifs.some((f) => f.split("|")[0] === bare);
  }

  toggleFavoriteSticker(id: string) {
    const idx = this.favoriteStickers.indexOf(id);
    if (idx === -1) {
      this.favoriteStickers.push(id);
    } else {
      this.favoriteStickers.splice(idx, 1);
    }
  }

  isFavoriteSticker(id: string) {
    return this.favoriteStickers.includes(id);
  }

  setPreferredMode(mode: AppMode) {
    this.preferredMode = mode;
  }

  setCurrentIcon(icon?: string | null) {
    this.currentIcon = icon;
  }

  update(settings: Partial<APIUserSettings>) {
    if (settings.spacePositions != undefined)
      this.spacePositions.replace(settings.spacePositions.map(String));

    if (settings.currentTheme != undefined)
      this.currentTheme = settings.currentTheme;

    if (settings.currentIcon != undefined)
      this.currentIcon = settings.currentIcon;

    if (settings.preferredMode != undefined)
      this.preferredMode = settings.preferredMode;

    if (settings.updatedAt != undefined)
      this.updatedAt = new Date(settings.updatedAt);

    if (settings.preferredSelfMute != undefined)
      this.preferredSelfMute = settings.preferredSelfMute;

    if (settings.preferredSelfDeaf != undefined)
      this.preferredSelfDeaf = settings.preferredSelfDeaf;

    if (settings.favoriteEmojis != undefined)
      this.favoriteEmojis = observable.array(settings.favoriteEmojis);
    if (settings.favoriteGifs != undefined)
      this.favoriteGifs = observable.array(settings.favoriteGifs);
    if (settings.favoriteStickers != undefined)
      this.favoriteStickers = observable.array(settings.favoriteStickers);

    this.lastSyncedHash = this.computeHash(this.getSyncPayload());
  }

  setPreferredSelfMute(value: boolean) {
    this.preferredSelfMute = value;
  }

  setPreferredSelfDeaf(value: boolean) {
    this.preferredSelfDeaf = value;
  }

  setVoiceInputMode(mode: VoiceInputMode) {
    this.voiceInputMode = mode;
    this.app.voice?.applyVoiceSettings();
  }

  setVoiceInputSensitivity(value: number) {
    this.voiceInputSensitivity = Math.min(100, Math.max(0, value));
    this.app.voice?.applyVoiceSettings();
  }

  setVoiceInputSensitivityAuto(value: boolean) {
    this.voiceInputSensitivityAuto = value;
    this.app.voice?.applyVoiceSettings();
  }

  setPushToTalkKey(code: string) {
    this.pushToTalkKey = code;
  }

  setScreenShareIncludeAudio(value: boolean) {
    this.screenShareIncludeAudio = value;
  }

  setScreenShareQuality(value: ScreenShareQuality) {
    this.screenShareQuality = value;
  }

  setIdleThresholdMs(ms: number) {
    this.idleThresholdMs = ms;
  }

  startSyncing() {
    this.syncIntervalId = setInterval(
      () => {
        this.sync();
      },
      10 * 60 * 1000
    ); // Sync every 10 minutes, send only if there are changes
  }

  stopSyncing() {
    clearInterval(this.syncIntervalId);
  }

  addPosition(spaceId: Snowflake) {
    this.spacePositions.addFirst(spaceId);
  }

  removePosition(spaceId: Snowflake) {
    this.spacePositions.delete(spaceId);
  }

  reorderSpaces(newOrder: Snowflake[]) {
    this.spacePositions.clear();
    newOrder.forEach((id) => this.spacePositions.addLast(id));
  }

  moveSpace(fromIndex: number, toIndex: number) {
    const items = this.spacePositions.toArray();
    const [removed] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, removed);
    this.reorderSpaces(items);
  }

  async sync() {
    if (!this.app.account) return;
    if (!this.isDirty) return;

    const payload = this.getSyncPayload();

    const res = await this.app.rest
      .patch<APIUserSettings, SettingsPatch>("/@me/settings", payload)
      .catch(() => null);

    if (res) this.update(res);
  }

  private getSyncPayload(): SettingsPatch {
    return {
      spacePositions: this.spacePositions.toArray(),
      preferredMode: this.preferredMode,
      preferEmbossed: this.preferEmbossed,
      currentTheme: this.currentTheme,
      currentIcon: this.currentIcon,
      preferredSelfMute: this.preferredSelfMute,
      preferredSelfDeaf: this.preferredSelfDeaf,
      favoriteEmojis: [...this.favoriteEmojis],
      favoriteGifs: [...this.favoriteGifs],
      favoriteStickers: [...this.favoriteStickers]
    };
  }

  private computeHash(payload: SettingsPatch): string {
    return JSON.stringify(payload);
  }
}
