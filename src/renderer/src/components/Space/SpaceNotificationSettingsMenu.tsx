import { ContextItem } from "@components/ContextItem";
import { ContextSubmenu } from "@components/ContextSubmenu";
import { useAppStore } from "@hooks/useStores";
import { NotificationLevel } from "@mutualzz/types";
import type { PatchSpaceNotificationSettings } from "@mutualzz/validators";
import type { Space } from "@stores/objects/Space";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { BellSlashIcon } from "@phosphor-icons/react";

interface Props {
  space: Space;
}

export const SpaceNotificationSettingsMenu = observer(({ space }: Props) => {
  const app = useAppStore();
  const { t } = useTranslation("chat");
  const settings = app.spaceNotifications.get(space.id);

  const patch = (body: PatchSpaceNotificationSettings) =>
    void app.spaceNotifications.patch(space.id, body);

  return (
    <>
      <ContextSubmenu
        label={t("contextMenu.notificationLevel")}
        arrow={<BellSlashIcon weight="fill" />}
      >
        <ContextItem
          onClick={() => patch({ level: NotificationLevel.All })}
        >
          {t("contextMenu.notificationAll")}
        </ContextItem>
        <ContextItem
          onClick={() => patch({ level: NotificationLevel.Mentions })}
        >
          {t("contextMenu.notificationMentions")}
        </ContextItem>
        <ContextItem
          onClick={() => patch({ level: NotificationLevel.Nothing })}
        >
          {t("contextMenu.notificationNothing")}
        </ContextItem>
      </ContextSubmenu>

      <ContextSubmenu label={t("contextMenu.muteSpace")}>
        <ContextItem onClick={() => patch({ muteDuration: "1h" })}>
          {t("contextMenu.muteDuration1h")}
        </ContextItem>
        <ContextItem onClick={() => patch({ muteDuration: "8h" })}>
          {t("contextMenu.muteDuration8h")}
        </ContextItem>
        <ContextItem onClick={() => patch({ muteDuration: "24h" })}>
          {t("contextMenu.muteDuration24h")}
        </ContextItem>
        <ContextItem onClick={() => patch({ muteDuration: "1w" })}>
          {t("contextMenu.muteDuration1w")}
        </ContextItem>
        <ContextItem onClick={() => patch({ muteDuration: "forever" })}>
          {t("contextMenu.muteUntilTurnBackOn")}
        </ContextItem>
        <ContextItem onClick={() => patch({ muteDuration: "off" })}>
          {t("contextMenu.unmuteSpace")}
        </ContextItem>
      </ContextSubmenu>

      <ContextItem
        onClick={() =>
          patch({ suppressEveryone: !(settings?.suppressEveryone ?? false) })
        }
      >
        {t("contextMenu.suppressEveryone")}
      </ContextItem>
      <ContextItem
        onClick={() =>
          patch({ suppressRoles: !(settings?.suppressRoles ?? false) })
        }
      >
        {t("contextMenu.suppressRoles")}
      </ContextItem>
    </>
  );
});
