import {
    createContext,
    useContext,
    useState,
    type PropsWithChildren,
} from "react";

export type SpaceSettingsSidebarPage = "invites" | "profile";
export type SpaceSettingsSidebarCategories = "people" | "general";

interface SpaceSettingsSidebarContextProps {
    currentPage: SpaceSettingsSidebarPage;
    currentCategory: SpaceSettingsSidebarCategories;
    setCurrentPage: (page: SpaceSettingsSidebarPage) => void;
    setCurrentCategory: (category: SpaceSettingsSidebarCategories) => void;
}

const SpaceSettingsSidebarContext =
    createContext<SpaceSettingsSidebarContextProps>({
        currentPage: "profile",
        currentCategory: "general",
        setCurrentPage: () => {
            return;
        },
        setCurrentCategory: () => {
            return;
        },
    });

export const SpaceSettingsSidebarProvider = ({
    children,
}: PropsWithChildren) => {
    const [currentPage, setCurrentPage] =
        useState<SpaceSettingsSidebarPage>("profile");

    const [currentCategory, setCurrentCategory] =
        useState<SpaceSettingsSidebarCategories>("general");

    return (
        <SpaceSettingsSidebarContext.Provider
            value={{
                currentPage,
                setCurrentPage,
                currentCategory,
                setCurrentCategory,
            }}
        >
            {children}
        </SpaceSettingsSidebarContext.Provider>
    );
};

export function useSpaceSettingsSidebar() {
    const ctx = useContext(SpaceSettingsSidebarContext);
    if (!ctx)
        throw new Error(
            "useSettingsSidebar must be used within a SettingsSidebarProvider",
        );
    return ctx;
}
