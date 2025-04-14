import { CssVarsProvider, type Theme } from "@mui/joy/styles";
import type { Mode } from "@mui/system/cssVars/useCurrentColorScheme";
import {
    createContext,
    useMemo,
    useState,
    type PropsWithChildren,
} from "react";
import { themes } from "../themes";

export const ThemeContext = createContext<{
    mode: Mode;
    setMode: (mode: Mode | null) => void;
    theme: Theme;
    setTheme: (theme: Theme | null) => void;
}>({
    mode: "system",
    setMode: (_mode?: Mode | null) => {},
    theme: themes["base"],
    setTheme: (_theme: Theme | null) => {},
});

export const ThemeProvider = ({ children }: PropsWithChildren) => {
    const [theme, changeTheme] = useState<Theme>(themes["base"]);
    const [mode, changeMode] = useState<Mode>("system");

    const setMode = (mode: Mode | null = "system") => {
        if (!mode) return changeMode("system");
        changeMode(mode);
    };

    const setTheme = (theme: Theme | null = themes["base"]) => {
        if (!theme) return changeTheme(themes["base"]);
        changeTheme(theme);
    };

    const value = useMemo(
        () => ({
            mode,
            setMode,
            theme,
            setTheme,
        }),
        [mode, theme],
    );

    return (
        <ThemeContext.Provider value={value}>
            <CssVarsProvider defaultMode={mode} theme={theme}>
                {children}
            </CssVarsProvider>
        </ThemeContext.Provider>
    );
};
