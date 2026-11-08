import { ContextItem } from "@components/ContextItem";
import { ContextMenu } from "@components/ContextMenu";
import { ContextSubmenu } from "@components/ContextSubmenu";
import { useAppStore } from "@hooks/useStores";
import {
  MESSAGE_SCHEDULE_PRESETS,
  resolveMessageSchedulePreset
} from "@mutualzz/client";
import { Divider, Portal } from "@mutualzz/ui-web";
import {
  ArrowRightIcon,
  CalendarPlusIcon,
  FileArrowUpIcon
} from "@phosphor-icons/react";
import { useSchedulePresetLabel } from "./useSchedulePresetLabel";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

export const composerPlusMenuId = (channelId: string) =>
  `composer-plus-${channelId}`;

interface Props {
  channelId: string;
  canAttachFiles: boolean;
  onUploadFile: () => void;
  onSchedule: (time: Date) => void;
  onScheduleCustom: () => void;
}

export const ComposerPlusMenu = observer(
  ({
    channelId,
    canAttachFiles,
    onUploadFile,
    onSchedule,
    onScheduleCustom
  }: Props) => {
    const app = useAppStore();
    const { t } = useTranslation("chat");
    const elevation = app.settings?.preferEmbossed ? 5 : 1;

    const presetLabel = useSchedulePresetLabel();

    return (
      <Portal>
        <ContextMenu id={composerPlusMenuId(channelId)} elevation={elevation}>
          {canAttachFiles && (
            <ContextItem
              onClick={onUploadFile}
              startDecorator={<FileArrowUpIcon weight="fill" />}
            >
              {t("scheduledMessages.uploadFile")}
            </ContextItem>
          )}
          <ContextSubmenu
            label={t("scheduledMessages.menuTitle")}
            decorator={<CalendarPlusIcon weight="fill" />}
            arrow={<ArrowRightIcon weight="fill" />}
            elevation={elevation}
            onClick={onScheduleCustom}
          >
            {MESSAGE_SCHEDULE_PRESETS.map((preset) => {
              const time = resolveMessageSchedulePreset(preset);
              return (
                <ContextItem
                  key={preset}
                  onClick={() =>
                    onSchedule(resolveMessageSchedulePreset(preset))
                  }
                >
                  {presetLabel(preset, time)}
                </ContextItem>
              );
            })}
            <Divider css={{ opacity: 0.5 }} />
            <ContextItem onClick={onScheduleCustom}>
              {t("reminders.custom")}
            </ContextItem>
          </ContextSubmenu>
        </ContextMenu>
      </Portal>
    );
  }
);
