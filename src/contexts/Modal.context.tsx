import { ModalRoot } from "@components/ModalRoot";
import type { ModalProps } from "@mutualzz/ui";
import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from "react";

interface ModalStackItem {
    id: string;
    content: ReactNode;
    props?: Partial<ModalProps>;
}

interface ModalContextProps {
    modals: ModalStackItem[];
    openModal: (
        id: string,
        children: ReactNode,
        modalProps?: Partial<ModalProps>,
    ) => void;
    closeModal: (id?: string) => void;
    isModalOpen: (id: string) => boolean;
}

const ModalContext = createContext<ModalContextProps>({
    modals: [],
    openModal: () => {
        return;
    },
    closeModal: () => {
        return;
    },
    isModalOpen: () => false,
});

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [modals, setModals] = useState<ModalStackItem[]>([]);

    const openModal = useCallback(
        (id: string, content: ReactNode, props: Partial<ModalProps> = {}) => {
            setModals((prev) => [
                ...prev,
                {
                    id,
                    content,
                    props: { layout: "center", ...props },
                },
            ]);
        },
        [],
    );

    const closeModal = useCallback((id?: string) => {
        setModals(
            (prev) =>
                id
                    ? prev.filter((modal) => modal.id !== id)
                    : prev.slice(0, -1), // close topmost if no id
        );
    }, []);

    const isModalOpen = useCallback(
        (id: string) => modals.some((modal) => modal.id === id),
        [modals],
    );

    const contextValue: ModalContextProps = {
        modals,
        openModal,
        closeModal,
        isModalOpen,
    };

    return (
        <ModalContext.Provider value={contextValue}>
            {children}
            <ModalRoot />
        </ModalContext.Provider>
    );
};

export function useModal() {
    const ctx = useContext(ModalContext);
    if (!ctx)
        throw new Error("useModalContext must be used within a ModalProvider");
    return ctx;
}
