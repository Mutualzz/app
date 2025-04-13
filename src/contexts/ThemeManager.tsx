import { CssVarsProvider, type Theme } from "@mui/joy/styles";
import {
    createContext,
    type PropsWithChildren,
    useMemo,
    useState,
} from "react";
import { themes } from "../themes";

export const ThemeContext = createContext<{
    theme: Theme;
    changeTheme: (theme: Theme) => void;
}>({
    theme: themes["base"],
    changeTheme: (_theme: Theme) => {},
});

export const ThemeProvider = ({ children }: PropsWithChildren) => {
    const [theme, setTheme] = useState<Theme>(themes["base"]);

    const changeTheme = (theme: Theme) => {
        setTheme(theme);
    };

    const value = useMemo(
        () => ({
            theme,
            changeTheme,
        }),
        [theme],
    );

    return (
        <ThemeContext.Provider value={value}>
            <CssVarsProvider theme={theme}>{children}</CssVarsProvider>
        </ThemeContext.Provider>
    );
};
