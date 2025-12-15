import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import { UserAvatar } from "@components/User/UserAvatar";
import { useAppStore } from "@hooks/useStores";
import { Stack } from "@mutualzz/ui-web";
import {
    Message as MessageType,
    type MessageLike,
} from "@stores/objects/Message";
import { QueuedMessageStatus } from "@stores/objects/QueuedMessage";
import { observer } from "mobx-react-lite";
import { MessageAuthor } from "./MessageAuthor";
import {
    MessageBase,
    MessageContent,
    MessageContentText,
    MessageDetails,
    MessageInfo,
} from "./MessageBase";
import { MessageEmbed } from "./MessageEmbed";
import { MessageToolbar } from "./MessageToolbar";

interface Props {
    message: MessageLike;
    header?: boolean;
}

export const Message = observer(({ message, header }: Props) => {
    const app = useAppStore();
    const space = message.spaceId ? app.spaces.get(message.spaceId) : null;

    const isSent = message instanceof MessageType;

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

    const children = (
        <MessageBase
            onMouseEnter={hideSwitcher}
            onMouseLeave={showSwitcher}
            header={header}
        >
            <MessageInfo>
                {header ? (
                    <UserAvatar user={message.author} size="lg" />
                ) : (
                    <MessageDetails message={message} position="left" />
                )}
            </MessageInfo>
            <MessageContent>
                {header && (
                    <Stack flexShrink={0}>
                        <MessageAuthor message={message} space={space} />
                        <MessageDetails message={message} position="top" />
                    </Stack>
                )}

                <MessageContentText
                    sending={
                        "status" in message &&
                        message.status === QueuedMessageStatus.Sending
                    }
                    failed={
                        "status" in message &&
                        message.status === QueuedMessageStatus.Failed
                    }
                >
                    {message.content && (
                        <MarkdownRenderer
                            variant="plain"
                            textColor="primary"
                            value={message.content}
                        />
                    )}
                </MessageContentText>

                {"embeds" in message && message.embeds.length > 0 && (
                    <Stack pb={0.25}>
                        {message.embeds.map((embed, index) => (
                            <MessageEmbed key={index} embed={embed} />
                        ))}
                    </Stack>
                )}
            </MessageContent>
        </MessageBase>
    );

    return isSent ? (
        <MessageToolbar header={header} message={message}>
            {children}
        </MessageToolbar>
    ) : (
        children
    );
});
