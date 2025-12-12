import { MarkdownInput } from "@components/Markdown/MarkdownInput/MarkdownInput";
import { useAppStore } from "@hooks/useStores";
import { MessageType } from "@mutualzz/types";
import { Paper } from "@mutualzz/ui-web";
import type { Channel } from "@stores/objects/Channel";
import Snowflake from "@utils/Snowflake";
import { observer } from "mobx-react";
import { useCallback, useState, type KeyboardEvent } from "react";
import type { Editor } from "slate";

interface Props {
    channel?: Channel | null;
}

export const MessageInput = observer(({ channel }: Props) => {
    const app = useAppStore();
    const [content, setContent] = useState(() => "");

    const canSendMessage = useCallback(() => {
        if (!content || !content.trim() || !content.replace(/\r?\n|\r/g, ""))
            return false;

        return true;
    }, [content]);

    const sendMessage = useCallback(
        async (editor: Editor) => {
            if (!canSendMessage()) return;
            setContent("");

            const nonce = Snowflake.generate();
            const author = app.account!.raw;
            const msg = app.queue.add({
                id: nonce,
                content,
                author,
                authorId: author.id,
                channelId: channel!.id,
                spaceId: channel?.space?.id ?? null,
                createdAt: new Date().toISOString(),
                type: MessageType.Default,
            });

            const body = {
                content,
                nonce,
            };

            try {
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

                await channel?.sendMessage(body, msg);
            } catch (e) {
                const error =
                    e instanceof Error
                        ? e.message
                        : typeof e === "string"
                          ? e
                          : "Unknown error";

                msg.fail(error);
            }
        },
        [content, channel, canSendMessage],
    );

    const onChange = (value: string) => {
        setContent(value);
    };

    const onKeyDown = (e: KeyboardEvent, editor: Editor) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(editor);
        }
    };

    return (
        <Paper elevation={4} p={2} borderRadius={6} display="block" m={2.5}>
            <MarkdownInput
                autoFocus
                color="success"
                value={content}
                variant="plain"
                onChange={onChange}
                placeholder={`Message #${channel?.name}`}
                onKeyDown={onKeyDown}
            />
        </Paper>
    );
});
