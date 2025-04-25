import { ThemeProvider as EmotionThemeProvder } from "@emotion/react";
import { themesObj, type Themes } from "@themes/index";
import {
    createContext,
    useMemo,
    useState,
    type PropsWithChildren,
} from "react";
import type { Theme } from "./types";

export const ThemeContext = createContext<{
    theme: Theme;
    changeTheme: (theme: Themes) => void;
}>({
    theme: themesObj["baseDark"],
    changeTheme: (_theme: Themes) => {},
});

export const ThemeProvider = ({ children }: PropsWithChildren) => {
    const [theme, setTheme] = useState<Themes>("baseDark");

    const changeTheme = (theme: Themes) => {
        setTheme(theme);
    };

    const themeObject = themesObj[theme];

    const value = useMemo(
        () => ({
            theme: themeObject,
            changeTheme,
        }),
        [theme],
    );

    return (
        <ThemeContext.Provider value={value}>
            <EmotionThemeProvder theme={themeObject}>
                {children}
            </EmotionThemeProvder>
        </ThemeContext.Provider>
    );
};
