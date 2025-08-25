import { ModalRoot } from "@components/ModalRoot";
import type { ModalProps } from "@mutualzz/ui";
import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from "react";

interface ModalContextProps {
    open: boolean;
    activeId: string | null;
    modalContent: ReactNode;

    openModal: (
        id: string,
        children: ReactNode,
        modalProps?: Partial<ModalProps>,
    ) => void;
    closeModal: () => void;
    isModalOpen: (id: string) => boolean;

    modalProps: Partial<ModalProps>;
}

const ModalContext = createContext<ModalContextProps>({
    open: false,
    activeId: null,
    modalContent: null,
    openModal: () => {
        return;
    },
    closeModal: () => {
        return;
    },
    isModalOpen: () => false,
    modalProps: {},
});

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [modalContent, setModalContent] = useState<ReactNode>(null);
    const [modalProps, setModalProps] = useState<Partial<ModalProps>>({
        layout: "center",
    });

    const openModal = useCallback(
        (id: string, content: ReactNode, props: Partial<ModalProps> = {}) => {
            if (activeId) closeModal();

            setActiveId(id);
            setModalContent(content);
            setModalProps({
                layout: "center",
                ...props,
            });
        },
        [activeId],
    );

    const closeModal = useCallback(() => {
        setActiveId(null);
        setModalContent(null);
        setModalProps({ layout: "center" });
    }, []);

    const isModalOpen = useCallback(
        (id: string) => {
            return activeId === id;
        },
        [activeId],
    );

    const contextValue: ModalContextProps = {
        open: activeId !== null,
        activeId,
        modalContent,
        openModal,
        closeModal,
        isModalOpen,
        modalProps,
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
