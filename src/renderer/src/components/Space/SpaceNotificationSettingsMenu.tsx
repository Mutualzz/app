import { ContextItem } from "@components/ContextItem";
import { ContextSubmenu } from "@components/ContextSubmenu";
import { useAppStore } from "@hooks/useStores";
import {
  DEFAULT_NOTIFICATION_LEVEL,
  isNotificationMuteActive,
  NotificationLevel,
} from "@mutualzz/types";
import type { PatchSpaceNotificationSettings } from "@mutualzz/validators";
import { Divider, useTheme } from "@mutualzz/ui-web";
import { formatColor } from "@mutualzz/ui-core";
import type { Space } from "@stores/objects/Space";
import {
  ArrowRightIcon,
  BellIcon,
  BellSlashIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

const SPACE_MUTE_DURATIONS = [
  { duration: "1h", labelKey: "contextMenu.muteDuration1h" },
  { duration: "8h", labelKey: "contextMenu.muteDuration8h" },
  { duration: "24h", labelKey: "contextMenu.muteDuration24h" },
  { duration: "1w", labelKey: "contextMenu.muteDuration1w" },
  { duration: "forever", labelKey: "contextMenu.muteUntilTurnBackOn" },
] as const satisfies ReadonlyArray<{
  duration: NonNullable<PatchSpaceNotificationSettings["muteDuration"]>;
  labelKey: string;
}>;

interface Props {
  space: Space;
}

export const SpaceNotificationSettingsMenu = observer(({ space }: Props) => {
  const app = useAppStore();
  const { theme } = useTheme();
  const { t } = useTranslation("chat");
  const settings = app.spaceNotifications.get(space.id);
  const isMuted = isNotificationMuteActive(settings?.mutedUntil);
  const level = settings?.level ?? DEFAULT_NOTIFICATION_LEVEL;
  const elevation = app.settings?.preferEmbossed ? 5 : 1;

  const patch = (body: PatchSpaceNotificationSettings) => {
    void app.spaceNotifications.patch(space.id, body);
  };

  const checkColor = formatColor(theme.colors.success);

  return (
    <>
      {isMuted ? (
        <ContextItem
          onClick={() => patch({ muteDuration: "off" })}
          endDecorator={<BellIcon weight="fill" />}
        >
          {t("contextMenu.unmuteSpace")}
        </ContextItem>
      ) : (
        <ContextSubmenu
          label={t("contextMenu.muteSpace")}
          endDecorator={<BellSlashIcon weight="fill" />}
          arrow={<ArrowRightIcon weight="fill" />}
          elevation={elevation}
          transparency={0}
          onClick={() => patch({ muteDuration: "forever" })}
        >
          {SPACE_MUTE_DURATIONS.map(({ duration, labelKey }) => (
            <ContextItem
              key={duration}
              onClick={() => patch({ muteDuration: duration })}
            >
              {t(labelKey)}
            </ContextItem>
          ))}
        </ContextSubmenu>
      )}

      <ContextSubmenu
        label={t("contextMenu.notificationSettings")}
        arrow={<ArrowRightIcon weight="fill" />}
        elevation={elevation}
        transparency={0}
      >
        <ContextItem
          onClick={() => patch({ level: NotificationLevel.All })}
          endDecorator={
            level === NotificationLevel.All ? (
              <CheckIcon size={16} weight="bold" color={checkColor} />
            ) : undefined
          }
        >
          {t("contextMenu.notificationAll")}
        </ContextItem>
        <ContextItem
          onClick={() => patch({ level: NotificationLevel.Mentions })}
          endDecorator={
            level === NotificationLevel.Mentions ? (
              <CheckIcon size={16} weight="bold" color={checkColor} />
            ) : undefined
          }
        >
          {t("contextMenu.notificationMentions")}
        </ContextItem>
        <ContextItem
          onClick={() => patch({ level: NotificationLevel.Nothing })}
          endDecorator={
            level === NotificationLevel.Nothing ? (
              <CheckIcon size={16} weight="bold" color={checkColor} />
            ) : undefined
          }
        >
          {t("contextMenu.notificationNothing")}
        </ContextItem>
        <Divider css={{ opacity: 0.5 }} />
        <ContextItem
          onClick={() =>
            patch({
              suppressEveryone: !(settings?.suppressEveryone ?? false),
            })
          }
          endDecorator={
            settings?.suppressEveryone ? (
              <CheckIcon size={16} weight="bold" color={checkColor} />
            ) : undefined
          }
        >
          {t("contextMenu.suppressEveryone")}
        </ContextItem>
        <ContextItem
          onClick={() =>
            patch({ suppressRoles: !(settings?.suppressRoles ?? false) })
          }
          endDecorator={
            settings?.suppressRoles ? (
              <CheckIcon size={16} weight="bold" color={checkColor} />
            ) : undefined
          }
        >
          {t("contextMenu.suppressRoles")}
        </ContextItem>
      </ContextSubmenu>

      <Divider css={{ opacity: 0.5 }} />
    </>
  );
});
