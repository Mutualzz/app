import { useModal } from "@contexts/Modal.context";
import { Modal } from "@mutualzz/ui";

export const ModalRoot = () => {
    const { open, modalContent, closeModal, modalProps } = useModal();

    if (!open || !modalContent) return null;

    return (
        <Modal open={open} onClose={closeModal} {...modalProps}>
            {modalContent}
        </Modal>
    );
};
