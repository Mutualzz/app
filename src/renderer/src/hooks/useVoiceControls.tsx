import { SpaceModerated } from "@components/Modals/SpaceModerated";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";

export function useVoiceControls() {
  const app = useAppStore();
  const { openModal } = useModal();

  const toggleMute = () => {
    if (app.voice.spaceMute) {
      openModal("space-muted", <SpaceModerated type="muted" />);
      return;
    }
    app.voice.setMute(!app.voice.selfMute);
  };

  const toggleDeafen = () => {
    if (app.voice.spaceDeaf) {
      openModal("space-deafened", <SpaceModerated type="deafened" />);
      return;
    }
    app.voice.setDeaf(!app.voice.selfDeaf);
  };

  const disconnect = () => {
    if (!app.voice.currentChannelId) return;
    void app.voice.leave();
  };

  return { toggleMute, toggleDeafen, disconnect };
}
