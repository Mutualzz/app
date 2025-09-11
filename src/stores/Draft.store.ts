import type { ThemeDraft } from "@app-types/theme";
import { Logger } from "@logger";
import { isSSR } from "@utils/index";
import { makeAutoObservable } from "mobx";
import { makePersistable } from "mobx-persist-store";
import { type CanvasPath } from "react-sketch-canvas";

export class DraftStore {
    private readonly logger = new Logger({
        tag: "DraftStore",
    });
    themes: ThemeDraft[] = [];
    avatars: { image: string; paths: CanvasPath[] }[] = [];

    constructor() {
        makeAutoObservable(this);

        if (isSSR) return;

        makePersistable(this, {
            name: "DraftStore",
            properties: ["avatars", "themes"],
            storage: localStorage,
        });
    }

    saveAvatarDraft(image: string, paths: CanvasPath[]) {
        if (isSSR) return;
        if (this.avatars.some((avatar) => avatar.paths === paths)) {
            this.logger.warn("Avatar draft already exists");
            return;
        }

        this.avatars.unshift({ image, paths });
    }

    deleteAvatarDraft(index: number) {
        if (isSSR) return;
        if (!this.avatars[index]) {
            this.logger.warn("Avatar draft does not exist");
            return;
        }

        this.avatars.splice(index, 1);
    }

    saveThemeDraft(theme: ThemeDraft) {
        if (isSSR) return;

        this.themes.unshift(theme);
    }

    deleteThemeDraft(theme: ThemeDraft) {
        if (isSSR) return;

        this.themes = this.themes.filter((t) => t.name !== theme.name);
    }
}
