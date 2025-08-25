import {
    createContext,
    useContext,
    useState,
    type PropsWithChildren,
} from "react";

export type UserSidebarPage = "my-account" | "profile";

interface UserSidebarContextProps {
    currentPage: UserSidebarPage;
    setCurrentPage: (page: UserSidebarPage) => void;
}

const UserSidebarContext = createContext<UserSidebarContextProps>({
    currentPage: "my-account",
    setCurrentPage: () => {
        return;
    },
});

export const UserSidebarProvider = ({ children }: PropsWithChildren) => {
    const [currentPage, setCurrentPage] = useState<UserSidebarPage>("profile");

    return (
        <UserSidebarContext.Provider value={{ currentPage, setCurrentPage }}>
            {children}
        </UserSidebarContext.Provider>
    );
};

export function useUserSidebar() {
    const ctx = useContext(UserSidebarContext);
    if (!ctx)
        throw new Error(
            "useUserSidebar must be used within a UserSidebarProvider",
        );
    return ctx;
}
