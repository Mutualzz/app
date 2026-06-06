import { useAppStore } from "@hooks/useStores";
import { observer } from "mobx-react-lite";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { Message } from "@stores/objects/Message";
import type { Channel } from "@stores/objects/Channel";
import {
  MarkdownInput,
  MarkdownInputHandle
} from "@components/Markdown/MarkdownInput/MarkdownInput";
import {
  ChannelType,
  HttpException,
  HttpStatusCode,
  MessageType
} from "@mutualzz/types";
import { useMutation } from "@tanstack/react-query";
import { Editor } from "slate";
import Snowflake from "@utils/Snowflake";
import { messageFlags } from "@mutualzz/bitfield";
import { createSystemMessage } from "@utils/index";
import { Stack, Typography } from "@mutualzz/ui-web";
import { Link } from "@components/Link";
import { Paper } from "@components/Paper";
import { TypingIndicator } from "@components/TypingIndicator";

interface Props {
  channel: Channel | null;
  message?: Message | null;
  onStopEditing?: () => void;
  onRequestEditLatest?: () => void;
}

export const MessageInput = observer(
  ({ channel, message, onStopEditing, onRequestEditLatest }: Props) => {
    const app = useAppStore();
    const [content, setContent] = useState(message?.content ?? "");
    const [nonce, setNonce] = useState("");

    const inputRef = useRef<MarkdownInputHandle>(null);
    const typingCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

    const isDM =
      channel?.type === ChannelType.DM || channel?.type === ChannelType.GroupDM;
    const isGroupDM = channel?.type === ChannelType.GroupDM;

    const relationship = isDM
      ? app.relationships.getForMe(channel.dmRecipient?.id ?? "")
      : null;

    const meId = app.account?.id;
    const iBlockedThem =
      !!relationship?.isBlocked && relationship.userId === meId;
    const theyBlockedMe =
      !!relationship?.isBlocked && relationship.userId !== meId;

    const areTyping = app.typing.areTyping(channel?.id || "");

    const denySendingMessages = isDM
      ? !!channel?.dmRecipients.find(
          (r) => r.flags.has("System") || iBlockedThem
        )
      : !(
          app.spaces.get(channel?.spaceId ?? "") ?? app.spaces.active
        )?.members.me?.canSendMessages(channel);

    useEffect(() => {
      app.pushComposer();
      return () => {
        app.popComposer();
      };
    }, []);

    useEffect(() => {
      setContent(message?.content ?? "");
    }, [message?.id]);

    useEffect(() => {
      requestAnimationFrame(() => {
        if (denySendingMessages && !message) return;
        inputRef.current?.focus();
      });
    }, [message?.editing, message?.id]);

    useEffect(() => {
      return () => clearTimeout(typingCooldownRef.current!);
    }, []);

    const triggerTyping = () => {
      if (!channel || message?.editing) return;

      if (!typingCooldownRef.current) {
        app.rest.post(`/channels/${channel.id}/typing`).catch(() => {});
      }

      clearTimeout(typingCooldownRef.current!);
      typingCooldownRef.current = setTimeout(() => {
        typingCooldownRef.current = null;
      }, 8_000);
    };

    const stopTyping = () => {
      clearTimeout(typingCooldownRef.current!);
      typingCooldownRef.current = null;
    };

    const { mutate: sendMessage } = useMutation({
      mutationKey: ["send-message", channel?.id],
      mutationFn: async ({
        editor,
        contentOverride
      }: {
        editor?: Editor | null;
        contentOverride?: string;
      }) => {
        if (!app.account) return null;
        if (!channel) return null;

        stopTyping();

        const trimmed = (contentOverride ?? content).trim();
        const original = (message?.content ?? "").trim();
        const isEditing = !!message;

        if (!isEditing && !trimmed) return null;

        if (isEditing && trimmed === original) {
          onStopEditing?.();
          return null;
        }

        if (message) {
          onStopEditing?.();
          return message.edit(trimmed);
        }

        const nonce = Snowflake.generate();
        setNonce(nonce);
        const author = app.account.raw;
        const msg = app.queue.add({
          id: nonce,
          content: trimmed,
          author,
          authorId: author.id,
          channelId: channel.id,
          spaceId: channel.spaceId ?? null,
          createdAt: new Date().toISOString(),
          type: MessageType.Default
        });

        editor?.select({
          anchor: editor.start([]),
          focus: editor.end([])
        });
        editor?.removeNodes();
        editor?.delete();
        editor?.insertNode({
          type: "line",
          children: [{ text: "" }]
        });

        if (content.length >= 2000)
          throw new HttpException(
            HttpStatusCode.Forbidden,
            "Message cannot exceed 2000 characters"
          );

        if (isDM && theyBlockedMe)
          throw new HttpException(
            HttpStatusCode.Forbidden,
            "You cannot message this person"
          );

        setContent("");

        return await channel.sendMessage({ content: trimmed, nonce }, msg);
      },
      onError: async (err: HttpException) => {
        const error = err.errors?.[0]?.message || err.message;
        console.log(nonce);

        if (!message) {
          const queued = app.queue
            .get(channel?.id ?? "")
            .find((x) => x.id === nonce || x.content === content);
          console.log("queued", queued);

          queued?.fail(error);

          const sysMessage = await createSystemMessage(
            app,
            channel?.id ?? "",
            error,
            messageFlags.Ephemeral
          );
          if (sysMessage) channel?.messages.add(sysMessage);
        }
      },
      onSuccess: () => {
        setNonce("");
      }
    });

    const onChange = (value: string) => {
      setContent(value);
    };

    const onStopEdit = (e?: KeyboardEvent) => {
      e?.preventDefault();
      message?.setEditing(false);
      onStopEditing?.();
    };

    const onKeyDown = (e: KeyboardEvent, editor: Editor) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage({ editor });
        return;
      }

      if (e.key === "Escape" && message) {
        onStopEdit(e);
        return;
      }

      if (e.key === "ArrowUp" && !message && !content.trim()) {
        e.preventDefault();
        onRequestEditLatest?.();
        return;
      }

      triggerTyping();
    };

    const placeholder = (() => {
      if (denySendingMessages) {
        return isDM
          ? "You cannot message this person, because you have them blocked"
          : "You are not allowed to send messages in this channel.";
      }

      if (isDM) {
        return `Message ${
          isGroupDM
            ? (channel?.name ?? "the group")
            : (channel?.dmRecipient?.displayName ?? "in this conversation")
        }`;
      }

      return `Message #${channel?.name ?? "in this channel"}`;
    })();

    const typingIndicator = !message?.editing && channel && (
      <TypingIndicator channelId={channel.id} />
    );

    const inputContent = (
      <Paper
        p={2}
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        borderTopLeftRadius={areTyping ? 0 : 6}
        borderTopRightRadius={areTyping ? 0 : 6}
        borderBottomLeftRadius={6}
        borderBottomRightRadius={6}
        display="block"
        mb={message?.editing ? 0 : 3.5}
      >
        <MarkdownInput
          autoFocus
          color="success"
          value={content}
          variant="plain"
          ref={inputRef}
          onChange={onChange}
          placeholder={message?.editing ? message.content : placeholder}
          onKeyDown={onKeyDown}
          onSendMessage={(message) =>
            sendMessage({
              editor: inputRef.current?.editor ?? null,
              contentOverride: message
            })
          }
          disabled={denySendingMessages}
          emojiPicker={!denySendingMessages}
          gifPicker={!denySendingMessages && !message?.editing}
        />
      </Paper>
    );

    return message?.editing ? (
      <Stack direction="column" spacing={1.25}>
        {inputContent}
        <Typography level="body-xs" textColor="secondary">
          escape to{" "}
          <Link textColor="accent" onClick={() => onStopEdit()}>
            cancel
          </Link>{" "}
          • enter to{"  "}
          <Link
            textColor="accent"
            onClick={() => sendMessage({ editor: null })}
          >
            save
          </Link>
        </Typography>
      </Stack>
    ) : (
      <Stack direction="column" spacing={0} ml={1.25} mr={1.75}>
        {typingIndicator}
        {inputContent}
      </Stack>
    );
  }
);
