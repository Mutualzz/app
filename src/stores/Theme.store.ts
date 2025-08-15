import type { MzTheme, ThemeDraft } from "@app-types/theme";
import { usePrefersDark } from "@hooks/usePrefersDark";
import { Logger } from "@logger";
import type { APITheme, APIUser } from "@mutualzz/types";
import { baseDarkTheme, baseLightTheme, type ThemeMode } from "@mutualzz/ui";
import { themes as defaultThemes } from "@themes/index";
import { isSSR } from "@utils/index";
import { makeAutoObservable } from "mobx";
import { makePersistable } from "mobx-persist-store";

export class ThemeStore {
    private readonly logger = new Logger({
        tag: "ThemeStore'",
    });

    themes: MzTheme[] = [];
    themeDrafts: ThemeDraft[] = [];

    currentTheme: string | null = null;
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
        this.currentTheme = theme?.id;
    }

    setInitialTheme() {
        if (!this.currentTheme && this.themes.length > 0) {
            // Set default theme based on current mode
            const prefersDark = usePrefersDark();

            let defaultTheme: MzTheme | undefined;

            const darkTheme = this.themes.find(
                (theme) => theme.id === "baseDark",
            );
            const lightTheme = this.themes.find(
                (theme) => theme.id === "baseLight",
            );

            switch (this.currentMode) {
                case "dark":
                    defaultTheme = darkTheme;
                    break;
                case "light":
                    defaultTheme = lightTheme;
                    break;
                case "system":
                default:
                    defaultTheme = prefersDark ? darkTheme : lightTheme;
                    break;
            }

            if (defaultTheme) this.currentTheme = defaultTheme.id;
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
