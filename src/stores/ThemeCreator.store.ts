import { baseDarkTheme, baseLightTheme, type ThemeStyle, type ThemeType, } from "@mutualzz/ui-core";
import type { APITheme } from "@mutualzz/types";
import type { Theme as MzTheme } from "@emotion/react";
import { type IObservableArray, makeAutoObservable, observable } from "mobx";
import { Theme } from "@stores/objects/Theme";
import { adaptColors } from "@utils/adaptation.ts";
import { usePrefersDark } from "@hooks/usePrefersDark.ts";

type ApiErrors = Record<string, string>;

export type ThemeCreatorCategory = "general" | "colors";
export type ThemeCreatorPage =
    | "details"
    | "base"
    | "feedback"
    | "typography"
    | "adaptive";

export type ThemeCreatorLoadedType = "default" | "draft" | "custom";

export type ThemeCreatorFilter = ThemeType | ThemeStyle | "adaptive";

// TODO: Finish implementing the store from the old context
export class ThemeCreatorStore {
    values: APITheme;
    inPreview = false;
    themeBeforePreview: MzTheme | null = null;

    filters: IObservableArray<ThemeCreatorFilter> = observable.array([]);
    loadedType: ThemeCreatorLoadedType = "default";
    userInteracted = false;
    errors: ApiErrors = {};

    constructor() {
        const prefersDark = usePrefersDark();
        this.values = {
            ...(prefersDark ? baseDarkTheme : baseLightTheme),
            id: "",
            name: "",
            description: "",
        };
        makeAutoObservable(this);
    }

    setValues(newValues: Partial<APITheme>) {
        this.values = Theme.serialize({ ...this.values, ...newValues });
        this.userInteracted = true;
        if (this.loadedType === "default") this.loadedType = "custom";
    }

    loadValues(theme: APITheme) {
        if (this.loadedType === "default") {
            const t = { ...theme, id: "", name: "", description: "" };
            this.values = Theme.serialize(t);
            this.userInteracted = false;
            return;
        }
        this.values = Theme.serialize(theme);
        this.userInteracted = true;
    }

    addFilter(filter: ThemeCreatorFilter) {
        if (!this.filters.includes(filter)) this.filters.push(filter);
    }

    removeFilter(filter: ThemeCreatorFilter) {
        if (!this.filters.includes(filter)) return;
        this.filters.remove(filter);
    }

    resetValues() {
        this.filters = observable.array([]);
    }

    setLoadedType(type: ThemeCreatorLoadedType) {
        this.loadedType = type;
    }

    startPreview(
        changeTheme: (theme: MzTheme) => void,
        currentTheme?: MzTheme,
    ) {
        if (this.inPreview) return;
        let previewTheme = this.values;
        if (this.values.adaptive) {
            previewTheme = Theme.serialize({
                ...this.values,
                ...(adaptColors({
                    baseColor: this.values.colors.background,
                    primaryColor: this.values.colors.primary,
                    primaryText: this.values.typography.colors.primary,
                }) as Partial<APITheme>),
            });
        }

        if (!this.themeBeforePreview && currentTheme)
            this.themeBeforePreview = currentTheme;
        changeTheme(Theme.toEmotion(previewTheme));
        this.inPreview = true;
    }

    stopPreview(changeTheme: (theme: MzTheme) => void) {
        if (!this.inPreview) return;
        if (this.themeBeforePreview)
            changeTheme(Theme.toEmotion(this.themeBeforePreview));
        this.themeBeforePreview = null;
        this.inPreview = false;
    }
}
