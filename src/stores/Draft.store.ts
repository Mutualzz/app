import type { ThemeDraft } from "@app-types/theme";
import { isSSR } from "@utils/index";
import { makeAutoObservable } from "mobx";
import { makePersistable } from "mobx-persist-store";

export class DraftStore {
    themes: ThemeDraft[] = [];

    constructor() {
        makeAutoObservable(this);

        if (isSSR) return;

        makePersistable(this, {
            name: "DraftsStore",
            properties: ["themes"],
            storage: localStorage,
        });
    }

    saveThemeDraft(theme: ThemeDraft) {
        if (isSSR) return;
        this.themes.push(theme);
    }

    deleteThemeDraft(theme: ThemeDraft) {
        if (isSSR) return;
        this.themes = this.themes.filter((t) => t.name !== theme.name);
    }
}
