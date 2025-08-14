import type { MzTheme, ThemeDraft } from "@app-types/theme";
import { Logger } from "@logger";
import type { APITheme, APIUser } from "@mutualzz/types";
import { baseDarkTheme, baseLightTheme, type ThemeMode } from "@mutualzz/ui";
import { themes as defaultThemes } from "@themes/index";
import { isSSR } from "@utils/index";
import { makeAutoObservable } from "mobx";
import { makePersistable } from "mobx-persist-store";

// TODO: Finish theme system (with REST, Gateway and everything combined)
export class ThemeStore {
    private readonly logger = new Logger({
        tag: "ThemeStore'",
    });

    themes: MzTheme[] = [];
    themeDrafts: ThemeDraft[] = [];

    currentTheme: MzTheme | null = null;
    currentMode: ThemeMode = "system";

    constructor() {
        makeAutoObservable(this);

        if (isSSR) return;
        makePersistable(this, {
            name: "ThemeStore",
            properties: ["themeDrafts", "currentTheme", "currentMode"],
            storage: localStorage,
        });
    }

    setCurrentTheme(themeId: string) {
        let theme = this.themes.find((theme) => theme.id === themeId);
        if (!theme) theme = this.themes[0];
        this.currentTheme = theme;
    }

    setInitialTheme() {
        if (!this.currentTheme && this.themes.length > 0) {
            // Set default theme based on current mode
            const defaultTheme =
                this.themes.find(
                    (theme) =>
                        theme.type ===
                        (this.currentMode === "system"
                            ? "dark"
                            : this.currentMode),
                ) || this.themes[0];

            this.currentTheme = defaultTheme;
        }
    }

    setCurrentMode(mode: ThemeMode) {
        this.currentMode = mode;
    }

    loadDefaultThemes() {
        defaultThemes.forEach((theme) => {
            const themeWithMetadata = {
                ...theme,
                createdAt: new Date(0),
                createdTimestamp: 0,
                updatedAt: new Date(0),
                updatedTimestamp: 0,
                createdBy: undefined,
            };
            this.addTheme(themeWithMetadata);
        });

        this.setInitialTheme();
        this.logger.debug("Default themes loaded");
    }

    addTheme(theme: APITheme) {
        if (this.themes.find((t) => t.id === theme.id)) {
            this.logger.warn(`Theme ${theme.id} already exists.`);
            return;
        }

        let themeToMergedWith;
        if (theme.type === "light") themeToMergedWith = baseLightTheme;
        else themeToMergedWith = baseDarkTheme;

        const newTheme = {
            ...themeToMergedWith,
            ...theme,
            typography: {
                ...themeToMergedWith.typography,
                ...theme.typography,
                colors: {
                    ...themeToMergedWith.typography.colors,
                    ...theme.typography?.colors,
                },
            },
        };

        this.themes = [...this.themes, newTheme];
    }

    updateTheme(theme: APITheme) {
        const existingTheme = this.themes.find((t) => t.id === theme.id);
        if (!existingTheme) {
            this.logger.warn(`Theme ${theme.id} does not exist.`);
            return;
        }

        const updatedTheme = {
            ...existingTheme,
            ...theme,
            typography: {
                ...existingTheme.typography,
                ...theme.typography,
                colors: {
                    ...existingTheme.typography.colors,
                    ...theme.typography?.colors,
                },
            },
        };

        this.themes = this.themes.map((t) =>
            t.id === theme.id ? updatedTheme : t,
        );
    }

    removeTheme(themeId: string) {
        if (!this.themes.find((t) => t.id === themeId)) {
            this.logger.warn(`Theme ${themeId} does not exist.`);
            return;
        }

        this.themes = this.themes.filter((t) => t.id !== themeId);
    }

    loadUserThemes(user: APIUser) {
        // Load user-specific themes
        const userThemes = user.themes ?? [];
        userThemes.forEach((theme) => this.addTheme(theme));
        this.logger.debug("User themes loaded");
    }

    saveDraft(theme: ThemeDraft) {
        if (isSSR) return;
        this.themeDrafts.push(theme);
    }

    deleteDraft(theme: ThemeDraft) {
        if (isSSR) return;
        this.themeDrafts = this.themeDrafts.filter(
            (t) => t.name !== theme.name,
        );
    }
}
