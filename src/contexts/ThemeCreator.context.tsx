/* eslint-disable @typescript-eslint/no-empty-function */
import type { Theme as MzTheme } from "@emotion/react";
import { usePrefersDark } from "@hooks/usePrefersDark";
import type { APITheme } from "@mutualzz/types";
import {
    baseDarkTheme,
    baseLightTheme,
    type ThemeStyle,
    type ThemeType,
} from "@mutualzz/ui-core";
import { useTheme } from "@mutualzz/ui-web";
import { Theme } from "@stores/objects/Theme";
import { adaptColors } from "@utils/adaptation";
import { observer } from "mobx-react-lite";
import {
    createContext,
    type PropsWithChildren,
    useContext,
    useMemo,
    useState,
} from "react";

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

interface ThemeCreatorContextProps {
    // Page management
    currentCategory: ThemeCreatorCategory;
    setCurrentCategory: (category: ThemeCreatorCategory) => void;
    currentPage: ThemeCreatorPage;
    setCurrentPage: (page: ThemeCreatorPage) => void;

    // Value management
    values: APITheme;
    setValues: (values: Partial<APITheme>) => void;
    loadValues: (theme: APITheme) => void;
    resetValues: () => void;

    // Filters
    filters: ThemeCreatorFilter[];
    addFilter: (filter: ThemeCreatorFilter) => void;
    removeFilter: (filter: ThemeCreatorFilter) => void;
    setFilters: (filters: ThemeCreatorFilter[]) => void;
    resetFilters: () => void;
    filter: (themes: Theme[]) => Theme[];

    // Loaded Type
    loadedType: ThemeCreatorLoadedType;
    setLoadedType: (type: ThemeCreatorLoadedType) => void;

    errors: ApiErrors;
    setErrors: (errors: ApiErrors) => void;

    // Preview
    themeBeforePreview: Theme | APITheme | null;
    inPreview: boolean;
    startPreview: () => void;
    stopPreview: () => void;

    userInteracted: boolean;
    nameEmpty: boolean;
}

const ThemeCreatorContext = createContext<ThemeCreatorContextProps>({
    currentCategory: "general",
    setCurrentCategory: () => {},
    currentPage: "details",
    setCurrentPage: () => {},

    values: baseDarkTheme,
    setValues: () => {},
    loadValues: () => {},
    resetValues: () => {},

    loadedType: "default",
    setLoadedType: () => {},

    filters: [],
    addFilter: () => {},
    removeFilter: () => {},
    setFilters: () => {},
    resetFilters: () => {},
    filter: () => [],

    errors: {},
    setErrors: () => {},

    themeBeforePreview: null,
    inPreview: false,
    startPreview: () => {},
    stopPreview: () => {},

    userInteracted: false,
    nameEmpty: true,
});

export const ThemeCreatorProvider = observer(
    ({ children }: PropsWithChildren) => {
        const { theme: currentTheme, changeTheme } = useTheme();
        const prefersDark = usePrefersDark();
        const [currentPage, setCurrentPage] =
            useState<ThemeCreatorPage>("details");
        const [currentCategory, setCurrentCategory] =
            useState<ThemeCreatorCategory>("general");
        const [values, _setValues] = useState<APITheme>(() => {
            const theme = prefersDark ? baseDarkTheme : baseLightTheme;

            return { ...theme, name: "", description: "" };
        });
        const [inPreview, setInPreview] = useState(false);
        const [themeBeforePreview, setThemeBeforePreview] =
            useState<MzTheme | null>(null);

        const [userInteracted, setUserInteracted] = useState(false);

        const [loadedType, setLoadedType] =
            useState<ThemeCreatorLoadedType>("default");

        const nameEmpty = useMemo(
            () => values.name.trim() === "",
            [values.name],
        );

        const [filters, setFilters] = useState<ThemeCreatorFilter[]>([]);

        const addFilter = (value: ThemeCreatorFilter) => {
            setFilters((prev) => Array.from(new Set([...prev, value])));
        };

        const removeFilter = (value: ThemeCreatorFilter) => {
            setFilters((prev) => prev.filter((filter) => filter !== value));
        };

        const resetFilters = () => {
            setFilters([]);
        };

        const filter = (themes: Theme[]) => {
            if (filters.length === 0) return themes;

            return themes.filter((theme) => {
                return filters.every((filter) => {
                    return (
                        theme.type === filter ||
                        theme.style === filter ||
                        (filter === "adaptive" && theme.adaptive)
                    );
                });
            });
        };

        const [errors, setErrors] = useState<ApiErrors>({});

        const startPreview = () => {
            if (inPreview) return;
            let previewTheme = values;
            if (values.adaptive)
                previewTheme = Theme.serialize({
                    ...values,
                    ...(adaptColors({
                        baseColor: values.colors.background,
                        primaryColor: values.colors.primary,
                        primaryText: values.typography.colors.primary,
                    }) as Partial<APITheme>),
                });

            if (!themeBeforePreview) setThemeBeforePreview(currentTheme);
            changeTheme(Theme.toEmotion(previewTheme));
            setInPreview(true);
        };

        const stopPreview = () => {
            if (!inPreview) return;
            if (themeBeforePreview)
                changeTheme(Theme.toEmotion(themeBeforePreview));

            setThemeBeforePreview(null);
            setInPreview(false);
        };

        const setValues = (newValues: Partial<APITheme>) => {
            _setValues(
                Theme.serialize({
                    ...values,
                    ...newValues,
                }),
            );
            if (!userInteracted) setUserInteracted(true);
            if (loadedType === "default") setLoadedType("custom");
        };

        const loadValues = (theme: APITheme) => {
            if (loadedType === "default") {
                theme = {
                    ...theme,
                    id: "",
                    name: "",
                    description: "",
                };
                _setValues(Theme.serialize(theme));
                if (userInteracted) setUserInteracted(false);
                return;
            }

            _setValues(Theme.serialize(theme));
            if (!userInteracted) setUserInteracted(true);
        };

        const resetValues = () => {
            const defaultValues = prefersDark ? baseDarkTheme : baseLightTheme;
            _setValues(
                Theme.serialize({
                    ...defaultValues,
                    id: "",
                    name: "",
                    description: "",
                }),
            );
            setLoadedType("default");
            setErrors({});
            setCurrentCategory("general");
            setCurrentPage("details");
            if (userInteracted) setUserInteracted(false);
        };

        return (
            <ThemeCreatorContext.Provider
                value={{
                    currentCategory,
                    setCurrentCategory,
                    currentPage,
                    setCurrentPage,
                    values,
                    setValues,
                    loadValues,
                    resetValues,
                    loadedType,
                    setLoadedType,
                    filters,
                    addFilter,
                    removeFilter,
                    setFilters,
                    resetFilters,
                    filter,
                    errors,
                    setErrors,
                    themeBeforePreview,
                    inPreview,
                    startPreview,
                    stopPreview,
                    userInteracted,
                    nameEmpty,
                }}
            >
                {children}
            </ThemeCreatorContext.Provider>
        );
    },
);

export function useThemeCreator() {
    const ctx = useContext(ThemeCreatorContext);
    if (!ctx)
        throw new Error(
            "useThemeCreator must be used within a ThemeCreatorProvider",
        );
    return ctx;
}
