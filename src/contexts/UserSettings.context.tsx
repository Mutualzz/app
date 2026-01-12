import { observer } from "mobx-react-lite";
import {
    createContext,
    useContext,
    useState,
    type PropsWithChildren,
} from "react";

export type UserSettingsPage = "my-account" | "profile" | "appearance";
export type UserSettingsCategories = "user-settings" | "app-settings";

interface UserSettingsContextProps {
    currentPage: UserSettingsPage;
    currentCategory: UserSettingsCategories;
    setCurrentPage: (page: UserSettingsPage) => void;
    setCurrentCategory: (category: UserSettingsCategories) => void;
}

const UserSettingsContext = createContext<UserSettingsContextProps>({
    currentPage: "my-account",
    currentCategory: "user-settings",
    setCurrentPage: () => {
        return;
    },
    setCurrentCategory: () => {
        return;
    },
});

export const UserSettingsProvider = observer(
    ({ children }: PropsWithChildren) => {
        const [currentPage, setCurrentPage] =
            useState<UserSettingsPage>("profile");
        const [currentCategory, setCurrentCategory] =
            useState<UserSettingsCategories>("user-settings");

        return (
            <UserSettingsContext.Provider
                value={{
                    currentPage,
                    setCurrentPage,
                    currentCategory,
                    setCurrentCategory,
                }}
            >
                {children}
            </UserSettingsContext.Provider>
        );
    },
);

export function useUserSettings() {
    const ctx = useContext(UserSettingsContext);
    if (!ctx)
        throw new Error(
            "useUserSettings must be used within a UserSettingsProvider",
        );
    return ctx;
}
