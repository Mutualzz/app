import { CssVarsProvider, type Theme } from "@mui/joy/styles";
import {
    createContext,
    type PropsWithChildren,
    useMemo,
    useState,
} from "react";
import { type AllThemes, themes } from "../themes";

export const ThemeContext = createContext<{
    theme: Theme;
    changeTheme: (theme: AllThemes) => void;
}>({
    theme: themes["base"],
    changeTheme: (_theme: AllThemes) => {},
});

export const ThemeProvider = ({ children }: PropsWithChildren) => {
    const [theme, setTheme] = useState<AllThemes>("base");

    const changeTheme = (theme: AllThemes) => {
        setTheme(theme);
    };

    const themeObject = themes[theme];

    const value = useMemo(
        () => ({
            theme: themeObject,
            changeTheme,
        }),
        [theme],
    );

    return (
        <ThemeContext.Provider value={value}>
            <CssVarsProvider theme={themeObject}>{children}</CssVarsProvider>
        </ThemeContext.Provider>
    );
};
