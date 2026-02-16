import { useModal } from "@contexts/Modal.context.tsx";
import { Modal, useTheme } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";

export const ModalRoot = observer(() => {
    const { theme } = useTheme();
    const { modals, closeModal } = useModal();

    if (modals.length === 0) return null;

    const topIdx = modals.length - 1;

    return (
        <>
            {modals.map((modal, idx) => {
                const isTop = idx === topIdx;

                return (
                    <Modal
                        {...modal.props}
                        key={`modal-${modal.key}`}
                        open={true}
                        disableEnforceFocus={!isTop}
                        disableAutoFocus={!isTop}
                        disableEscapeKeyDown={!isTop}
                        onClose={isTop ? () => closeModal(modal.id) : undefined}
                        hideBackdrop={!isTop}
                        keepMounted
                        css={{
                            zIndex: theme.zIndex.modal + idx,
                            pointerEvents: isTop ? "auto" : "none",
                            ...modal.props?.css,
                        }}
                        aria-hidden={!isTop}
                        tabIndex={isTop ? 0 : -1}
                    >
                        {modal.content}
                    </Modal>
                );
            })}
        </>
    );
});
