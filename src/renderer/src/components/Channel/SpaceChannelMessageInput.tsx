import {
    MarkdownInput,
    type MarkdownInputHandle
} from "@components/Markdown/MarkdownInput/MarkdownInput";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { MessageType } from "@mutualzz/types";
import Snowflake from "@utils/Snowflake";
import { observer } from "mobx-react-lite";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import type { Editor } from "slate";
import { Message } from "@stores/objects/Message";
import type { Channel } from "@stores/objects/Channel";
import { Link, Stack, Typography } from "@mutualzz/ui-web";
import { useMutation } from "@tanstack/react-query";

// If message is present it means we are editing
interface Props {
    channel: Channel | null;
    message?: Message | null;
    onStopEditing?: () => void;
    onRequestEditLatest?: () => void;
}

export const SpaceChannelMessageInput = observer(
    ({ channel, message, onStopEditing, onRequestEditLatest }: Props) => {
        const app = useAppStore();
        const [content, setContent] = useState(message?.content ?? "");

        const inputRef = useRef<MarkdownInputHandle>(null);

        const space =
            app.spaces.get(channel?.spaceId ?? "") ?? app.spaces.active ?? null;

        const me = space?.members.me;

        const denySendingMessages = !me?.canSendMessages(channel);

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
                inputRef.current?.focus();
            });
        }, [message?.editing, message?.id]);

        const { mutate: sendMessage } = useMutation({
            mutationKey: ["send-message", channel?.id],
            mutationFn: async (editor?: Editor | null) => {
                if (!app.account) return null;
                if (!channel) return null;

                const trimmed = content.trim();
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
                setContent("");

                return await channel.sendMessage(
                    { content: trimmed, nonce },
                    msg
                );
            },
            onError: (err) => {
                const error =
                    err instanceof Error
                        ? err.message
                        : typeof err === "string"
                          ? err
                          : "Unknown error";
                if (!message) {
                    const queued = app.queue
                        .get(channel?.id ?? "")
                        .find((x) => x.content === content);
                    queued?.fail(error);
                }
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
                sendMessage(editor);
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
        };

        const placeholder = denySendingMessages
            ? "You are not allowed to send messages in this channel."
            : `Message #${channel?.name ?? "in this channel"}`;

        const inputContent = (
            <Paper
                p={2}
                elevation={app.settings?.preferEmbossed ? 5 : 1}
                borderRadius={6}
                display="block"
                mb={message?.editing ? 0 : 3.5}
                ml={message?.editing ? 0 : 1.25}
            >
                <MarkdownInput
                    autoFocus
                    color="success"
                    value={content}
                    variant="plain"
                    ref={inputRef}
                    onChange={onChange}
                    placeholder={
                        message?.editing ? message.content : placeholder
                    }
                    onKeyDown={onKeyDown}
                    disabled={denySendingMessages}
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
                    <Link textColor="accent" onClick={() => sendMessage(null)}>
                        save
                    </Link>
                </Typography>
            </Stack>
        ) : (
            inputContent
        );
    }
);
