import { observer } from "mobx-react-lite";
import {
    createContext,
    useContext,
    useState,
    type PropsWithChildren,
} from "react";

export type SpaceSettingsPage = "invites" | "profile";
export type SpaceSettingsCategories = "people" | "general";

interface SpaceSettingsContextProps {
    currentPage: SpaceSettingsPage;
    currentCategory: SpaceSettingsCategories;
    setCurrentPage: (page: SpaceSettingsPage) => void;
    setCurrentCategory: (category: SpaceSettingsCategories) => void;
}

const SpaceSettingsContext = createContext<SpaceSettingsContextProps>({
    currentPage: "profile",
    currentCategory: "general",
    setCurrentPage: () => {
        return;
    },
    setCurrentCategory: () => {
        return;
    },
});

export const SpaceSettingsProvider = observer(
    ({ children }: PropsWithChildren) => {
        const [currentPage, setCurrentPage] =
            useState<SpaceSettingsPage>("profile");

        const [currentCategory, setCurrentCategory] =
            useState<SpaceSettingsCategories>("general");

        return (
            <SpaceSettingsContext.Provider
                value={{
                    currentPage,
                    setCurrentPage,
                    currentCategory,
                    setCurrentCategory,
                }}
            >
                {children}
            </SpaceSettingsContext.Provider>
        );
    },
);

export function useSpaceSettings() {
    const ctx = useContext(SpaceSettingsContext);
    if (!ctx)
        throw new Error(
            "useSpaceSettings must be used within a SettingsSidebarProvider",
        );
    return ctx;
}
