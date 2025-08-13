import { useModal } from "@contexts/Modal.context";
import { Modal } from "@mutualzz/ui";

export const ModalRoot = () => {
    const { activeId, modalContent, closeModal, modalLayout } = useModal();

    return (
        <Modal open={!!activeId} onClose={closeModal} layout={modalLayout}>
            {modalContent}
        </Modal>
    );
};
