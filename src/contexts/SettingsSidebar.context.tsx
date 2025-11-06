import {
    createContext,
    useContext,
    useState,
    type PropsWithChildren,
} from "react";

export type SettingsSidebarPage = "my-account" | "profile" | "appearance";
export type SettingsSidebarCategories = "user-settings" | "app-settings";

interface SettingsSidebarContextProps {
    currentPage: SettingsSidebarPage;
    currentCategory: SettingsSidebarCategories;
    setCurrentPage: (page: SettingsSidebarPage) => void;
    setCurrentCategory: (category: SettingsSidebarCategories) => void;
}

const SettingsSidebarContext = createContext<SettingsSidebarContextProps>({
    currentPage: "my-account",
    currentCategory: "user-settings",
    setCurrentPage: () => {
        return;
    },
    setCurrentCategory: () => {
        return;
    },
});

export const SettingsSidebarProvider = ({ children }: PropsWithChildren) => {
    const [currentPage, setCurrentPage] =
        useState<SettingsSidebarPage>("profile");

    const [currentCategory, setCurrentCategory] =
        useState<SettingsSidebarCategories>("user-settings");

    return (
        <SettingsSidebarContext.Provider
            value={{
                currentPage,
                setCurrentPage,
                currentCategory,
                setCurrentCategory,
            }}
        >
            {children}
        </SettingsSidebarContext.Provider>
    );
};

export function useSettingsSidebar() {
    const ctx = useContext(SettingsSidebarContext);
    if (!ctx)
        throw new Error(
            "useUserSidebar must be used within a UserSidebarProvider",
        );
    return ctx;
}
