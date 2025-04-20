import { CssVarsProvider, useColorScheme, type Theme } from "@mui/joy/styles";
import {
    createContext,
    useEffect,
    useMemo,
    useState,
    type PropsWithChildren,
} from "react";
import { themes, type ThemeName } from "../themes";

export const ThemeContext = createContext<{
    themeName: ThemeName;
    setThemeName: (key: ThemeName) => void;
    theme: Theme;
}>({
    themeName: "baseDark",
    setThemeName: () => {},
    theme: themes["baseDark"],
});

export const ThemeProvider = ({ children }: PropsWithChildren) => {
    const [themeName, setThemeName] = useState<ThemeName>("baseDark");

    const theme = useMemo(() => themes[themeName], [themeName]) as Theme;

    return (
        <ThemeContext.Provider
            value={{
                themeName,
                setThemeName,
                theme,
            }}
        >
            <CssVarsProvider
                theme={theme}
                defaultMode="system"
                modeStorageKey="mz-mode"
            >
                <ModeBridge theme={theme} />
                {children}
            </CssVarsProvider>
        </ThemeContext.Provider>
    );
};

const ModeBridge = ({ theme }: { theme: Theme }) => {
    const { mode, setMode } = useColorScheme();

    useEffect(() => {
        console.log(theme);
        if ("dark" in theme && mode !== "dark") {
            setMode("dark");
        }

        if ("light" in theme && mode !== "light") {
            setMode("light");
        }
    }, [mode, setMode, theme]);

    return null;
};
