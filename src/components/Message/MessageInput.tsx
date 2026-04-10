import { MarkdownInput, type MarkdownInputHandle, } from "@components/Markdown/MarkdownInput/MarkdownInput";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { MessageType } from "@mutualzz/types";
import Snowflake from "@utils/Snowflake";
import { observer } from "mobx-react-lite";
import { type KeyboardEvent, useCallback, useEffect, useRef, useState, } from "react";
import type { Editor } from "slate";
import { Message } from "@stores/objects/Message";
import type { Channel } from "@stores/objects/Channel.ts";

// If message is present it means we are editing
interface Props {
    channel?: Channel | null;
    message?: Message | null;
    onStopEditing?: () => void;
    onRequestEditLatest?: () => void;
}

export const MessageInput = observer(
    ({
        channel: channelProp,
        message,
        onStopEditing,
        onRequestEditLatest,
    }: Props) => {
        const app = useAppStore();
        const channel = channelProp ?? app.channels.active;
        const [content, setContent] = useState(message?.content ?? "");

        const inputRef = useRef<MarkdownInputHandle>(null);

        const space =
            app.spaces.get(channel?.spaceId ?? "") ?? app.spaces.active ?? null;

        const me = space?.members.me;

        const denySendingMessages = !me?.canSendMessages(channel);

        const sendMessage = useCallback(
            async (editor: Editor) => {
                if (!app.account) return;
                if (!channel) return;

                const trimmed = content.trim();
                const original = (message?.content ?? "").trim();
                const isEditing = !!message;

                if (!isEditing && !trimmed) return;

                if (isEditing && trimmed === original) {
                    onStopEditing?.();
                    return;
                }

                try {
                    if (message) {
                        onStopEditing?.();
                        await message.edit(trimmed);
                        return;
                    }

                    const nonce = Snowflake.generate();
                    const author = app.account.raw;
                    const msg = app.queue.add({
                        id: nonce,
                        content: trimmed,
                        author,
                        authorId: author.id,
                        channelId: channel.id,
                        spaceId: channel.spaceId ?? null,
                        createdAt: new Date().toISOString(),
                        type: MessageType.Default,
                    });

                    editor.select({
                        anchor: editor.start([]),
                        focus: editor.end([]),
                    });
                    editor.removeNodes();
                    editor.delete();
                    editor.insertNode({
                        type: "line",
                        children: [{ text: "" }],
                    });
                    setContent("");

                    await channel.sendMessage({ content: trimmed, nonce }, msg);
                } catch (e) {
                    const error =
                        e instanceof Error
                            ? e.message
                            : typeof e === "string"
                              ? e
                              : "Unknown error";
                    if (!message) {
                        const queued = app.queue
                            .get(channel.id ?? "")
                            .find((x) => x.content === content);
                        queued?.fail(error);
                    }
                }
            },
            [app.account, app.queue, content, message, onStopEditing],
        );

        useEffect(() => {
            setContent(message?.content ?? "");
        }, [message?.id]);

        useEffect(() => {
            requestAnimationFrame(() => {
                inputRef.current?.focus();
            });
        }, [message?.editing, message?.id]);

        const onChange = (value: string) => {
            setContent(value);
        };

        const onKeyDown = (e: KeyboardEvent, editor: Editor) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(editor);
                return;
            }

            if (e.key === "Escape" && message) {
                e.preventDefault();
                message.setEditing(false);
                onStopEditing?.();
                return;
            }

            if (e.key === "ArrowUp" && !message && !content.trim()) {
                e.preventDefault();
                onRequestEditLatest?.();
            }
        };

        return (
            <Paper
                p={2}
                elevation={app.settings?.preferEmbossed ? 5 : 1}
                borderRadius={6}
                display="block"
                m={2.5}
            >
                <MarkdownInput
                    autoFocus
                    color="success"
                    value={content}
                    variant="plain"
                    ref={inputRef}
                    onChange={onChange}
                    placeholder={
                        message?.editing
                            ? message.content
                            : denySendingMessages
                              ? "You are not allowed to send messages to this channel"
                              : `Message #${channel?.name}`
                    }
                    onKeyDown={onKeyDown}
                    disabled={denySendingMessages}
                />
            </Paper>
        );
    },
);
