import type { CSSObject } from "@emotion/react";
import { useAppStore } from "@hooks/useStores";
import type { ModalProps } from "@mutualzz/ui-web";
import { reaction } from "mobx";
import {
  isModalAllowedDuringSpaceLockdown,
  notifySpaceLockdownBlocked,
  shouldCloseModalDuringSpaceLockdown
} from "@utils/spaceLockdown";
import { observer } from "mobx-react-lite";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
  type ReactNode
} from "react";

interface ModalStackItem {
  key: string;
  id: string;
  content: ReactNode;
  props?: Partial<ModalProps>;
}

interface ModalContextProps {
  modals: ModalStackItem[];
  openModal: (
    id: string,
    children: ReactNode,
    modalProps?: Partial<ModalProps> & { css?: CSSObject }
  ) => void;
  closeModal: (id?: string) => void;
  closeAllModals: () => void;
  isModalOpen: (id: string) => boolean;
}

const ModalContext = createContext<ModalContextProps | null>({
  modals: [],
  openModal: () => {
    return;
  },
  closeModal: () => {
    return;
  },
  isModalOpen: () => false,
  closeAllModals: () => {
    return;
  }
});

export const ModalProvider = observer(({ children }: PropsWithChildren) => {
  const app = useAppStore();
  const [modals, setModals] = useState<ModalStackItem[]>([]);

  useEffect(() => {
    const dispose = reaction(
      () => app.token,
      (token) => {
        if (!token) {
          setModals([]);
        }
      }
    );

    return dispose;
  }, [app.token]);

  useEffect(() => {
    const dispose = reaction(
      () => Boolean(app.spaces.active?.isInLockdown),
      (inLockdown) => {
        if (!inLockdown) return;
        setModals((prev) =>
          prev.filter((modal) => !shouldCloseModalDuringSpaceLockdown(modal.id))
        );
      }
    );

    return dispose;
  }, [app.spaces]);

  const openModal = useCallback(
    (
      id: string,
      content: ReactNode,
      props: Partial<ModalProps> & { css?: CSSObject } = {}
    ) => {
      const activeSpace = app.spaces.active;
      if (
        activeSpace?.isInLockdown &&
        !isModalAllowedDuringSpaceLockdown(id)
      ) {
        notifySpaceLockdownBlocked();
        return;
      }

      setModals((prev) => [
        ...prev,
        {
          key: `modal-${id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          id,
          content,
          props: {
            showCloseButton: false,
            ...props
          }
        }
      ]);
    },
    [app.spaces.active]
  );

  const closeModal = useCallback((id?: string) => {
    setModals(
      (prev) =>
        id ? prev.filter((modal) => modal.id !== id) : prev.slice(0, -1)
    );
  }, []);

  const closeAllModals = useCallback(() => {
    setModals([]);
  }, []);

  const isModalOpen = useCallback(
    (id: string) => modals.some((modal) => modal.id === id),
    [modals]
  );

  const contextValue: ModalContextProps = {
    modals,
    openModal,
    closeModal,
    isModalOpen,
    closeAllModals
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  );
});

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within a ModalProvider");
  return ctx;
}
