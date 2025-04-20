import { CssVarsProvider, useColorScheme, type Theme } from "@mui/joy/styles";
import type { Mode } from "@mui/system/cssVars/useCurrentColorScheme";
import {
    createContext,
    useMemo,
    useState,
    type PropsWithChildren,
} from "react";
import { themes, type ThemeName } from "../themes";

export const ThemeContext = createContext<{
    themeName: ThemeName;
    setThemeName: (key: ThemeName) => void;
    mode: Mode;
    setMode: (mode: Mode) => void;
    theme: Theme;
}>({
    themeName: "base",
    setThemeName: () => {},
    mode: "system",
    setMode: () => {},
    theme: themes["base"],
});

export const ThemeProvider = ({ children }: PropsWithChildren) => {
    const [themeName, setThemeName] = useState<ThemeName>("base");
    const [modeState, setModeState] = useState<Mode>("system");

    const theme = useMemo(() => themes[themeName], [themeName]);

    return (
        <ThemeContext.Provider
            value={{
                themeName,
                setThemeName,
                mode: modeState,
                setMode: setModeState,
                theme,
            }}
        >
            <CssVarsProvider
                theme={theme}
                defaultMode="system"
                modeStorageKey="mz-mode"
            >
                <ModeBridge mode={modeState} />
                {children}
            </CssVarsProvider>
        </ThemeContext.Provider>
    );
};

// Sets the actual mode Joy uses
const ModeBridge = ({ mode }: { mode: Mode }) => {
    const { setMode } = useColorScheme();
    setMode(mode);
    return null;
};
