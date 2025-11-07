import { useModal } from "@contexts/Modal.context";
import { Modal, useTheme } from "@mutualzz/ui-web";
import { observer } from "mobx-react";

export const ModalRoot = observer(() => {
    const { theme } = useTheme();
    const { modals, closeModal } = useModal();

    if (modals.length === 0) return null;

    return (
        <>
            {modals.map((modal, idx) => (
                <Modal
                    {...modal.props}
                    key={modal.id}
                    open={true}
                    onClose={() => closeModal(modal.id)}
                    css={{
                        zIndex: theme.zIndex.modal + idx,
                        ...modal.props?.css,
                    }}
                >
                    {modal.content}
                </Modal>
            ))}
        </>
    );
});
