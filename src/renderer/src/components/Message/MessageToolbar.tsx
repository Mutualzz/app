import { EmojiPicker } from "@components/Expression/EmojiPicker";
import { IconButton } from "@components/IconButton";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { useRecentEmojis } from "@renderer/hooks/useRecentEmojis";
import { Portal, Stack, Tooltip as MzTooltip } from "@mutualzz/ui-web";
import { Message } from "@stores/objects/Message";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import type { PropsWithChildren, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { QueuedMessage } from "@stores/objects/QueuedMessage";
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import type { Expression } from "@stores/objects/Expression";
import type { PickerEmoji } from "@utils/emojis/emojiPickerData";
import type { SkinTone } from "@utils/emojis/emojiSprite";
import {
  expressionToReactionEmoji,
  pickerEmojiToReactionEmoji
} from "@utils/reactions";
import { Tooltip } from "../Tooltip";
import { MessageReactionToolbar } from "./MessageReactionToolbar";

interface Props extends PropsWithChildren {
  message: Message | QueuedMessage;
  header?: boolean;
}

interface ToolbarContentProps extends Props {
  pickerOpen: boolean;
  onPickerOpenChange: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  toolbarRef: RefObject<HTMLDivElement | null>;
}

const ToolbarContent = observer(
  ({
    message,
    pickerOpen,
    onPickerOpenChange,
    triggerRef,
    toolbarRef
  }: ToolbarContentProps) => {
    const app = useAppStore();

    const { mutate: deleteMessage } = useMutation({
      mutationKey: ["delete-message", message.id],
      mutationFn: (): any => message.delete()
    });

    const me = message.space?.members.me;

    const hideSwitcher = () => {
      if (!app.memberListVisible) {
        app.setHideSwitcher(true);
      }
    };

    const showSwitcher = () => {
      if (!app.memberListVisible) {
        app.setHideSwitcher(false);
      }
    };

    const isSent = message instanceof Message;

    return (
      <Paper
        ref={toolbarRef}
        onMouseEnter={hideSwitcher}
        onMouseLeave={showSwitcher}
        p={2}
        borderRadius={10}
        elevation={app.settings?.preferEmbossed ? 5 : 2}
        transparency={25}
      >
        <Stack direction="row" alignItems="center" spacing={1.25}>
          {isSent && (
            <MessageReactionToolbar
              message={message}
              pickerOpen={pickerOpen}
              onPickerOpenChange={onPickerOpenChange}
              triggerRef={triggerRef}
            />
          )}
          {message.author?.id === app.account?.id && isSent && (
            <Tooltip offset={16} content="Edit">
              <IconButton
                onClick={() => message.setEditing(true)}
                variant="plain"
                size="sm"
              >
                <PencilSimpleIcon weight="fill" />
              </IconButton>
            </Tooltip>
          )}
          {(message.author?.id === app.account?.id ||
            me?.hasPermission("ManageMessages")) && (
            <Tooltip offset={16} content="Delete">
              <IconButton
                color="danger"
                variant="plain"
                size="sm"
                onClick={() => deleteMessage()}
              >
                <TrashIcon weight="fill" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Paper>
    );
  }
);

export const MessageToolbar = observer(
  ({ message, header, children }: Props) => {
    const [hoverOpen, setHoverOpen] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"emoji" | "gifs" | "stickers">(
      "emoji"
    );
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLButtonElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const { addRecentStandard, addRecentCustom } = useRecentEmojis();

    const isSent = message instanceof Message;

    useEffect(() => {
      if (!pickerOpen || !triggerRef.current) return;

      const rect = triggerRef.current.getBoundingClientRect();
      const pickerHeight = 500;
      const pickerWidth = 500;

      let top = rect.top - pickerHeight - 8;
      let left = rect.left - pickerWidth + 28;

      if (top < 8) top = rect.bottom + 8;
      if (left < 8) left = 8;
      if (left + pickerWidth > window.innerWidth - 8) {
        left = window.innerWidth - pickerWidth - 8;
      }

      setPosition({ top, left });
    }, [pickerOpen]);

    useEffect(() => {
      if (!pickerOpen) return;

      const handleMouseDown = (event: MouseEvent) => {
        const target = event.target as Node;
        if (
          pickerRef.current?.contains(target) ||
          triggerRef.current?.contains(target) ||
          toolbarRef.current?.contains(target)
        ) {
          return;
        }

        setPickerOpen(false);
      };

      document.addEventListener("mousedown", handleMouseDown);
      return () => document.removeEventListener("mousedown", handleMouseDown);
    }, [pickerOpen]);

    const handleSelectEmoji = (emoji: PickerEmoji, skinTone: SkinTone) => {
      if (!isSent) return;

      addRecentStandard(emoji.unified, skinTone);
      void message.toggleReaction(pickerEmojiToReactionEmoji(emoji, skinTone));
      setPickerOpen(false);
    };

    const handleSelectCustomEmoji = (emoji: Expression) => {
      if (!isSent) return;

      addRecentCustom(emoji.id, emoji.name, emoji.url, emoji.animated);
      void message.toggleReaction(expressionToReactionEmoji(emoji));
      setPickerOpen(false);
    };

    if (message instanceof Message && message.editing) return children;

    return (
      <>
        <MzTooltip
          placement="top-end"
          content={
            <ToolbarContent
              message={message}
              header={header}
              pickerOpen={pickerOpen}
              onPickerOpenChange={setPickerOpen}
              triggerRef={triggerRef}
              toolbarRef={toolbarRef}
            />
          }
          offset={{ mainAxis: header ? -4 : -24, crossAxis: 0 }}
          shift={{ crossAxis: false }}
          disablePortal
          disableHoverListener={pickerOpen}
          open={hoverOpen || pickerOpen}
          onHover={setHoverOpen}
          leaveDelay={pickerOpen ? 0 : 100}
        >
          {children}
        </MzTooltip>

        {pickerOpen && isSent && (
          <Portal>
            <div
              ref={pickerRef}
              style={{
                position: "fixed",
                top: position.top,
                left: position.left,
                zIndex: 1400
              }}
            >
              <EmojiPicker
                pickerRef={pickerRef as any}
                onSelectEmoji={handleSelectEmoji}
                onSelectCustomEmoji={handleSelectCustomEmoji}
                onSelectGif={() => setPickerOpen(false)}
                onSelectSticker={() => setPickerOpen(false)}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
          </Portal>
        )}
      </>
    );
  }
);
