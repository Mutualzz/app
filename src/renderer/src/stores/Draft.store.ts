import { Logger } from "@mutualzz/logger";
import type { APITheme } from "@mutualzz/types";
import { makeAutoObservable, observable } from "mobx";
import { makePersistable } from "mobx-persist-store";
import { Snowflake } from "@mutualzz/client";
import type { CanvasPath } from "react-sketch-canvas";

interface AvatarDraft {
  id: string;
  image: string;
  paths: CanvasPath[];
}

interface ThemeDraft extends APITheme {
  id: string;
}

interface MessageDraft {
  content: string;
  stickerIds: string[];
  attachmentIds: string[];
}

const getMessageDraftKey = (accountId: string, channelId: string) =>
  `${accountId}:${channelId}`;

export class DraftStore {
  themes = observable.map<string, ThemeDraft>();
  avatars = observable.map<string, AvatarDraft>();
  messages = observable.map<string, MessageDraft>();
  readonly ready: Promise<void>;

  private readonly logger = new Logger({
    tag: "DraftStore"
  });

  constructor() {
    makeAutoObservable(this, { ready: false }, { autoBind: true });

    this.ready = makePersistable(this, {
      name: "DraftStore",
      properties: ["avatars", "themes", "messages"],
      storage: localStorage
    }).then(() => undefined);
  }

  // Message Drafts
  saveMessageDraft(accountId: string, channelId: string, draft: MessageDraft) {
    const key = getMessageDraftKey(accountId, channelId);

    if (
      draft.content.trim() === "" &&
      draft.stickerIds.length === 0 &&
      draft.attachmentIds.length === 0
    ) {
      this.messages.delete(key);
      return;
    }

    this.messages.set(key, draft);
  }

  getMessageDraft(accountId: string, channelId: string) {
    const key = getMessageDraftKey(accountId, channelId);
    return this.messages.get(key);
  }

  deleteMessageDraft(accountId: string, channelId: string) {
    const key = getMessageDraftKey(accountId, channelId);
    this.messages.delete(key);
  }

  // Avatar Drafts
  saveAvatarDraft(image: string, paths: CanvasPath[]) {
    const id = Snowflake.generate();
    const avatarDraft: AvatarDraft = { id, image, paths };
    this.avatars.set(id, avatarDraft);
    return id;
  }

  updateAvatarDraft(id: string, image: string, paths: CanvasPath[]) {
    if (!this.avatars.has(id)) {
      this.logger.warn("Avatar draft does not exist");
      return;
    }
    this.avatars.set(id, { id, image, paths });
  }

  deleteAvatarDraft(id: string) {
    if (!this.avatars.has(id)) {
      this.logger.warn("Avatar draft does not exist");
      return;
    }
    this.avatars.delete(id);
  }

  getAvatarDraft(id: string) {
    return this.avatars.get(id);
  }

  // Theme Drafts
  saveThemeDraft(theme: APITheme) {
    const existing = Array.from(this.themes.values()).some(
      (t) => t.name === theme.name
    );
    if (existing) {
      this.logger.warn("Theme draft already exists");
      return;
    }

    const id = Snowflake.generate();
    const themeDraft: ThemeDraft = { ...theme, id };
    this.themes.set(id, themeDraft);
    return id;
  }

  updateThemeDraft(theme: APITheme) {
    const existingDraft = Array.from(this.themes.values()).find(
      (t) => t.name === theme.name
    );
    if (!existingDraft) {
      this.logger.warn("Theme draft does not exist");
      return;
    }

    const themeDraft: ThemeDraft = { ...theme, id: existingDraft.id };
    this.themes.set(existingDraft.id, themeDraft);
  }

  deleteThemeDraft(theme: APITheme) {
    const existingDraft = Array.from(this.themes.values()).find(
      (t) => t.name === theme.name
    );
    if (!existingDraft) {
      this.logger.warn("Theme draft does not exist");
      return;
    }

    this.themes.delete(existingDraft.id);
  }

  existsThemeDraft(theme: APITheme) {
    return Array.from(this.themes.values()).some((t) => t.name === theme.name);
  }

  getThemeDraft(id: string) {
    return this.themes.get(id);
  }

  clear() {
    this.themes.clear();
    this.avatars.clear();
    this.messages.clear();
  }
}
