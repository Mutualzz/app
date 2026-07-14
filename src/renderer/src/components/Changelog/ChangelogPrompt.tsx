import {
  WhatsNewModal,
  WHATS_NEW_MODAL_ID
} from "@components/Modals/WhatsNewModal";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import type { APIChangelog } from "@mutualzz/types";
import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";

export const ChangelogPrompt = observer(() => {
  const app = useAppStore();
  const { openModal, isModalOpen } = useModal();
  const shownIdsRef = useRef(new Set<string>());
  const inFlightRef = useRef(false);
  const version = app.versions.app;

  useEffect(() => {
    if (!app.isGatewayReady || !app.token || !version) return;
    if (inFlightRef.current) return;

    inFlightRef.current = true;

    void (async () => {
      try {
        const changelog = await app.rest.get<APIChangelog | null>(
          "/changelogs/unseen",
          {
            platform: "desktop",
            version
          }
        );

        if (!changelog) return;
        if (shownIdsRef.current.has(changelog.id)) return;
        if (isModalOpen(WHATS_NEW_MODAL_ID)) return;

        shownIdsRef.current.add(changelog.id);

        openModal(
          WHATS_NEW_MODAL_ID,
          <WhatsNewModal
            changelog={changelog}
            onAck={async () => {
              await app.rest.post(`/changelogs/${changelog.id}/ack`);
            }}
          />,
          {
            disableEscapeKeyDown: true,
            disableBackdropClick: true
          }
        );
      } catch {
        return;
      } finally {
        inFlightRef.current = false;
      }
    })();
  }, [app.isGatewayReady, app.token, version]);

  return null;
});
