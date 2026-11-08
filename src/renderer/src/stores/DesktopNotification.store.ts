import { isElectron } from "@renderer/utils";
import type { AppStore } from "@stores/App.store";
import {
  type AppNavigateFunction,
  openChannelMessage
} from "@utils/openChannelMessage";
import { makeAutoObservable } from "mobx";
import { makePersistable } from "mobx-persist-store";

interface DesktopNotificationInput {
  title: string;
  body: string;
  tag?: string;
  channelId?: string | null;
  messageId?: string | null;
}

export class DesktopNotificationStore {
  enabled = true;
  private navigate: AppNavigateFunction | null = null;

  constructor(private readonly app: AppStore) {
    makeAutoObservable<this, "navigate">(
      this,
      { navigate: false },
      { autoBind: true }
    );

    void makePersistable(this, {
      name: "DesktopNotificationStore",
      properties: ["enabled"],
      storage: localStorage
    });
  }

  get supported() {
    return typeof Notification !== "undefined";
  }

  get permissionGranted() {
    return (
      isElectron || (this.supported && Notification.permission === "granted")
    );
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (enabled && !isElectron && this.supported) {
      if (Notification.permission === "default")
        void Notification.requestPermission();
    }
  }

  setNavigator(navigate: AppNavigateFunction | null) {
    this.navigate = navigate;
  }

  private get isDoNotDisturb() {
    const accountId = this.app.account?.id;
    if (!accountId) return false;
    return this.app.presence.get(accountId)?.status === "dnd";
  }

  show({ title, body, tag, channelId, messageId }: DesktopNotificationInput) {
    if (!this.enabled || !this.supported || !this.permissionGranted) return;
    if (this.isDoNotDisturb) return;
    if (document.hasFocus()) return;

    try {
      const notification = new Notification(title, {
        body,
        tag,
        silent: true
      });

      notification.onclick = () => {
        if (isElectron) void window.api.window.focus();
        else window.focus();

        if (channelId && this.navigate)
          openChannelMessage(
            this.app,
            this.navigate,
            channelId,
            messageId ?? undefined
          );

        notification.close();
      };
    } catch {
      return;
    }
  }
}
