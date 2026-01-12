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
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import {
    createContext,
    useContext,
    useState,
    type PropsWithChildren,
} from "react";

type ApiErrors = Record<string, string>;

export type ThemeCreatorCategory = "general" | "colors";
export type ThemeCreatorPage = "details" | "base" | "typography";
export type ThemeSelectedType = "default" | "draft" | "custom";

interface ThemeCreatorContextProps {
    // Page management
    currentCategory: ThemeCreatorCategory;
    setCurrentCategory: (category: ThemeCreatorCategory) => void;
    currentPage: ThemeCreatorPage;
    setCurrentPage: (page: ThemeCreatorPage) => void;

    // Value management
    values: MzTheme | APITheme;
    setValues: (values: Partial<MzTheme | APITheme>) => void;
    resetValues: () => void;

    // Preview
    preview: boolean;
    setPreview: (preview: boolean) => void;

    selectedType: ThemeSelectedType;
    setSelectedType: (type: ThemeSelectedType) => void;

    errors: ApiErrors;
    setErrors: (errors: ApiErrors) => void;

    currentType: ThemeType;
    setCurrentType: (type: ThemeType) => void;

    currentStyle: ThemeStyle;
    setCurrentStyle: (style: ThemeStyle) => void;
}

const ThemeCreatorContext = createContext<ThemeCreatorContextProps>({
    currentCategory: "general",
    setCurrentCategory: () => {
        return;
    },
    currentPage: "details",
    setCurrentPage: () => {
        return;
    },

    values: baseDarkTheme,
    setValues: () => {
        return;
    },
    resetValues: () => {
        return;
    },

    preview: false,
    setPreview: () => {
        return;
    },

    selectedType: "default",
    setSelectedType: () => {
        return;
    },

    errors: {},
    setErrors: () => {
        return;
    },
    currentType: "dark",
    setCurrentType: () => {
        return;
    },
    currentStyle: "normal",
    setCurrentStyle: () => {
        return;
    },
});

export const ThemeCreatorProvider = observer(
    ({ children }: PropsWithChildren) => {
        const { changeTheme } = useTheme();
        const prefersDark = usePrefersDark();
        const [currentPage, setCurrentPage] =
            useState<ThemeCreatorPage>("details");
        const [currentCategory, setCurrentCategory] =
            useState<ThemeCreatorCategory>("general");
        const [values, _setValues] = useState<MzTheme | APITheme>(() => {
            const theme = prefersDark ? baseDarkTheme : baseLightTheme;
            delete (theme as any).name;
            delete theme.description;

            return toJS(Theme.toEmotionTheme(theme));
        });
        const [preview, _setPreview] = useState<boolean>(false);
        const [selectedType, setSelectedType] =
            useState<ThemeSelectedType>("default");
        const [currentType, setCurrentType] = useState<ThemeType>("dark");
        const [currentStyle, setCurrentStyle] = useState<ThemeStyle>("normal");

        const [errors, setErrors] = useState<ApiErrors>({});

        const setPreview = (preview: boolean) => {
            if (preview) changeTheme(toJS(Theme.toEmotionTheme(values)));
            _setPreview(preview);
        };

        const setValues = (newValues: Partial<MzTheme | APITheme>) => {
            if (selectedType === "default") {
                newValues.name = "";
                newValues.description = "";
            }
            const updatedValues: MzTheme | APITheme = toJS({
                ...values,
                ...newValues,
            });

            setCurrentType(newValues.type || currentType);
            setCurrentStyle(newValues.style || currentStyle);

            const finalTheme = Theme.toEmotionTheme(updatedValues);

            _setValues(finalTheme);
            if (preview) changeTheme(finalTheme);
        };

        const resetValues = () => {
            const defaultValues = prefersDark ? baseDarkTheme : baseLightTheme;
            _setValues(defaultValues);
            setSelectedType("default");
            setErrors({});
            setCurrentType(prefersDark ? "dark" : "light");
            setCurrentStyle("normal");
            if (preview) changeTheme(defaultValues);
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
                    preview,
                    setPreview,
                    resetValues,
                    selectedType,
                    setSelectedType,
                    errors,
                    setErrors,
                    currentType,
                    setCurrentType,
                    currentStyle,
                    setCurrentStyle,
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
