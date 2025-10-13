import type { MzTheme } from "@app-types/theme";
import { Logger } from "@logger";
import type { APITheme, APIUser } from "@mutualzz/types";
import {
    baseDarkTheme,
    baseLightTheme,
    type ThemeStyle,
    type ThemeType,
} from "@mutualzz/ui-core";
import { themes as defaultThemes } from "@themes/index";
import { isSSR } from "@utils/index";
import { makeAutoObservable } from "mobx";
import { makePersistable } from "mobx-persist-store";

export class ThemeStore {
    private readonly logger = new Logger({
        tag: "ThemeStore",
    });

    themes: MzTheme[] = [];

    currentTheme: string | null = null;
    currentType: ThemeType = "system";
    currentStyle: ThemeStyle = "normal";

    defaultThemesLoaded = false;
    userThemesLoaded = false;

    constructor() {
        makeAutoObservable(this);

        if (isSSR) return;
        makePersistable(this, {
            name: "ThemeStore",
            properties: ["currentTheme", "currentStyle", "currentType"],
            storage: localStorage,
        });
    }

    setCurrentTheme(themeId: string | null) {
        this.currentTheme = themeId;
    }

    setCurrentType(type: ThemeType) {
        this.currentType = type;
    }

    setCurrentStyle(style: ThemeStyle) {
        this.currentStyle = style;
    }

    reset() {
        const defaultThemeIds = defaultThemes.map((t) => t.id);
        this.themes = this.themes.filter((t) => defaultThemeIds.includes(t.id));
        this.userThemesLoaded = false;
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
            this.addTheme(themeWithMetadata as any);
        });

        this.defaultThemesLoaded = true;
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

    loadThemes() {
        this.loadDefaultThemes();
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
        const userThemes = user.themes ?? [];
        if (userThemes.length === 0) {
            this.logger.debug("No user themes found");
            this.userThemesLoaded = true; // Set to true even if none found
            return;
        }
        userThemes.forEach((theme) => this.addTheme(theme));
        this.userThemesLoaded = true;
        this.logger.debug("User themes loaded");
    }
}
