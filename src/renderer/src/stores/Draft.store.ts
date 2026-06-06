import { Logger } from "@mutualzz/logger";
import type { APITheme } from "@mutualzz/types";
import { makeAutoObservable, observable } from "mobx";
import { makePersistable } from "mobx-persist-store";
import Snowflake from "@utils/Snowflake";
import type { CanvasPath } from "react-sketch-canvas";

interface AvatarDraft {
  id: string;
  image: string;
  paths: CanvasPath[];
}

interface ThemeDraft extends APITheme {
  id: string;
}

export class DraftStore {
  themes = observable.map<string, ThemeDraft>();
  avatars = observable.map<string, AvatarDraft>();
  private readonly logger = new Logger({
    tag: "DraftStore"
  });

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });

    makePersistable(this, {
      name: "DraftStore",
      properties: ["avatars", "themes"],
      storage: localStorage
    });
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
  }
}
