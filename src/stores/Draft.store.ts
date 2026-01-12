import { Logger } from "@mutualzz/logger";
import type { APITheme } from "@mutualzz/types";
import { safeLocalStorage } from "@utils/safeLocalStorage";
import Snowflake from "@utils/Snowflake";
import { makeAutoObservable, observable, type IObservableArray } from "mobx";
import { makePersistable } from "mobx-persist-store";
import { type CanvasPath } from "react-sketch-canvas";

type AvatarDraft = {
    image: string;
    paths: CanvasPath[];
};

export class DraftStore {
    private readonly logger = new Logger({
        tag: "DraftStore",
    });

    themes: IObservableArray<APITheme>;
    avatars: IObservableArray<AvatarDraft>;

    constructor() {
        makeAutoObservable(this);

        this.themes = observable.array([]);
        this.avatars = observable.array([]);

        makePersistable(this, {
            name: "DraftStore",
            properties: ["avatars", "themes"],
            storage: safeLocalStorage,
        });
    }

    saveAvatarDraft(image: string, paths: CanvasPath[]) {
        if (this.avatars.some((avatar) => avatar.paths === paths)) {
            this.logger.warn("Avatar draft already exists");
            return;
        }

        this.avatars.unshift({ image, paths });
    }

    deleteAvatarDraft(index: number) {
        if (!this.avatars[index]) {
            this.logger.warn("Avatar draft does not exist");
            return;
        }

        this.avatars.splice(index, 1);
    }

    saveThemeDraft(theme: APITheme) {
        const id = Snowflake.generate();
        theme.id = id;
        const existing = this.themes.some((t) => t.id === theme.id);
        if (existing) {
            this.logger.warn("Theme draft already exists");
            return;
        }

        this.themes.unshift(theme);
    }

    deleteThemeDraft(theme: APITheme) {
        const existing = this.themes.some((t) => t.id === theme.id);
        if (!existing) {
            this.logger.warn("Theme draft does not exist");
            return;
        }

        this.themes.filter((t) => t.id !== theme.id);
    }
}
