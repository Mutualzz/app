import type { Arch, Family, OsType, Platform } from "@tauri-apps/plugin-os";
import { observer } from "mobx-react-lite";
import {
    createContext,
    useContext,
    useState,
    type PropsWithChildren,
} from "react";

interface OsInfo {
    platform: Platform | "unknown";
    type: OsType | "unknown";
    family: Family | "unknown";
    arch: Arch | "unknown";
    locale: string | null;
}

interface DesktopShellContextProps {
    os: OsInfo;

    setOsInfo: (info: Partial<OsInfo>) => void;
}

const DesktopShellContext = createContext<DesktopShellContextProps>({
    os: {
        platform: "unknown",
        type: "unknown",
        family: "unknown",
        arch: "unknown",
        locale: null,
    },

    setOsInfo: () => {
        return;
    },
});

export const DesktopShellProvider = observer(
    ({ children }: PropsWithChildren) => {
        const [osInfo, setOsInfo] = useState<OsInfo>({
            platform: "unknown",
            type: "unknown",
            family: "unknown",
            arch: "unknown",
            locale: null,
        });

        const setOsInfoInternal = (info: Partial<OsInfo>) => {
            setOsInfo((prev) => ({ ...prev, info }));
        };

        const contextValue: DesktopShellContextProps = {
            os: osInfo,
            setOsInfo: setOsInfoInternal,
        };

        return (
            <DesktopShellContext.Provider value={contextValue}>
                {children}
            </DesktopShellContext.Provider>
        );
    },
);

export function useDesktopShell() {
    const ctx = useContext(DesktopShellContext);
    if (!ctx)
        throw new Error(
            "useDesktopShell must be used within a DesktopShellProvider",
        );
    return ctx;
}
