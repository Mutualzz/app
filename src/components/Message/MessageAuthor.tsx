import { Typography } from "@mutualzz/ui-web";
import type { MessageLike } from "@stores/objects/Message";
import type { Space } from "@stores/objects/Space";
import { observer } from "mobx-react";

interface Props {
    message: MessageLike;
    space?: Space | null;
}

export const MessageAuthor = observer(({ message, space: _ }: Props) => {
    return <Typography>{message.author?.displayName}</Typography>;
});
