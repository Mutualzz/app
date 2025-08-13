import { ModalRoot } from "@components/ModalRoot";
import { createContext, useContext, useState, type ReactNode } from "react";

interface ModalContextProps {
    activeId: string | null;
    openModal: (
        id: string,
        children?: ReactNode,
        layout?: "center" | "fullscreen",
    ) => void;
    closeModal: () => void;
    modalContent?: ReactNode;
    modalLayout?: "center" | "fullscreen";
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [modalContent, setModalContent] = useState<ReactNode>(null);
    const [modalLayout, setModalLayout] = useState<"center" | "fullscreen">(
        "center",
    );

    const openModal = (
        id: string,
        content: ReactNode,
        layout: "center" | "fullscreen" = "center",
    ) => {
        setActiveId(id);
        setModalContent(content);
        setModalLayout(layout);
    };

    const closeModal = () => {
        setActiveId(null);
        setModalContent(null);
        setModalLayout("center");
    };

    return (
        <ModalContext.Provider
            value={{
                activeId,
                modalContent,
                openModal,
                closeModal,
                modalLayout,
            }}
        >
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
