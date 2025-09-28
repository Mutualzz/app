import { useModal } from "@contexts/Modal.context";
import { useTheme } from "@mutualzz/ui-core";
import { Modal } from "@mutualzz/ui-web";
import { useMediaQuery } from "@react-hookz/web";

export const ModalRoot = () => {
    const { theme } = useTheme();
    const { modals, closeModal } = useModal();
    const isMobileQuery = useMediaQuery(
        theme.breakpoints.down("md").replace("@media ", ""),
    );

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
                    }}
                    pt={
                        isMobileQuery
                            ? "max(2rem, env(safe-area-inset-bottom, 0px))"
                            : undefined
                    }
                >
                    {modal.content}
                </Modal>
            ))}
        </>
    );
};
