import { observer } from "mobx-react-lite";
import { Channel } from "@stores/objects/Channel";
import { Message } from "@stores/objects/Message";
import { useAppStore } from "@hooks/useStores";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import {
    MarkdownInput,
    MarkdownInputHandle
} from "@components/Markdown/MarkdownInput/MarkdownInput";
import type { Editor } from "slate";
import Snowflake from "@utils/Snowflake";
import { HttpException, HttpStatusCode, MessageType } from "@mutualzz/types";
import { Paper } from "@components/Paper";
import { Link, Stack, Typography } from "@mutualzz/ui-web";
import { useMutation } from "@tanstack/react-query";
import { createSystemMessage } from "@utils/index";
import { messageFlags } from "@mutualzz/bitfield";

interface Props {
    channel: Channel | null;
    message?: Message | null;
    onStopEditing?: () => void;
    onRequestEditLatest?: () => void;
}

export const DMChannelMessageInput = observer(
    ({ channel, message, onStopEditing, onRequestEditLatest }: Props) => {
        const app = useAppStore();
        const [content, setContent] = useState(message?.content ?? "");
        const [nonce, setNonce] = useState("");

        const inputRef = useRef<MarkdownInputHandle>(null);

        const relationship = app.relationships.getForMe(
            channel?.dmRecipient?.id ?? ""
        );
        const meId = app.account?.id;
        const iBlockedThem =
            relationship?.isBlocked && relationship.userId === meId;
        const theyBlockedMe =
            relationship?.isBlocked && relationship.userId !== meId;

        const denySendingMessages = !!channel?.dmRecipients.find(
            (r) => r.flags.has("System") || iBlockedThem
        );

        useEffect(() => {
            app.pushComposer();
            return () => {
                app.popComposer();
            };
        }, []);

        useEffect(() => {
            setContent(message?.content ?? "");
        }, []);

        useEffect(() => {
            requestAnimationFrame(() => {
                if (denySendingMessages) return;

                inputRef.current?.focus();
            });
        }, []);

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
                setNonce(nonce);

                if (theyBlockedMe)
                    throw new HttpException(
                        HttpStatusCode.Forbidden,
                        "You cannot message this person"
                    );

                return await channel.sendMessage(
                    { content: trimmed, nonce },
                    msg
                );
            },
            onError: async (err) => {
                const error =
                    err instanceof Error
                        ? err.message
                        : typeof err === "string"
                          ? err
                          : "Unknown error";

                if (!message) {
                    const queued = app.queue
                        .get(channel?.id ?? "")
                        .find((x) => x.id === nonce);

                    queued?.fail(error);
                    const sysMessage = await createSystemMessage(
                        app,
                        channel?.id ?? "",
                        "You cannot send a message to this person",
                        messageFlags.Ephemeral
                    );

                    if (!sysMessage) return;

                    channel?.messages.add(sysMessage);
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
            ? "You cannot message this person, because you have them blocked"
            : `Message ${channel?.dmRecipient ? channel.dmRecipient.displayName : (channel?.name ?? "in this conversation")}`;

        const InputContent = (
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
                {InputContent}
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
            InputContent
        );
    }
);
