import { UserSettingsModal } from "@components/UserSettings/UserSettingsModal";
import type { UserSettingsPage } from "@components/UserSettings/UserSettings.context";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import i18n from "../../i18n";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { toast } from "react-toastify";

export const SettingsReturnHandler = observer(() => {
  const app = useAppStore();
  const { openModal, isModalOpen } = useModal();

  useEffect(() => {
    if (!app.token || !app.isGatewayReady) return;

    const openReturn = () => {
      const page = sessionStorage.getItem("settings-return");
      if (!page) return;

      sessionStorage.removeItem("settings-return");

      if (!isModalOpen("user-settings")) {
        openModal(
          "user-settings",
          <UserSettingsModal redirectTo={page as UserSettingsPage} />
        );
      }

      toast.success(i18n.t("settings:discord.linkedToast"), {
        toastId: "discord-linked"
      });
    };

    openReturn();
    window.addEventListener("settings-return", openReturn);
    return () => window.removeEventListener("settings-return", openReturn);
  }, [app.token, app.isGatewayReady, isModalOpen, openModal]);

  return null;
});
