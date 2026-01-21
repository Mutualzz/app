import { useModal } from "@contexts/Modal.context";
import { Modal, useTheme } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";

export const ModalRoot = observer(() => {
    const { theme } = useTheme();
    const { modals, closeModal } = useModal();

    if (modals.length === 0) return null;

    const topIdx = modals.length - 1;

    return (
        <>
            {modals.map((modal, idx) => (
                <Modal
                    {...modal.props}
                    key={modal.id}
                    open={idx === topIdx}
                    disableEnforceFocus={idx !== topIdx}
                    disableAutoFocus={idx !== topIdx}
                    disableEscapeKeyDown={idx !== topIdx}
                    onClose={() => closeModal(modal.id)}
                    css={{
                        zIndex: theme.zIndex.modal + idx,
                        pointerEvents: idx === topIdx ? "auto" : "none",
                        ...modal.props?.css,
                    }}
                    aria-hidden={idx !== topIdx}
                    tabIndex={idx === topIdx ? 0 : -1}
                >
                    {modal.content}
                </Modal>
            ))}
        </>
    );
});
