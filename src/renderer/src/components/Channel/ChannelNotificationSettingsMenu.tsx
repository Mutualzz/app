import { ContextItem } from "@components/ContextItem";
import { ContextSubmenu } from "@components/ContextSubmenu";
import { useAppStore } from "@hooks/useStores";
import { NotificationLevel } from "@mutualzz/types";
import type { PatchChannelNotificationSettings } from "@mutualzz/validators";
import type { Channel } from "@stores/objects/Channel";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

interface Props {
  channel: Channel;
}

export const ChannelNotificationSettingsMenu = observer(
  ({ channel }: Props) => {
    const app = useAppStore();
    const { t } = useTranslation("chat");
    const elevation = app.settings?.preferEmbossed ? 5 : 1;

    const patch = (body: PatchChannelNotificationSettings) =>
      void app.readStates.patchNotificationSettings(channel.id, body);

    return (
      <ContextSubmenu
        label={t("contextMenu.notificationSettings")}
        arrow={<ArrowRightIcon weight="fill" />}
        elevation={elevation}
        transparency={0}
      >
        <ContextItem onClick={() => patch({ useSpaceDefault: true })}>
          {t("contextMenu.useSpaceDefault")}
        </ContextItem>
        <ContextItem
          onClick={() =>
            patch({ notificationLevel: NotificationLevel.All, useSpaceDefault: false })
          }
        >
          {t("contextMenu.notificationAll")}
        </ContextItem>
        <ContextItem
          onClick={() =>
            patch({
              notificationLevel: NotificationLevel.Mentions,
              useSpaceDefault: false,
            })
          }
        >
          {t("contextMenu.notificationMentions")}
        </ContextItem>
        <ContextItem
          onClick={() =>
            patch({
              notificationLevel: NotificationLevel.Nothing,
              useSpaceDefault: false,
            })
          }
        >
          {t("contextMenu.notificationNothing")}
        </ContextItem>
        <ContextItem onClick={() => patch({ muteDuration: "forever" })}>
          {t("contextMenu.muteChannel")}
        </ContextItem>
        <ContextItem onClick={() => patch({ muteDuration: "off" })}>
          {t("contextMenu.unmuteChannel")}
        </ContextItem>
      </ContextSubmenu>
    );
  },
);
