import {
  IncomingCallModal
} from "@components/Call/IncomingCallModal";
import { INCOMING_CALL_MODAL_ID } from "@components/Call/incomingCallIds";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { reaction } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";

export const IncomingCallWatcher = observer(() => {
  const app = useAppStore();
  const { openModal, closeModal } = useModal();
  const openChannelRef = useRef<string | null>(null);

  useEffect(() => {
    return reaction(
      () => {
        const channelId = app.calls.getIncomingRingingChannelId();
        if (!channelId) return null;
        if (String(app.channels.activeId) === channelId) return null;
        return channelId;
      },
      (channelId) => {
        if (channelId === openChannelRef.current) return;

        if (openChannelRef.current) {
          closeModal(INCOMING_CALL_MODAL_ID);
          openChannelRef.current = null;
        }

        if (!channelId) return;

        openChannelRef.current = channelId;
        app.sounds.unlock();
        openModal(
          INCOMING_CALL_MODAL_ID,
          <IncomingCallModal channelId={channelId} />,
          {
            disableEscapeKeyDown: true,
            disableBackdropClick: true,
            showCloseButton: false
          }
        );
      },
      { fireImmediately: true }
    );
  }, [app, openModal, closeModal]);

  return null;
});
