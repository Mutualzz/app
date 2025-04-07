import { ThemeProvider as EmotionThemeProvder } from "@emotion/react";
import {
    createContext,
    PropsWithChildren,
    useContext,
    useMemo,
    useState,
} from "react";
import { AllThemes, themes } from "../themes";
import { Theme } from "@emotion/react";

const ThemeContext = createContext<{
    theme: Theme;
    changeTheme: (theme: AllThemes) => void;
}>({
    theme: themes["baseDark"],
    changeTheme: (_theme: AllThemes) => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: PropsWithChildren) => {
    const [theme, setTheme] = useState<AllThemes>("baseDark");

    const changeTheme = (theme: AllThemes) => {
        setTheme(theme);
    };

    const themeObject = themes[theme as keyof typeof themes];

    const value = useMemo(
        () => ({
            theme: themeObject,
            changeTheme,
        }),
        [theme]
    );

    return (
        <ThemeContext.Provider value={value}>
            <EmotionThemeProvder theme={themeObject}>
                {children}
            </EmotionThemeProvder>
        </ThemeContext.Provider>
    );
};
